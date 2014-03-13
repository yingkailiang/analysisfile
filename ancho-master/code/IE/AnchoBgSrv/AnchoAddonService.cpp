/****************************************************************************
 * AnchoAddonService.cpp : Implementation of CAnchoAddonService
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <kontakt@seiberspace.de>
 ****************************************************************************/

#include "stdafx.h"
#include "AnchoAddonService.h"

#include <sstream>
#include <algorithm>

#include "PopupWindow.h"

#include <crxProcessing/extract.hpp>
#include "AnchoBackgroundServer/UpdateChecking.hpp"

using namespace Ancho::PageAction;

struct CookieNotificationCallback: public ACookieCallbackFunctor
{
  CookieNotificationCallback(CAnchoAddonService &aService): service(aService)
  {}

  void operator()(CComVariant &aCookie)
  {
    ATLASSERT(aCookie.vt == VT_DISPATCH);
    CComBSTR eventName(L"cookies.onChanged");

    service.invokeEventObjectInAllExtensionsWithIDispatchArgument(eventName, aCookie.pdispVal);
    ATLTRACE("NOTIFICATION ");
  }

  CAnchoAddonService &service;
};

/*============================================================================
 * class CAnchoAddonService
 */

CAnchoAddonService *gAnchoAddonService = NULL;

