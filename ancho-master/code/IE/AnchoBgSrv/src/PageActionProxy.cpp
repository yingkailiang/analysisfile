/****************************************************************************
 * PageActionProxy.h : Implementation of Ancho::PageAction::Proxy
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"
#include "AnchoBackGroundServer/PageActionProxy.hpp"

namespace Ancho {
namespace PageAction {

/*============================================================================
 * class Proxy
 */

//----------------------------------------------------------------------------
// CTOR
Proxy::Proxy()
{
}

//----------------------------------------------------------------------------
// advicePageActionBar
//  Called from IAnchoPageActionToolbar. aDispatch is the toolbar.
HRESULT Proxy::advicePageActionBar(IDispatch * aDispatch)
{
  mPageActionToolbar = aDispatch;
  return S_OK;
}

//----------------------------------------------------------------------------
// unadvicePageActionBar
void Proxy::unadvicePageActionBar()
{
  mPageActionToolbar.Release();
}

//----------------------------------------------------------------------------
// getToolBar
//  Return a weak pointer to the toolbar. Can return NULL.
IAnchoPageActionToolbar * Proxy::getToolBar() {
  return mPageActionToolbar;
}

//----------------------------------------------------------------------------
// getToolBar
//  Return toolbar as a variant. Can return empty value with S_FALSE.
HRESULT Proxy::getToolBar(VARIANT * aRetVal) {
  ENSURE_RETVAL(aRetVal);
  VariantInit(aRetVal);
  if (!mPageActionToolbar) {
    return S_FALSE;
  }
  HRESULT hr = mPageActionToolbar.QueryInterface(&aRetVal->pdispVal);
  if (SUCCEEDED(hr)) {
    aRetVal->vt = VT_DISPATCH;
  }
  return hr;
}

//----------------------------------------------------------------------------
// onTabNavigate
//  Promotes a tab navigation event to the toolbar.
HRESULT Proxy::onTabNavigate(INT aTabId) {
  if (mPageActionToolbar) {
    return mPageActionToolbar->onTabNavigate(aTabId);
  }
  return S_FALSE;
}

//----------------------------------------------------------------------------
// onTabActivate
//  Promotes a tab activation event to the toolbar.
HRESULT Proxy::onTabActivate(INT aNewTabId) {
  if (mPageActionToolbar) {
    return mPageActionToolbar->onTabActivate(aNewTabId);
  }
  return S_FALSE;
}

//----------------------------------------------------------------------------
// writeHandleAndInject
//  Writes the internal mIEMainWindow to the mem file and invokes the page
//  action broker to inject the page actions DLL into the IE process.
HRESULT Proxy::writeHandleAndInject(DWORD aProcessId)
{
  // detect bitness of target process
  CHandle process(::OpenProcess(  PROCESS_QUERY_LIMITED_INFORMATION, FALSE, aProcessId ));
  if( !process ) {
    return HRESULT_FROM_WIN32(::GetLastError());
  }
  BOOL is64 = Is64bitProcess(process);
  process.Close();

  // write window handle
  CHandle fileMapping;
  HRESULT hr = writeHandle(mIEMainWindow, fileMapping.m_h);
  if (FAILED(hr)) {
    return hr;
  }

  // prepare broker process
  STARTUPINFO startInfo;
  ::ZeroMemory( &startInfo, sizeof( startInfo ) );
  startInfo.cb = sizeof( startInfo );
  startInfo.dwFlags |= STARTF_USESHOWWINDOW;
  startInfo.wShowWindow = FALSE;

  PROCESS_INFORMATION processInfo;
  ::ZeroMemory( &processInfo, sizeof( processInfo ) );

  // pass process-ID
  CString params;
  params.Format(_T("%lu"), aProcessId);

  // path for broker exe to use
  CString path;
  path.Format(_T("%s%s"), (is64) ? mInstallPath64 : mInstallPath32, sBrokerExec);

  if( ::CreateProcess(
      path.GetBuffer(MAX_PATH), params.GetBuffer(MAX_PATH),
      NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL,
      &startInfo, &processInfo ) ){
    ::WaitForSingleObject( processInfo.hProcess, INFINITE );
    ::CloseHandle( processInfo.hThread );
    ::CloseHandle( processInfo.hProcess );
    return S_OK;
  }
  // something went wrong. Call GetLastError BEFORE closing file handle!
  DWORD dw = ::GetLastError();
  fileMapping.Close();
  return HRESULT_FROM_WIN32(dw);
}

