/****************************************************************************
 * AnchoRuntime.cpp : Implementation of CAnchoRuntime
 * Copyright 2012 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <kontakt@seiberspace.de>
 ****************************************************************************/

#include "stdafx.h"
#include <map>
#include "anchocommons.h"
#include "AnchoRuntime.h"
#include "AnchoAddon.h"
#include "AnchoBrowserEvents.h"
#include "AnchoPassthruAPP.h"
#include "dllmain.h"
#include <AnchoCommons/JSValueWrapper.hpp>
#include "ProtocolHandlerRegistrar.h"

#include <string>
#include <ctime>

#include <Iepmapi.h>
#pragma comment(lib, "Iepmapi.lib")

#include "WindowDocumentMap.h"
WindowDocumentMap gWindowDocumentMap;
/*============================================================================
 * class CAnchoRuntime
 */

//----------------------------------------------------------------------------
//  InitAddons
HRESULT CAnchoRuntime::InitAddons()
{
  // create all addons
  // open the registry key where all extensions are registered,
  // iterate subkeys and load each extension

  CRegKey regKey;
  LONG res = regKey.Open(HKEY_CURRENT_USER, s_AnchoExtensionsRegistryKey, KEY_READ);
  if (ERROR_SUCCESS != res)
  {
    return HRESULT_FROM_WIN32(res);
  }
  DWORD iIndex = 0;
  CString sKeyName;
  DWORD dwLen = 4096;
  HRESULT hr = S_OK;

  while(ERROR_SUCCESS == regKey.EnumKey(iIndex++, sKeyName.GetBuffer(dwLen), &dwLen, NULL))
  {
    sKeyName.ReleaseBuffer();
    CAnchoAddonComObject * pNewObject = NULL;
    hr = CAnchoAddonComObject::CreateInstance(&pNewObject);
    if (SUCCEEDED(hr))
    {
      CComPtr<IAnchoAddon> addon(pNewObject);
      hr = addon->Init(sKeyName, mAnchoService, mWebBrowser);
      if (SUCCEEDED(hr))
      {
        mMapAddons[std::wstring(sKeyName)] = addon;
      }
    }
    dwLen = 4096;
  }
  return S_OK;
}

//----------------------------------------------------------------------------
//  DestroyAddons
void CAnchoRuntime::DestroyAddons()
{
  AddonMap::iterator it = mMapAddons.begin();
  while(it != mMapAddons.end()) {
    it->second->Shutdown();
    ++it;
  }
  mMapAddons.clear();

  ATLTRACE(L"ANCHO: all addons destroyed for runtime %d\n", mTabId);
}

//----------------------------------------------------------------------------
//  Cleanup
HRESULT CAnchoRuntime::Cleanup()
{
  mToolbarWindow.DestroyWindow();

  // release page actions first
  if (mAnchoService) {
    mAnchoService->releasePageActions(mTabId);
    mAnchoService->unregisterBrowserActionToolbar(mTabId);
  }

  // unadvise events
  if (mBrowserEventSource) {
    AtlUnadvise(mBrowserEventSource, IID_DAnchoBrowserEvents, mAnchoBrowserEventsCookie);
    mBrowserEventSource.Release();
    mAnchoBrowserEventsCookie = 0;
  }
  if (mWebBrowser) {
    AtlUnadvise(mWebBrowser, DIID_DWebBrowserEvents2, mWebBrowserEventsCookie);
    mWebBrowser.Release();
    mWebBrowserEventsCookie = 0;
  }

  // remove instance from tab map and -manager
  gWindowDocumentMap.eraseTab(mTabId);
  if(mTabManager) {
    mTabManager->unregisterRuntime(mTabId);
    mTabManager.Release();
  }

  // release service. must happen as the last step!
  if (mAnchoService) {
    mAnchoService.Release();
  }

  return S_OK;
}

//----------------------------------------------------------------------------
//  initCookieManager
HRESULT CAnchoRuntime::initCookieManager(IAnchoServiceApi * aServiceAPI)
{
  mCookieManager = Ancho::CookieManager::createInstance(aServiceAPI);
  return (mCookieManager) ? S_OK : E_FAIL;
}

