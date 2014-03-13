/****************************************************************************
 * PageActionBase.cpp : Implementation of Ancho::PageAction::Base
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"
#include "PageActionBase.hpp"

namespace Ancho {
namespace PageAction {

/*============================================================================
 * class Ancho::PageAction::Base
 */

// the page actions dll that gets injected into IE. Needs to be in install path.
// make sure this fits code\IE\anchoPageActionsBroker\broker.cpp
LPCTSTR Base::sWrapperDLL = _T("anchoPageActions.dll");

// the page actions broker-exe that injects into IE. Needs to be in install path.
LPCTSTR Base::sBrokerExec = _T("anchoPageActionsBroker.exe");

// file name mapping for passing the IE main window handle to the IE process
LPCTSTR Base::sFileMappingName = _T("Local\\AnchoIEMainWindowHandle");

// message that gets registered for initializing a new IE window / toolbar instance
LPCTSTR Base::sInitWindowMessageName = _T("ancho-pageactions-initialize");

//----------------------------------------------------------------------------
// CTOR
Base::Base() :
  mIEMainWindow(NULL),
  mIECmdTargetWnd(NULL),
  mIEToolbarWnd(NULL)
{
}

//----------------------------------------------------------------------------
// DTOR
Base::~Base()
{
}

//----------------------------------------------------------------------------
// Is64bitOS()
// Detect if this method is called on a 64bit OS
BOOL Base::Is64bitOS()
{
#ifdef _WIN64
  // this is a 64bit build, so it must run on a 64bit os
  return TRUE;
#else
  // this is a 32bit build, can run also on a 64bit os
  BOOL isWOW = FALSE;
  if (!IsWow64Process(GetCurrentProcess(),&isWOW))
  {
    return FALSE;
  }
  return isWOW;
#endif
}

//----------------------------------------------------------------------------
// Is64bitProcess()
// Detect if aProcess is a 64bit process
BOOL Base::Is64bitProcess(HANDLE aProcess)
{
  BOOL isWOW = FALSE;
  if (!IsWow64Process(aProcess,&isWOW)) {
    return FALSE;
  }
#ifdef _WIN64
  // this is a 64bit process, so we must be on a 64bit system
  return !isWOW;
#else
  // this is a 32bit process
  return Is64bitOS() && !isWOW;
#endif
}

//----------------------------------------------------------------------------
// GetInstallDir()
// Read install dir from registry, 32 and 64bit version.
BOOL Base::GetInstallDir(LPTSTR aInstallDir, ULONG aMaxLength, BOOL aFor64bit)
{
  CRegKey hklmAncho;
  REGSAM sam = (aFor64bit)
      ? KEY_READ | KEY_WOW64_64KEY
      : KEY_READ | KEY_WOW64_32KEY;
  if (ERROR_SUCCESS !=
      hklmAncho.Open(HKEY_LOCAL_MACHINE,
                   _T("SOFTWARE\\Salsita\\AnchoAddonService"),
                   sam)) {
    return FALSE;
  }
  aMaxLength -= 2;
  LONG res = hklmAncho.QueryStringValue(_T("install"), aInstallDir, &aMaxLength);
  aInstallDir[aMaxLength] = 0;
  PathAddBackslash(aInstallDir);
  return TRUE;
}

//----------------------------------------------------------------------------
// readHandle()
//  Read a window handle (from an IE main window) from the mem-file.
HRESULT Base::readHandle(HWND & aWindowHandle)
{
  CHandle fileMapping(::OpenFileMapping( FILE_MAP_ALL_ACCESS, FALSE, sFileMappingName ));
  if (!fileMapping) {
    return HRESULT_FROM_WIN32(::GetLastError());
  }

  DWORD dataSize = sizeof(__int32);
  LPVOID data = ::MapViewOfFile( fileMapping, FILE_MAP_ALL_ACCESS, 0, 0, dataSize );
  if( !data ) {
    return HRESULT_FROM_WIN32(::GetLastError());
  }
  __int32 ihwndMain = 0;
  ::CopyMemory( &ihwndMain, data, dataSize );
  ::UnmapViewOfFile( data );
  fileMapping.Close();

  if (!ihwndMain || !::IsWindow((HWND)ihwndMain)) {
    return E_INVALIDARG;
  }
  aWindowHandle = (HWND)ihwndMain;
  return S_OK;
}

