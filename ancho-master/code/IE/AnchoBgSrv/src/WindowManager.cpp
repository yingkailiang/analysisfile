#include "stdafx.h"
#include "AnchoBackgroundServer/WindowManager.hpp"
#include "AnchoBackgroundServer/TabManager.hpp"
#include <Exceptions.h>
#include <SimpleWrappers.h>
#include <AnchoCommons/COMConversions.hpp>
#include <AnchoCommons/JavaScriptCallback.hpp>
#include "PopupWindow.h"
#include "AnchoAddonService.h"

namespace Ancho {
namespace Utils {

bool isIEWindow(HWND aHwnd)
{
  wchar_t className[256];
  return GetClassName(aHwnd, className, 256) && (std::wstring(L"IEFrame") == className);
}

HWND getCurrentWindowHWND()
{
  //FindWindowEx returns windows in z-order - the first one is also the top one
  return ::FindWindowEx(NULL, NULL, L"IEFrame", NULL);
}

} //namespace Utils

namespace Service {

Ancho::Service::WindowManager & Ancho::Service::WindowManager::instance()
{
  // this is a singleton and member of CAnchoAddonService
  return CAnchoAddonService::instance().getWindowManagerInstance();
}

//==========================================================================================
struct CreateWindowTask
{
  CreateWindowTask(const Utils::JSObject &aCreateData,
                const TabCallback& aCallback,
                const std::wstring &aExtensionId,
                int aApiId)
                : mCreateData(aCreateData), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    /* TODO - handle these parameters:
    tabId ( optional integer )

    left ( optional integer )

    top ( optional integer )

    width ( optional integer )

    height ( optional integer )

    focused ( optional boolean )

    incognito ( optional boolean )

    type ( optional enumerated string ["normal", "popup", "panel", "detached_panel"] ) */

    Utils::JSObject properties;
    properties[L"windowId"] = WINDOW_ID_NON_EXISTENT;
    properties[L"url"] = mCreateData[L"url"];

    auto helperCallback = [=](TabInfo aInfo) {
      Utils::JSObjectWrapper info = Utils::JSValueWrapper(aInfo).toObject();

      WindowId windowId = info[L"windowId"].toInt();

      WindowManager::instance().getWindow(windowId, Ancho::Utils::JSObject(), mCallback, mExtensionId, mApiId);
    };

    TabManager::instance().createTab(properties, helperCallback, mExtensionId, mApiId);
  }

  Utils::JSObject mCreateData;
  TabCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};

//==========================================================================================
//              API methods
//==========================================================================================
STDMETHODIMP WindowManager::createWindow(LPDISPATCH aCreateData, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aCreateData);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant createData = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<WindowInfo, void> callback(aCallback);

