/****************************************************************************
 * PageActionToolbar.cpp : Implementation of PageActionToolbar
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"
#include "Mshtml.h"
#include "PageActionToolbar.hpp"
#include "PageActionModule.hpp"

using namespace std;

extern PageActionModule _AtlModule;

/*============================================================================
 * class PageActionToolbar::Addon
 */

//----------------------------------------------------------------------------
// CTOR
PageActionToolbar::Addon::Addon(const UINT aCmdID) :
  mCmdId(aCmdID)
{
}

/*============================================================================
 * class PageActionToolbar::PageAction
 */

//----------------------------------------------------------------------------
// CTOR
PageActionToolbar::PageAction::PageAction(
      const std::wstring & aAddonId,
      const UINT aCmdID,
      const std::wstring & aTitle,
      const int aImageOffset,
      LPDISPATCH aOnClickHandler) :
    mAddonId(aAddonId),
    mTitle(aTitle),
    mOnClickHandler(aOnClickHandler),
    mCmdId(aCmdID),
    mImageOffset(aImageOffset),
    mVisible(FALSE)
{
}

/*============================================================================
 * class PageActionToolbar::Tab
 */
//----------------------------------------------------------------------------
// CTOR
PageActionToolbar::Tab::Tab(int aId) :
    mId(aId)
{
}

//----------------------------------------------------------------------------
// DTOR
PageActionToolbar::Tab::~Tab()
{
  for (MapAddonId2PageAction::iterator it = mPageActions.begin();
      it != mPageActions.end();
      ++it) {
    delete it->second;
  }
  mPageActions.clear();
}

//----------------------------------------------------------------------------
// hideAll
//  Sets all page actions to hidden.
//  Does not update the UI.
void PageActionToolbar::Tab::hideAll()
{
  for (MapAddonId2PageAction::iterator it = mPageActions.begin();
      it != mPageActions.end();
      ++it) {
    it->second->mVisible = FALSE;
  }
}

//----------------------------------------------------------------------------
// getPageAction
//  Returns a page action for this tab or NULL.
PageActionToolbar::PageAction * PageActionToolbar::Tab::getPageAction(
    const std::wstring & aAddonId)
{
  MapAddonId2PageAction::iterator it = mPageActions.find(aAddonId);
  return (it != mPageActions.end()) ? it->second : NULL;
}

//----------------------------------------------------------------------------
// addPageAction
//  Adds a page action for this tab.
PageActionToolbar::PageAction * PageActionToolbar::Tab::addPageAction(
    const std::wstring & aAddonId,
    const UINT aCmdID,
    const std::wstring & aTitle,
    const int aImageOffset,
    LPDISPATCH aOnClickHandler)
{
  PageAction * pageAction = mPageActions[aAddonId] =
      new PageAction(aAddonId, aCmdID, aTitle, aImageOffset, aOnClickHandler);
  return pageAction;
}

//----------------------------------------------------------------------------
// removePageAction
//  Removes page action for this tab.
void PageActionToolbar::Tab::removePageAction(
    const std::wstring & aAddonId)
{
  MapAddonId2PageAction::iterator it = mPageActions.find(aAddonId);
  if (it != mPageActions.end()) {
    delete it->second;
    mPageActions.erase(it);
  }
}

/*============================================================================
 * class PageActionToolbar
 */

//----------------------------------------------------------------------------
// CreateInstance
//  Static creator function.
HRESULT PageActionToolbar::CreateInstance(
  HWND aIEMainWindow,
  HWND aIEToolbarWnd,
  HWND aIECmdTargetWnd,
  CComPtr<IAnchoPageActionToolbar> & aRetVal)
{
  CComObject<PageActionToolbar> * newObject = NULL;
  IF_FAILED_RET(CComObject<PageActionToolbar>::CreateInstance(&newObject));
  CComPtr<IAnchoPageActionToolbar> manager(newObject);
  IF_FAILED_RET(newObject->init(aIEMainWindow, aIEToolbarWnd, aIECmdTargetWnd));
  aRetVal = newObject;
  return S_OK;
}

