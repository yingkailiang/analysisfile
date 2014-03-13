#include "stdafx.h"
#include "HtmlToolbarWindow.h"

HRESULT HtmlToolbarWindow::FinalConstruct()
{
  mTabId = 0;
  return S_OK;
}

void HtmlToolbarWindow::FinalRelease()
{
}

LRESULT HtmlToolbarWindow::OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
  DefWindowProc();

  CComPtr<IAxWinHostWindow> spHost;
  IF_FAILED_RET2(QueryHost(__uuidof(IAxWinHostWindow), (void**)&spHost), -1);

  CComPtr<IUnknown>  p;
  IF_FAILED_RET2(spHost->CreateControlEx(_T("{8856F961-340A-11D0-A96B-00C04FD705A2}"), *this, NULL, &p, DIID_DWebBrowserEvents2, (IUnknown *)(WebBrowserEvents *) this), -1);

  mWebBrowser = p;
  if (!mWebBrowser) {
    return -1;
  }
  SetExternalUIHandler(this);

  return 0;
}

LRESULT HtmlToolbarWindow::OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled)
{
  SetExternalUIHandler(NULL);
  bHandled = FALSE;
  mWebBrowser.Release();
  mExternalDispatch.Release();
  return 1;
}

STDMETHODIMP_(void) HtmlToolbarWindow::OnBrowserProgressChange(LONG Progress, LONG ProgressMax)
{
  //Workaround to rid of the ActiveXObject
  //?? still some scripts are started earlier ??
  //also executed multiple times
//  InjectJsObjects();

}

STDMETHODIMP_(void) HtmlToolbarWindow::OnBrowserDocumentComplete(IDispatch* pDispBrowser, VARIANT * vtURL)
{
  // Make sure that we aren't zoomed (since the web browser control is initialized with the zoom
  // of the browser window).
  CComVariant zoom(100);
  CComVariant result;
  CComQIPtr<IWebBrowser2> pWebBrowser(pDispBrowser);
  if (pWebBrowser) {
    HRESULT hr = pWebBrowser->ExecWB(OLECMDID_OPTICAL_ZOOM, OLECMDEXECOPT_DONTPROMPTUSER, &zoom, &result);
  }

  CIDispatchHelper scriptDispatch = CIDispatchHelper::GetScriptDispatch(mWebBrowser);
  if (scriptDispatch) {
    CIDispatchHelper window;
    scriptDispatch.Get<CIDispatchHelper, VT_DISPATCH, IDispatch*>(L"window", window);
    if (window) {
      CComVariant idVariant = mTabId;
      DISPPARAMS params = {&idVariant, NULL, 1, 0};
      window.Call((LPOLESTR)L"initBrowserActionPage", &params);
    }
  }
}

// IDocHostUIHandlerDispatch
STDMETHODIMP HtmlToolbarWindow::TranslateAccelerator(DWORD_PTR hWnd, DWORD nMessage, DWORD_PTR wParam, DWORD_PTR lParam, BSTR bstrGuidCmdGroup, DWORD nCmdID, HRESULT *dwRetVal)
{
  return S_OK;
}

STDMETHODIMP HtmlToolbarWindow::ShowContextMenu(DWORD dwID, DWORD x, DWORD y, IUnknown *pcmdtReserved, IDispatch *pdispReserved, HRESULT *dwRetVal)
{
  ENSURE_RETVAL(dwRetVal);
  *dwRetVal = S_OK;
  return S_OK;
}

STDMETHODIMP HtmlToolbarWindow::GetHostInfo(DWORD *pdwFlags, DWORD *pdwDoubleClick)
{
  ENSURE_RETVAL(pdwFlags);
  ENSURE_RETVAL(pdwDoubleClick);
  *pdwFlags = DOCHOSTUIFLAG_DIALOG | DOCHOSTUIFLAG_THEME | DOCHOSTUIFLAG_DISABLE_SCRIPT_INACTIVE | DOCHOSTUIFLAG_NO3DBORDER | DOCHOSTUIFLAG_NO3DOUTERBORDER;
  *pdwDoubleClick = DOCHOSTUIDBLCLK_DEFAULT;
  return S_OK;
}

STDMETHODIMP HtmlToolbarWindow::GetExternal(IDispatch **ppDispatch)
{
  ENSURE_RETVAL(ppDispatch);
  *ppDispatch = NULL;
  if (mExternalDispatch)
  {
    return mExternalDispatch.QueryInterface(ppDispatch);
  }
  return S_FALSE;
}
