#pragma once

#include <string>
#include <boost/atomic.hpp>
#include <ctime>

extern const wchar_t * s_AnchoMainAPIModuleID;
extern const wchar_t * s_AnchoExtensionsRegistryKey;
extern const wchar_t * s_AnchoExtensionsRegistryEntryGUID;
extern const wchar_t * s_AnchoExtensionsRegistryEntryFlags;
extern const wchar_t * s_AnchoExtensionsRegistryEntryPath;
extern const wchar_t * s_AnchoRegistryEntryVersion;
extern const wchar_t * s_AnchoUpdateUrlRegistryEntry;
extern const wchar_t * s_AnchoProtocolHandlerScheme;
extern const wchar_t * s_AnchoProtocolHandlerPrefix;
extern const wchar_t * s_AnchoInternalProtocolHandlerScheme;
extern const wchar_t * s_AnchoGlobalAPIObjectName;
extern const wchar_t * s_AnchoServiceAPIName;
extern const wchar_t * s_AnchoBackgroundAPIObjectName;
extern const wchar_t * s_AnchoBackgroundPageAPIName;
extern const wchar_t * s_AnchoBackgroundConsoleObjectName;
extern const wchar_t * s_AnchoFnGetContentAPI;
extern const wchar_t * s_AnchoFnReleaseContentAPI;
extern const wchar_t * s_AnchoTabIDPropertyName;



#include <SHTypes.h>
bool isExtensionPage(const std::wstring &aUrl);
std::wstring getDomainName(const std::wstring &aUrl);
std::wstring getSystemPathWithFallback(REFKNOWNFOLDERID aKnownFolderID, int aCLSID);

std::wstring stringFromCLSID(const CLSID &aCLSID);
std::wstring stringFromGUID2(const GUID &aGUID);


inline std::wstring stripFragmentFromUrl(std::wstring aUrl)
{
  size_t pos = aUrl.find_first_of(L'#');
  if (pos != std::wstring::npos) {
    aUrl.erase(pos);
  }
  return aUrl;
}

inline std::wstring stripTrailingSlash(std::wstring aUrl)
{
  size_t idx = aUrl.size();
  while (idx-1 && aUrl[idx-1] == L'/') {
    --idx;
  }

  if (idx < aUrl.size()) {
    aUrl.erase(idx);
  }
  return aUrl;
}


inline int getWindowZOrder(HWND hWnd)
{
    int z = 0;
    for (HWND h = hWnd; h != NULL; h = ::GetWindow(h, GW_HWNDPREV)) {
      ++z;
    }
    return z;
}

struct ZOrderComparator
{
  bool operator()(HWND aFirst, HWND aSecond) const
  {
    return getWindowZOrder(aFirst) < getWindowZOrder(aSecond);
  }
};

//----------------------------------------------------------------------------
//
inline HWND findParentWindowByClass(HWND aWindow, std::wstring aClassName)
{
  wchar_t className[256];
  while (aWindow) {
    if (!GetClassName(aWindow, className, 256)) {
      return NULL;
    }
    if (aClassName == className) {
      return aWindow;
    }
    aWindow = GetParent(aWindow);
  }
  return NULL;
}

namespace Ancho {
namespace Utils {

inline std::wstring getLastError(HRESULT hr)
{
    LPWSTR lpMsgBuf;
    DWORD ret;
    std::wstring def(L"(UNNKOWN)");
    ret = FormatMessage(
        FORMAT_MESSAGE_ALLOCATE_BUFFER |
        FORMAT_MESSAGE_FROM_HMODULE,
        GetModuleHandle(TEXT("imapi2.dll")),
        hr,
        0,
        (LPWSTR) &lpMsgBuf,
        0, NULL );

    if(ret)
    {
        std::wstring last(lpMsgBuf);
        LocalFree(lpMsgBuf);
        return last;
    }
    return def;
}

/**
 * Thread safe generator of unique sequential IDs.
 * \tparam TId must be integral type
 **/
template<typename TId = int>
class IdGenerator
{
public:
  IdGenerator(TId aInitValue = 1): mNextValue(aInitValue)
  { /*empty*/ }

  TId next()
  {
    return mNextValue.fetch_add(1, boost::memory_order_relaxed);
  }
protected:
  boost::atomic<TId> mNextValue;
};

} //namespace Utils
} //namespace Ancho


#define EPOCH_DIFF 0x019DB1DED53E8000LL /* 116444736000000000 nsecs */
#define RATE_DIFF 10000000 /* 100 nsecs */

typedef INT64 filetime_t;

/* Convert a UNIX time_t into a Windows filetime_t */
inline filetime_t unixTimeToFileTime(time_t utime) {
        INT64 tconv = ((INT64)utime * RATE_DIFF) + EPOCH_DIFF;
        return tconv;
}

/* Convert a Windows filetime_t into a UNIX time_t */
inline time_t fileTimeToUnixTime(filetime_t ftime) {
        INT64 tconv = (ftime - EPOCH_DIFF) / RATE_DIFF;
        return (time_t)tconv;
}