//----------------------------------------------------------------------------
//  initTabManager
HRESULT CAnchoRuntime::initTabManager(IAnchoServiceApi * aServiceAPI, HWND aHwndFrameTab)
{
  CComQIPtr<IDispatch> dispatch;
  IF_FAILED_RET(aServiceAPI->get_tabManager(&dispatch));
  CComQIPtr<IAnchoTabManagerInternal> tabManager = dispatch;
  if (!tabManager) {
    return E_NOINTERFACE;
  }
  mTabManager = tabManager;

  // Registering tab in service - obtains tab id and assigns it to the tab as property
  return mTabManager->registerRuntime((OLE_HANDLE)aHwndFrameTab, this, mHeartbeatSlave.id());
}

//----------------------------------------------------------------------------
//  initWindowManager
HRESULT CAnchoRuntime::initWindowManager(IAnchoServiceApi * aServiceAPI, IAnchoWindowManagerInternal ** aWindowManager)
{
  // get WindowManager
  CComQIPtr<IDispatch> dispatch;
  IF_FAILED_RET(aServiceAPI->get_windowManager(&dispatch));
  return dispatch.QueryInterface(aWindowManager);
}

//----------------------------------------------------------------------------
//  Init
HRESULT CAnchoRuntime::Init()
{
  ATLASSERT(m_spUnkSite);

  // Expected window structure, currently IE10:
  //
  // + <page title>        IEFrame                 <-- IE main window  (hwndIEFrame)
  //   ...
  //   + Frame Tab                                 <-- IE current tab (hwndFrameTab)
  //     + "ITabBarHost"   InternetToolbarHost
  //       + "Menu Bar"    WorkerW
  //         + ""          ReBarWindow32           <-- parent of toolbar (hwndReBarWindow32)
  //         ...
  //         + ""          ATL:????                <-- our toolbar window
  //     + <page title>    TabWindowClass
  //       + ""            Shell DocObject View    <-- actual webbrowser control

  HWND hwndReBarWindow32 = NULL;
  HWND hwndFrameTab = NULL;
  HWND hwndIEFrame = NULL;

  //---------------------------------------------------------------------------
  // prepare our own webbrowser instance

  // get IServiceProvider to get IWebBrowser2 and IOleWindow
  CComQIPtr<IServiceProvider> pServiceProvider = m_spUnkSite;
  if (!pServiceProvider) {
    return E_FAIL;
  }

  // get IWebBrowser2
  pServiceProvider->QueryService(SID_SWebBrowserApp, IID_IWebBrowser2, (LPVOID*)&mWebBrowser.p);
  if (!mWebBrowser) {
    return E_FAIL;
  }

  //---------------------------------------------------------------------------
  // get required window

  // get parent window for toolbar: ReBarWindow32
  CComQIPtr<IOleWindow> reBarWindow32(m_spUnkSite);
  if (!reBarWindow32) {
    return E_FAIL;
  }
  reBarWindow32->GetWindow(&hwndReBarWindow32);

  // get "Frame Tab" window
  hwndFrameTab = ::GetParent(getTabWindowClassWindow());
  if (!hwndFrameTab) {
    ATLASSERT(0 && "TOOLBAR: Failed to obtain 'Frame Tab' window handle.");
    return E_FAIL;
  }
  hwndIEFrame = ::GetParent(hwndFrameTab);

  //---------------------------------------------------------------------------
  // create addon service object
  ATLTRACE(L"ANCHO: runtime initialization - CoCreateInstance(CLSID_AnchoAddonService)\n");
  IF_FAILED_RET(mAnchoService.CoCreateInstance(CLSID_AnchoAddonService));

  //---------------------------------------------------------------------------
  // toolbar window

  // register protocol handler for toolbar window
  CComBSTR serviceHost, servicePath;
  IF_FAILED_RET(mAnchoService->getInternalProtocolParameters(&serviceHost, &servicePath));
  IF_FAILED_RET(CProtocolHandlerRegistrar::
    RegisterTemporaryResourceHandler(s_AnchoInternalProtocolHandlerScheme, serviceHost, servicePath));

  // Register toolbar with ancho service.
  // NOTE: This is where we also receive our Tab-ID
  CComBSTR toolbarURL;
  mAnchoService->registerBrowserActionToolbar((INT)hwndFrameTab, &toolbarURL, &mTabId);
  mToolbarWindow.mTabId = mTabId;
  mAnchoService->getDispatchObject(&mToolbarWindow.mExternalDispatch);

  // create toolbar window
  mToolbarWindow.Create(hwndReBarWindow32, CWindow::rcDefault, NULL,
      WS_CHILD | WS_VISIBLE | WS_CLIPSIBLINGS | WS_CLIPCHILDREN, 0);
  if (!mToolbarWindow.mWebBrowser) {
    return E_FAIL;
  }

  //---------------------------------------------------------------------------
  // webbrowser events, service API

  // subscribe to browser events
  AtlAdvise(mWebBrowser, (IUnknown *)(TWebBrowserEvents *) this, DIID_DWebBrowserEvents2, &mWebBrowserEventsCookie);

  // get IAnchoServiceApi interface
  CComQIPtr<IAnchoServiceApi> serviceApi = mAnchoService;
  if (!serviceApi) {
    return E_NOINTERFACE;
  }

  //---------------------------------------------------------------------------
  // init some required objects: TabManager, WindowManager, CookieManager

  IF_FAILED_RET(initCookieManager(serviceApi));
  IF_FAILED_RET(initTabManager(serviceApi, hwndFrameTab));

  CComPtr<IAnchoWindowManagerInternal> windowManager;
  IF_FAILED_RET(initWindowManager(serviceApi, &windowManager.p));
  // get our WindowId
  IF_FAILED_RET(windowManager->getWindowIdFromHWND(reinterpret_cast<OLE_HANDLE>(hwndIEFrame), &mWindowId));

  // set our tabID for the passthru app
  ::SetProp(hwndIEFrame, s_AnchoTabIDPropertyName, (HANDLE)mTabId);

  // subscribe to URL loading events
  CComObject<CAnchoBrowserEvents>* pBrowserEventSource;
  IF_FAILED_RET(CComObject<CAnchoBrowserEvents>::CreateInstance(&pBrowserEventSource));

  mBrowserEventSource = pBrowserEventSource;

  AtlAdvise(mBrowserEventSource, (IUnknown*)(TAnchoBrowserEvents*) this, IID_DAnchoBrowserEvents,
    &mAnchoBrowserEventsCookie);

  // Set the sink as property of the browser so it can be retrieved if someone wants to send
  // us events.
  IF_FAILED_RET(mWebBrowser->PutProperty(L"_anchoBrowserEvents", CComVariant(mBrowserEventSource)));
  ATLTRACE(L"ANCHO: runtime %d initialized\n", mTabId);

  // initialize page actions for this process/window/tab
  mAnchoService->initPageActions((OLE_HANDLE)hwndIEFrame, mTabId);

  // load toolbar's html page
  IF_FAILED_RET(mToolbarWindow.mWebBrowser->Navigate(toolbarURL, NULL, NULL, NULL, NULL));

  return S_OK;
}
//----------------------------------------------------------------------------
//
HRESULT CAnchoRuntime::get_cookieManager(LPDISPATCH* ppRet)
{
  ENSURE_RETVAL(ppRet);
  return mCookieManager->QueryInterface(ppRet);
}
//----------------------------------------------------------------------------
//
STDMETHODIMP_(void) CAnchoRuntime::OnBrowserDownloadBegin()
{
  mExtensionPageAPIPrepared = false;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP_(void) CAnchoRuntime::OnWindowStateChanged(LONG dwFlags, LONG dwValidFlagsMask)
{
  if (mAnchoService
      && (dwFlags & dwValidFlagsMask & OLECMDIDF_WINDOWSTATE_USERVISIBLE)
      && (dwFlags & dwValidFlagsMask & OLECMDIDF_WINDOWSTATE_ENABLED)) {
    mAnchoService->onTabActivate(mTabId);
  }
}

//----------------------------------------------------------------------------
//
STDMETHODIMP_(void) CAnchoRuntime::OnBrowserProgressChange(LONG Progress, LONG ProgressMax)
{
  if (mIsExtensionPage && !mExtensionPageAPIPrepared && mWebBrowser) {
    READYSTATE readyState;
    mWebBrowser->get_ReadyState(&readyState);
    if (readyState == READYSTATE_INTERACTIVE) {
      CComBSTR url;
      mWebBrowser->get_LocationURL(&url);
      if (S_OK == InitializeExtensionScripting(url)) {
        mExtensionPageAPIPrepared = true;
      }
    }
  }
}

//----------------------------------------------------------------------------
//  OnNavigateComplete
STDMETHODIMP_(void) CAnchoRuntime::OnNavigateComplete(LPDISPATCH pDispatch, VARIANT *URL)
{
  CComBSTR url(URL->bstrVal);
  mIsExtensionPage = isExtensionPage(std::wstring(url));
  if (mIsExtensionPage) {
    // Too early for api injections
    if (S_OK == InitializeExtensionScripting(url)) {
      mExtensionPageAPIPrepared = true;
    }
  }
}

//----------------------------------------------------------------------------
//  OnBrowserBeforeNavigate2
STDMETHODIMP_(void) CAnchoRuntime::OnBrowserBeforeNavigate2(LPDISPATCH pDisp, VARIANT *pURL, VARIANT *Flags,
  VARIANT *TargetFrameName, VARIANT *PostData, VARIANT *Headers, BOOL *Cancel)
{
  static bool bFirstRun = true;

  // Add the frame to the frames map so we can retrieve the IWebBrowser2 object using the URL.
  ATLASSERT(pURL->vt == VT_BSTR && pURL->bstrVal != NULL);
  CComQIPtr<IWebBrowser2> pWebBrowser(pDisp);
  ATLASSERT(pWebBrowser != NULL);

  // Workaround to ensure that first request goes through PAPP
  if (bFirstRun) {
    bFirstRun = false;
    *Cancel = TRUE;
    pWebBrowser->Stop();
    pWebBrowser->Navigate2(pURL, Flags, TargetFrameName, PostData, Headers);
    return;
  }

  // Check if this is a new tab we are creating programmatically.
  // If so redirect it to the correct URL.
  std::wstring url(pURL->bstrVal, SysStringLen(pURL->bstrVal));

  boost::wregex expression(L"(.*)://\\$\\$([0-9]+)\\$\\$(.*)");
  boost::wsmatch what;
  //TODO - find a better way
  if (boost::regex_match(url, what, expression)) {
    int requestId = boost::lexical_cast<int>(what[2].str());
    url = boost::str(boost::wformat(L"%1%://%2%") % what[1] % what[3]);

    _variant_t vtUrl(url.c_str());
    *Cancel = TRUE;
    pWebBrowser->Stop();
    pWebBrowser->Navigate2(&vtUrl.GetVARIANT(), Flags, TargetFrameName, PostData, Headers);
    mTabManager->createTabNotification(mTabId, requestId);
    return;
  }


  VARIANT_BOOL isTop;
  if (SUCCEEDED(pWebBrowser->get_TopLevelContainer(&isTop))) {
    if (isTop) {
      // Loading the main frame so reset the frame list.
      mMapFrames.clear();
      mNextFrameId = 0;
    }
  }
  std::wstring frameUrl = stripTrailingSlash(stripFragmentFromUrl(pURL->bstrVal));
  mMapFrames[frameUrl] = FrameRecord(pWebBrowser, isTop != VARIANT_FALSE, mNextFrameId++);

  pWebBrowser->PutProperty(CComBSTR(L"_anchoNavigateURL"), CComVariant(*pURL));

  SHANDLE_PTR hwndBrowser = NULL;
  pWebBrowser->get_HWND(&hwndBrowser);

  if (isTop) {
    //Fill information about current document
    CComPtr<IDispatch> tmp;
    pWebBrowser->get_Document(&tmp);
    CComQIPtr<IHTMLDocument2> doc = tmp;
    if (doc) {
      CComQIPtr<IOleWindow> docWin = doc;
      HWND docWinHWND = NULL;
      if (docWin) {
        docWin->GetWindow(&docWinHWND);
      }
      if (docWinHWND) {
        gWindowDocumentMap.put(WindowDocumentRecord(docWinHWND, mTabId, mWebBrowser, pWebBrowser, doc));
      }
    }
    HWND tabWindow = getTabWindowClassWindow();
    if (tabWindow) {
      gWindowDocumentMap.put(WindowDocumentRecord(tabWindow, mTabId, mWebBrowser, pWebBrowser, doc));
    }
    mAnchoService->onTabNavigate(mTabId);
  }
}

//----------------------------------------------------------------------------
//  OnFrameStart
STDMETHODIMP CAnchoRuntime::OnFrameStart(BSTR bstrUrl, VARIANT_BOOL bIsMainFrame)
{
  //For extension pages we don't execute content scripts
  if (isExtensionPage(std::wstring(bstrUrl))) {
    return S_OK;
  }
  return InitializeContentScripting(bstrUrl, bIsMainFrame, documentLoadStart);
}

//----------------------------------------------------------------------------
//  OnFrameEnd
STDMETHODIMP CAnchoRuntime::OnFrameEnd(BSTR bstrUrl, VARIANT_BOOL bIsMainFrame)
{
  //For extension pages we don't execute content scripts
  if (isExtensionPage(std::wstring(bstrUrl))) {
    return S_OK;
  }
  return InitializeContentScripting(bstrUrl, bIsMainFrame, documentLoadEnd);
}

//----------------------------------------------------------------------------
//  OnFrameRedirect
STDMETHODIMP CAnchoRuntime::OnFrameRedirect(BSTR bstrOldUrl, BSTR bstrNewUrl)
{
  std::wstring oldUrl = stripTrailingSlash(stripFragmentFromUrl(bstrOldUrl));
  FrameMap::iterator it = mMapFrames.find(oldUrl);
  if (it != mMapFrames.end()) {
    std::wstring newUrl = stripTrailingSlash(stripFragmentFromUrl(bstrNewUrl));
    mMapFrames[newUrl] = it->second;
    mMapFrames.erase(it);
  }
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::OnBeforeRequest(VARIANT aReporter)
{
  ATLASSERT(aReporter.vt == VT_UNKNOWN);
  CComBSTR str;
  CComQIPtr<IWebRequestReporter> reporter(aReporter.punkVal);
  if (!reporter) {
    return E_INVALIDARG;
  }
  BeforeRequestInfo outInfo;
  CComBSTR url;
  CComBSTR method;
  reporter->getUrl(&url);
  reporter->getHTTPMethod(&method);

  FrameMap::const_iterator it = mMapFrames.find(url.m_str);
  const FrameRecord *frameRecord = NULL;
  if (it != mMapFrames.end()) {
    frameRecord = &(it->second);
  } else {
    ATLTRACE(L"No frame record for %s\n", url.m_str);
  }

  fireOnBeforeRequest(url.m_str, method.m_str, frameRecord, outInfo);
  if (outInfo.cancel) {
    reporter->cancelRequest();
  }
  if (outInfo.redirect) {
    reporter->redirectRequest(CComBSTR(outInfo.newUrl.c_str()));
  }
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::OnBeforeSendHeaders(VARIANT aReporter)
{
  ATLASSERT(aReporter.vt == VT_UNKNOWN);
  CComBSTR str;
  CComQIPtr<IWebRequestReporter> reporter(aReporter.punkVal);
  if (!reporter) {
    return E_INVALIDARG;
  }
  BeforeSendHeadersInfo outInfo;
  CComBSTR url;
  CComBSTR method;
  reporter->getUrl(&url);
  reporter->getHTTPMethod(&method);

  FrameMap::const_iterator it = mMapFrames.find(url.m_str);
  const FrameRecord *frameRecord = NULL;
  if (it != mMapFrames.end()) {
    frameRecord = &(it->second);
  } else {
    ATLTRACE(L"No frame record for %s\n", url.m_str);
  }

  fireOnBeforeSendHeaders(url.m_str, method.m_str, frameRecord, outInfo);
  if (outInfo.modifyHeaders) {
    reporter->setNewHeaders(CComBSTR(outInfo.headers.c_str()).Detach());
  }
  return S_OK;
}

void
CAnchoRuntime::fillRequestInfo(SimpleJSObject &aInfo, const std::wstring &aUrl, const std::wstring &aMethod, const CAnchoRuntime::FrameRecord *aFrameRecord)
{
  //TODO - get proper request ID
  aInfo.setProperty(L"requestId", CComVariant(L"TODO_RequestId"));
  aInfo.setProperty(L"url", CComVariant(aUrl.c_str()));
  aInfo.setProperty(L"method", CComVariant(aMethod.c_str()));
  aInfo.setProperty(L"tabId", CComVariant(mTabId));
  //TODO - find out parent frame id
  aInfo.setProperty(L"parentFrameId", CComVariant(-1));
  if (aFrameRecord) {
    aInfo.setProperty(L"frameId", CComVariant(aFrameRecord->frameId));
    aInfo.setProperty(L"type", CComVariant(aFrameRecord->isTopLevel ? L"main_frame" : L"sub_frame"));
  } else {
    aInfo.setProperty(L"frameId", CComVariant(-1));
    aInfo.setProperty(L"type", CComVariant(L"other"));
  }
  time_t timeSinceEpoch = time(NULL);
  aInfo.setProperty(L"timeStamp", CComVariant(double(timeSinceEpoch)*1000));
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoRuntime::fireOnBeforeRequest(const std::wstring &aUrl, const std::wstring &aMethod, const CAnchoRuntime::FrameRecord *aFrameRecord, /*out*/ BeforeRequestInfo &aOutInfo)
{
  CComPtr<ComSimpleJSObject> info;
  IF_FAILED_RET(SimpleJSObject::createInstance(info));
  fillRequestInfo(*info, aUrl, aMethod, aFrameRecord);

  CComPtr<ComSimpleJSArray> argArray;
  IF_FAILED_RET(SimpleJSArray::createInstance(argArray));
  argArray->push_back(CComVariant(info.p));

  CComVariant result;
  mAnchoService->invokeEventObjectInAllExtensions(CComBSTR(L"webRequest.onBeforeRequest"), argArray.p, &result);
  if (result.vt & VT_ARRAY) {
    CComSafeArray<VARIANT> arr;
    arr.Attach(result.parray);
    //contained data already managed by CComSafeArray
    VARIANT tmp = {0}; HRESULT hr = result.Detach(&tmp);
    BEGIN_TRY_BLOCK
      aOutInfo.cancel = false;
      for (ULONG i = 0; i < arr.GetCount(); ++i) {
        Ancho::Utils::JSObjectWrapperConst item = Ancho::Utils::JSValueWrapperConst(arr.GetAt(i)).toObject();

        Ancho::Utils::JSValueWrapperConst cancel = item[L"cancel"];
        if (!cancel.isNull()) {
          aOutInfo.cancel = aOutInfo.cancel || cancel.toBool();
        }

        Ancho::Utils::JSValueWrapperConst redirectUrl = item[L"redirectUrl"];
        if (!redirectUrl.isNull()) {
          aOutInfo.redirect = true;
          aOutInfo.newUrl = redirectUrl.toString();
        }
      }
    END_TRY_BLOCK_CATCH_TO_HRESULT

  }
  return S_OK;
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoRuntime::fireOnBeforeSendHeaders(const std::wstring &aUrl, const std::wstring &aMethod, const CAnchoRuntime::FrameRecord *aFrameRecord, /*out*/ BeforeSendHeadersInfo &aOutInfo)
{
  aOutInfo.modifyHeaders = false;
  CComPtr<ComSimpleJSObject> info;
  IF_FAILED_RET(SimpleJSObject::createInstance(info));

  fillRequestInfo(*info, aUrl, aMethod, aFrameRecord);
  CComPtr<ComSimpleJSArray> requestHeaders;
  IF_FAILED_RET(SimpleJSArray::createInstance(requestHeaders));
  info->setProperty(L"requestHeaders", CComVariant(requestHeaders.p));

  CComPtr<ComSimpleJSArray> argArray;
  IF_FAILED_RET(SimpleJSArray::createInstance(argArray));
  argArray->push_back(CComVariant(info.p));

  CComVariant result;
  mAnchoService->invokeEventObjectInAllExtensions(CComBSTR(L"webRequest.onBeforeSendHeaders"), argArray.p, &result);
  if (result.vt & VT_ARRAY) {
    CComSafeArray<VARIANT> arr;
    arr.Attach(result.parray);
    //contained data already managed by CComSafeArray
    VARIANT tmp = {0}; HRESULT hr = result.Detach(&tmp);
    BEGIN_TRY_BLOCK
      for (ULONG i = 0; i < arr.GetCount(); ++i) {
        Ancho::Utils::JSObjectWrapperConst item = Ancho::Utils::JSValueWrapperConst(arr.GetAt(i)).toObject();
        Ancho::Utils::JSValueWrapperConst requestHeaders = item[L"requestHeaders"];
        if (!requestHeaders.isNull()) {
          Ancho::Utils::JSArrayWrapperConst headersArray = requestHeaders.toArray();
          std::wostringstream oss;
          int headerCount = headersArray.size();
          for (int i = 0; i < headerCount; ++i) {
            Ancho::Utils::JSValueWrapperConst headerRecord = headersArray[i];
            //TODO handle headerRecord[L"binaryValue"]
            if (headerRecord.isNull()) {
              continue;
            }
            std::wstring headerText = headerRecord.toObject()[L"name"].toString() + std::wstring(L": ") + headerRecord.toObject()[L"value"].toString();
            oss << headerText << L"\r\n";
          }
          aOutInfo.modifyHeaders = true;
          aOutInfo.headers = oss.str();
        }
      }
    END_TRY_BLOCK_CATCH_TO_HRESULT

  }

  return S_OK;
}

//----------------------------------------------------------------------------
//  InitializeContentScripting
HRESULT CAnchoRuntime::InitializeContentScripting(BSTR bstrUrl, VARIANT_BOOL isRefreshingMainFrame, documentLoadPhase aPhase)
{
  CComPtr<IWebBrowser2> webBrowser;
  if (isRefreshingMainFrame) {
    webBrowser = mWebBrowser;
  }
  else {
    std::wstring url = stripTrailingSlash(stripFragmentFromUrl(bstrUrl));
    FrameMap::iterator it = mMapFrames.find(url);
    if (it == mMapFrames.end()) {
      // Either this frame has already been removed, or the request isn't for a frame after all (e.g. an htc).
      return S_FALSE;
    }
    webBrowser = it->second.browser;
  }
  // Normally the frame map is cleared in the BeforeNavigate2 handler, but it isn't triggered when the
  // page is refreshed, so we need this workaround as well.
  if (isRefreshingMainFrame && (documentLoadStart == aPhase)) {
    mMapFrames.clear();
    mNextFrameId = 0;
  }
  AddonMap::iterator it = mMapAddons.begin();
  while(it != mMapAddons.end()) {
    it->second->InitializeContentScripting(webBrowser, bstrUrl, aPhase);
    ++it;
  }

  return S_OK;
}

//----------------------------------------------------------------------------
//
HRESULT CAnchoRuntime::InitializeExtensionScripting(BSTR bstrUrl)
{
  std::wstring domain = getDomainName(bstrUrl);
  AddonMap::iterator it = mMapAddons.find(domain);
  if (it != mMapAddons.end()) {
    return it->second->InitializeExtensionScripting(bstrUrl);
  }
  return S_FALSE;
}

STDMETHODIMP CAnchoRuntime::GetBandInfo(DWORD dwBandID, DWORD dwViewMode, DESKBANDINFO* pdbi)
{
  if (pdbi) {
    m_dwBandID = dwBandID;
    m_dwViewMode = dwViewMode;

    if (pdbi->dwMask & DBIM_MINSIZE) {
      pdbi->ptMinSize.x = 200;
      pdbi->ptMinSize.y = 28;
    }

    if (pdbi->dwMask & DBIM_MAXSIZE) {
      pdbi->ptMaxSize.x = -1;
      pdbi->ptMaxSize.y = 28;
    }

    if (pdbi->dwMask & DBIM_INTEGRAL) {
      pdbi->ptIntegral.x = 0;
      pdbi->ptIntegral.y = 0;
    }

    if (pdbi->dwMask & DBIM_ACTUAL) {
      pdbi->ptActual.x = 600;
      pdbi->ptActual.y = 28;
    }

    if (pdbi->dwMask & DBIM_TITLE) {
      pdbi->dwMask &= ~DBIM_TITLE;
    }

    if (pdbi->dwMask & DBIM_MODEFLAGS) {
      pdbi->dwModeFlags = DBIMF_VARIABLEHEIGHT;
    }

    if (pdbi->dwMask & DBIM_BKCOLOR) {
      pdbi->dwMask &= ~DBIM_BKCOLOR;
    }
    return S_OK;
  }
  return E_INVALIDARG;
}


STDMETHODIMP CAnchoRuntime::GetWindow(HWND* phwnd)
{
  if (!phwnd) {
    return E_POINTER;
  }
  (*phwnd) = mToolbarWindow;
  return S_OK;
}


STDMETHODIMP CAnchoRuntime::ContextSensitiveHelp(BOOL fEnterMode)
{
  return S_OK;
}


STDMETHODIMP CAnchoRuntime::CloseDW(unsigned long dwReserved)
{
  mToolbarWindow.DestroyWindow();
  return S_OK;
}


STDMETHODIMP CAnchoRuntime::ResizeBorderDW(const RECT* prcBorder, IUnknown* punkToolbarSite, BOOL fReserved)
{
  return E_NOTIMPL;
}


STDMETHODIMP CAnchoRuntime::ShowDW(BOOL fShow)
{
  mToolbarWindow.ShowWindow(fShow ? SW_SHOW : SW_HIDE);
  return S_OK;
}

//----------------------------------------------------------------------------
//  SetSite
STDMETHODIMP CAnchoRuntime::SetSite(IUnknown *pUnkSite)
{
  HRESULT hr = IObjectWithSiteImpl<CAnchoRuntime>::SetSite(pUnkSite);
  IF_FAILED_RET(hr);
  if (pUnkSite)
  {
    hr = Init();
    if (SUCCEEDED(hr)) {
      hr = InitAddons();
      if (SUCCEEDED(hr)) {
        // in case IE has already a page loaded initialize scripting 
        READYSTATE readyState;
        mWebBrowser->get_ReadyState(&readyState);
        if (readyState >= READYSTATE_INTERACTIVE) {
          CComBSTR url;
          mWebBrowser->get_LocationURL(&url);
          if (!isExtensionPage(std::wstring(url))) {
            if (url != L"about:blank") {
              // give toolbar a chance to load
              Sleep(200);
              InitializeContentScripting(url, TRUE, documentLoadEnd);
            }
          }
        }
      }
      //showBrowserActionBar(TRUE);
    }
  }
  else
  {
    DestroyAddons();
    Cleanup();
  }
  return hr;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::reloadTab()
{
  CComVariant var(REFRESH_COMPLETELY);
  mWebBrowser->Refresh2(&var);
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::closeTab()
{
  return mWebBrowser->Quit();
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::executeScript(BSTR aExtensionId, BSTR aCode, INT aFileSpecified)
{
  //TODO: check permissions from manifest
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::showBrowserActionBar(INT aShow)
{
  wchar_t clsid[1024] = {0};
  IF_FAILED_RET(::StringFromGUID2( CLSID_AnchoRuntime, (OLECHAR*)clsid, sizeof(clsid)));
  CComVariant clsidVar(clsid);
  CComVariant show(aShow != FALSE);
  IF_FAILED_RET(mWebBrowser->ShowBrowserBar(&clsidVar, &show, NULL));
  return S_OK;
}
//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::updateTab(LPDISPATCH aProperties)
{
  CIDispatchHelper properties(aProperties);
  CComBSTR url;
  HRESULT hr = properties.Get<CComBSTR, VT_BSTR, BSTR>(L"url", url);
  if (hr == S_OK) {
    CComVariant vtUrl(url);
    CComVariant vtEmpty;
    mWebBrowser->Navigate2(&vtUrl, &vtEmpty, &vtEmpty, &vtEmpty, &vtEmpty);
  }
  INT active = 0;
  hr = properties.Get<INT, VT_BOOL, INT>(L"active", active);
  if (hr == S_OK) {
    HWND hwnd = getTabWindowClassWindow();
    IAccessible *acc = NULL;
    //TODO - fix tab activation
    if (S_OK == AccessibleObjectFromWindow(hwnd, OBJID_WINDOW, IID_IAccessible, (void**)&acc)) {
      CComVariant var(CHILDID_SELF, VT_I4);
      acc->accDoDefaultAction(var);
    }
  }
  return S_OK;
}

//----------------------------------------------------------------------------
//
STDMETHODIMP CAnchoRuntime::fillTabInfo(VARIANT* aInfo)
{
  ENSURE_RETVAL(aInfo);
  if(aInfo->vt != VT_DISPATCH) {
    return E_NOINTERFACE;
  }
  CIDispatchHelper obj(aInfo->pdispVal);

  CComBSTR locationUrl;
  CComBSTR name;
  mWebBrowser->get_LocationURL(&locationUrl);
  obj.SetProperty(L"url", CComVariant(locationUrl));

  mWebBrowser->get_Name(&name);
  IF_FAILED_RET(obj.SetProperty(L"title", CComVariant(name)));

  IF_FAILED_RET(obj.SetProperty(L"id", CComVariant(mTabId)));

  IF_FAILED_RET(obj.SetProperty(L"active", CComVariant(isTabActive())));

  IF_FAILED_RET(obj.SetProperty(L"windowId", mWindowId));
  return S_OK;
}

//----------------------------------------------------------------------------
//
HWND CAnchoRuntime::getTabWindowClassWindow()
{
  ATLASSERT(mWebBrowser);
  HWND hwndBrowser = NULL;
  IServiceProvider* pServiceProvider = NULL;
  if (SUCCEEDED(mWebBrowser->QueryInterface(IID_IServiceProvider, (void**)&pServiceProvider))){
    IOleWindow* pWindow = NULL;
    if (SUCCEEDED(pServiceProvider->QueryService(SID_SShellBrowser, IID_IOleWindow,(void**)&pWindow))) {
      // hwndBrowser is the handle of TabWindowClass
      if (!SUCCEEDED(pWindow->GetWindow(&hwndBrowser))) {
        hwndBrowser = NULL;
      }
      pWindow->Release();
    }
    pServiceProvider->Release();
  }
  return hwndBrowser;
}

//----------------------------------------------------------------------------
//
bool CAnchoRuntime::isTabActive()
{
  HWND hwndBrowser = getTabWindowClassWindow();
  return hwndBrowser && ::IsWindowVisible(hwndBrowser);
}
