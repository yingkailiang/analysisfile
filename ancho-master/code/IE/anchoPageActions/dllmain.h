// dllmain.h : Declaration of module class.

extern class CAnchoPageActionsModule _AtlModule;

class CAnchoPageActionsModule :
  public Ancho::Utils::PageActionBase,
  public CAtlDllModuleT<CAnchoPageActionsModule>
{
public :

private:
  HRESULT init();
  void destroy();

  static LRESULT CALLBACK cmdTargetWndProcS(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);
  static LRESULT CALLBACK addrBarWndProcS(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

  BOOL cmdTargetWndProc(LRESULT & lResult, UINT uMsg, WPARAM wParam, LPARAM lParam);
  BOOL addrBarWndProc(LRESULT & lResult, UINT uMsg, WPARAM wParam, LPARAM lParam);

  CString m_sInstallPath32;
  CString m_sInstallPath64;

  typedef LRESULT (CALLBACK *WndProcPtr)(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam);

  BOOL  mInitialized;
  WndProcPtr mOldCmdTargetWndProc;
  WndProcPtr mIEToolbarWndProc;
  CComPtr<IAnchoAddonService> mService;
  CComPtr<IAnchoPageActionBar> mBar;
};

