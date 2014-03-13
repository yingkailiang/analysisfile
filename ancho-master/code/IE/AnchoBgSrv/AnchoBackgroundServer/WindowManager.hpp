#pragma once
#include "resource.h"
#include "AnchoBgSrv_i.h"
#include <AnchoCommons/AsynchronousTaskManager.hpp>
#include <AnchoCommons/COMConversions.hpp>
#include <AnchoCommons/JavaScriptCallback.hpp>
#include "AnchoBackgroundServer/PeriodicTimer.hpp"
#include <IPCHeartbeat.h>
#include <Exceptions.h>
#include <SimpleWrappers.h>

namespace Ancho {


namespace Service {

enum SpecialWindowId {
  WINDOW_ID_NONE = -1,
  WINDOW_ID_CURRENT = -2,
  WINDOW_ID_NON_EXISTENT = -3 //Address window which wasn't created yet and it should be created
};

typedef int WindowId;
typedef CComPtr<IDispatch> WindowInfo;
typedef CComPtr<IDispatch> WindowInfoList;

typedef boost::function<void(WindowInfo)> WindowCallback;
typedef boost::function<void(WindowInfoList)> WindowListCallback;
typedef boost::function<void(void)> SimpleCallback;

/**
 * Singleton class.
 * This manager stores information and references to all IE windows currently available.
 * It provides dual interface - we can implement chrome.windows API by calling methods of this class
 **/
class WindowManager:
  public CComObjectRootEx<CComMultiThreadModel>,
  //public IAnchoTabManagerInternal,
  public IDispatchImpl<IWindowManager, &IID_IWindowManager, &LIBID_AnchoBgSrvLib, /*wMajor =*/ 0xffff, /*wMinor =*/ 0xffff>,
  public IAnchoWindowManagerInternal,
  public boost::noncopyable

{
public:
//  friend struct CreateTabTask;

  class WindowRecord;
  typedef boost::recursive_mutex Mutex;

  WindowManager()
  {
  }

  ~WindowManager()
  {
    finalize();
  }
public:
  ///@{
  /** Asynchronous methods available to JS.**/
  STDMETHOD(createWindow)(LPDISPATCH aCreateData, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);
  STDMETHOD(getAllWindows)(LPDISPATCH aGetInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);
  STDMETHOD(getWindow)(LONG windowId, LPDISPATCH aGetInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);
  STDMETHOD(updateWindow)(LONG windowId, LPDISPATCH aUpdateInfo, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);
  STDMETHOD(removeWindow)(LONG windowId, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId);

  STDMETHOD(getCurrentWindowId)(LONG *aWindowId);
  ///@}

  /**
   * Apply callable object on each available tab.
   * \tparam TCallable Type of callable object with signature TCallable::operator()(Ancho::Service::TabManager::TabRecord &).
   * \param aCallable Callable object, which will be applied on each tab record instance obtained by ID from aTabIds list.
   * \result Copy of provided callable object - can be used for returning accumulated values, etc.
   **/
  template<typename TCallable>
  TCallable forEachWindow(TCallable aCallable)
  {
    WindowMap tmp;
    {
      boost::unique_lock<Mutex> lock(mWindowAccessMutex);
      tmp = mWindows;
    }

    auto it = tmp.begin();
    while (it != tmp.end()) {
      ATLASSERT(it->second);
      aCallable(*it->second);
      ++it;
    }
    return aCallable;
  }

  /**
   * Apply callable object on each tab from provided list.
   * \tparam TContainer Iterable container (vector, list) of tab IDs
   * \tparam TCallable Type of callable object with signature TCallable::operator()(Ancho::Service::TabManager::TabRecord &).
   * \param aTabIds List of tab IDs which should be processed.
   * \param aCallable Callable object, which will be applied on each tab record instance obtained by ID from aTabIds list.
   * \result List of IDs for tabs which couldn't be found (wrong ID, tab already closed, etc.)
   **/
  template<typename TContainer, typename TCallable>
  TContainer forWindowsInList(const TContainer &aWindowIds, TCallable aCallable)
  {
    //Create list of windows which do not exist
    TContainer missed;
    WindowMap tmp;

    {
      boost::unique_lock<Mutex> lock(mWindowAccessMutex);
      tmp = mWindows; //we need to work on a copy to prevent deadlocks caused by COM calls
    }

    BOOST_FOREACH(auto windowId, aWindowIds) {
      auto it = tmp.find(windowId);
      if (it != tmp.end()) {
        ATLASSERT(it->second);
        aCallable(*it->second);
        ++it;
      } else {
        missed.insert(missed.end(), windowId);
      }
    }
    return std::move(missed);
  }

  static Ancho::Service::WindowManager & instance();

  STDMETHOD(getWindowIdFromHWND)(OLE_HANDLE aHWND, LONG *aWindowId);
  STDMETHOD(createPopupWindow)(BSTR aUrl, INT aX, INT aY, LPDISPATCH aInjectedData, LPDISPATCH aCloseCallback);
public:
  void createWindow(
                  const Utils::JSObject &aCreateData,
                  const WindowCallback& aCallback,
                  const std::wstring &aExtensionId,
                  int aApiId);

  void getAllWindows(
                const Utils::JSObject &aGetInfo,
                const WindowListCallback& aCallback,
                const std::wstring &aExtensionId,
                int aApiId);

  void getWindow(
                WindowId aWindowId,
                const Utils::JSObject &aGetInfo,
                const WindowCallback& aCallback,
                const std::wstring &aExtensionId,
                int aApiId);

  void updateWindow(
                 WindowId aWindowId,
                 const Utils::JSObject &aUpdateInfo,
                 const WindowCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId);

  void removeWindow(
                 WindowId aWindowId,
                 const SimpleCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId);

  WindowId getCurrentWindowId();
  void finalize();

  HWND getCurrentWindowHWND();
public:
  // -------------------------------------------------------------------------
  // COM standard stuff
  DECLARE_NO_REGISTRY()
  DECLARE_NOT_AGGREGATABLE(Ancho::Service::WindowManager)
  DECLARE_PROTECT_FINAL_CONSTRUCT()

  HRESULT FinalConstruct()
  {
    return S_OK;
  }
  void FinalRelease()
  {
    finalize();
  }

public:
  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(Ancho::Service::WindowManager)
    COM_INTERFACE_ENTRY(IDispatch)
    COM_INTERFACE_ENTRY(IWindowManager)
    COM_INTERFACE_ENTRY(IAnchoWindowManagerInternal)
  END_COM_MAP()


protected:
  HWND getHandleFromWindowId(WindowId aWindowId);
  WindowId getWindowIdFromHWND(HWND aHWND);
  WindowId createNewWindowRecord(HWND aHWND);
  void updateWindowImpl(HWND aWndHandle, Utils::JSObject aInfo);
  void fillWindowInfo(HWND aWndHandle, Utils::JSObjectWrapper aInfo);

  Ancho::Utils::AsynchronousTaskManager mAsyncTaskManager;

  typedef std::map<HWND, WindowId> WindowHandleToWindowIDMap;
  WindowHandleToWindowIDMap mWindowIds;

  /*Utils::IdGenerator<ULONG> mRequestIdGenerator;*/

  Utils::IdGenerator<WindowId> mWindowIdGenerator;

  typedef std::map<WindowId, boost::shared_ptr<WindowRecord> > WindowMap;
  WindowMap mWindows;

  /// Manipulations with tab record container is synchronized by this mutex
  Mutex mWindowAccessMutex;
};

//============================================================================================

class WindowManager::WindowRecord
{
public:
  WindowRecord(HWND aHWND = NULL): mHWND(aHWND)
  { /*empty*/ }

  HWND getHWND()const
  { return mHWND; }
protected:
  HWND mHWND;
};

} //namespace Service
} //namespace Ancho
