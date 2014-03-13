#include "stdafx.h"
#include "AnchoBackgroundServer/TabManager.hpp"
#include "AnchoBackgroundServer/WindowManager.hpp"
#include "AnchoAddonService.h"
#include <Exceptions.h>
#include <SimpleWrappers.h>
#include <AnchoCommons/JavaScriptCallback.hpp>

namespace Ancho {
namespace Utils {

BOOL CALLBACK enumBrowserWindows(HWND hwnd, LPARAM lParam)
{
  wchar_t className[MAX_PATH];
  ::GetClassName(hwnd, className, MAX_PATH);
  try {
    if (wcscmp(className, L"Internet Explorer_Server") == 0) {
      // Now we need to get the IWebBrowser2 from the window.
      DWORD dwMsg = ::RegisterWindowMessage(L"WM_HTML_GETOBJECT");
      LRESULT lResult = 0;
      ::SendMessageTimeout(hwnd, dwMsg, 0, 0, SMTO_ABORTIFHUNG, 1000, (DWORD_PTR*) &lResult);
      if (!lResult) {
        return TRUE;
      }
      CComPtr<IHTMLDocument2> doc;
      IF_FAILED_THROW(::ObjectFromLresult(lResult, IID_IHTMLDocument2, 0, (void**) &doc))

      CComPtr<IHTMLWindow2> win;
      IF_FAILED_THROW(doc->get_parentWindow(&win));

      CComQIPtr<IServiceProvider> sp(win);
      if (!sp) { return TRUE; }

      CComPtr<IWebBrowser2> pWebBrowser;
      IF_FAILED_THROW(sp->QueryService(IID_IWebBrowserApp, IID_IWebBrowser2, (void**) &pWebBrowser));

      // This check works for IE<10
      CComPtr<IDispatch> container;
      IF_FAILED_THROW(pWebBrowser->get_Container(&container));
      // IWebBrowser2 doesn't have a container if it is an IE tab, so if we have a container
      // then we must be an embedded web browser (e.g. in an HTML toolbar).
      if (container) { return TRUE; }

      // This check works for IE10
      // We want only real tab windows. So we expect the following structure:
      //   TabWindowClass
      //   + Shell DocObject View
      //     + OUR WINDOW
      HWND hwndParent = ::GetParent(::GetParent(hwnd));
      if (!hwndParent) {
        return TRUE;
      }
      ::GetClassName(hwndParent, className, MAX_PATH);
      if (wcscmp(className, L"TabWindowClass") != 0) {
        return TRUE;
      }

      // Now get the HWND associated with the tab so we can see if it is active.
      sp = pWebBrowser;
      if (!sp) { return TRUE; }

      CComPtr<IOleWindow> oleWindow;
      IF_FAILED_THROW(sp->QueryService(SID_SShellBrowser, IID_IOleWindow, (void**) &oleWindow));
      HWND hTab;
      IF_FAILED_THROW(oleWindow->GetWindow(&hTab));
      if (::IsWindowEnabled(hTab)) {
        // Success, we found the active browser!
        pWebBrowser.CopyTo((IWebBrowser2 **) lParam);
        return FALSE;
      }
    }
  } catch (std::exception &) {
    return TRUE;
  }
  return TRUE;
}


CComPtr<IWebBrowser2> findActiveBrowser()
{
  CComQIPtr<IWebBrowser2> browser;
  // First find the IE frame windows.
  HWND hIEFrame = NULL;
  do {
    hIEFrame = ::FindWindowEx(NULL, hIEFrame, L"IEFrame", NULL);
    if (hIEFrame) {
      BOOL enable = ::IsWindowEnabled(hIEFrame);
      // Now we enumerate the child windows to find the "Internet Explorer_Server".
      ::EnumChildWindows(hIEFrame, enumBrowserWindows, (LPARAM) (&browser));
      if (browser) {
        return browser;
      }
    }
  } while(hIEFrame);

  // Oops, for some reason we didn't find it.
  return CComPtr<IWebBrowser2>();
}

/**
 * Invokes single callback for set of operations specified by their IDs.
 * Thread safe.
 **/
template<typename TId>
class MultiOperationCallbackInvoker: public boost::noncopyable
{
public:
  typedef boost::shared_ptr<MultiOperationCallbackInvoker<TId> > Ptr;