//----------------------------------------------------------------------------
// initPageActions
//  Called to initialize page actions for a certain browser / tab
HRESULT Proxy::initPageActions(HWND aHwndBrowser, INT aTabId)
{
  if (!aHwndBrowser || !::IsWindow(aHwndBrowser)) {
    return E_INVALIDARG;
  }
  mIEMainWindow = aHwndBrowser;

  // Get install paths for 32 and 64bit from registry
  if (mInstallPath32.IsEmpty()) {
    if (!GetInstallDir(mInstallPath32.GetBuffer(MAX_PATH), MAX_PATH, FALSE)) {
      return E_FAIL;
    }
    mInstallPath32.ReleaseBuffer();
  }

  if (mInstallPath64.IsEmpty()) {
    // do we also have a 64 bit installation?
    if (!GetInstallDir(mInstallPath64.GetBuffer(MAX_PATH), MAX_PATH, TRUE)) {
      mInstallPath64 = mInstallPath32;
    }
    mInstallPath64.ReleaseBuffer();
  }

  // get process ID from window handle
  DWORD ieMainProcessID = 0;
  if (!::GetWindowThreadProcessId(aHwndBrowser, &ieMainProcessID)) {
    return E_FAIL;
  }

  // prepare and start injection
  return writeHandleAndInject(ieMainProcessID);
}


/*============================================================================
 * class ProxyManager
 */

//----------------------------------------------------------------------------
// CTOR
ProxyManager::ProxyManager()
{
}

//----------------------------------------------------------------------------
// DTOR
ProxyManager::~ProxyManager()
{
  clear();
}

//----------------------------------------------------------------------------
// clear
//  Remove all proxies.
void ProxyManager::clear()
{
  // mMapHWND2Proxy is the owner of the Proxy objects
  for (MapHWND2Proxy::iterator it = mMapHWND2Proxy.begin();
      it != mMapHWND2Proxy.end(); ++it) {
    delete it->second;
  }
  mMapTabId2HWND.clear();

  mMapHWND2Proxy.clear();
}

//----------------------------------------------------------------------------
// getProxyForHWND
//  Returns proxy for a certain window or NULL.
Proxy * ProxyManager::getProxyForHWND(HWND aHWND)
{
  MapHWND2Proxy::iterator it = mMapHWND2Proxy.find(aHWND);
  return (it == mMapHWND2Proxy.end()) ? NULL : it->second;
}

//----------------------------------------------------------------------------
// getProxyForTabId
//  Returns proxy for a certain tab or NULL.
Proxy * ProxyManager::getProxyForTabId(INT aTabId)
{
  return getProxyForHWND(getHWNDForTab(aTabId));
}

//----------------------------------------------------------------------------
// getHWNDForTab
//  Returns a window for a certain tab or NULL.
HWND ProxyManager::getHWNDForTab(INT aTabId)
{
  MapTabId2HWND::iterator it = mMapTabId2HWND.find(aTabId);
  return (it == mMapTabId2HWND.end()) ? NULL : it->second;
}

//----------------------------------------------------------------------------
// initPageActions
//  Called to initialize page actions for a certain browser / tab. Creates
//  new proxy if none exists yet for aHWND.
HRESULT ProxyManager::initPageActions(HWND aHWND, INT aTabId)
{
  Proxy * proxy = getProxyForHWND(aHWND);
  if (!proxy) {
    // note that the new proxy already has to be available via the
    // getProxyFor...() methods when initPageActions() is called
    mMapHWND2Proxy[aHWND] = proxy = new Proxy();
    HRESULT hr = proxy->initPageActions(aHWND, aTabId);
    if (FAILED(hr)) {
      delete proxy;
      mMapHWND2Proxy.erase(aHWND);
      return hr;
    }
  }
  mMapTabId2HWND[aTabId] = aHWND;
  return S_OK;
}

//----------------------------------------------------------------------------
// removeProxyForHWND
//  Removes proxy for a certain window.
void ProxyManager::removeProxyForHWND(HWND aHWND)
{
  MapHWND2Proxy::iterator itProxy = mMapHWND2Proxy.find(aHWND);
  if (itProxy != mMapHWND2Proxy.end()) {
    itProxy->second->unadvicePageActionBar();
    delete itProxy->second;
    mMapHWND2Proxy.erase(itProxy);
    MapTabId2HWND::iterator itHWND = mMapTabId2HWND.begin();
    while(itHWND != mMapTabId2HWND.end()) {
      if (itHWND->second == aHWND) {
        mMapTabId2HWND.erase(itHWND++);
      }
      else {
        ++itHWND;
      }
    }
  }
}

//----------------------------------------------------------------------------
// removeTab
//  Removes a tab, but does not delete the owner window!
void ProxyManager::removeTab(INT aTabId)
{
  mMapTabId2HWND.erase(aTabId);
}


} //namespace PageAction
} //namespace Ancho
