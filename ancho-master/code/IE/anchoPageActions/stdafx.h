// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently,
// but are changed infrequently

#pragma once

#ifndef STRICT
#define STRICT
#endif

#include "targetver.h"

#define _ATL_APARTMENT_THREADED
#define _ATL_NO_AUTOMATIC_NAMESPACE

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS  // some CString constructors will be explicit

#include "resource.h"
#include <atlbase.h>
#include <atlstr.h>
#include <atlcom.h>
#include <atlctl.h>
#include <atlapp.h>
#include <atlctrls.h>
#include <atlsafe.h>
#include <atltypes.h>

using namespace ATL;

#include <string>
#include <map>

#include <Strsafe.h>

#include <gdiplus.h>
using namespace Gdiplus;

// addon framework
#import "AnchoBgSrv.tlb" named_guids no_smart_pointers raw_interfaces_only raw_native_types exclude("tagSAFEARRAYBOUND")
using namespace AnchoBgSrvLib;

// helper
#include "libbhohelper.h"
using namespace LIB_BhoHelper;

#define _DEBUG_BREAK
#ifdef _DEBUG_BREAK
#define ASSERT_ ATLASSERT
#else
#define ASSERT_
#endif

#define IF_FAILED_RET(_hr) \
  do \
  { \
    HRESULT _hr__ = _hr; \
    ASSERT_(SUCCEEDED(_hr__)); \
    if (FAILED(_hr__)) \
    { \
      ATLTRACE(_T("ASSERTION FAILED: 0x%08x in "), _hr__); \
      ATLTRACE(__FILE__); \
      ATLTRACE(_T(" line %i\n"), __LINE__); \
      return _hr__; \
    } \
  } while(0);

#define IF_FAILED_RET2(_hr, _ret) \
  do \
  { \
    HRESULT _hr__ = _hr; \
    ASSERT_(SUCCEEDED(_hr__)); \
    if (FAILED(_hr__)) \
    { \
      ATLTRACE(_T("ASSERTION FAILED: 0x%08x in "), _hr__); \
      ATLTRACE(__FILE__); \
      ATLTRACE(_T(" line %i\n"), __LINE__); \
      return _ret; \
    } \
  } while(0);

#define ENSURE_RETVAL(_val) \
  if (!_val) return E_POINTER;