  template<typename TContainer>
  MultiOperationCallbackInvoker(Ancho::Service::SimpleCallback aCallback, const TContainer &aOperationIds): mCallback(aCallback), mIds(aOperationIds.begin(), aOperationIds.end())
  {
    if (aCallback.empty()) {
      ANCHO_THROW(EInvalidArgument());
    }
  }

  /**
   * This notifies the object that another operation finished.
   * When all operations finished call the callback.
   * \param aOperationId ID of finished operation.
   **/
  void progress(TId aOperationId)
  {
    bool shouldCall = false;

    {
      boost::unique_lock<boost::mutex> lock(mMutex);
      std::set<TId>::iterator it = mIds.find(aOperationId);
      if (it == mIds.end()) {
        ANCHO_THROW(EInvalidId());
      }
      mIds.erase(it);

      shouldCall = mIds.empty();
    }

    if (shouldCall) {
      mCallback();
    }
  }

  std::set<TId> mIds;
  Ancho::Service::SimpleCallback mCallback;

  boost::mutex mMutex;
};

/**
 * Multi operation callback wrapper - each operation can call this as its callback
 * - original multi operation callback will be invoked after all ops from the set finish.
 **/
template<typename TId>
struct MultiOperationCallback
{
  TId mId;
  typename MultiOperationCallbackInvoker<TId>::Ptr mInvoker;

  MultiOperationCallback(TId aId, typename MultiOperationCallbackInvoker<TId>::Ptr aInvoker): mId(aId), mInvoker(aInvoker)
  {
    if (!aInvoker) {
      ANCHO_THROW(EInvalidArgument());
    }
  }
  void operator()()
  {
    mInvoker->progress(mId);
  }
};


} //namespace Utils

namespace Service {

Ancho::Service::TabManager & Ancho::Service::TabManager::instance()
{
  // this is a singleton and member of CAnchoAddonService
  return CAnchoAddonService::instance().getTabManagerInstance();
}

//==========================================================================================
/**
 * Task which creates new tab
 **/
struct CreateTabTask
{
  CreateTabTask(const Utils::JSObject &aProperties,
                const TabCallback& aCallback,
                const std::wstring &aExtensionId,
                int aApiId)
                : mProperties(aProperties), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - CreateTabTask start\n");
    CComPtr<IWebBrowser2> browser = Utils::findActiveBrowser();

    if (!browser) {
      //Problem - no browser available
      return;
    }

    Utils::JSVariant windowIdVt = mProperties[L"windowId"];
    //TODO - handle windowId properly
    int windowId = (windowIdVt.which() == Utils::jsInt) ? boost::get<int>(windowIdVt) : WINDOW_ID_CURRENT;

    Utils::JSVariant url = mProperties[L"url"];
    std::wstring tmpUrl = (url.which() == Utils::jsString) ? boost::get<std::wstring>(url) : L"about:blank";

    if (!mCallback.empty()) {
      int requestID = TabManager::instance().mRequestIdGenerator.next();
      boost::wregex expression(L"(.*)://(.*)");
      boost::wsmatch what;
      if (boost::regex_match(tmpUrl, what, expression)) {
        tmpUrl = boost::str(boost::wformat(L"%1%://$$%2%$$%3%") % what[1] % requestID % what[2]);

        TabManager::CreateTabCallbackRequestInfo requestInfo = { mCallback, mExtensionId, mApiId };
        TabManager::instance().addCreateTabCallbackInfo(requestID, requestInfo);
      }
    }
    _variant_t vtUrl = tmpUrl.c_str();

    long flags = windowId == WINDOW_ID_NON_EXISTENT ? navOpenInNewWindow : navOpenInNewTab;
    _variant_t vtFlags(flags, VT_I4);

    _variant_t vtTargetFrameName;
    _variant_t vtPostData;
    _variant_t vtHeaders;

