/****************************************************************************
 * AnchoRuntime.h : Declaration of the CAnchoRuntime
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <kontakt@seiberspace.de>
 ****************************************************************************/

#pragma once
#include "resource.h"       // main symbols

#include <Shlobj.h>
#include "HTMLToolbarWindow.h"
#include "ancho_i.h"

#include "CookieManager.h"

#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif


/*============================================================================
 * class CAnchoRuntime
 */
class CAnchoRuntime;
typedef IDispEventImpl<1, CAnchoRuntime, &DIID_DWebBrowserEvents2, &LIBID_SHDocVw, 1, 0> TWebBrowserEvents;
typedef IDispEventImpl<2, CAnchoRuntime, &IID_DAnchoBrowserEvents, &LIBID_anchoLib, 0xffff, 0xffff> TAnchoBrowserEvents;

class ATL_NO_VTABLE CAnchoRuntime :
  public CComObjectRootEx<CComSingleThreadModel>,
  public CComCoClass<CAnchoRuntime, &CLSID_AnchoRuntime>,
  public IObjectWithSiteImpl<CAnchoRuntime>,
  public TWebBrowserEvents,
  public TAnchoBrowserEvents,
  public IAnchoRuntime,
  public IDeskBand
{
  struct FrameRecord
  {
    FrameRecord(CComPtr<IWebBrowser2> aBrowser = CComPtr<IWebBrowser2>(), bool aIsTopLevel = false, int aFrameId = -1)
      : browser(aBrowser), frameId(aFrameId), isTopLevel(aIsTopLevel)
    { }

    CComPtr<IWebBrowser2> browser;
    int frameId;
    bool isTopLevel;
  };

  typedef std::map<std::wstring, FrameRecord> FrameMap;
public:
  // -------------------------------------------------------------------------
  // ctor
  CAnchoRuntime() :
      mWebBrowserEventsCookie(0),
      mAnchoBrowserEventsCookie(0),
      mExtensionPageAPIPrepared(false),
      mNextFrameId(0),
      mIsExtensionPage(false)
  {
  }

  // -------------------------------------------------------------------------
  // COM standard stuff
  DECLARE_REGISTRY_RESOURCEID(IDR_ANCHORUNTIME)
  DECLARE_NOT_AGGREGATABLE(CAnchoRuntime)
  DECLARE_PROTECT_FINAL_CONSTRUCT()

  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(CAnchoRuntime)
    COM_INTERFACE_ENTRY(IAnchoRuntime)
    COM_INTERFACE_ENTRY(IObjectWithSite)
    COM_INTERFACE_ENTRY(IDeskBand)
    COM_INTERFACE_ENTRY(IOleWindow)
    COM_INTERFACE_ENTRY(IDockingWindow)
  END_COM_MAP()

  // -------------------------------------------------------------------------
  // COM implemented categories
  BEGIN_CATEGORY_MAP(CAnchoRuntime)
    IMPLEMENTED_CATEGORY(CATID_CommBand)
  END_CATEGORY_MAP()

  // -------------------------------------------------------------------------
  // COM sink map
  BEGIN_SINK_MAP(CAnchoRuntime)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_BEFORENAVIGATE2, OnBrowserBeforeNavigate2)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_NAVIGATECOMPLETE2, OnNavigateComplete)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_PROGRESSCHANGE, OnBrowserProgressChange)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_DOWNLOADBEGIN, OnBrowserDownloadBegin)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_WINDOWSTATECHANGED, OnWindowStateChanged)
    SINK_ENTRY_EX(2, IID_DAnchoBrowserEvents, 1, OnFrameStart)
    SINK_ENTRY_EX(2, IID_DAnchoBrowserEvents, 2, OnFrameEnd)
    SINK_ENTRY_EX(2, IID_DAnchoBrowserEvents, 3, OnFrameRedirect)

    SINK_ENTRY_EX(2, IID_DAnchoBrowserEvents, 4, OnBeforeRequest)
    SINK_ENTRY_EX(2, IID_DAnchoBrowserEvents, 5, OnBeforeSendHeaders)
  END_SINK_MAP()

  // -------------------------------------------------------------------------
  // COM standard methods
  HRESULT FinalConstruct()
  {
    m_dwBandID = 0;
    m_dwViewMode = 0;
    return S_OK;
  }

  void FinalRelease()
  {
    DestroyAddons();
    Cleanup();
  }

public:
// IDeskBand
  STDMETHOD(GetBandInfo)(DWORD dwBandID, DWORD dwViewMode, DESKBANDINFO* pdbi);

// IOleWindow
  STDMETHOD(GetWindow)(HWND* phwnd);
  STDMETHOD(ContextSensitiveHelp)(BOOL fEnterMode);