//----------------------------------------------------------------------------
// writeHandle()
//  Writes a window handle to the mem-file.
//  Creates the memfile and returns in case of success the handle for that
//  file for cleaning up. This method is called to pass a window handle to the
//  page actions dll.
//  The dll is responsible for closing the file!
HRESULT Base::writeHandle(const HWND aWindowHandle, HANDLE & aFileMapping)
{
  __int32 ihwndMain = (__int32)aWindowHandle;
  DWORD dataSize = sizeof(__int32);
  CHandle fileMapping(::CreateFileMapping( INVALID_HANDLE_VALUE, NULL,
      PAGE_READWRITE, 0, dataSize, sFileMappingName ));
  if (!fileMapping) {
    return HRESULT_FROM_WIN32(::GetLastError());
  }

  LPVOID data = ::MapViewOfFile( fileMapping, FILE_MAP_ALL_ACCESS, 0, 0, dataSize );
  if( !data ) {
    return HRESULT_FROM_WIN32(::GetLastError());
  }

  ::CopyMemory( data, &ihwndMain, dataSize );
  ::UnmapViewOfFile( data );
  aFileMapping = fileMapping.Detach();
  return S_OK;
}

//----------------------------------------------------------------------------
// gatherIEWindows()
// Searches and returns the IE windows we are interested in:
//  command target window
//  toolbar window
BOOL Base::gatherIEWindows(
    HWND aIeMainWindow,
    HWND & aCmdTargetWindow,
    HWND & aToolbarWindow) {
  if (!aIeMainWindow || !::IsWindow(aIeMainWindow)) {
    return FALSE;
  }

  // Get the windows for the command target that receives the WM_COMMAND messages
  // from the IE toolbar and the toolbar itself.

  // Current window structure in IE.
  // NOTE: This might change in future and
  // has to be adjusted!
  //
  //  + "Windows Internet Explorer" - IEFrame
  //      ...
  //    + "Navigation Bar" - WorkerW
  //        ReBarWindow32
  //        ...
  //        + Address Band Root  <-- this is the window receiving command messages
  //          ...
  //          + "Page Control" - ToolbarWindow32 (last one!)  <-- this is the toolbar
  HWND hw = ::FindWindowEx( aIeMainWindow, NULL, _T( "WorkerW" ), NULL );
  hw = ::FindWindowEx( hw, NULL, _T( "ReBarWindow32" ), NULL );

  aCmdTargetWindow = ::FindWindowEx( hw, NULL, _T( "Address Band Root" ), NULL );
  if( !aCmdTargetWindow  ) {
    return FALSE;
  }

  hw = ::FindWindowEx( aCmdTargetWindow, NULL, _T( "ToolbarWindow32" ), NULL );
  while( hw && aCmdTargetWindow == ::GetParent(hw) )
  {
    aToolbarWindow = hw;
    hw = ::GetNextWindow( hw, GW_HWNDNEXT );
  }
  if (!aToolbarWindow) {
    return FALSE;
  }
  return TRUE;
}

//----------------------------------------------------------------------------
// gatherIEWindows()
// uses static version to get windows for this instance
BOOL Base::gatherIEWindows(HWND aIeMainWindow) {
  BOOL b = gatherIEWindows(aIeMainWindow, mIECmdTargetWnd, mIEToolbarWnd);
  if (b) {
    mIEMainWindow = aIeMainWindow;
  }
  return b;
}

//----------------------------------------------------------------------------
// getPageActionMessage()
// Registers and returns the init-message
UINT Base::getPageActionMessage() {
  return ::RegisterWindowMessage(sInitWindowMessageName);
}

//----------------------------------------------------------------------------
// getPageActionMessage()
// clears internal data
void Base::reset() {
  mIEMainWindow = mIEToolbarWnd = mIECmdTargetWnd = NULL;
}


} //namespace PageAction
} //namespace Ancho
