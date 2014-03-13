#include "stdafx.h"
#include "PopupWindow.h"
#include "AnchoBgSrv_i.h"
#include "AnchoAddonService.h"
#include "AnchoShared_i.h"
#include "AnchoShared/AnchoShared.h"

#include "AnchoBackgroundServer/TabManager.hpp"
#include <AnchoCommons/COMConversions.hpp>
#include <AnchoCommons/JavaScriptCallback.hpp>

//class CPopupResizeEventHandler;
//typedef CComObject<CPopupResizeEventHandler> CPopupResizeEventHandlerComObject;

template<typename TFunctor>
class ATL_NO_VTABLE EventHandler :
    public CComObjectRootEx<CComSingleThreadModel>,
    public IDispatchImpl<IWebBrowserEventHandler, &IID_IWebBrowserEventHandler, &LIBID_AnchoBgSrvLib,
                /*wMajor =*/ 0xffff, /*wMinor =*/ 0xffff>
{
public:
  typedef EventHandler<TFunctor> ThisClass;
  // -------------------------------------------------------------------------
  // COM standard stuff
  DECLARE_NO_REGISTRY();
  DECLARE_NOT_AGGREGATABLE(ThisClass)
  DECLARE_PROTECT_FINAL_CONSTRUCT()

public:
  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(ThisClass)
    COM_INTERFACE_ENTRY(IWebBrowserEventHandler)
    COM_INTERFACE_ENTRY(IDispatch)
  END_COM_MAP()

public:
  EventHandler(){}
  // -------------------------------------------------------------------------
  // static creator function
  static HRESULT createObject(TFunctor aListener, CComObject<EventHandler<TFunctor> > *& pRet)
  {
    CComObject<EventHandler<TFunctor> > *newObject = pRet = NULL;
    IF_FAILED_RET(CComObject<EventHandler<TFunctor> >::CreateInstance(&newObject));
    newObject->AddRef();
    newObject->mListener = aListener;
    pRet = newObject;
    return S_OK;
  }

public:
  // -------------------------------------------------------------------------
  // COM standard methods
  HRESULT FinalConstruct(){return S_OK;}
  void FinalRelease(){}


  STDMETHOD(onFire)()
  {
    IF_THROW_RET(mListener());
    //mWin->checkResize();
    return S_OK;
  }

private:
  TFunctor mListener;
};

//TODO - Replace by boost::bind()
struct OnResizeFunctor
{
  OnResizeFunctor(CPopupWindow *aWin = NULL) : mWin(aWin)
  { /*empty*/ }

  void operator()()
  {
    ATLASSERT(mWin);
    mWin->checkResize();
  }
  CPopupWindow *mWin;
};
typedef EventHandler<OnResizeFunctor> PopupResizeEventHandler;
typedef CComObject<PopupResizeEventHandler> PopupResizeEventHandlerComObject;

struct OnClickFunctor
{
  //OnClickFunctor(){}
  OnClickFunctor(CPopupWindow *aWin = NULL/*, CComPtr<IWebBrowser2> aWebBrowser*/) : mWin(aWin)//, mWebBrowser(aWebBrowser)
  { /*empty*/ }

  void operator()()
  {
    ATLASSERT(mWin);
    ATLASSERT(mWin->mWebBrowser);
    //ATLASSERT(mWebBrowser);

    CComPtr<IDispatch> doc;
    HRESULT hr = mWin->mWebBrowser->get_Document(&doc);
    CComQIPtr<IHTMLDocument2> htmlDocument2 = doc;
    if (FAILED(hr) || !htmlDocument2) {
      return;
    }

    CComQIPtr<IHTMLWindow2> htmlWindow2;
    hr = htmlDocument2->get_parentWindow(&htmlWindow2);
    if (FAILED(hr) || !htmlWindow2) {
      return;
    }

    CComQIPtr<IHTMLEventObj> htmlEvent;
    hr = htmlWindow2->get_event(&htmlEvent);
    if (FAILED(hr) || !htmlEvent) {
      return;
    }

    CComQIPtr<IHTMLElement> htmlElement;
    hr = htmlEvent->get_srcElement(&htmlElement);
    if (FAILED(hr) || !htmlElement) {
      return;
    }
    //check if we have anchor - if not try its parents
    CComQIPtr<IHTMLAnchorElement> anchor = htmlElement;
    while (htmlElement && !anchor) {
      CComQIPtr<IHTMLElement> tmpElement;
      hr = htmlElement->get_parentElement(&tmpElement);
      if (FAILED(hr)) {
        return;
      }
      anchor = htmlElement = tmpElement;
    }

    if (!anchor) {
        return;
    }
    CComBSTR hrefValue(L"href");
    hr = anchor->get_href(&hrefValue);
    if (FAILED(hr)) {
      return;
    }

    if (hrefValue.Length() == 0) {
      return;
    }

    htmlEvent->put_returnValue(CComVariant(false));

    Ancho::Utils::JSObject properties;
    properties[L"url"] = std::wstring(hrefValue.m_str);

    Ancho::Service::TabManager::instance().createTab(properties);
  }
  CPopupWindow *mWin;
  //CComPtr<IWebBrowser2> mWebBrowser;
};
typedef EventHandler<OnClickFunctor> PopupOnClickEventHandler;
typedef CComObject<PopupOnClickEventHandler> PopupOnClickEventHandlerComObject;

// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------

void CPopupWindow::InjectJsObjects()
{
  // We don't care here if it works, if not, fail silently.
  // It will anyway be called again later when script and window
  // are available.
  if (!mWebBrowser) {
    return;
  }
  CIDispatchHelper script = CIDispatchHelper::GetScriptDispatch(mWebBrowser);
  if (!script) {
    return;
  }
  CIDispatchHelper window;
  script.Get<CIDispatchHelper, VT_DISPATCH, IDispatch*>(L"window", window);
  for (DispatchMap::iterator it = mInjectedObjects.begin(); it != mInjectedObjects.end(); ++it) {
    CComVariant vt(it->second);
    // set in any case to global script dispatch..
    script.SetProperty((LPOLESTR)(it->first.c_str()), vt);
    if (window) {
      //.. and just in case also window if we have already one
      window.SetProperty((LPOLESTR)(it->first.c_str()), vt);
    }
  }
}



HRESULT CPopupWindow::FinalConstruct()
{
  CComPtr<PopupResizeEventHandlerComObject> onResizeEventHandler;
  PopupResizeEventHandler::createObject(OnResizeFunctor(this), onResizeEventHandler.p);
  mResizeEventHandler = onResizeEventHandler;


  CComPtr<PopupOnClickEventHandlerComObject> onClickEventHandler;
  PopupOnClickEventHandler::createObject(OnClickFunctor(this), onClickEventHandler.p);
  mClickEventHandler = onClickEventHandler;
  return S_OK;
}

void CPopupWindow::FinalRelease()
{
}

BOOL CPopupWindow::PreTranslateMessage(MSG* pMsg)
{
	if((pMsg->message < WM_KEYFIRST || pMsg->message > WM_KEYLAST) &&
	   (pMsg->message < WM_MOUSEFIRST || pMsg->message > WM_MOUSELAST))
		return FALSE;

	// give HTML page a chance to translate this message
	return (BOOL)SendMessage(WM_FORWARDMSG, 0, (LPARAM)pMsg);
}

void CPopupWindow::OnFinalMessage(HWND)
{
  // This Release call is paired with the AddRef call in OnCreate.
  Release();
}

LRESULT CPopupWindow::OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
  DefWindowProc();

  mRectBorders.left = mRectBorders.right = GetSystemMetrics(SM_CXBORDER);
  mRectBorders.top = mRectBorders.bottom = GetSystemMetrics(SM_CYBORDER);
  ::SetClassLongPtr(*this, GCL_STYLE, ::GetClassLongPtr(*this, GCL_STYLE)|CS_DROPSHADOW);

  CComPtr<IAxWinHostWindow> spHost;
  IF_FAILED_RET2(QueryHost(__uuidof(IAxWinHostWindow), (void**)&spHost), -1);

  CComPtr<IUnknown>  p;
  IF_FAILED_RET2(spHost->CreateControlEx(_T("{8856F961-340A-11D0-A96B-00C04FD705A2}"), *this, NULL, &p, DIID_DWebBrowserEvents2, (IUnknown *)(PopupWebBrowserEvents *) this), -1);

  mWebBrowser = p;
  if (!mWebBrowser)
  {
    return -1;
  }

  _AtlModule.GetMessageLoop()->AddMessageFilter(this);

  //Replacing XMLHttpRequest by wrapper
  CComPtr<IAnchoXmlHttpRequest> pRequest;
  IF_FAILED_RET(createAnchoXHRInstance(&pRequest));
  mInjectedObjects[L"XMLHttpRequest"] = pRequest.p;

  //Workaround to rid of the ActiveXObject
  mInjectedObjects[L"ActiveXObject"] = NULL;

  // inject all objects the first time
  InjectJsObjects();

  // and load page
  mWebBrowser->Navigate(CComBSTR(mURL), NULL, NULL, NULL, NULL);

  // set a timer for resizing
  SetTimer(TIMER_ID, TIMER_TIMEOUT, NULL);

  // This AddRef call is paired with the Release call in OnFinalMessage
  // to keep the object alive as long as the window exists.
  AddRef();
  return 0;
}

