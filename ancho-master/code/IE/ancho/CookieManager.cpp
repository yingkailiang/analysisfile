#include "stdafx.h"
#include "CookieManager.h"
#include <boost/scope_exit.hpp>

#pragma comment(lib, "Wininet.lib")

namespace Ancho {

struct GetCookieFunctor
{
  GetCookieFunctor(Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr aAnchoService, const Utils::JSObject &aDetails, const CookieCallback& aCallback, const std::wstring &aExtensionId, int aApiId)
    : mAnchoService(aAnchoService), mDetails(aDetails), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    std::wstring url = boost::get<std::wstring>(mDetails[L"url"]);
    std::wstring name = boost::get<std::wstring>(mDetails[L"name"]);
    CComPtr<IDispatch> cookieDataPtr;

    DWORD size = 0;
    if (InternetGetCookie(url.c_str(), name.c_str(), NULL, &size)){
      //Size was returned in bytes not in number of characters.
      boost::scoped_array<wchar_t> buffer(new wchar_t[size/sizeof(wchar_t) + 1]);
      if (!InternetGetCookie(url.c_str(), name.c_str(), buffer.get(), &size)){
        HRESULT hr = HRESULT_FROM_WIN32(GetLastError());
        ANCHO_THROW(EHResult(hr));
      }

      IF_FAILED_THROW(mAnchoService->get()->createJSObject(_bstr_t(mExtensionId.c_str()), mApiId, &cookieDataPtr));
      Utils::JSObjectWrapper cookieData =  Utils::JSValueWrapper(cookieDataPtr).toObject();

      //Now the size was returned in number of characters !!
      buffer[size] = 0;
      std::wstring tmp(buffer.get());
      size_t idx = tmp.find(L'=');
      std::wstring n(tmp, 0, idx);
      std::wstring v(tmp, idx+1);
      cookieData[L"name"] = name;
      cookieData[L"url"] = url;
      cookieData[L"value"] = v;
    }
    mCallback(cookieDataPtr);
  }
  Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr mAnchoService;
  Utils::JSObject mDetails;
  CookieCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};

struct SetCookieFunctor
{
  SetCookieFunctor(Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr aAnchoService, const Utils::JSObject &aDetails, const CookieCallback& aCallback, const std::wstring &aExtensionId, int aApiId)
    : mAnchoService(aAnchoService), mDetails(aDetails), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    std::wstring url = boost::get<std::wstring>(mDetails[L"url"]);
    std::wstring name = boost::get<std::wstring>(mDetails[L"name"]);
    std::wstring value;

    std::wostringstream ss;

    if (mDetails[L"value"].which() == Utils::jsString) {
      value = boost::get<std::wstring>(mDetails[L"value"]);
      ss << /*name <<"=" << */value;
    }
    ss << L"; ";

    Utils::JSVariant expiration = mDetails[L"expirationDate"];
    if (expiration.which() == Utils::jsInt
      || expiration.which() == Utils::jsDouble)
    {
      using namespace boost::posix_time;
      using namespace boost::gregorian;
      date epoch(1970,Jan,1);
      long s = 0;
      if (expiration.which() == Utils::jsInt) {
        s = static_cast<long>(boost::get<int>(expiration));
      } else {
        s = static_cast<long>(boost::get<double>(expiration));
      }
      ptime t(epoch,  seconds(s));

      std::wostringstream dataStream;
      wtime_facet* outputFacet = new wtime_facet();
      outputFacet->format(L"%a, %d-%b-%Y %H:%M:%S GMT");
      dataStream.imbue(std::locale(std::locale::classic(), outputFacet)); //locale gets ownership of outputFacet
      dataStream << t;
      ss << dataStream.str() << L"; ";
    }

    std::wstring data = ss.str();
    if (InternetSetCookie(url.c_str(), name.c_str(), data.c_str())) {
      HRESULT hr = HRESULT_FROM_WIN32(GetLastError());
      ANCHO_THROW(EHResult(hr));
    }

    CComPtr<IDispatch> cookieDataPtr;
    IF_FAILED_THROW(mAnchoService->get()->createJSObject(_bstr_t(mExtensionId.c_str()), mApiId, &cookieDataPtr));
    Utils::JSObjectWrapper cookieData =  Utils::JSValueWrapper(cookieDataPtr).toObject();
    cookieData[L"name"] = name;
    cookieData[L"url"] = url;
    cookieData[L"value"] = value;
    mCallback(cookieDataPtr);
  }
  Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr mAnchoService;
  Utils::JSObject mDetails;
  CookieCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};


