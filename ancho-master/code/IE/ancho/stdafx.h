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
#include <atlcoll.h>
#include <atlsafe.h>

#include <shlguid.h>
#include <exdispid.h>
#include <activscp.h>

#include <ShlObj.h>
#include <Wininet.h>
#include <map>
#include <string>

#include <anchocommons.h>

using namespace ATL;

// Magpie
#import "Magpie.tlb" named_guids raw_interfaces_only raw_native_types no_smart_pointers exclude("tagSAFEARRAYBOUND")
using namespace MagpieLib;
#include "CreateMagpieInstance.h"

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

/*
#define WIDEN2(x) L ## x
#define WIDEN(x) WIDEN2(x)
#define __WFILE__ WIDEN(__FILE__)
CString s; \
s.Format(_T("ASSERTION FAILED: 0x%08x in file %s line %i"), _hr__, __WFILE__, __LINE__); \
::MessageBox(NULL, s, _T("ancho debug"), MB_OK); \
*/

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

#define IF_FAILED_BREAK(_hr, _hrRet) \
    _hrRet = _hr; \
    ASSERT_(SUCCEEDED(_hrRet)); \
    if (FAILED(_hrRet)) \
    { \
      ATLTRACE(_T("ASSERTION FAILED: 0x%08x in "), _hrRet); \
      ATLTRACE(__FILE__); \
      ATLTRACE(_T(" line %i\n"), __LINE__); \
      break; \
    }

#define ENSURE_RETVAL(_val) \
  if (!_val) return E_POINTER;

#include <Exceptions.h>
#include <SimpleWrappers.h>
#include <IPCHeartbeat.h>

#include <deque>
#include <string>
#include <map>
#include <set>
#include <vector>
#include <algorithm>
#include <locale>
#include <sstream>

#include <boost/regex.hpp>
#include <boost/bind.hpp>
#include <boost/format.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/scoped_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/make_shared.hpp>
#include <boost/utility/result_of.hpp>
#include <boost/utility.hpp>
#include <boost/function.hpp>
#include <boost/thread/future.hpp>
#include <boost/thread.hpp>
#include <boost/atomic.hpp>
#include <boost/foreach.hpp>
#include <boost/asio.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>
#include <boost/date_time/time_facet.hpp>
#include <boost/algorithm/string.hpp>
#include <boost/filesystem.hpp>

#include <boost/tuple/tuple.hpp>
#include <boost/tuple/tuple_comparison.hpp>

#include <boost/fusion/container/vector.hpp>
#include <boost/fusion/support/is_sequence.hpp>
#include <boost/fusion/algorithm/iteration/for_each.hpp>
namespace fusion = boost::fusion;