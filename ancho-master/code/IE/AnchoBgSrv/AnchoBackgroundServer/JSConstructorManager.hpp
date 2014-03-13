#pragma once

namespace Ancho {
namespace Service {

/**
 * Stores basic JS entities (Object, Array) constructors for API instances.
 * Useful for creation of return values, so JS engines can process objects from same context.
 * NOTE: calling constructor from different thread doesn't work, so instead of storing
 * constructors directly we store wrapper functions which return proper object instances.
 **/
class JSConstructorManager
{
public:
  typedef boost::tuple<std::wstring, int> ApiInstanceId;
  typedef boost::tuple<Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr, Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr> Constructors;

  void registerConstructors(CComPtr<IDispatchEx> aObjectConstructor, CComPtr<IDispatchEx> aArrayConstructor, const std::wstring &aExtensionId, int aApiId)
  {

    auto objectMarshaller = boost::make_shared<Ancho::Utils::ObjectMarshaller<IDispatchEx> >(aObjectConstructor);
    auto arrayMarshaller = boost::make_shared<Ancho::Utils::ObjectMarshaller<IDispatchEx> >(aArrayConstructor);

    {
      boost::unique_lock<boost::mutex> lock(mConstructorMapMutex);
      mConstructorInstances[ApiInstanceId(aExtensionId, aApiId)] = Constructors(objectMarshaller, arrayMarshaller);
    };
  }

  void removeConstructors(const std::wstring &aExtensionId, int aApiId)
  {
    boost::unique_lock<boost::mutex> lock(mConstructorMapMutex);
    mConstructorInstances.erase(ApiInstanceId(aExtensionId, aApiId));
  }

  CComPtr<IDispatch> createObject(const std::wstring &aExtensionId, int aApiId)
  {
    return createInstanceByConstructor<0>(aExtensionId, aApiId);
  }

  CComPtr<IDispatch> createArray(const std::wstring &aExtensionId, int aApiId)
  {
    return createInstanceByConstructor<1>(aExtensionId, aApiId);
  }

protected:
  template<size_t tConstructorIdx>
  CComPtr<IDispatch> createInstanceByConstructor(const std::wstring &aExtensionId, int aApiId)
  {
    Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr creatorMarshaller;
    //ATLTRACE(L"JSConstructorManager - creating instance from %s, %d\n", aExtensionId.c_str(), aApiId);
    {
      //keep locked until we get the constructor marshaller
      boost::unique_lock<boost::mutex> lock(mConstructorMapMutex);
      auto it = mConstructorInstances.find(ApiInstanceId(aExtensionId, aApiId));

      if (it == mConstructorInstances.end()) {
        ANCHO_THROW(EInvalidArgument());
      }
      creatorMarshaller = it->second.get<tConstructorIdx>();
    }
    CComPtr<IDispatchEx> creator = creatorMarshaller->get();

    DISPPARAMS params = {0};
    _variant_t result;
    //Workaround - DISPATCH_CONSTRUCT doesn't work in worker thread -
    //so we invoke wrapper function which calls constructors and returns newly created instance.
    IF_FAILED_THROW(creator->InvokeEx(DISPID_VALUE, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, result.GetAddress(), NULL, NULL));
    //ATLTRACE(L"JSConstructorManager - creating instance from %s, %d finished\n", aExtensionId.c_str(), aApiId);
    try {
      return CComPtr<IDispatch>(result.pdispVal);
    } catch (_com_error &e) {
      ANCHO_THROW(EHResult(e.Error()));
    }
  }

  std::map<ApiInstanceId, Constructors> mConstructorInstances;
  boost::mutex mConstructorMapMutex;
};




} //namespace Service
} //namespace Ancho