//----------------------------------------------------------------------------
//
void CAnchoAddonService::OnAddonFinalRelease(BSTR bsID)
{
  m_BackgroundObjects.erase(std::wstring(bsID, SysStringLen(bsID)));
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::get_cookieManager(LPDISPATCH* ppRet)
{
  BEGIN_TRY_BLOCK;
  ENSURE_RETVAL(ppRet);

  //auto runtime = Ancho::Service::TabManager::instance().getSomeTabRecord()->mRuntime;
  auto runtime = mTabManager.getSomeTabRecord()->runtime();
  if (!runtime ) {
    return E_FAIL;
  }

  return runtime->get_cookieManager(ppRet);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::get_tabManager(LPDISPATCH* ppRet)
{
  ENSURE_RETVAL(ppRet);
  return mTabManager.QueryInterface(IID_ITabManager, (void**)ppRet);
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::get_windowManager(LPDISPATCH* ppRet)
{
  ENSURE_RETVAL(ppRet);
  return mWindowManager.QueryInterface(IID_IWindowManager, (void**)ppRet);
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::invokeExternalEventObject(BSTR aExtensionId, BSTR aEventName, LPDISPATCH aArgs, VARIANT* aRet)
{
  ENSURE_RETVAL(aRet);
  CAnchoAddonBackgroundComObject* pObject = NULL;

  BackgroundObjectsMap::iterator it = m_BackgroundObjects.find(std::wstring(aExtensionId, SysStringLen(aExtensionId)));
  if (it != m_BackgroundObjects.end()) {
    ATLASSERT(it->second != NULL);
    return it->second->invokeExternalEventObject(aEventName, aArgs, aRet);
  }
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::registerJSConstructors(LPDISPATCH aObjectConstructor, LPDISPATCH aArrayConstructor, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  Ancho::Service::JSConstructorManager::registerConstructors(
                                                CComQIPtr<IDispatchEx>(aObjectConstructor),
                                                CComQIPtr<IDispatchEx>(aArrayConstructor),
                                                std::wstring(aExtensionId),
                                                aApiId);
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::removeJSConstructors(BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  Ancho::Service::JSConstructorManager::removeConstructors(std::wstring(aExtensionId), aApiId);
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::createJSObject(BSTR aExtensionId, INT aApiId, LPDISPATCH *aObject)
{
  BEGIN_TRY_BLOCK;
  ENSURE_RETVAL(aObject)
  auto obj = Ancho::Service::JSConstructorManager::createObject(std::wstring(aExtensionId), aApiId);
  *aObject = obj.Detach();
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::createJSArray(BSTR aExtensionId, INT aApiId, LPDISPATCH *aArray)
{
  BEGIN_TRY_BLOCK;
  ENSURE_RETVAL(aArray)
  auto arr = Ancho::Service::JSConstructorManager::createArray(std::wstring(aExtensionId), aApiId);
  *aArray = arr.Detach();
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::navigateBrowser(LPUNKNOWN aWebBrowserWin, const std::wstring &url, INT32 aNavigateOptions)
{
  CComQIPtr<IWebBrowser2> webBrowser = aWebBrowserWin;
  if (!webBrowser) {
    return E_NOINTERFACE;
  }

  CComVariant vtUrl(url.c_str());
  CComVariant vtFlags(aNavigateOptions);
  CComVariant vtEmpty;
  return webBrowser->Navigate2(&vtUrl, &vtFlags, &vtEmpty, &vtEmpty, &vtEmpty);
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::getActiveWebBrowser(LPUNKNOWN* pUnkWebBrowser)
{
  CComPtr<IWebBrowser2> pWebBrowser;
  HRESULT hr = FindActiveBrowser(&pWebBrowser);
  if (FAILED(hr)) {
    return hr;
  }
  return pWebBrowser->QueryInterface(IID_IUnknown, (void**) pUnkWebBrowser);
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::getBrowserActions(VARIANT* aBrowserActionsArray)
{
  ENSURE_RETVAL(aBrowserActionsArray);

  CComVariant tmp(&m_BrowserActionInfos);
  return tmp.Detach(aBrowserActionsArray);
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::addBrowserActionInfo(LPDISPATCH aBrowserActionInfo)
{
  if (!aBrowserActionInfo) {
    return E_POINTER;
  }

  m_BrowserActionInfos.push_back(CComVariant(aBrowserActionInfo));

  mTabManager.forEachTab(
              [](Ancho::Service::TabManager::TabRecord &aRec){ aRec.runtime()->showBrowserActionBar(TRUE); }
            );
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::setBrowserActionUpdateCallback(INT aTabId, LPDISPATCH aBrowserActionUpdateCallback)
{
  m_BrowserActionCallbacks[aTabId] = CIDispatchHelper(aBrowserActionUpdateCallback);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::browserActionNotification()
{
  for (BrowserActionCallbackMap::iterator it = m_BrowserActionCallbacks.begin(); it != m_BrowserActionCallbacks.end(); ++it) {
    it->second.Invoke0(DISPID(0));
  }
  return S_OK;
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::FinalConstruct()
{
  BEGIN_TRY_BLOCK;
    gAnchoAddonService = this;

    // Get and store the path, this will be used in some places (e.g. to load
    // additional DLLs).
    LPTSTR psc = m_sThisPath.GetBuffer(_MAX_PATH);
    GetModuleFileName(_AtlModule.m_hInstance, psc, _MAX_PATH);
    PathRemoveFileSpec(psc);
    PathAddBackslash(psc);
    m_sThisPath.ReleaseBuffer();

    m_Cookies.setNotificationCallback(ACookieCallbackFunctor::APtr(new CookieNotificationCallback(*this)));
    m_Cookies.startWatching();

    //Check for Ancho updates
    std::wstring key(s_AnchoExtensionsRegistryKey);
    std::wstring id(L"Ancho");
    mAsyncTaskManager.addTask([key, id]{ Ancho::Service::checkForUpdate(key, id); });

    GdiplusStartupInput gsi;
    if (Ok != GdiplusStartup( &mGDIpToken, &gsi, NULL )) {
      ANCHO_THROW(EHResult(E_FAIL));
    }

  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

//----------------------------------------------------------------------------
//
void CAnchoAddonService::FinalRelease()
{
  // shutdown GDI+
  GdiplusShutdown(mGDIpToken);

  // delete pageaction proxies
  mPageActionProxies.clear();

  // release background objects
  BackgroundObjectsMap::iterator it = m_BackgroundObjects.begin();
  while(it != m_BackgroundObjects.end())
  {
    ATLASSERT(it->second != NULL);
    it->second->OnAddonServiceReleased();
    ++it;
  }
  m_BackgroundObjects.clear();
  mWindowManager.finalize();
  mTabManager.finalize();
  gAnchoAddonService = NULL;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::GetCreateAddonBackground(BSTR bsID, IAnchoAddonBackground ** ppRet)
{
  ENSURE_RETVAL(ppRet);

  CComPtr<IAnchoAddonBackground> ptr;
  std::wstring id = std::wstring(bsID, SysStringLen(bsID));
  BackgroundObjectsMap::iterator it = m_BackgroundObjects.find(id);
  if (it == m_BackgroundObjects.end()) {
    ATLTRACE(_T("ADD OBJECT %s\n"), bsID);
    CAnchoAddonBackgroundComObject* pObject = NULL;
    HRESULT hr = CAnchoAddonBackgroundComObject::CreateInstance(&pObject);
    if (FAILED(hr))
    {
      return hr;
    }
    // store to a safepointer
    ptr = pObject;

    ///////////////////////////////////////////////////////
    // Init the whole addon. This will load and init the
    // Ancho api.
    hr = pObject->Init(m_sThisPath, this, static_cast<IAnchoServiceApi*>(this), bsID);
    if (FAILED(hr))
    {
      return hr;
    }
    // store in map
    m_BackgroundObjects[id] = pObject;
  } else {
    ATLTRACE(_T("FOUND OBJECT %s\n"), bsID);
    // found, create a new intance ID
    // store to safepointer
    ptr = it->second;
  }

  // set return value
  (*ppRet) = ptr.Detach();
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::GetModulePath(BSTR * pbsPath)
{
  ENSURE_RETVAL(pbsPath);
  (*pbsPath) = m_sThisPath.AllocSysString();
  return S_OK;
}
//----------------------------------------------------------------------------
//

STDMETHODIMP CAnchoAddonService::invokeEventObjectInAllExtensions(BSTR aEventName, LPDISPATCH aArgs, VARIANT* aRet)
{
  for (BackgroundObjectsMap::iterator it = m_BackgroundObjects.begin(); it != m_BackgroundObjects.end(); ++it) {
    CComBSTR id(it->first.c_str());
    invokeExternalEventObject(id, aEventName, aArgs, aRet);
  }
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::invokeEventObjectInAllExtensionsWithIDispatchArgument(BSTR aEventName, LPDISPATCH aArg)
{
  for (BackgroundObjectsMap::iterator it = m_BackgroundObjects.begin(); it != m_BackgroundObjects.end(); ++it) {
    it->second->invokeEventWithIDispatchArgument(aEventName, aArg);
  }
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::webBrowserReady()
{
  m_WebBrowserPostInitTasks.autoExecuteAll();
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::getInternalProtocolParameters(BSTR * aServiceHost, BSTR * aServicePath)
{
  ENSURE_RETVAL(aServiceHost);
  ENSURE_RETVAL(aServicePath);

  CString serviceHost = L"AnchoBackgroundService";

  WCHAR appPath[MAX_PATH] = {0};
  if (!GetModuleFileNameW(NULL, appPath, _countof(appPath))) {
    return E_FAIL;
  }
  CString servicePath(appPath);

  *aServiceHost = serviceHost.AllocSysString();
  *aServicePath = servicePath.AllocSysString();
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::registerBrowserActionToolbar(OLE_HANDLE aFrameTab, BSTR * aUrl, INT*aTabId)
{
  ENSURE_RETVAL(aUrl);
  ENSURE_RETVAL(aTabId);

  *aTabId = mTabManager.getFrameTabId((HWND)aFrameTab);

  /*WCHAR   appPath[MAX_PATH] = {0};
  GetModuleFileNameW(NULL, appPath, _countof(appPath));*/

  CString url;
  url.Format(L"%s://AnchoBackgroundService/BROWSER_ACTION_TOOLBAR.HTML", s_AnchoInternalProtocolHandlerScheme);
  *aUrl = url.AllocSysString();
  ATLTRACE(L"ANCHO SERVICE: registered browser action toolbar; tab: %d\n", *aTabId);
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::unregisterBrowserActionToolbar(INT aTabId)
{
  ATLTRACE(L"ANCHO SERVICE: unregistering browser action toolbar; tab: %d\n", aTabId);
  m_BrowserActionCallbacks.erase(aTabId);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::getDispatchObject(IDispatch **aRet)
{
  ENSURE_RETVAL(aRet);
  *aRet = static_cast<IDispatch*>(this);
  AddRef();
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::initPageActions(OLE_HANDLE aHwndBrowser, INT aTabId)
{
  ATLTRACE(_T("INIT PAGEACTIONS for HWND 0x&08x, tab %i\n"), aHwndBrowser, aTabId);
  mPageActionProxies.initPageActions((HWND)aHwndBrowser, aTabId);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::releasePageActions(INT aTabId)
{
  ATLTRACE(_T("RELEASE PAGEACTIONS for tab %i\n"), aTabId);
  mPageActionProxies.removeTab(aTabId);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::advicePageActionBar(OLE_HANDLE hwndBrowser, IDispatch * aDispatch) {
  if(!hwndBrowser || !aDispatch) {
    return E_INVALIDARG;
  }

  Proxy * proxy = mPageActionProxies.getProxyForHWND((HWND)hwndBrowser);
  if (!proxy) {
    return E_INVALIDARG;
  }

  return proxy->advicePageActionBar(aDispatch);
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::unadvicePageActionBar(OLE_HANDLE hwndBrowser) {
  mPageActionProxies.removeProxyForHWND((HWND)hwndBrowser);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::onTabNavigate(INT aTabId) {
  Proxy * proxy = mPageActionProxies.getProxyForTabId(aTabId);
  return (proxy) ? proxy->onTabNavigate(aTabId) : E_UNEXPECTED;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::onTabActivate(INT aNewTabId) {
  Proxy * proxy = mPageActionProxies.getProxyForTabId(aNewTabId);
  return (proxy) ? proxy->onTabActivate(aNewTabId) : E_UNEXPECTED;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::isImageData(LPDISPATCH aObject, VARIANT_BOOL * aRetVal)
{
  ENSURE_RETVAL(aRetVal);
#ifdef ANCHO_USES_CANVAS
  CComQIPtr<ICanvasImageData> object(aObject);
  (*aRetVal) = object ? VARIANT_TRUE : VARIANT_FALSE;
#else
  (*aRetVal) = VARIANT_FALSE;
#endif // def ANCHO_USES_CANVAS
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoAddonService::pageActionToolbar(INT aTabId, VARIANT * aRetVal) {
  ENSURE_RETVAL(aRetVal);
  VariantInit(aRetVal);
  Proxy * proxy = mPageActionProxies.getProxyForTabId(aTabId);
  if (!proxy) {
    return S_FALSE;
  }
  return proxy->getToolBar(aRetVal);
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoAddonService::FindActiveBrowser(IWebBrowser2** webBrowser)
{
  ATLASSERT(webBrowser != NULL);
  *webBrowser = NULL;
  // First find the IE frame windows.
  HWND hIEFrame = NULL;
  do {
    hIEFrame = ::FindWindowEx(NULL, hIEFrame, L"IEFrame", NULL);
    if (hIEFrame) {
      BOOL enable = ::IsWindowEnabled(hIEFrame);
      // Now we enumerate the child windows to find the "Internet Explorer_Server".
      ::EnumChildWindows(hIEFrame, EnumBrowserWindows, (LPARAM) webBrowser);
      if (*webBrowser) {
        return S_OK;
      }
    }
  }while(hIEFrame);

  // Oops, for some reason we didn't find it.
  return E_FAIL;
}
