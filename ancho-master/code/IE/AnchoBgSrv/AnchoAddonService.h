/****************************************************************************
 * AnchoAddonService.h : Declaration of CAnchoAddonService
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <kontakt@seiberspace.de>
 ****************************************************************************/

#pragma once
#include "resource.h"       // main symbols

#include "AnchoBgSrv_i.h"
#include "AnchoBackground.h"
#include "AnchoBgSrvModule.h"
#include "IECookieManager.h"
#include "CommandQueue.h"


#include <Exceptions.h>
#include <SimpleWrappers.h>
#include <IPCHeartbeat.h>

#include <AnchoCommons/AsynchronousTaskManager.hpp>
#include "AnchoBackgroundServer/TabManager.hpp"
#include "AnchoBackgroundServer/WindowManager.hpp"
#include "AnchoBackgroundServer/JSConstructorManager.hpp"
#include "AnchoBackgroundServer/PageActionProxy.hpp"

#include <AnchoCommons/COMConversions.hpp>
#include <AnchoCommons/JavaScriptCallback.hpp>

#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

class CAnchoAddonService;
extern CAnchoAddonService *gAnchoAddonService;
/*============================================================================
 * class CAnchoAddonServiceCallback
 */
struct CAnchoAddonServiceCallback
{
  virtual void OnAddonFinalRelease(BSTR bsID) = 0;
};

/*============================================================================
 * class CAnchoAddonService
 */