//----------------------------------------------------------------------------
// FinalConstruct
HRESULT PageActionToolbar::FinalConstruct()
{
  GdiplusStartupInput gsi;
  if (Ok != GdiplusStartup( &mGDIpToken, &gsi, NULL )) {
    return E_FAIL;
  }

  return S_OK;
}

//----------------------------------------------------------------------------
// FinalRelease
void PageActionToolbar::FinalRelease()
{
  // make sure we don't process onCommandMessage any more,
  // because the PageAction pointer stored in the button infos will be
  // gone now.
  mToolbar.Detach();
  for (MapTabId2Tab::iterator it = mTabs.begin();
      it != mTabs.end();
      ++it) {
    delete it->second;
  }
  mTabs.clear();
  mAddons.clear();
  if (mToolTipBuffer) {
    free(mToolTipBuffer);
    mToolTipBuffer = NULL;
  }

  GdiplusShutdown(mGDIpToken);
}

//----------------------------------------------------------------------------
// closeConnection
//  Unadvice us from the background service.
void PageActionToolbar::closeConnection()
{
  if (mService) {
    mService->unadvicePageActionBar((OLE_HANDLE)mIEMainWindow);
  }
  mService.Release();
}

//----------------------------------------------------------------------------
// onCommandMessage
//  Called for a WM_COMMAND for our toolbar
BOOL PageActionToolbar::onCommandMessage(WPARAM wParam, LPARAM lParam)
{
  if ( !mService || !mToolbar
      || (wParam < FIRST_COMMAND_ID)
      || (wParam > mNextCmdID) ) {
    // invalid state or not our command
    return FALSE;
  }
  TBBUTTONINFO info = {sizeof(info), TBIF_LPARAM | TBIF_SIZE, 0};
  if (-1 != mToolbar.GetButtonInfo((int)wParam, &info) && info.lParam) {
    CRect r;
    mToolbar.GetItemRect((int)mToolbar.CommandToIndex((int)wParam), r);
    mToolbar.ClientToScreen(r);
    PageAction * action = (PageAction*)info.lParam;
    if (action->mOnClickHandler) {
      CComVariant args[5] = {r.Height(), r.Width(), r.top, r.left, mCurrentTab};
      DISPPARAMS params = {args, NULL, 5, 0};
      action->mOnClickHandler.Call(NULL, &params);
    }
    return TRUE;
  }
  return FALSE;
}

//----------------------------------------------------------------------------
// getToolTipW
//  Returns a tooltip for the button (Unicode version).
BOOL PageActionToolbar::getToolTipW(TOOLTIPTEXTW * aToolTipHdr)
{
  if ( !mToolbar
      || (aToolTipHdr->hdr.idFrom < FIRST_COMMAND_ID)
      || (aToolTipHdr->hdr.idFrom > mNextCmdID)
      || (aToolTipHdr->uFlags & TTF_IDISHWND)) {
    // not interested or invalid args
    return FALSE;
  }

  TBBUTTONINFO info = {sizeof(info), TBIF_LPARAM, 0};
  if (-1 != mToolbar.GetButtonInfo((int)aToolTipHdr->hdr.idFrom, &info) && info.lParam) {
    PageAction * action = (PageAction*)info.lParam;
    // For the mess here with allocating a buffer see
    // http://support.microsoft.com/kb/180646/en-us
    // In a short term: The buffer has to stay valid after
    // returning from the message handler.
    // But also the caller does not free it..
    // Again: Well done, MS!
    if (mToolTipBuffer) {
      free(mToolTipBuffer);
    }
    aToolTipHdr->lpszText = mToolTipBuffer = _wcsdup(action->mTitle.c_str());
    return TRUE;
  }
  return FALSE;
}