STDMETHODIMP CookieManager::removeCookie(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aDetails);
  if (!tmp) {
    return E_FAIL;
  }

  Ancho::Utils::JSVariant details = Utils::convertToJSVariant(*tmp);
  Ancho::Utils::JavaScriptCallback<CookieInfo, void> callback(aCallback);

  removeCookie(boost::get<Utils::JSObject>(details), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void CookieManager::removeCookie(Utils::JSObject aDetails,
                 const CookieCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  aDetails[L"expirationDate"] = 0;
  mAsyncTaskManager.addTask(SetCookieFunctor(mAnchoServiceMarshaller, aDetails, aCallback, aExtensionId, aApiId));
}

STDMETHODIMP CookieManager::setCookie(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aDetails);
  if (!tmp) {
    return E_FAIL;
  }

  Ancho::Utils::JSVariant details = Utils::convertToJSVariant(*tmp);
  Ancho::Utils::JavaScriptCallback<CookieInfo, void> callback(aCallback);

  setCookie(boost::get<Utils::JSObject>(details), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void CookieManager::setCookie(const Utils::JSObject &aDetails,
                 const CookieCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(SetCookieFunctor(mAnchoServiceMarshaller, aDetails, aCallback, aExtensionId, aApiId));
}

STDMETHODIMP CookieManager::getCookie(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aDetails);
  if (!tmp) {
    return E_FAIL;
  }

  Ancho::Utils::JSVariant details = Utils::convertToJSVariant(*tmp);
  Ancho::Utils::JavaScriptCallback<CookieInfo, void> callback(aCallback);

  getCookie(boost::get<Utils::JSObject>(details), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void CookieManager::getCookie(const Utils::JSObject &aDetails,
                 const CookieCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(GetCookieFunctor(mAnchoServiceMarshaller, aDetails, aCallback, aExtensionId, aApiId));
}

struct GetAllCookiesFunctor
{
  GetAllCookiesFunctor(Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr aAnchoService, const Utils::JSObject &aDetails, const CookieCallback& aCallback, const std::wstring &aExtensionId, int aApiId)
    : mAnchoService(aAnchoService), mDetails(aDetails), mCallback(aCallback), mExtensionId(aExtensionId), mApiId(aApiId)
  { /*empty*/ }

  void operator()()
  {
    CComPtr<IDispatch> cookiesDisp;

    DWORD dwEntrySize;
    std::wstring filter = L"cookie:";
    static const DWORD MAX_CACHE_ENTRY_INFO_SIZE = 4096;
    boost::scoped_array<char> buffer(new char[MAX_CACHE_ENTRY_INFO_SIZE]);
    LPINTERNET_CACHE_ENTRY_INFO entry = reinterpret_cast<LPINTERNET_CACHE_ENTRY_INFO>(buffer.get());
    dwEntrySize = MAX_CACHE_ENTRY_INFO_SIZE;

    HANDLE hCacheDir = FindFirstUrlCacheEntry(filter.c_str(), entry, &dwEntrySize);
    if (hCacheDir) {
      BOOST_SCOPE_EXIT_ALL(&) { FindCloseUrlCache(hCacheDir); };

      IF_FAILED_THROW(mAnchoService->get()->createJSArray(_bstr_t(mExtensionId.c_str()), mApiId, &cookiesDisp));
      Utils::JSArrayWrapper cookies = Utils::JSValueWrapper(cookiesDisp).toArray();
      do {
        try {
          readCookieFile(entry->lpszSourceUrlName, cookies);
        } catch (std::exception &) {
          ATLTRACE(L"readCookieFile failed for %s\n", entry->lpszSourceUrlName);
        }
        dwEntrySize = MAX_CACHE_ENTRY_INFO_SIZE;
      } while (FindNextUrlCacheEntry(hCacheDir, entry, &dwEntrySize));
    } else {
      HRESULT hr = HRESULT_FROM_WIN32(GetLastError());
      ANCHO_THROW(EHResult(hr));
    }

    mCallback(cookiesDisp);
  }

  void readCookieFile(const std::wstring &url, Utils::JSArrayWrapper &cookies) {
    static const DWORD MAX_CACHE_ENTRY_INFO_SIZE = 10 * 4096;
    DWORD entrySize = MAX_CACHE_ENTRY_INFO_SIZE;
    boost::scoped_array<char> buffer(new char[MAX_CACHE_ENTRY_INFO_SIZE]);
    LPINTERNET_CACHE_ENTRY_INFO info = reinterpret_cast<LPINTERNET_CACHE_ENTRY_INFO>(buffer.get());

    HANDLE streamHandle;
    streamHandle = RetrieveUrlCacheEntryStream(url.c_str(), info, &entrySize, false, 0);
    if (streamHandle == NULL) {
      HRESULT hr = HRESULT_FROM_WIN32(GetLastError());
      ATLTRACE(_T("Cannot open cache entry stream. Error: %d; url: %ws\n"), hr, url);
      ANCHO_THROW(EHResult(hr));
    } else {
      BOOST_SCOPE_EXIT_ALL(&) { UnlockUrlCacheEntryStream(streamHandle, 0); };
      DWORD dwStreamSize = info->dwSizeLow;
      boost::scoped_array<char> data(new char[dwStreamSize+1]);

      if (!ReadUrlCacheEntryStream(streamHandle, 0, data.get(), &dwStreamSize, 0)) {
        HRESULT hr = HRESULT_FROM_WIN32(GetLastError());
        ATLTRACE(_T("Cannot read cache entry stream. Error: %d\n"), hr);
      } else {
        data[dwStreamSize] = '\0';
        std::vector<std::string> strs;
        boost::split(strs, std::string(data.get()), boost::is_any_of("\n\r"));
        if (strs.size() < 6) {
          ATLTRACE(L"MALFORMED COOKIE STRING\n");
          return;
        }
        /*name;
        value;
        hostPath;
        flags;
        expTimeLow;
        expTimeHigh;
        creationTimeLow;
        creationTimeHigh;*/

        CComPtr<IDispatch> cookieDataPtr;
        IF_FAILED_THROW(mAnchoService->get()->createJSObject(_bstr_t(mExtensionId.c_str()), mApiId, &cookieDataPtr));
        Utils::JSObjectWrapper cookieData =  Utils::JSValueWrapper(cookieDataPtr).toObject();
        cookieData[L"name"] = std::wstring(strs[0].begin(), strs[0].end());
        cookieData[L"value"] = std::wstring(strs[1].begin(), strs[1].end());
        cookieData[L"url"] = std::wstring(strs[2].begin(), strs[2].end());;

        FILETIME expiration;
        try {
          expiration.dwLowDateTime = boost::lexical_cast<DWORD>(strs[4]);
          expiration.dwHighDateTime = boost::lexical_cast<DWORD>(strs[5]);
          cookieData[L"expirationDate"] = static_cast<double>(fileTimeToUnixTime(*reinterpret_cast<filetime_t*>(&expiration)));
        } catch (boost::bad_lexical_cast &) {
          ATLTRACE(L"FAILED to get expiration date for cookie %s\n", url.c_str());
        }
        cookies.push_back(cookieData);
      }
    }
  }

  Ancho::Utils::ObjectMarshaller<IAnchoServiceApi>::Ptr mAnchoService;
  Utils::JSObject mDetails;
  CookieCallback mCallback;
  std::wstring mExtensionId;
  int mApiId;
};


STDMETHODIMP CookieManager::getAllCookies(LPDISPATCH aDetails, LPDISPATCH aCallback, BSTR aExtensionId, INT aApiId)
{
  BEGIN_TRY_BLOCK;
  if (aExtensionId == NULL) {
    return E_INVALIDARG;
  }
  CComQIPtr<IDispatchEx> tmp(aDetails);
  if (!tmp) {
    return E_FAIL;
  }

  Ancho::Utils::JSVariant details = Utils::convertToJSVariant(*tmp);
  Ancho::Utils::JavaScriptCallback<CookieList, void> callback(aCallback);

  getAllCookies(boost::get<Utils::JSObject>(details), callback, std::wstring(aExtensionId), aApiId);
  END_TRY_BLOCK_CATCH_TO_HRESULT;
  return S_OK;
}

void CookieManager::getAllCookies(const Utils::JSObject &aDetails,
                 const CookieListCallback& aCallback,
                 const std::wstring &aExtensionId,
                 int aApiId)
{
  mAsyncTaskManager.addTask(GetAllCookiesFunctor(mAnchoServiceMarshaller, aDetails, aCallback, aExtensionId, aApiId));
}

} //namespace Ancho