LRESULT CPopupWindow::OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled)
{
  _AtlModule.GetMessageLoop()->RemoveMessageFilter(this);

  bHandled = FALSE;
  //Cleanup procedure
  KillTimer(TIMER_ID);

  mResizeEventAdapter.remove();
  mClickEventAdapter.remove();

  mCloseCallback.Invoke0(DISPID(0));
  mWebBrowser.Release();
  return 1;
}

LRESULT CPopupWindow::OnActivate(UINT /*uMsg*/, WPARAM wParam, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
  if (wParam == WA_INACTIVE) {
    DestroyWindow();
    return 0;
  }
  return 1;
}

LRESULT CPopupWindow::OnTimer(UINT /*uMsg*/, WPARAM wParam, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
  if (TIMER_ID == wParam) {
    checkResize();
  }
  return 0;
}

STDMETHODIMP_(void) CPopupWindow::OnBrowserProgressChange(LONG Progress, LONG ProgressMax)
{
  //Workaround to rid of the ActiveXObject
  //?? still some scripts are started earlier ??
  //also executed multiple times
  InjectJsObjects();

  //Autoresize
  checkResize();

  CComQIPtr<IHTMLElement2> bodyElement = getBodyElement();

  if (bodyElement) {
    mResizeEventAdapter.addTo(bodyElement, L"resize", mResizeEventHandler);
  }

  CComPtr<IDispatch> doc;
  if (FAILED(mWebBrowser->get_Document(&doc)) || !doc) {
    return;
  }
  CComQIPtr<IHTMLDocument2> htmlDocument2 = doc;
  if (htmlDocument2) {
    mClickEventAdapter.addTo(htmlDocument2, L"click", mClickEventHandler);
    return;
  }
}

STDMETHODIMP_(void) CPopupWindow::OnNavigateComplete(IDispatch* pDispBrowser, VARIANT * vtURL)
{
  InjectJsObjects();
}

void CPopupWindow::checkResize()
{
  CComQIPtr<IHTMLElement2> bodyElement = getBodyElement();
  if (!bodyElement) {
    return;
  }

  long contentHeight, contentWidth;
  if (FAILED(bodyElement->get_scrollHeight(&contentHeight)) ||
    FAILED(bodyElement->get_scrollWidth(&contentWidth)))
  {
    return;
  }
  if (contentHeight > 0 && contentWidth > 0) {
    contentWidth += mRectBorders.left + mRectBorders.right;
    contentHeight += mRectBorders.top + mRectBorders.bottom;
    CRect rect;
    BOOL res = GetWindowRect(rect);

    if (res && (rect.Height() != contentHeight || rect.Width() != contentWidth)) {
      MoveWindow(rect.left, rect.top, contentWidth, contentHeight, TRUE);
    }
  }
}

CComPtr<IHTMLElement> CPopupWindow::getBodyElement()
{
  CComPtr<IDispatch> doc;
  if (FAILED(mWebBrowser->get_Document(&doc)) || !doc) {
    return CComPtr<IHTMLElement>();
  }
  CComQIPtr<IHTMLDocument2> htmlDocument2 = doc;
  if (!htmlDocument2) {
    return CComPtr<IHTMLElement>();
  }
  CComPtr<IHTMLElement> element;
  if (FAILED(htmlDocument2->get_body(&element)) || !element ) {
    return CComPtr<IHTMLElement>();
  }
  return element;
}


HRESULT CPopupWindow::CreatePopupWindow(HWND aParent, CAnchoAddonService *aService, const DispatchMap &aInjectedObjects, LPCWSTR aURL, int aX, int aY, CIDispatchHelper aCloseCallback)
{
  ATLASSERT(aService);
  CPopupWindowComObject * pNewWindow = NULL;
  IF_FAILED_RET(CPopupWindowComObject::CreateInstance(&pNewWindow));
  pNewWindow->mURL = aURL;
  pNewWindow->mInjectedObjects = aInjectedObjects;
  pNewWindow->mCloseCallback = aCloseCallback;
  pNewWindow->mService = aService;
  RECT r = {aX, aY, aX + defaultWidth, aY + defaultHeight};

  if (!pNewWindow->Create(aParent, r, NULL, WS_POPUP|WS_BORDER))
  {
    return E_FAIL;
  }
  pNewWindow->ShowWindow(SW_SHOW);
  return S_OK;
}