//----------------------------------------------------------------------------
// getToolTipA
//  Returns a tooltip for the button (ANSI version).
//  Not sure if this one will ever be used, but samples on the internet
//  usually handle ANSI AND Unicode. So I leave it here.
BOOL PageActionToolbar::getToolTipA(TOOLTIPTEXTA * aToolTipHdr)
{
  if ( !mToolbar ||
      (aToolTipHdr->hdr.idFrom < FIRST_COMMAND_ID) ||
      (aToolTipHdr->hdr.idFrom > mNextCmdID) ) {
    // not our command
    return FALSE;
  }
  TBBUTTONINFO info = {sizeof(info), TBIF_LPARAM, 0};
  if (-1 != mToolbar.GetButtonInfo((int)aToolTipHdr->hdr.idFrom, &info) && info.lParam) {
    PageAction * action = (PageAction*)info.lParam;
    // Since it seems not to be used I'm ok with trunkating to 80 chars here
    _wcstombsz(aToolTipHdr->szText, action->mTitle.c_str(), _countof(aToolTipHdr->szText));
    return TRUE;
  }
  return FALSE;
}

//----------------------------------------------------------------------------
// init
HRESULT PageActionToolbar::init(HWND aIEMainWindow, HWND aIEToolbarWnd, HWND aIECmdTargetWnd)
{
  ATLASSERT(aIEMainWindow);
  ATLASSERT(aIEToolbarWnd);
  ATLASSERT(aIECmdTargetWnd);

  // store our windows
  mIEMainWindow = aIEMainWindow;
  mIEToolbarWnd = aIEToolbarWnd;
  mIECmdTargetWnd = aIECmdTargetWnd;

  // get instance of background service...
  IF_FAILED_RET(mService.CoCreateInstance(CLSID_AnchoAddonService));
  // ...and advice our instance
  mService->advicePageActionBar((OLE_HANDLE)mIEMainWindow, this);

  // get toolbar...
  mToolbar.Attach(mIEToolbarWnd);

  // ...and its image lists
  mImageListNormal = mToolbar.GetImageList();
  mImageListHot = mToolbar.GetHotImageList();
  mImageListPressed = mToolbar.GetPressedImageList();

  // size of an image in the toolbar
  mImageListNormal.GetIconSize(mImageSize);
  if (0 == mImageSize.cx) {
    mImageSize.cx = 16;
  }
  if (0 == mImageSize.cy) {
    mImageSize.cy = 16;
  }

  return S_OK;
}

//----------------------------------------------------------------------------
// getPageAction
//  Return a page action for a certain addon in a certain tab or NULL.
PageActionToolbar::PageAction *
  PageActionToolbar::getPageAction(const std::wstring & aAddonId, const INT aTabId)
{
  MapTabId2Tab::iterator it = mTabs.find(aTabId);
  if (it != mTabs.end()) {
    return it->second->getPageAction(aAddonId);
  }
  return NULL;
}

//----------------------------------------------------------------------------
// showHide
//  Show or hide a page action. Updates the UI.
HRESULT PageActionToolbar::showHide(const BSTR addonID, const INT aTabId, const BOOL aShow)
{
  if (!mToolbar) {
    return E_UNEXPECTED;
  }

  PageAction * pageAction = getPageAction(addonID, aTabId);
  if (!pageAction) {
    return E_INVALIDARG;
  }
  pageAction->mVisible = aShow;

  updateToolbar();

  return S_OK;
}

//----------------------------------------------------------------------------
// hideAll
//  Hides all page actions for a certain tab. Used in onTabNavigate.
void PageActionToolbar::hideAll(const INT aTabId)
{
  MapTabId2Tab::iterator it = mTabs.find(aTabId);
  if (it != mTabs.end()) {
    it->second->hideAll();
  }
}

