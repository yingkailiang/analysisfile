#pragma once

//#include <atlwin.h>

#define NOT_IMPLEMENTED {return E_NOTIMPL;}

class HtmlToolbarWindow;
typedef IDispEventImpl<1, HtmlToolbarWindow, &DIID_DWebBrowserEvents2, &LIBID_SHDocVw, 1, 0> WebBrowserEvents;

class HtmlToolbarWindow :
  public CComObjectRootEx<CComSingleThreadModel>,
  public CWindowImpl<HtmlToolbarWindow, CAxWindow>,
  public IDispatchImpl<IDocHostUIHandlerDispatch, &IID_IDocHostUIHandlerDispatch, &LIBID_MSHTML>,
  public WebBrowserEvents
{
public:
  DECLARE_WND_SUPERCLASS(NULL, CAxWindow::GetWndClassName())
  DECLARE_PROTECT_FINAL_CONSTRUCT()

  BEGIN_COM_MAP(HtmlToolbarWindow)
    COM_INTERFACE_ENTRY(IUnknown)
  END_COM_MAP()

  BEGIN_SINK_MAP(HtmlToolbarWindow)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_PROGRESSCHANGE, OnBrowserProgressChange)
    SINK_ENTRY_EX(1, DIID_DWebBrowserEvents2, DISPID_DOCUMENTCOMPLETE, OnBrowserDocumentComplete)
  END_SINK_MAP()

  BEGIN_MSG_MAP(HtmlToolbarWindow)
    MESSAGE_HANDLER(WM_CREATE, OnCreate)
    MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
  END_MSG_MAP()

  HRESULT FinalConstruct();
  void FinalRelease();

//  static HRESULT CreateHtmlToolbarWindow(HWND aParent, CAnchoAddonService *aService, const DispatchMap &aInjectedObjects, LPCWSTR aURL, int aX, int aY, CIDispatchHelper aCloseCallback);

  LRESULT OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);
  LRESULT OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled);

// IDocHostUIHandlerDispatch
  STDMETHOD(ShowUI)(DWORD dwID, IUnknown *pActiveObject, IUnknown *pCommandTarget, IUnknown *pFrame, IUnknown *pDoc, HRESULT *dwRetVal) NOT_IMPLEMENTED
  STDMETHOD(HideUI)(void) NOT_IMPLEMENTED
  STDMETHOD(UpdateUI)(void) NOT_IMPLEMENTED
  STDMETHOD(EnableModeless)(VARIANT_BOOL fEnable) NOT_IMPLEMENTED
  STDMETHOD(OnDocWindowActivate)(VARIANT_BOOL fActivate) NOT_IMPLEMENTED
  STDMETHOD(OnFrameWindowActivate)(VARIANT_BOOL fActivate) NOT_IMPLEMENTED
  STDMETHOD(ResizeBorder)(long left, long top, long right, long bottom, IUnknown *pUIWindow, VARIANT_BOOL fFrameWindow) NOT_IMPLEMENTED
  STDMETHOD(GetOptionKeyPath)(BSTR *pbstrKey, DWORD dw) NOT_IMPLEMENTED
  STDMETHOD(GetDropTarget)(IUnknown *pDropTarget, IUnknown **ppDropTarget) NOT_IMPLEMENTED
  STDMETHOD(TranslateUrl)(DWORD dwTranslate, BSTR bstrURLIn, BSTR *pbstrURLOut) NOT_IMPLEMENTED
  STDMETHOD(FilterDataObject)(IUnknown *pDO, IUnknown **ppDORet) NOT_IMPLEMENTED

  STDMETHOD(TranslateAccelerator)(DWORD_PTR hWnd, DWORD nMessage, DWORD_PTR wParam, DWORD_PTR lParam, BSTR bstrGuidCmdGroup, DWORD nCmdID, HRESULT *dwRetVal);
  STDMETHOD(ShowContextMenu)(DWORD dwID, DWORD x, DWORD y, IUnknown *pcmdtReserved, IDispatch *pdispReserved, HRESULT *dwRetVal);
  STDMETHOD(GetHostInfo)(DWORD *pdwFlags, DWORD *pdwDoubleClick);
  STDMETHOD(GetExternal)(IDispatch **ppDispatch);

  STDMETHOD_(void, OnBrowserProgressChange)(LONG Progress, LONG ProgressMax);
  STDMETHOD_(void, OnBrowserDocumentComplete)(IDispatch* pDispBrowser, VARIANT * vtURL);

  CComQIPtr<IWebBrowser2>   mWebBrowser;     // Embedded WebBrowserControl
  CComPtr<IDispatch>  mExternalDispatch;
  int mTabId;

};

#undef NOT_IMPLEMENTED