    // actually giving NULL instead of empty variants should work, but the stub in IE9
    // seems to be buggy and does not accept them. So for "compatibility" reasons we use
    // empty variants instead.. *sigh*
    IF_FAILED_THROW(browser->Navigate2(
                                &vtUrl.GetVARIANT(),
                                &vtFlags.GetVARIANT(),
                                &vtTargetFrameName.GetVARIANT(),
                                &vtPostData.GetVARIANT(),
                                &vtHeaders.GetVARIANT())
                                );
    ATLTRACE(L"TABMANAGER - CreateTabTask end\n");
  }

  Utils::JSObject mProperties;
  TabCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};
//==========================================================================================
/**
 * Task which reloads tab
 **/
struct ReloadTabTask
{
  ReloadTabTask(int aTabId,
                const Utils::JSObject &aReloadProperties,
                const boost::function<void(void)> & aCallback,
                const std::wstring &aExtensionId,
                int aApiId)
                : mTabId(aTabId), mReloadProperties(aReloadProperties), mCallback(aCallback), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - ReloadTabTask start\n");
    TabManager::TabRecord::Ptr tabRecord = TabManager::instance().getTabRecord(mTabId);
    if (!tabRecord) {
      ANCHO_THROW(EInvalidArgument());
    }
    if (!mCallback.empty()) {
          tabRecord->addOnReloadCallback(mCallback);
    }

    CComPtr<IAnchoRuntime> runtime = tabRecord->runtime();

    //TODO - pass options
    IF_FAILED_THROW(runtime->reloadTab());
    ATLTRACE(L"TABMANAGER - ReloadTabTask end\n");
  }

  int mTabId;
  Utils::JSObject mReloadProperties;
  boost::function<void(void)> mCallback;
  int mApiId;
};
//==========================================================================================
struct GetTabTask
{
  GetTabTask(int aTabId,
             const TabCallback& aCallback,
             const std::wstring &aExtensionId,
             int aApiId)
              : mTabId(aTabId), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  {
    ATLASSERT(!aCallback.empty());
  }

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - GetTabTask start\n");
    TabManager::TabRecord::Ptr tabRecord = TabManager::instance().getTabRecord(mTabId);
    ATLASSERT(tabRecord);

    CComPtr<IAnchoRuntime> runtime = tabRecord->runtime();

    CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(mExtensionId, mApiId);
    //CComPtr<ComSimpleJSObject> info = SimpleJSObject::createInstance();
    IF_FAILED_THROW(runtime->fillTabInfo(&_variant_t(info).GetVARIANT()));

    mCallback(info);
    ATLTRACE(L"TABMANAGER - GetTabTask end\n");
  }

  int mTabId;
  TabCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};
//==========================================================================================
struct QueryTabsTask
{
  QueryTabsTask(const Utils::JSObject &aProperties,
             const TabListCallback& aCallback,
             const std::wstring &aExtensionId,
             int aApiId)
              : mProperties(aProperties), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  {
    ATLASSERT(!aCallback.empty());
  }

  struct CheckTab
  {
    Utils::JSArrayWrapper &mArray;
    Utils::JSObject &mProperties;
    std::wstring mExtensionId;
    int mApiId;

    CheckTab(Utils::JSArrayWrapper &aArray, Utils::JSObject &aProperties, const std::wstring &aExtensionId, int aApiId)
      : mArray(aArray), mProperties(aProperties), mExtensionId(aExtensionId), mApiId(aApiId)
    { /*empty*/ }

