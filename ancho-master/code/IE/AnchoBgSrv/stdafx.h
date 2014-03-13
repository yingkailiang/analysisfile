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
#include <atlapp.h>
#include <atlcom.h>
#include <atlctl.h>
#include <atlfile.h>
#include <atlcoll.h>
#include <atltime.h>
#include <atlsafe.h>

#include <atlhost.h>
#include <atlwin.h>
#include <atlframe.h>
#include <atlctrls.h>
#include <atltypes.h>

using namespace ATL;

#include <Wininet.h>
#include <KnownFolders.h>
#include <ShlObj.h>

#include <comutil.h>

#include <anchocommons.h>
#include <Exceptions.h>

#include <gdiplus.h>
using namespace Gdiplus;

// Magpie
#import "Magpie.tlb" named_guids raw_interfaces_only raw_native_types no_smart_pointers exclude("tagSAFEARRAYBOUND")
using namespace MagpieLib;
#include "CreateMagpieInstance.h"

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

#define ENSURE_RETVAL(_val) \
  if (!_val) return E_POINTER;

#include <deque>
#include <string>
#include <map>
#include <set>
#include <vector>
#include <algorithm>

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
#include <boost/algorithm/string.hpp>
#include <boost/filesystem.hpp>
#include <boost/scope_exit.hpp>

#include <boost/tuple/tuple.hpp>
#include <boost/tuple/tuple_comparison.hpp>

#include <boost/fusion/container/vector.hpp>
#include <boost/fusion/support/is_sequence.hpp>
#include <boost/fusion/algorithm/iteration/for_each.hpp>
namespace fusion = boost::fusion;