// IDockingWindow
  STDMETHOD(CloseDW)(unsigned long dwReserved);
  STDMETHOD(ResizeBorderDW)(const RECT* prcBorder, IUnknown* punkToolbarSite, BOOL fReserved);
  STDMETHOD(ShowDW)(BOOL fShow);

  // -------------------------------------------------------------------------
  // IObjectWithSiteImpl methods
  STDMETHOD(SetSite)(IUnknown *pUnkSite);

  // -------------------------------------------------------------------------
  // IAnchoRuntime methods
  STDMETHOD(get_cookieManager)(LPDISPATCH* ppRet);
  STDMETHOD(reloadTab)();
  STDMETHOD(closeTab)();
  STDMETHOD(executeScript)(BSTR aExtensionId, BSTR aCode, INT aFileSpecified);
  STDMETHOD(updateTab)(LPDISPATCH aProperties);
  STDMETHOD(fillTabInfo)(VARIANT* aInfo);
  STDMETHOD(showBrowserActionBar)(INT aShow);

  // DWebBrowserEvents2 methods
  STDMETHOD_(void, OnNavigateComplete)(LPDISPATCH pDispatch, VARIANT *URL);
  STDMETHOD_(void, OnBrowserBeforeNavigate2)(LPDISPATCH pDisp, VARIANT *pURL, VARIANT *Flags,
    VARIANT *TargetFrameName, VARIANT *PostData, VARIANT *Headers, BOOL *Cancel);

  STDMETHOD_(void, OnBrowserDownloadBegin)();
  STDMETHOD_(void, OnWindowStateChanged)(LONG dwFlags, LONG dwValidFlagsMask);
  STDMETHOD_(void, OnBrowserProgressChange)(LONG Progress, LONG ProgressMax);

  // -------------------------------------------------------------------------
  // DAnchoBrowserEvents methods.
  STDMETHOD(OnFrameStart)(BSTR bstrUrl, VARIANT_BOOL bIsMainFrame);
  STDMETHOD(OnFrameEnd)(BSTR bstrUrl, VARIANT_BOOL bIsMainFrame);
  STDMETHOD(OnFrameRedirect)(BSTR bstrOldUrl, BSTR bstrNewUrl);

  STDMETHOD(OnBeforeRequest)(VARIANT aReporter);
  STDMETHOD(OnBeforeSendHeaders)(VARIANT aReporter);


private:
  // -------------------------------------------------------------------------
  // Methods
  HRESULT initCookieManager(IAnchoServiceApi * aServiceAPI);
  HRESULT initTabManager(IAnchoServiceApi * aServiceAPI, HWND aHwndFrameTab);
  HRESULT initWindowManager(IAnchoServiceApi * aServiceAPI, IAnchoWindowManagerInternal ** aWindowManager);

  HRESULT InitAddons();
  void DestroyAddons();
  HRESULT Init();
  HRESULT Cleanup();
  HRESULT InitializeContentScripting(BSTR bstrUrl, VARIANT_BOOL bIsRefreshingMainFrame, documentLoadPhase aPhase);
  HRESULT InitializeExtensionScripting(BSTR bstrUrl);

  void fillRequestInfo(SimpleJSObject &aInfo, const std::wstring &aUrl, const std::wstring &aMethod, const CAnchoRuntime::FrameRecord *aFrameRecord);
  struct BeforeRequestInfo
  {
    BeforeRequestInfo(): cancel(false), redirect(false) {}
    bool cancel;
    bool redirect;
    std::wstring newUrl;
  };
  HRESULT fireOnBeforeRequest(const std::wstring &aUrl, const std::wstring &aMethod, const FrameRecord *aType, /*out*/ BeforeRequestInfo &aOutInfo);

  struct BeforeSendHeadersInfo
  {
    BeforeSendHeadersInfo() : modifyHeaders(false) {}
    bool modifyHeaders;
    std::wstring headers;
  };
  HRESULT fireOnBeforeSendHeaders(const std::wstring &aUrl, const std::wstring &aMethod, const CAnchoRuntime::FrameRecord *aFrameRecord, /*out*/ BeforeSendHeadersInfo &aOutInfo);

  HWND getTabWindowClassWindow();
  bool isTabActive();
private:
  // -------------------------------------------------------------------------
  // Private members.
  typedef std::map<std::wstring, CComPtr<IAnchoAddon> > AddonMap;
  CComQIPtr<IWebBrowser2>                 mWebBrowser;
  CComPtr<IAnchoAddonService>             mAnchoService;
  CComPtr<IAnchoTabManagerInternal>       mTabManager;
  AddonMap                                mMapAddons;
  int                                     mTabId;
  LONG                                    mWindowId;
  CComPtr<DAnchoBrowserEvents>            mBrowserEventSource;
  DWORD                                   mWebBrowserEventsCookie;
  DWORD                                   mAnchoBrowserEventsCookie;

  FrameMap                                mMapFrames;
  int                                     mNextFrameId;//used for generating frameIds

  bool                                    mExtensionPageAPIPrepared;
  bool                                    mIsExtensionPage;

  HeartbeatSlave                          mHeartbeatSlave;

  CComPtr<Ancho::CookieManagerComObject>  mCookieManager;

  CComObjectStackEx<HtmlToolbarWindow>    mToolbarWindow;
  DWORD m_dwBandID;
  DWORD m_dwViewMode;
};

OBJECT_ENTRY_AUTO(__uuidof(AnchoRuntime), CAnchoRuntime)

