/****************************************************************************
 * PageActionModule.cpp : Implementation of PageActionModule
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"
#include "PageActionModule.hpp"

using namespace Ancho::PageAction;

/*============================================================================
 * class PageActionModule
 */

//----------------------------------------------------------------------------
// CTOR
PageActionModule::PageActionModule() :
  mHModule(NULL),
  mWM_INITIALIZE(0)
{
}

//----------------------------------------------------------------------------
// DllMain2
BOOL WINAPI PageActionModule::DllMain2(
  _In_ HMODULE hModule,
  _In_ DWORD dwReason,
  _In_opt_ LPVOID lpReserved)
{
  BOOL res = CAtlDllModuleT<PageActionModule>::DllMain(dwReason, lpReserved);
  switch (dwReason)
  {
    case DLL_PROCESS_ATTACH:
      mHModule = hModule;
      // Do a general init in process-attach.
      init();
      // Fall through to init any window already now. The next DLL_THREAD_ATTACH
      // will be too late
    case DLL_THREAD_ATTACH:
      // Attach the window delivered in the file mapping in thread-attach.
      // Process-attach is called only once per process, but this module
      // has to be notified about every new IE window in this process.
      // CreateRemoteThread triggers a call to DLLMain with DLL_THREAD_ATTACH
      // so we get what we need.
      // In case there is no filemapping (another thread attaches) nothing
      // happens.
      addWindow();
      break;
    case DLL_PROCESS_DETACH:
      destroy();
      break;
    default:
      break;
  }
  return res;
}

//----------------------------------------------------------------------------
// init
HRESULT PageActionModule::init()
{
  mWM_INITIALIZE = Base::getPageActionMessage();
  return S_OK;
}

//----------------------------------------------------------------------------
// destroy
void PageActionModule::destroy()
{
  ATLASSERT(mWindowsByMainHwnd.empty());
  ATLASSERT(mWindowsByCmdTargetHwnd.empty());
}

//----------------------------------------------------------------------------
// addWindow
//  Reads a window handle from the mem file and intitializes a
//  PageActionIEWindow for that IE window, if not already done.
HRESULT PageActionModule::addWindow()
{
  // get the window handle from memfile
  HWND hwndIEMain = NULL;
  HRESULT hr = Base::readHandle(hwndIEMain);
  if (FAILED(hr)) {
    return hr;
  }

  if (!hwndIEMain || !::IsWindow(hwndIEMain)) {
    return E_INVALIDARG;
  }

  // see if we have already an instance
  MapHWND2IEWindow::iterator it = mWindowsByMainHwnd.find(hwndIEMain);
  if (it != mWindowsByMainHwnd.end()) {
    return S_FALSE; // have already
  }

  // create new PageActionIEWindow
  PageActionIEWindow * window = new PageActionIEWindow();
  hr = window->preInit(hwndIEMain);
  if (FAILED(hr)) {
    delete window;
    return hr;
  }

  // store
  mWindowsByMainHwnd[hwndIEMain] =
  mWindowsByCmdTargetHwnd[window->getCmdTargetWnd()] =
      window;

  // and post init message for processing on UI thread
  ::PostMessage(window->getCmdTargetWnd(), mWM_INITIALIZE, NULL, NULL);

  return S_OK;
}

//----------------------------------------------------------------------------
// cmdTargetWndProc
//  Static message handler for all windows. Dispatches the message to the
//  correct instance and initializes an instance on the UI thread.
LRESULT PageActionModule::cmdTargetWndProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
  // by default we signal success
  LRESULT result = 0;

  MapHWND2IEWindow::iterator it = _AtlModule.mWindowsByCmdTargetHwnd.find(hwnd);
  if (it == _AtlModule.mWindowsByCmdTargetHwnd.end()) {
    // should not happen
    ATLASSERT(FALSE && "PageActionModule::cmdTargetWndProc called for invalid window");
    return 1;
  }

  PageActionIEWindow * window = it->second;

  if (_AtlModule.mWM_INITIALIZE == uMsg && !window->mInitialized) {
    // init message. handle and return.
    window->init();
    return 0;
  }

  // In case the message will be WM_DESTROY the window object
  // will be deleted when calling CallWindowProc, so use oldProc instead of
  // window->mOldCmdTargetWndProc.
  PageActionIEWindow::WndProcPtr oldProc = window->mOldCmdTargetWndProc;

  // also handle WM_DESTROY, before the window can handle it
  if (WM_DESTROY == uMsg) {
    _AtlModule.mWindowsByCmdTargetHwnd.erase(hwnd);
    _AtlModule.mWindowsByMainHwnd.erase(window->getIEMainWnd());
  }

  // pass handling to window
  if( window->cmdTargetWndProc( result, uMsg, wParam, lParam ) ) {
    // window handled the message exclusively, so don't call old proc
    return result;
  }

  return CallWindowProc( oldProc, hwnd, uMsg, wParam, lParam );
}