class ATL_NO_VTABLE CAnchoAddonService :
  public CAnchoAddonServiceCallback,
  public CComObjectRootEx<CComSingleThreadModel>,
  public CComCoClass<CAnchoAddonService, &CLSID_AnchoAddonService>,
  public IAnchoAddonService,
  public IDispatchImpl<IAnchoServiceApi, &IID_IAnchoServiceApi, &LIBID_AnchoBgSrvLib, /*wMajor =*/ 0xffff, /*wMinor =*/ 0xffff>,
  public Ancho::Service::JSConstructorManager
{
public:
  // -------------------------------------------------------------------------
  // ctor
  CAnchoAddonService() : mGDIpToken(NULL)
  {
  }

public:
  // -------------------------------------------------------------------------
  // COM standard stuff
  DECLARE_REGISTRY_RESOURCEID(IDR_SCRIPTSERVICE)
  DECLARE_CLASSFACTORY_SINGLETON(CAnchoAddonService)
  DECLARE_NOT_AGGREGATABLE(CAnchoAddonService)
  DECLARE_PROTECT_FINAL_CONSTRUCT()

public:
  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(CAnchoAddonService)
    COM_INTERFACE_ENTRY(IAnchoAddonService)
    COM_INTERFACE_ENTRY(IDispatch)
    COM_INTERFACE_ENTRY(IAnchoServiceApi)
  END_COM_MAP()

public:
  // -------------------------------------------------------------------------
  // COM standard methods
  HRESULT FinalConstruct();
  void FinalRelease();

public:
  // -------------------------------------------------------------------------
  // Methods
  inline LPCTSTR GetThisPath() {return m_sThisPath;}

  // CAnchoAddonServiceCallback implementation
  virtual void OnAddonFinalRelease(BSTR bsID);

  HRESULT navigateBrowser(LPUNKNOWN aWebBrowserWin, const std::wstring &url, INT32 aNavigateOptions);
  HRESULT getActiveWebBrowser(LPUNKNOWN* pUnkWebBrowser);
public:
  // -------------------------------------------------------------------------
  // IAnchoServiceApi methods. See .idl for description.
  STDMETHOD(get_cookieManager)(LPDISPATCH* ppRet);
  STDMETHOD(get_tabManager)(LPDISPATCH* ppRet);
  STDMETHOD(get_windowManager)(LPDISPATCH* ppRet);

  STDMETHOD(invokeExternalEventObject)(BSTR aExtensionId, BSTR aEventName, LPDISPATCH aArgs, VARIANT* aRet);

  STDMETHOD(registerJSConstructors)(LPDISPATCH aObjectConstructor, LPDISPATCH aArrayConstructor, BSTR aExtensionId, INT aApiId);
  STDMETHOD(removeJSConstructors)(BSTR aExtensionId, INT aApiId);
  STDMETHOD(createJSObject)(BSTR aExtensionId, INT aApiId, LPDISPATCH *aObject);
  STDMETHOD(createJSArray)(BSTR aExtensionId, INT aApiId, LPDISPATCH *aArray);

  //STDMETHOD(get_browserActionInfos)(VARIANT* aBrowserActionInfos);
  STDMETHOD(getBrowserActions)(VARIANT* aBrowserActionsArray);
  STDMETHOD(addBrowserActionInfo)(LPDISPATCH aBrowserActionInfo);
  STDMETHOD(setBrowserActionUpdateCallback)(INT aTabId, LPDISPATCH aBrowserActionUpdateCallback);
  STDMETHOD(browserActionNotification)();
  STDMETHOD(isImageData)(LPDISPATCH aObject, VARIANT_BOOL * aRetVal);
  STDMETHOD(pageActionToolbar)(INT aTabId, VARIANT * aRetVal);

  STDMETHOD(testFunction)(BSTR aData)
  {
    ATLTRACE(L"TEST FUNCTION -----------------\n");
    BEGIN_TRY_BLOCK;
    return S_OK;
    END_TRY_BLOCK_CATCH_TO_HRESULT;
  }
  // -------------------------------------------------------------------------
  // IAnchoAddonService methods. See .idl for description.
  STDMETHOD(GetCreateAddonBackground)(BSTR bsID, IAnchoAddonBackground ** ppRet);
  STDMETHOD(GetModulePath)(BSTR * pbsPath);
  STDMETHOD(getInternalProtocolParameters)(BSTR * aServiceHost, BSTR * aServicePath);
  STDMETHOD(invokeEventObjectInAllExtensions)(BSTR aEventName, LPDISPATCH aArgs, VARIANT* aRet);
  STDMETHOD(invokeEventObjectInAllExtensionsWithIDispatchArgument)(BSTR aEventName, LPDISPATCH aArg);

  STDMETHOD(webBrowserReady)();

  STDMETHOD(registerBrowserActionToolbar)(OLE_HANDLE aFrameTab, BSTR * aUrl, INT*aTabId);
  STDMETHOD(unregisterBrowserActionToolbar)(INT aTabId);
  STDMETHOD(getDispatchObject)(IDispatch **aRet);

  STDMETHOD(initPageActions)(OLE_HANDLE aHwndBrowser, INT aTabId);
  STDMETHOD(releasePageActions)(INT aTabId);
  STDMETHOD(advicePageActionBar)(OLE_HANDLE hwndBrowser, IDispatch * aDispatch);
  STDMETHOD(unadvicePageActionBar)(OLE_HANDLE hwndBrowser);
  STDMETHOD(onTabNavigate)(INT aTabId);
  STDMETHOD(onTabActivate)(INT aNewTabId);

  Ancho::Service::TabManager & getTabManagerInstance() {return mTabManager;}
  Ancho::Service::WindowManager & getWindowManagerInstance() {return mWindowManager;}

  static CAnchoAddonService & instance()
  {
    ATLASSERT(gAnchoAddonService != NULL);
    return *gAnchoAddonService;
  }

  template<typename TCallable>
  void addBackgroundTask(TCallable aCallable)
  {
    mAsyncTaskManager.addTask(aCallable);
  }
public:

  HRESULT FindActiveBrowser(IWebBrowser2** webBrowser);
private:
    //Private type declarations

  // a map containing all addon background objects - one per addon
  typedef std::map<std::wstring, CAnchoAddonBackgroundComObject*> BackgroundObjectsMap;
  typedef std::map<int, CIDispatchHelper> BrowserActionCallbackMap;

  typedef CComCritSecLock<CComAutoCriticalSection> CSLock;

private:
  // -------------------------------------------------------------------------
  // Private members.


  BackgroundObjectsMap          m_BackgroundObjects;
  CComObjectStackEx<Ancho::Service::WindowManager>
                                mWindowManager;
  CComObjectStackEx<Ancho::Service::TabManager>
                                mTabManager;

  CComObjectStackEx<SimpleJSArray> m_BrowserActionInfos;
  BrowserActionCallbackMap      m_BrowserActionCallbacks;
  CommandQueue                  m_WebBrowserPostInitTasks;

  Ancho::Utils::AsynchronousTaskManager mAsyncTaskManager;

  // Path to this exe and also to magpie.
  CString                       m_sThisPath;
  // Install path from registry
  CString                       mInstallPath32;
  CString                       mInstallPath64;

  CComObjectStackEx<CIECookieManager> m_Cookies;

  Ancho::PageAction::ProxyManager
                                mPageActionProxies;

  ULONG_PTR                     mGDIpToken;
};

OBJECT_ENTRY_AUTO(__uuidof(AnchoAddonService), CAnchoAddonService)

//--------------------------------------------------------------------


