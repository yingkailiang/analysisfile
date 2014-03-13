#pragma once

#include <AnchoCommons/AsynchronousTaskManager.hpp>
#include <AnchoCommons/COMConversions.hpp>
#include <AnchoCommons/JavaScriptCallback.hpp>

#include "ancho_i.h"
namespace Ancho {

typedef CComPtr<IDispatch> CookieInfo;
typedef CComPtr<IDispatch> CookieList;
typedef boost::function<void(CookieInfo)> CookieCallback;
typedef boost::function<void(CookieList)> CookieListCallback;

class CookieManager;
typedef CComObject<CookieManager> CookieManagerComObject;

class ATL_NO_VTABLE CookieManager :
  public CComObjectRootEx<CComSingleThreadModel>,
  public IDispatchImpl<IIECookieAccessor, &IID_IIECookieAccessor, &LIBID_AnchoBgSrvLib, /*wMajor =*/ 0xffff, /*wMinor =*/ 0xffff>
{
public:
  CookieManager() {}

  static CComPtr<CookieManagerComObject> createInstance(CComPtr<IAnchoServiceApi> aAnchoService)
  {
    CookieManagerComObject * newObject = NULL;
    IF_FAILED_THROW(CookieManagerComObject::CreateInstance(&newObject));
    ATLASSERT(aAnchoService);
    newObject->mAnchoServiceMarshaller = boost::make_shared<Ancho::Utils::ObjectMarshaller<IAnchoServiceApi> >(aAnchoService);
    return CComPtr<CookieManagerComObject>(newObject);  // to have a refcount of 1
  }

  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(CookieManager)
    COM_INTERFACE_ENTRY(IDispatch)
    COM_INTERFACE_ENTRY(IIECookieAccessor)
  END_COM_MAP()

  // -------------------------------------------------------------------------
  // COM standard methods
  HRESULT FinalConstruct()
  {
    return S_OK;
  }

  void FinalRelease()
  {
  }
public:
  STDMETHOD(getAllCookies)(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);

  STDMETHOD(removeCookie)(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);

  STDMETHOD(setCookie)(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);

  STDMETHOD(getCookie)(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);

  void removeCookie(Utils::JSObject aDetails,
                    const CookieCallback& aCallback,
                    const std::wstring &aExtensionId,
                    int aApiId);

  void getCookie(const Utils::JSObject &aDetails,
                 const CookieCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId);

  void setCookie(const Utils::JSObject &aDetails,
                 const CookieCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId);

  void getAllCookies(const Utils::JSObject &aDetails,
                 const CookieListCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId);
protected:
  Ancho::Utils::AsynchronousTaskManager mAsyncTaskManager;

  Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr mAnchoServiceMarshaller;
};

} //namespace Ancho