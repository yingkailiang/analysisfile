/****************************************************************************
 * PageActionProxy.h : Declaration of Ancho::PageAction::Proxy
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#pragma once

#include "PageActionBase.hpp"
#include "AnchoBgSrv_i.h"

namespace Ancho {
namespace PageAction {

/*============================================================================
 * class Proxy
 *  Represents a certain IE window (and by this it's toolbar via
 *  IAnchoPageActionToolbar) in ancho background service.
 */
class Proxy :
  public Ancho::PageAction::Base
{
public:
  Proxy();

  HRESULT initPageActions(HWND aHwndBrowser, INT aTabId);
  HRESULT advicePageActionBar(IDispatch * aDispatch);
  void unadvicePageActionBar();
  IAnchoPageActionToolbar * getToolBar();

  HRESULT getToolBar(VARIANT * aRetVal);
  HRESULT onTabNavigate(INT aTabId);
  HRESULT onTabActivate(INT aNewTabId);

private:
  HRESULT writeHandleAndInject(DWORD aProcessId);

  CString mInstallPath32;
  CString mInstallPath64;
  CComQIPtr<IAnchoPageActionToolbar>
          mPageActionToolbar;

};

/*============================================================================
 * class ProxyManager
 *  Keeps track of all proxies. Has getters for a proxy via Tab-ID or HWND
 *  HWND is an IE main window.
 */
class ProxyManager
{
public:
  ProxyManager();
  ~ProxyManager();

  void clear();

  Proxy * getProxyForHWND(HWND aHWND);
  Proxy * getProxyForTabId(INT aTabId);
  HWND getHWNDForTab(INT aTabId);

  HRESULT initPageActions(HWND aHWND, INT aTabId);
  void removeProxyForHWND(HWND aHWND);
  void removeTab(INT aTabId);

private:
  ProxyManager(const ProxyManager &);
  ProxyManager & operator = (const ProxyManager &);

  typedef std::map<HWND, Proxy*> MapHWND2Proxy;
  typedef std::map<INT, HWND> MapTabId2HWND;

  // mMapHWND2Proxy is the owner of the Proxy objects
  MapHWND2Proxy mMapHWND2Proxy;

  // mMapTabId2HWND holds a weak reference
  MapTabId2HWND mMapTabId2HWND;

};


} //namespace PageAction
} //namespace Ancho