//----------------------------------------------------------------------------
// updateToolbar
//  Updates the UI. Removes hidden buttons or all buttons if aForceHide is TRUE.
//  Inserts / updates visible buttons if aForceHide is FALSE.
//  Works for the currently selected tab (mCurrentTab).
void PageActionToolbar::updateToolbar(BOOL aForceHide)
{
  if (!mToolbar) {
    return;
  }
  MapTabId2Tab::iterator tabIt = mTabs.find(mCurrentTab);
  if (tabIt == mTabs.end()) {
    return;
  }
  Tab * tab = tabIt->second;

  for (MapAddonId2PageAction::iterator it = tab->mPageActions.begin();
      it != tab->mPageActions.end();
      ++it) {
    PageAction * action = it->second;
    ATLASSERT(action->mCmdId);
    ATLASSERT(action->mImageOffset > -1);

    // set current image and pageaction pointer
    mToolbar.SetButtonInfo(action->mCmdId,
        TBIF_IMAGE | TBIF_LPARAM,
        0, 0, NULL, action->mImageOffset,
        0, 0, (DWORD_PTR)action);
    // show / hide the button
    mToolbar.HideButton(action->mCmdId, (aForceHide || !action->mVisible));
  }

  // refreshes size of the toolbar
  mToolbar.SendMessage( WM_SIZE, 0, 0 );
  ::SendMessage( mIECmdTargetWnd, WM_SIZE, 0, 0 );
}

//----------------------------------------------------------------------------
// iconFromVariant
//  Gets a HICON handle of an icon with same size as other icons for the toolbar.
//  Currently only an absolute path to an image file is suppported.
HICON PageActionToolbar::iconFromVariant(const VARIANT & aIcon)
{
  if (VT_BSTR == aIcon.vt) {
    // icon is a filename
    Image img(aIcon.bstrVal, FALSE);
    if (Ok != img.GetLastStatus()) {
      return NULL;
    }

    Bitmap tmpBm(mImageSize.cx, mImageSize.cy, img.GetPixelFormat());
    Graphics graphics(&tmpBm);
    if (Ok != graphics.DrawImage(&img, 0, 0, mImageSize.cx, mImageSize.cy)) {
      return NULL;
    }

    HICON icon;
    if (Ok != tmpBm.GetHICON(&icon)) {
      return NULL;
    }
    return icon;
  }
  return NULL;
}

//----------------------------------------------------------------------------
// setIcon
//  Insert of replace (if aIndex != -1) icon in the toolbar's image lists.
int PageActionToolbar::setIcon(HICON aIcon, int aIndex)
{
  if (-1 == aIndex) {
    mImageListHot.AddIcon(aIcon);
    mImageListPressed.AddIcon(aIcon);
    return mImageListNormal.AddIcon(aIcon);
  }
  else {
    mImageListNormal.ReplaceIcon(aIndex, aIcon);
    mImageListHot.ReplaceIcon(aIndex, aIcon);
    mImageListPressed.ReplaceIcon(aIndex, aIcon);
    return aIndex;
  }
}

// -------------------------------------------------------------------------
// IAnchoPageActionToolbar implementation