    void operator()(Ancho::Service::TabManager::TabRecord &aRec)
    {
      CComPtr<IAnchoRuntime> runtime = aRec.runtime();

      CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(mExtensionId, mApiId);
      _variant_t vtInfo(info);
      IF_FAILED_THROW(runtime->fillTabInfo(&vtInfo.GetVARIANT()));

      Utils::JSObjectWrapperConst infoWrapper = Ancho::Utils::JSValueWrapperConst(vtInfo.GetVARIANT()).toObject();

      //TODO - more generic matching algorithm
      bool passed = true;


      if (mProperties[L"url"].which() == Utils::jsString) {
        if (infoWrapper[L"url"].isString()) {
          passed = passed && (infoWrapper[L"url"].toString() == boost::get<std::wstring>(mProperties[L"url"]));
        }
      }
      if (mProperties[L"active"].which() == Utils::jsBool) {
        if (infoWrapper[L"active"].isBool()) {
          passed = passed && (infoWrapper[L"active"].toBool() == boost::get<bool>(mProperties[L"active"]));
        }
      }
      if (mProperties[L"windowId"].which() == Utils::jsInt) {
        if (infoWrapper[L"windowId"].isInt()) {
          passed = passed && (infoWrapper[L"windowId"].toInt() == boost::get<int>(mProperties[L"windowId"]));
        }
      }
      if (passed) {
        mArray.push_back(infoWrapper);
      }
    }
  };

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - QueryTabsTask start\n");
    CComPtr<IDispatch> tabsDisp = CAnchoAddonService::instance().createArray(mExtensionId, mApiId);
    Utils::JSArrayWrapper tabs = Utils::JSValueWrapper(tabsDisp).toArray();
    //TabInfoList tabs = ComSimpleJSArray::createInstance();

    //We extended query parameters - we can get single tab specified by ID
    if (mProperties[L"tabId"].which() == Utils::jsInt) {
      TabManager::TabRecord::Ptr tabRecord = TabManager::instance().getTabRecord(boost::get<int>(mProperties[L"tabId"]));
      if (tabRecord) {
        CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(mExtensionId, mApiId);
        _variant_t vtInfo(info);
        IF_FAILED_THROW(tabRecord->runtime()->fillTabInfo(&vtInfo.GetVARIANT()));
        tabs.push_back(Utils::JSValueWrapper(info));
      }
    } else {
      TabManager::instance().forEachTab(CheckTab(tabs, mProperties, mExtensionId, mApiId));
    }

    if (mCallback) {
      mCallback(tabsDisp);
    }
    ATLTRACE(L"TABMANAGER - QueryTabsTask end\n");
  }

  Utils::JSObject mProperties;
  TabListCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};
//==========================================================================================
struct UpdateTabTask
{
  UpdateTabTask(int aTabId,
                //const Utils::JSObject &aUpdateProperties,
                Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr aMarshaller,
                const TabCallback & aCallback,
                const std::wstring &aExtensionId,
                int aApiId)
                : mTabId(aTabId), mMarshaller(aMarshaller)/*mUpdateProperties(aUpdateProperties)*/, mExtensionId(aExtensionId), mCallback(aCallback), mApiId(aApiId)
  { ATLASSERT(aMarshaller); }

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - UpdateTabTask start\n");
    TabManager::TabRecord::Ptr tabRecord = TabManager::instance().getTabRecord(mTabId);
    ATLASSERT(tabRecord);

    CComPtr<IAnchoRuntime> runtime = tabRecord->runtime();
    runtime->updateTab(mMarshaller->get().p);
    ATLTRACE(L"TABMANAGER - UpdateTabTask end\n");
  }

  int mTabId;
  //Utils::JSObject mUpdateProperties;
  Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr mMarshaller;
  TabCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};
//==========================================================================================
struct RemoveTabsTask
{
  RemoveTabsTask(const std::vector<TabId> &aTabs,
             const SimpleCallback& aCallback,
             const std::wstring &aExtensionId,
             int aApiId)
              : mTabs(aTabs), mCallback(aCallback), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    ATLTRACE(L"TABMANAGER - RemoveTabsTask start\n");
    auto invoker = boost::make_shared<Ancho::Utils::MultiOperationCallbackInvoker<TabId> >(mCallback, mTabs);
    auto missedTabs = TabManager::instance().forTabsInList(mTabs,
                          [&](Ancho::Service::TabManager::TabRecord &aRec) {
                            aRec.addOnCloseCallback(Ancho::Utils::MultiOperationCallback<TabId>(aRec.tabId(), invoker));
                            aRec.runtime()->closeTab();
                          });
    //If some of the tabs were removed before our request, we need to handle their ids.
    if (!missedTabs.empty()) {
      std::for_each(missedTabs.begin(), missedTabs.end(), [&](TabId atabId){ invoker->progress(atabId); });
    }
    ATLTRACE(L"TABMANAGER - RemoveTabsTask end\n");
  }

  std::vector<TabId> mTabs;
  SimpleCallback mCallback;
  int mApiId;
};

