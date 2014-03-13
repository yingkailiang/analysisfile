/****************************************************************************
 * PageActionModule.h : Declaration of PageActionModule
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#pragma once

#include "PageActionIEWindow.hpp"

extern class PageActionModule _AtlModule;

/*============================================================================
 * class PageActionModule
 *  Exists once per IE process.
 *  Contains and manages multiple IE windows for a process.
 *  Contains the DllMain for this dll.
 */
class PageActionModule :
  public CAtlDllModuleT<PageActionModule>
{
public :
  PageActionModule();

  BOOL WINAPI DllMain2(
    _In_ HMODULE hModule,
    _In_ DWORD dwReason,
    _In_opt_ LPVOID lpReserved) throw();

  static LRESULT CALLBACK cmdTargetWndProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

private:
  HRESULT init();
  HRESULT addWindow();
  void destroy();

  HMODULE mHModule;
  UINT    mWM_INITIALIZE;

  // this one is the owner of the PageActionIEWindow objects
  MapHWND2IEWindow  mWindowsByMainHwnd;

  // holds a weak reference to PageActionIEWindow
  MapHWND2IEWindow  mWindowsByCmdTargetHwnd;
};

