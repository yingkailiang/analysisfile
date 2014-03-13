/****************************************************************************
 * PageActionToolbar.h : Declaration of PageActionToolbar
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <kontakt@seiberspace.de>
 ****************************************************************************/

#pragma once

/*============================================================================
 * class PageActionToolbar
 *  Acts as the holder of the IE toolbar, command receiver from the toolbar
 *  and connection to the backgroundservice.
 *  Manages all the pageactions for a certain IE window.
 */
class ATL_NO_VTABLE PageActionToolbar :
  public CComObjectRootEx<CComSingleThreadModel>,
  public IDispatchImpl<IAnchoPageActionToolbar, &IID_IAnchoPageActionToolbar,
                &LIBID_AnchoBgSrvLib, /*wMajor =*/ 0xffff, /*wMinor =*/ 0xffff>
{
public:
  enum {
    FIRST_COMMAND_ID = 0xc001
  };

  friend class CComObject<PageActionToolbar>;

  static HRESULT CreateInstance(
      HWND aIEMainWindow,
      HWND aIEToolbarWnd,
      HWND aIECmdTargetWnd,
      CComPtr<IAnchoPageActionToolbar> & aRetVal);

public:
  // -------------------------------------------------------------------------
  // COM standard stuff
  DECLARE_NO_REGISTRY()
  DECLARE_NOT_AGGREGATABLE(PageActionToolbar)
  DECLARE_PROTECT_FINAL_CONSTRUCT()

public:
  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(PageActionToolbar)
    COM_INTERFACE_ENTRY(IDispatch)
    COM_INTERFACE_ENTRY(IAnchoPageActionToolbar)
  END_COM_MAP()

public:
  // -------------------------------------------------------------------------
  // COM standard methods
  HRESULT FinalConstruct();
  void FinalRelease();

  // -------------------------------------------------------------------------
  // methods called from PageActionIEWindow
  void closeConnection();
  BOOL onCommandMessage(WPARAM wParam, LPARAM lParam);
  BOOL getToolTipW(TOOLTIPTEXTW * aToolTipHdr);
  BOOL getToolTipA(TOOLTIPTEXTA * aToolTipHdr);

public:
  // -------------------------------------------------------------------------
  // IAnchoPageActionToolbar
  STDMETHOD(registerAction)(BSTR aAddonId, INT aTabId, VARIANT aIcon,
      BSTR aTitle, LPDISPATCH aOnClickHandler);
  STDMETHOD(unregisterAction)(BSTR aAddonId, INT aTabId);
  STDMETHOD(show)(BSTR addonID, INT aTabId);
  STDMETHOD(hide)(BSTR addonID, INT aTabId);
  STDMETHOD(setIcon)(BSTR addonID, INT aTabId, VARIANT aIcon);

  STDMETHOD(onTabNavigate)(INT aTabId);
  STDMETHOD(onTabActivate)(INT aNewTabId);

private:
  // ===========================================================================
  // represents an addon: a command ID (toolbar button id)
  // and an index in the image list.
  struct Addon {
    Addon(const UINT aCmdID = 0);
    UINT          mCmdId;
  };
  typedef std::map<std::wstring, Addon> MapAddons;

  // ===========================================================================
  // a simple data holder for the information of a certain page action in a certain tab
  class PageAction {
  public:
    PageAction(
        const std::wstring & aAddonId,
        const UINT aCmdID,
        const std::wstring & aTitle,
        const int aImageOffset,
        LPDISPATCH aOnClickHandler);

    std::wstring      mAddonId;
    std::wstring      mTitle;
    CIDispatchHelper  mOnClickHandler;
    UINT              mCmdId;
    int               mImageOffset;
    BOOL              mVisible;
  };
  typedef std::map<std::wstring, PageAction*> MapAddonId2PageAction;

  // ===========================================================================
  // a tab holding all page actions infos
  class Tab {
  public:
    Tab(int aId);
    ~Tab();

    PageAction * getPageAction(const std::wstring & aAddonId);
    PageAction * addPageAction(
        const std::wstring & aAddonId,
        const UINT aCmdID,
        const std::wstring & aTitle,
        const int aImageOffset,
        LPDISPATCH aOnClickHandler);
    void removePageAction(const std::wstring & aAddonId);
    void hideAll();

    int mId;
    MapAddonId2PageAction mPageActions;
  };
  typedef std::map<INT, Tab*> MapTabId2Tab;

private:
  // -------------------------------------------------------------------------
  // ctor
  PageActionToolbar() :
       mIEMainWindow(NULL),
       mImageSize(16,16),
       mGDIpToken(NULL),
       mNextCmdID(FIRST_COMMAND_ID),
       mCurrentTab(-1),
       mToolTipBuffer(NULL) {
  }

  HRESULT init(HWND aIEMainWindow, HWND aIEToolbarWnd, HWND aIECmdTargetWnd);
  PageAction * getPageAction(const std::wstring & aAddonId, const INT aTabId);
  HRESULT showHide(const BSTR addonID, const INT aTabId, const BOOL aShow);
  void hideAll(const INT aTabId);
  void updateToolbar(BOOL aForceHide = FALSE);
  HICON iconFromVariant(const VARIANT & aIcon);
  int setIcon(HICON aIcon, int aIndex = -1);

  MapTabId2Tab  mTabs;
  MapAddons     mAddons;

  CComPtr<IAnchoAddonService> mService;

  CToolBarCtrl  mToolbar;
  CImageList    mImageListNormal;
  CImageList    mImageListHot;
  CImageList    mImageListPressed;

  CSize         mImageSize;
  HWND          mIEMainWindow;
  HWND          mIEToolbarWnd;
  HWND          mIECmdTargetWnd;
  ULONG_PTR     mGDIpToken;
  UINT          mNextCmdID;
  INT           mCurrentTab;
  // Why this? Well, see getToolTipW
  LPTSTR        mToolTipBuffer;
};


