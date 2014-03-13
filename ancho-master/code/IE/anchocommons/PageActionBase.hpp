/****************************************************************************
 * PageActionBase.h : Declaration of Ancho::PageAction::Base
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#pragma once

namespace Ancho {
namespace PageAction {

/*============================================================================
 * class Ancho::PageAction::Base
 *  Contains usefull functions for pageactions and acts as baseclass for
 *  Ancho::PageAction::Proxy and PageActionIEWindow.
 *
 *  Purpose:
 *   - detecting bitness of a process
 *   - get install dir
 *   - memory file management for exchanging window handles
 *   - finding and holding required IE windows
 */
class Base
{
public:
  Base();
  virtual ~Base();

//** statics
  // configuration
  static LPCTSTR sWrapperDLL;
  static LPCTSTR sBrokerExec;
  static LPCTSTR sFileMappingName;
  static LPCTSTR sInitWindowMessageName;

  static BOOL GetInstallDir(LPTSTR aInstallDir, ULONG aMaxLength, BOOL aFor64bit);

  // process handling, detection 32 and 64 bit
  static BOOL Is64bitOS();
  static BOOL Is64bitProcess(HANDLE aProcess);

  // mem-file related
  static HRESULT readHandle(HWND & aWindowHandle);
  static HRESULT writeHandle(const HWND aWindowHandle, HANDLE & aFileMapping);

  // find required IE windows
  static BOOL gatherIEWindows(
      HWND aIeMainWindow,
      HWND & aCmdTargetWindow,
      HWND & aToolbarWindow);

  static UINT getPageActionMessage();

//** members
  BOOL gatherIEWindows(HWND aIeMainWindow);
  virtual void reset();

  // getters
  inline HWND getIEMainWnd()
    {return mIEMainWindow;}

  inline HWND getCmdTargetWnd()
    {return mIECmdTargetWnd;}

  inline HWND getToolbarWnd()
    {return mIEToolbarWnd;}

protected:
  // IE main window
  HWND  mIEMainWindow;
  // Command receiver window, the parent of the toolbar
  HWND  mIECmdTargetWnd;
  // Toolbar window
  HWND  mIEToolbarWnd;
};

} //namespace PageAction
} //namespace Ancho
