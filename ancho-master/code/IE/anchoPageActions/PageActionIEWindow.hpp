/****************************************************************************
 * PageActionIEWindow.h : Declaration of PageActionIEWindow
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#pragma once

#include "PageActionBase.hpp"
#include "PageActionToolbar.hpp"
#include <map>

/*============================================================================
 * class PageActionIEWindow
 *  Can exist multiple times per IE process.
 *  Represents a single IE window.
 *  Hosts the IAnchoPageActionToolbar for this window.
 *  Manages the window message handling for the toolbar.
 */
class PageActionIEWindow :
  public Ancho::PageAction::Base
{
public :
  PageActionIEWindow();
  BOOL cmdTargetWndProc(LRESULT & lResult, UINT uMsg, WPARAM wParam, LPARAM lParam);

  HRESULT preInit(HWND aIEMainWindow);
  HRESULT init();
  void onDestroy();

  typedef LRESULT (CALLBACK *WndProcPtr)(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

  WndProcPtr  mOldCmdTargetWndProc;
  BOOL        mInitialized;

  CComPtr<IAnchoPageActionToolbar> mBar;
};

typedef std::map<HWND, PageActionIEWindow * > MapHWND2IEWindow;