  createWindow(boost::get<Utils::JSObject>(createData), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void WindowManager::createWindow(const Utils::JSObject &aCreateData,
                 const WindowCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(CreateWindowTask(aCreateData, aCallback, aExtensionId, aApiId));
}
//==========================================================================================
STDMETHODIMP WindowManager::getAllWindows(LPDISPATCH aGetInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aGetInfo);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant getInfo = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<WindowInfoList, void> callback(aCallback);

  getAllWindows(boost::get<Utils::JSObject>(getInfo), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void WindowManager::getAllWindows(
                 const Utils::JSObject &aGetInfo,
                 const WindowListCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask([=,this]{
    //inner lambda had problems with capturing of these variables
    std::wstring extensionId = aExtensionId;
    int apiId = aApiId;

    CComPtr<IDispatch> windowList = CAnchoAddonService::instance().createArray(aExtensionId, aApiId);
    Utils::JSArrayWrapper windowListWrapper = Ancho::Utils::JSValueWrapper(windowList).toArray();

    WindowManager::instance().forEachWindow([&, extensionId, apiId](const WindowRecord &rec) {
      CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(extensionId, apiId);
      Utils::JSObjectWrapper infoWrapper = Ancho::Utils::JSValueWrapper(info).toObject();
      WindowManager::instance().fillWindowInfo(rec.getHWND(), infoWrapper);
      windowListWrapper.push_back(infoWrapper);
    });

    aCallback(windowList);
  });
}
//==========================================================================================
STDMETHODIMP WindowManager::updateWindow(LONG windowId, LPDISPATCH aUpdateInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aUpdateInfo);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant updateInfo = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<WindowInfo, void> callback(aCallback);

  updateWindow(windowId, boost::get<Utils::JSObject>(updateInfo), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void WindowManager::updateWindow(
                 WindowId aWindowId,
                 const Utils::JSObject &aUpdateInfo,
                 const WindowCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask([=, this](){
    HWND win = getHandleFromWindowId(aWindowId);
    updateWindowImpl(win, aUpdateInfo);

    getWindow(aWindowId,
              Ancho::Utils::JSObject(),
              aCallback,
              aExtensionId,
              aApiId);
  });
}
//==========================================================================================
STDMETHODIMP WindowManager::removeWindow(LONG aWindowId, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  Utils::JavaScriptCallback<void, void> callback(aCallback);

  removeWindow(aWindowId, callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void WindowManager::removeWindow(
                 WindowId aWindowId,
                 const SimpleCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask([=, this](){
    HWND win = getHandleFromWindowId(aWindowId);
    if( !::DestroyWindow(win) ) {
      ANCHO_THROW(EFail());
    }
    if (aCallback) {
      aCallback();
    }
  });
}
//==========================================================================================
STDMETHODIMP WindowManager::getWindow(LONG aWindowId, LPDISPATCH aGetInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aGetInfo);
  if (!tmp) {
    return E_FAIL;
  }

  Utils::JSVariant getInfo = Utils::convertToJSVariant(*tmp);
  Utils::JavaScriptCallback<WindowInfo, void> callback(aCallback);

  getWindow(aWindowId, boost::get<Utils::JSObject>(getInfo), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void WindowManager::getWindow(
                WindowId aWindowId,
                const Utils::JSObject &aGetInfo,
                const WindowCallback& aCallback,
                const std::wstring &aExtensionId,
                int aApiId)
{
  mAsyncTaskManager.addTask([=, this](){
    HWND win = getHandleFromWindowId(aWindowId);
    CComPtr<IDispatch> info = CAnchoAddonService::instance().createObject(aExtensionId, aApiId);
    //TODO - populate: aGetInfo[L"populate"];
    WindowManager::instance().fillWindowInfo(win, Utils::JSValueWrapper(info).toObject());
    aCallback(info);
  });
}

//==========================================================================================
STDMETHODIMP WindowManager::createPopupWindow(BSTR aUrl, INT aX, INT aY, LPDISPATCH aInjectedData, LPDISPATCH aCloseCallback)
{
  if (!aInjectedData || !aCloseCallback) {
    return E_INVALIDARG;
  }

  CIDispatchHelper injectedData(aInjectedData);
  CIDispatchHelper closeCallback(aCloseCallback);
  DispatchMap injectedDataMap;

  CComPtr<IDispatch> api;
  IF_FAILED_RET((injectedData.Get<CComPtr<IDispatch>, VT_DISPATCH, IDispatch*>((LPOLESTR)s_AnchoBackgroundPageAPIName, api)));
  injectedDataMap[s_AnchoBackgroundPageAPIName] = api;

  CComPtr<IDispatch> console;
  IF_FAILED_RET((injectedData.Get<CComPtr<IDispatch>, VT_DISPATCH, IDispatch*>((LPOLESTR)s_AnchoBackgroundConsoleObjectName, console)));
  injectedDataMap[s_AnchoBackgroundConsoleObjectName] = console;

  HWND hwnd = Utils::getCurrentWindowHWND();
  IF_FAILED_RET(CPopupWindow::CreatePopupWindow(hwnd, &CAnchoAddonService::instance(), injectedDataMap, aUrl, aX, aY, closeCallback));
  return S_OK;
}
//==========================================================================================
STDMETHODIMP WindowManager::getCurrentWindowId(LONG *aWindowId)
{
  BEGIN_TRY_BLOCK;
  ENSURE_RETVAL(aWindowId);
  *aWindowId = getCurrentWindowId();
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

WindowId WindowManager::getCurrentWindowId()
{
  HWND hwnd = Utils::getCurrentWindowHWND();
  if (hwnd) {
    return getWindowIdFromHWND(hwnd);
  }
  ANCHO_THROW(EFail());
}

HWND WindowManager::getCurrentWindowHWND()
{
  return Utils::getCurrentWindowHWND();
}
//==========================================================================================
STDMETHODIMP WindowManager::getWindowIdFromHWND(OLE_HANDLE aHWND, LONG *aWindowId)
{
  BEGIN_TRY_BLOCK;
  ENSURE_RETVAL(aWindowId);
  *aWindowId = getWindowIdFromHWND(reinterpret_cast<HWND>(aHWND));
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}
//==========================================================================================
HWND WindowManager::getHandleFromWindowId(WindowId aWindowId)
{
  boost::unique_lock<Mutex> lock(mWindowAccessMutex);
  auto it = mWindows.find(aWindowId);
  if (it == mWindows.end()) {
    ANCHO_THROW(EFail());
  }

  return it->second->getHWND();
}
//==========================================================================================
WindowId WindowManager::getWindowIdFromHWND(HWND aHWND)
{
  {
    boost::unique_lock<Mutex> lock(mWindowAccessMutex);
    auto it = mWindowIds.find(aHWND);
    if (it != mWindowIds.end()) {
      return it->second;
    }
  }

  return createNewWindowRecord(aHWND);
}

//==========================================================================================
WindowId WindowManager::createNewWindowRecord(HWND aHWND)
{
  boost::unique_lock<Mutex> lock(mWindowAccessMutex);
  WindowId id = mWindowIdGenerator.next();

  mWindowIds[aHWND] = id;
  mWindows[id] = boost::make_shared<WindowRecord>(aHWND);
  return id;
}
//==========================================================================================
void WindowManager::fillWindowInfo(HWND aWndHandle, Utils::JSObjectWrapper aInfo)
{
  //BOOL isVisible = IsWindowVisible(aWndHandle);
  WINDOWINFO winInfo;
  winInfo.cbSize = sizeof(WINDOWINFO);
  BOOL res = GetWindowInfo(aWndHandle, &winInfo);
  aInfo[L"top"] = winInfo.rcWindow.top;
  aInfo[L"left"] = winInfo.rcWindow.left;
  aInfo[L"width"] = winInfo.rcWindow.right - winInfo.rcWindow.left;
  aInfo[L"height"] = winInfo.rcWindow.bottom - winInfo.rcWindow.top;
  aInfo[L"focused"] = static_cast<bool>(winInfo.dwWindowStatus & WS_ACTIVECAPTION);
  aInfo[L"alwaysOnTop"] = false;
  aInfo[L"id"] = getWindowIdFromHWND(aWndHandle);
  std::wstring state = L"normal";
  if (IsIconic(aWndHandle)) {
    state = L"minimized";
  } else if (IsZoomed(aWndHandle)) {
    state = L"maximized";
  }
  aInfo[L"state"] = state;
}
//==========================================================================================
void WindowManager::updateWindowImpl(HWND aWndHandle, Utils::JSObject aInfo)
{
  if (!Utils::isIEWindow(aWndHandle)) {
    ANCHO_THROW(EFail());
  }
  WINDOWINFO winInfo;
  winInfo.cbSize = sizeof(WINDOWINFO);
  BOOL res = GetWindowInfo(aWndHandle, &winInfo);
  static const wchar_t* moveParamsNames[] = {L"left", L"top", L"width", L"height"};
  int moveParams[4];
  moveParams[0] = winInfo.rcWindow.left;
  moveParams[1] = winInfo.rcWindow.top;
  moveParams[2] = winInfo.rcWindow.right - winInfo.rcWindow.left;
  moveParams[3] = winInfo.rcWindow.bottom - winInfo.rcWindow.top;
  bool shouldMove = false;

  for (size_t i = 0; i < 4; ++i) {
    if (aInfo[moveParamsNames[i]].which() == Utils::jsInt) {
      moveParams[i] = boost::get<int>(aInfo[moveParamsNames[i]]);
      shouldMove = true;
    }
  }
  if (shouldMove) {
    ::MoveWindow(aWndHandle, moveParams[0], moveParams[1], moveParams[2], moveParams[3], TRUE);
  }
  bool focused = false;

  if (aInfo[L"focused"].which() == Utils::jsBool && (focused = boost::get<bool>(aInfo[L"focused"]))) {
    if(focused) {
      ::SetForegroundWindow(aWndHandle);
    } else {
      //Bring to foreground next IE window
      HWND nextWin = aWndHandle;
      while (nextWin = GetNextWindow(nextWin, GW_HWNDNEXT)) {
        if (Utils::isIEWindow(nextWin)) {
          ::SetForegroundWindow(nextWin);
          break;
        }
      }
    }
  }

  if (aInfo[L"state"].which() == Utils::jsString) {
    std::wstring state = boost::get<std::wstring>(aInfo[L"state"]);
    if (state == L"maximized") {
      ::ShowWindow(aWndHandle, SW_MAXIMIZE);
    } else if (state == L"minimized") {
      ::ShowWindow(aWndHandle, SW_MINIMIZE);
    } else if (state == L"normal") {
      ::ShowWindow(aWndHandle, SW_NORMAL);
    } else if (state == L"fullscreen") {
      //TODO - fullscreen
    }
  }
  //TODO - drawAttention
}

void WindowManager::finalize()
{
  mAsyncTaskManager.finalize();
  WindowMap tmp;

  {
    boost::unique_lock<Mutex> lock(mWindowAccessMutex);
    tmp = mWindows; //we need to a copy to destroy items without lock
    mWindows.clear();
  }

  //Window records are released in destructor of tmp
}

} //namespace Service
} //namespace Ancho
