/****************************************************************************
 * PageActionIEWindow.cpp : Implementation of PageActionIEWindow
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"
#include "PageActionIEWindow.hpp"
#include "PageActionModule.hpp"

//----------------------------------------------------------------------------
// CTOR
PageActionIEWindow::PageActionIEWindow() :
  mOldCmdTargetWndProc(NULL),
  mInitialized(FALSE)
{
}

//----------------------------------------------------------------------------
// preInit
//  Called from within the remote thread created by the broker.
//  Intializes windows messaging only.
HRESULT PageActionIEWindow::preInit(HWND aIEMainWindow)
{
  // get windows...
  if (!gatherIEWindows(aIEMainWindow)) {
    return E_FAIL;
  }

  // ...and subclass command target window
  if (!mOldCmdTargetWndProc) {
    mOldCmdTargetWndProc = (WndProcPtr)::GetWindowLongPtr( mIECmdTargetWnd, GWLP_WNDPROC );
    ::SetWindowLongPtr( mIECmdTargetWnd, GWLP_WNDPROC, (LONG_PTR)_AtlModule.cmdTargetWndProc );
  }
  return S_OK;
}

//----------------------------------------------------------------------------
// init
//  Already called from the UI thread. Initializes mBar, the actual
//  IAnchoPageActionToolbar.
HRESULT PageActionIEWindow::init()
{
  HRESULT hr = PageActionToolbar::CreateInstance(mIEMainWindow, mIEToolbarWnd,
        mIECmdTargetWnd, mBar);
  mInitialized = SUCCEEDED(hr);
  return hr;
}

//----------------------------------------------------------------------------
// onDestroy
//  Called in response to a WM_DESTROY message
void PageActionIEWindow::onDestroy()
{
  // unsubclass
  if (mOldCmdTargetWndProc && mIECmdTargetWnd) {
    ::SetWindowLongPtr( mIECmdTargetWnd, GWLP_WNDPROC, (LONG_PTR)mOldCmdTargetWndProc );
    mIECmdTargetWnd = NULL;
    mOldCmdTargetWndProc = NULL;
  }

  // and cleanup connection with ancho server
  mIEMainWindow = NULL;
  if (mBar) {
    ((CComObject<PageActionToolbar>*)mBar.p)->closeConnection();
  }
  // finally release toolbar
  mBar.Release();
  delete this;
}

//----------------------------------------------------------------------------
// cmdTargetWndProc
//  window proc for this instance.
//  Returns TRUE if the message should not be processed further.
BOOL PageActionIEWindow::cmdTargetWndProc(LRESULT & lResult, UINT uMsg,
      WPARAM wParam, LPARAM lParam)
{
  if (WM_DESTROY == uMsg) {
    onDestroy();
    return FALSE;
  }
  if (!mBar) {
    return FALSE;
  }

  // handle tool tip notifications for our toolbars
  if (WM_NOTIFY == uMsg) {
    NMHDR * nmhdr = (NMHDR*)lParam;
    if (TTN_NEEDTEXTW == nmhdr->code) {
      return ((CComObject<PageActionToolbar>*)mBar.p)->getToolTipW((TOOLTIPTEXTW*)nmhdr);
    }
    else if (TTN_NEEDTEXTA == nmhdr->code) {
      return ((CComObject<PageActionToolbar>*)mBar.p)->getToolTipA((TOOLTIPTEXTA*)nmhdr);
    }
  }

  // handle command messages
  if( mBar && uMsg == WM_COMMAND ) {
    return ((CComObject<PageActionToolbar>*)mBar.p)->onCommandMessage(wParam, lParam);
  }

  return FALSE;
}