//----------------------------------------------------------------------------
// registerAction
//  Adds / updates a pageaction for this addon / tab
STDMETHODIMP PageActionToolbar::registerAction(
    BSTR aAddonId,
    INT aTabId,
    VARIANT aIcon,
    BSTR aTitle,
    LPDISPATCH aOnClickHandler)
{
  if (!mToolbar) {
    return E_UNEXPECTED;
  }
  HICON icon = iconFromVariant(aIcon);
  if (!icon) {
    return E_INVALIDARG;
  }

  std::wstring addonID(aAddonId);

  // get or create tab
  Tab * tab = NULL;
  MapTabId2Tab::iterator it = mTabs.find(aTabId);
  if (it == mTabs.end()) {
    // a new tab was opened
    tab = mTabs[aTabId] = new Tab(aTabId);
  }
  else {
    // we have this tab already
    tab = it->second;
  }

  // get or create an addon
  UINT cmdId = 0;
  MapAddons::iterator itAddon = mAddons.find(addonID);
  Addon addon;
  if (itAddon == mAddons.end()) {
    // create new addon with new command ID
    addon = mAddons[addonID] = Addon(mNextCmdID++);
    // And insert a button for this addon. Note that at this point we don't
    // supply real values to the button, it is a dummy.
    // The actual values will be set in updateToolbar() depending
    // on the currently selected tab.
    mToolbar.InsertButton(0, addon.mCmdId, BTNS_AUTOSIZE, TBSTATE_ENABLED, 0, _T(""), NULL);
  }
  else {
    addon = itAddon->second;
  }

  // get or create page action for this tab
  PageAction * action = tab->getPageAction(addonID);
  if (!action) {
    // a new page action with a new icon
    action = tab->addPageAction(
        addonID,
        addon.mCmdId,
        aTitle,
        setIcon(icon),
        aOnClickHandler);
  }
  else {
    // update existing page action, replace icon in image list
    action->mTitle = aTitle;
    action->mOnClickHandler = aOnClickHandler;
    action->mVisible = FALSE;
    setIcon(icon, action->mImageOffset);
//    pageAction->mPopup = aPopup;
  }

  ::DeleteObject(icon);

  updateToolbar();

  return S_OK;
}

//----------------------------------------------------------------------------
// unregisterAction
//  Remove page action for a certain addon in a certain tab
STDMETHODIMP PageActionToolbar::unregisterAction(BSTR aAddonId, INT aTabId)
{
  // find tab
  MapTabId2Tab::iterator it = mTabs.find(aTabId);
  if (it != mTabs.end()) {
    it->second->removePageAction(aAddonId);
  }
  return S_OK;

}

//----------------------------------------------------------------------------
// show
STDMETHODIMP PageActionToolbar::show(BSTR addonID, INT aTabId)
{
  return showHide(addonID, aTabId, TRUE);
}

//----------------------------------------------------------------------------
// hide
STDMETHODIMP PageActionToolbar::hide(BSTR addonID, INT aTabId)
{
  return showHide(addonID, aTabId, FALSE);
}

//----------------------------------------------------------------------------
// setIcon
STDMETHODIMP PageActionToolbar::setIcon(BSTR addonID, INT aTabId, VARIANT aIcon)
{
  PageAction * pageAction = getPageAction(addonID, aTabId);
  if (!pageAction) {
    return E_INVALIDARG;
  }
  HICON icon = iconFromVariant(aIcon);
  if (!icon) {
    return E_INVALIDARG;
  }
  setIcon(icon, pageAction->mImageOffset);

  ::DeleteObject(icon);
  updateToolbar();

  return S_OK;
}

//----------------------------------------------------------------------------
// onTabNavigate
//  Called from CAnchoAddonService
//                <-- CAnchoRuntime
//                  <-- browser-event: DISPID_BEFORENAVIGATE2
STDMETHODIMP PageActionToolbar::onTabNavigate(INT aTabId) {
  if (mCurrentTab == aTabId) {
    // hide all page actions
    hideAll(aTabId);
    // and update UI (cleanup toolbar)
    updateToolbar(TRUE);
  }
  return S_OK;
}

//----------------------------------------------------------------------------
// onTabActivate
//  Called from CAnchoAddonService
//                <-- CAnchoRuntime
//                  <-- browser-event: DISPID_WINDOWSTATECHANGED
STDMETHODIMP PageActionToolbar::onTabActivate(INT aNewTabId) {
  if (mCurrentTab != aNewTabId) {
    // update UI (cleanup toolbar)
    updateToolbar(TRUE);
    mCurrentTab = aNewTabId;
    // and update UI for current tab
    updateToolbar();
  }
  return S_OK;
}

