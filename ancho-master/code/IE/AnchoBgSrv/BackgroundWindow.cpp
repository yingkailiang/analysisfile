#include "StdAfx.h"
#include "BackgroundWindow.h"
#include "AnchoShared_i.h"
#include "AnchoShared/AnchoShared.h"

HRESULT CBackgroundWindow::FinalConstruct()
{
  return S_OK;
}

void CBackgroundWindow::FinalRelease()
{
}

void CBackgroundWindow::OnFinalMessage(HWND)
{
  // This Release call is paired with the AddRef call in OnCreate.
  Release();
}

void CBackgroundWindow::InjectJsObjects()
{
  // We don't care here if it works, if not, fail silently.
  // It will anyway be called again later when script and window
  // are available.
  if (!m_pWebBrowser) {
    return;
  }
  CIDispatchHelper script = CIDispatchHelper::GetScriptDispatch(m_pWebBrowser);
  if (!script) {
    return;
  }
  CIDispatchHelper window;
  script.Get<CIDispatchHelper, VT_DISPATCH, IDispatch*>(L"window", window);
  for (DispatchMap::iterator it = m_InjectedObjects.begin(); it != m_InjectedObjects.end(); ++it) {
    CComVariant vt(it->second);
    // set in any case to global script dispatch..
    script.SetProperty((LPOLESTR)(it->first.c_str()), vt);
    if (window) {
      //.. and just in case also window if we have already one
      window.SetProperty((LPOLESTR)(it->first.c_str()), vt);
    }
  }
}

LRESULT CBackgroundWindow::OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/)
{
  DefWindowProc();

  CComPtr<IAxWinHostWindow> spHost;
  IF_FAILED_RET2(QueryHost(__uuidof(IAxWinHostWindow), (void**)&spHost), -1);

  CComPtr<IUnknown>  p;
  IF_FAILED_RET2(spHost->CreateControlEx(_T("{8856F961-340A-11D0-A96B-00C04FD705A2}"), *this, NULL, &p, DIID_DWebBrowserEvents2, (IUnknown *)(BackgroundWindowWebBrowserEvents *) this), -1);

  m_pWebBrowser = p;
  if (!m_pWebBrowser) {
    return -1;
  }

  //Replacing XMLHttpRequest by wrapper
  CComPtr<IAnchoXmlHttpRequest> pRequest;
  IF_FAILED_RET(createAnchoXHRInstance(&pRequest));
  m_InjectedObjects[L"XMLHttpRequest"] = pRequest.p;

  //Workaround to rid of the ActiveXObject
  m_InjectedObjects[L"ActiveXObject"] = NULL;

  // inject all objects the first time
  InjectJsObjects();

  // and load page
  m_pWebBrowser->Navigate(CComBSTR(m_sURL), NULL, NULL, NULL, NULL);

  // This AddRef call is paired with the Release call in OnFinalMessage
  // to keep the object alive as long as the window exists.
  AddRef();
  return 0;
}

LRESULT CBackgroundWindow::OnDestroy(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled)
{
  bHandled = FALSE;
  m_pWebBrowser.Release();
//  m_pDispApiJS.Release();
  return 1;
}

STDMETHODIMP_(void) CBackgroundWindow::OnBrowserProgressChange(LONG Progress, LONG ProgressMax)
{
  // This method of injecting again and again is brutal, but it seems to be the
  // only way to reliably inject things like "chrome", "XMLHttpRequest" etc.
  // It is done here, in OnCreate() and in OnNavigateComplete(). All together it seems to work.
  InjectJsObjects();
}

STDMETHODIMP_(void) CBackgroundWindow::OnNavigateComplete(IDispatch* pDispBrowser, VARIANT * vtURL)
{
  InjectJsObjects();
}

HRESULT CBackgroundWindow::CreateBackgroundWindow(const DispatchMap &aInjectedObjects, LPCWSTR lpszURL, CBackgroundWindowComObject ** ppRet)
{
  ENSURE_RETVAL(ppRet);
  (*ppRet) = NULL;
  CBackgroundWindowComObject * pNewWindow = NULL;
  IF_FAILED_RET(CBackgroundWindowComObject::CreateInstance(&pNewWindow));
  pNewWindow->AddRef();
  pNewWindow->m_sURL = lpszURL;
  pNewWindow->m_InjectedObjects = aInjectedObjects;
  RECT r = {0,0,0,0};
  if (!pNewWindow->Create(NULL, r, NULL, WS_POPUP))
  {
    pNewWindow->Release();
    return E_FAIL;
  }
  pNewWindow->ShowWindow(SW_HIDE);
  (*ppRet) = pNewWindow;
  return S_OK;
}
