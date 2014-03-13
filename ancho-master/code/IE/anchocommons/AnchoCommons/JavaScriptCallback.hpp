#pragma once

namespace Ancho {
namespace Utils {

namespace detail {

/**
 * Base class for JS callbacks - provides callback instance marshalling between threads.
 */
class JavaScriptCallbackBase
{
public:
  JavaScriptCallbackBase() {}

  virtual ~JavaScriptCallbackBase() {}

  JavaScriptCallbackBase(CComPtr<IDispatch> aCallback): mCallbackMarshaller(boost::make_shared<ObjectMarshaller<IDispatch> >(aCallback))
  { /*empty*/ }

  bool empty()const
  { return mCallbackMarshaller->empty(); }
protected:
  void call(DISPPARAMS &aParams, variant_t &aReturnValue)
  {
    if(empty()) {
      return;
    }

    CComQIPtr<IDispatch> callback = mCallbackMarshaller->get();
    if (!callback) {
      ANCHO_THROW(EFail());
    }
    IF_FAILED_THROW(callback->Invoke((DISPID)0, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &aParams, aReturnValue.GetAddress(), NULL, NULL));
  }

  JavaScriptCallbackBase(JavaScriptCallbackBase&& aCallback);

  ObjectMarshaller<IDispatch>::Ptr mCallbackMarshaller;
};
} //namespace detail

/**
 * JS callback
 **/
template<typename TArguments, typename TReturnValue>
class JavaScriptCallback: public detail::JavaScriptCallbackBase
{
public:
  typedef TArguments Arguments;
  //This is a workaround for isssue with 'void' type
  //- it is incoplete type and we cannot instantiate it.
  //The 'Empty' type will be used instead of void.
  typedef typename Ancho::Utils::SafeVoidTraits<TReturnValue>::type ReturnValue;

  JavaScriptCallback() {}

  JavaScriptCallback(CComPtr<IDispatch> aCallback): detail::JavaScriptCallbackBase(aCallback)
  { /*empty*/ }

  ReturnValue operator()(Arguments aArguments)
  {
    if (empty()) {
      return Utils::convert<variant_t, ReturnValue>(variant_t());
    }
    std::vector<CComVariant> parameters;
    DISPPARAMS params = {0};
    Utils::convert(aArguments, parameters);
    if (!parameters.empty()) {
      std::reverse(parameters.begin(), parameters.end());

      params.rgvarg = &(parameters[0]);
      params.cArgs = parameters.size();
    }

    variant_t vtResult;
    this->call(params, vtResult);
    return Utils::convert<variant_t, ReturnValue>(vtResult);
  }

};

/**
 * JS callback specialization for paremeter-less case
 **/
template<typename TReturnValue>
class JavaScriptCallback<void, TReturnValue>: public detail::JavaScriptCallbackBase
{
public:
  //This is a workaround for isssue with 'void' type
  //- it is incoplete type and we cannot instantiate it.
  //The 'Empty' type will be used instead of void.
  typedef typename Ancho::Utils::SafeVoidTraits<TReturnValue>::type ReturnValue;

  JavaScriptCallback() {}

  JavaScriptCallback(CComPtr<IDispatch> aCallback): detail::JavaScriptCallbackBase(aCallback)
  { /*empty*/ }

  ReturnValue operator()()
  {
    DISPPARAMS params = {0};

    variant_t vtResult;
    this->call(params, vtResult);
    return Utils::convert<variant_t, ReturnValue>(vtResult);
    return ReturnValue();
  }

};

} //namespace Utils
} //namespace Ancho