//==========================================================================================
//              API methods
//==========================================================================================

STDMETHODIMP TabManager::createTab(LPDISPATCH aProperties, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aProperties);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant properties = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<TabInfo, void> callback(aCallback);

  createTab(boost::get<Utils::JSObject>(properties), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void TabManager::createTab(const Utils::JSObject &aProperties,
                 const TabCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(CreateTabTask(aProperties, aCallback, aExtensionId, aApiId));
}
//==========================================================================================
STDMETHODIMP TabManager::reloadTab(INT aTabId, LPDISPATCH aReloadProperties, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aReloadProperties);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant properties = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<void, void> callback(aCallback);

  mAsyncTaskManager.addTask(ReloadTabTask(aTabId, boost::get<Utils::JSObject>(properties), callback, std::wstring(aExtensionId), aApiId));
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}
//==========================================================================================
STDMETHODIMP TabManager::queryTabs(LPDISPATCH aProperties, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aProperties);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant properties = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<TabInfoList, void> callback(aCallback);

  queryTabs(boost::get<Utils::JSObject>(properties), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void TabManager::queryTabs(const Utils::JSObject &aProperties,
                 const TabListCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(QueryTabsTask(aProperties, aCallback, aExtensionId, aApiId));
}
//==========================================================================================
STDMETHODIMP TabManager::updateTab(INT aTabId, LPDISPATCH aUpdateProperties, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aUpdateProperties);
  if (!tmp) {
    return E_FAIL;
  }

  //Utils::JSVariant properties = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<TabInfo, void> callback(aCallback);

  Ancho::Utils::ObjectMarshaller<IDispatchEx>::Ptr marshaller = boost::make_shared<Ancho::Utils::ObjectMarshaller<IDispatchEx> >(tmp);

  mAsyncTaskManager.addTask(UpdateTabTask(aTabId, marshaller/*boost::get<Utils::JSObject>(properties)*/, callback, std::wstring(aExtensionId), aApiId));
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

//==========================================================================================

STDMETHODIMP TabManager::removeTabs(LPDISPATCH aTabs, VARIANT aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aTabs);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSArray tabs = boost::get<Utils::JSArray>(Utils::convertToJSVariant(*tmp));
  CComPtr<IDispatch> callbackDispatch((VT_DISPATCH == aCallback.vt) ? aCallback.pdispVal : NULL);
  Utils::JavaScriptCallback<void, void> callback(callbackDispatch);

  std::vector<TabId> tabIds;
  tabIds.reserve(tabs.size());
  for (size_t i = 0; i < tabs.size(); ++i) {
    tabIds.push_back(boost::get<int>(tabs[i]));
  }

  removeTabs(tabIds, callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void TabManager::removeTabs(const std::vector<TabId> &aTabs,
                 const SimpleCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(RemoveTabsTask(aTabs, aCallback, aExtensionId, aApiId));
}
//==========================================================================================

void TabManager::getTab(TabId aTabId, const TabCallback& aCallback, const std::wstring &aExtensionId, int aApiId)
{
  mAsyncTaskManager.addTask(GetTabTask(aTabId, aCallback, aExtensionId, aApiId));
}

TabId TabManager::getFrameTabId(HWND aFrameTab)
{
  boost::unique_lock<Mutex> lock(mTabAccessMutex);

  FrameTabToTabIDMap::iterator it = mFrameTabIds.find(aFrameTab);
  if (it != mFrameTabIds.end()) {
    return it->second;
  }
  mFrameTabIds[aFrameTab] = mTabIdGenerator.next();
  return mFrameTabIds[aFrameTab];
}
//==========================================================================================
STDMETHODIMP TabManager::getTabInfo(INT aTabId, BSTR aExtensionId, INT aApiId, VARIANT* aRet)
{
  ENSURE_RETVAL(aRet);

  BEGIN_TRY_BLOCK;
  _variant_t vtInfo;
  TabManager::TabRecord::Ptr tabRecord = TabManager::instance().getTabRecord(aTabId);
  if (tabRecord) {
    CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(std::wstring(aExtensionId), aApiId);
    vtInfo = info;
    IF_FAILED_THROW(tabRecord->runtime()->fillTabInfo(&vtInfo.GetVARIANT()));
  }
  *aRet = vtInfo.Detach();
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}

//==========================================================================================
//              API methods - IAnchoTabManagerInternal
//==========================================================================================

STDMETHODIMP TabManager::registerRuntime(OLE_HANDLE aFrameTab, IAnchoRuntime * aRuntime, ULONG aHeartBeat)
{
  BEGIN_TRY_BLOCK;
  if (aFrameTab == 0) {
    return E_FAIL;
  }

  int tabId = getFrameTabId((HWND)aFrameTab);

  {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    mTabs[tabId] = boost::make_shared<TabRecord>(aRuntime, tabId, aHeartBeat);
  }
  ATLTRACE(L"ADDON SERVICE - registering tab: %d\n", tabId);

  if (!mHeartbeatTimer.isRunning()) {
    mHeartbeatTimer.start();
    mHeartbeatActive = true;
  }
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}
//==========================================================================================
//
STDMETHODIMP TabManager::unregisterRuntime(INT aTabID)
{
  BEGIN_TRY_BLOCK;

  boost::shared_ptr<TabRecord> record;
  {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    TabMap::iterator it = mTabs.find(aTabID);
    if (it != mTabs.end()) {
      record = it->second;
      mTabs.erase(it);
    }
  }
  if (record) {
    record->tabClosed();
  }

  ATLTRACE(L"ADDON SERVICE - unregistering tab: %d\n", aTabID);
  //if we cleanly unregistered all runtimes turn off the heartbeat
  {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    if (mTabs.empty()) {
      mHeartbeatActive = false;
      mHeartbeatTimer.stop();
    }
  }
  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}
//==========================================================================================
//
STDMETHODIMP TabManager::createTabNotification(INT aTabId, ULONG aRequestID)
{
  BEGIN_TRY_BLOCK;
  boost::unique_lock<Mutex> lock(mTabAccessMutex);

  CreateTabCallbackMap::iterator it = mCreateTabCallbacks.find(aRequestID);
  if (it != mCreateTabCallbacks.end()) {
    //Get created tab - callback for 'get' is compatible with 'tabCreate' callback
    getTab(aTabId, it->second.callback, it->second.extensionId, it->second.apiId);
    mCreateTabCallbacks.erase(it);
  }

  return S_OK;
  END_TRY_BLOCK_CATCH_TO_HRESULT;
}

//==========================================================================================
//
void TabManager::checkBHOConnections()
{
  TabMap tmp;
  {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    tmp = mTabs;
  }
  std::vector<TabId> invalidIDs;
  auto it = tmp.begin();
  auto endIter =  tmp.end();
  while (it != endIter) {
    ATLASSERT(it->second);
    if (!it->second->isAlive()) {
      invalidIDs.push_back(it->first);
    }
    ++it;
  }

  if (!invalidIDs.empty()) {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    std::for_each(invalidIDs.begin(), invalidIDs.end(), [&, this](TabId id){ mTabs.erase(id); });
    if (mTabs.empty()) {
      //We are in undefined state - kill the service
      TerminateProcess(GetCurrentProcess(), 0);
    }
  }
}

void TabManager::finalize()
{
  mAsyncTaskManager.finalize();
  TabMap tmp;

  {
    boost::unique_lock<Mutex> lock(mTabAccessMutex);
    tmp = mTabs; //we need to a copy to destroy items without lock
    mTabs.clear();
  }

  //Tab records are released in destructor of tmp
}

} //namespace Service
} //namespace Ancho