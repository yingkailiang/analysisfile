#include "stdafx.h"
#include "AnchoBackgroundServer/UpdateChecking.hpp"
#include <AnchoCommons/COMConversions.hpp>
#include "AnchoBackgroundServer/TabManager.hpp"
#include "AnchoBackgroundServer/WindowManager.hpp"

#import "msxml6.dll"
#pragma comment(lib, "Version.lib")

#include <Exceptions.h>
#include <AnchoCommons/JSValueWrapper.hpp>
#include <SimpleWrappers.h>

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>

#ifdef min
# undef min
#endif //min

namespace Ancho {
namespace Service {

std::wstring getCheckUpdateLinkFromRegistry(std::wstring aRegistryKey)
{
  CRegKey regKey;
  LONG res = regKey.Open(HKEY_CURRENT_USER, aRegistryKey.c_str(), KEY_READ);
  if (ERROR_SUCCESS != res) {
    ANCHO_THROW(EHResult(HRESULT_FROM_WIN32(res)));
  }
  ULONG nChars = _MAX_PATH;
  CString tmp;
  LPTSTR pst = tmp.GetBuffer(nChars+1);
  res = regKey.QueryStringValue(s_AnchoUpdateUrlRegistryEntry, pst, &nChars);
  pst[nChars] = 0;
  tmp.ReleaseBuffer();
  if (ERROR_SUCCESS != res) {
    ANCHO_THROW(EHResult(HRESULT_FROM_WIN32(res)));
  }
  return std::wstring(tmp);
}
// -------------------------------------------------------------------------
VersionInfo getVersionInfoFromRegistry(std::wstring aRegistryKey)
{
  CRegKey regKey;
  LONG res = regKey.Open(HKEY_CURRENT_USER, aRegistryKey.c_str(), KEY_READ);
  if (ERROR_SUCCESS != res) {
    ANCHO_THROW(EHResult(HRESULT_FROM_WIN32(res)));
  }
  ULONG nChars = 20;
  CString tmp;
  LPTSTR pst = tmp.GetBuffer(nChars+1);
  res = regKey.QueryStringValue(s_AnchoRegistryEntryVersion, pst, &nChars);
  pst[nChars] = 0;
  tmp.ReleaseBuffer();
  if (ERROR_SUCCESS != res) {
    ANCHO_THROW(EHResult(HRESULT_FROM_WIN32(res)));
  }
  return VersionInfo(std::wstring(tmp));
}
// -------------------------------------------------------------------------
std::wstring getUpdateInfoText(std::wstring aUrl)
{
  MSXML2::IXMLHTTPRequestPtr xmlHttpRequest = NULL;
  _bstr_t text;

  IF_FAILED_THROW(xmlHttpRequest.CreateInstance("Msxml2.XMLHTTP.6.0"));


  IF_FAILED_THROW(xmlHttpRequest->open("GET", aUrl.c_str(), false));

  IF_FAILED_THROW(xmlHttpRequest->send());

  return std::wstring((wchar_t*)xmlHttpRequest->responseText);
}
// -------------------------------------------------------------------------
UpdateInfo parseUpdateInfoText(std::wstring aInfoText)
{
  UpdateInfo info;

  std::wistringstream inputStream(aInfoText);
  boost::property_tree::wptree infoTree;
  boost::property_tree::json_parser::read_json(inputStream, infoTree);

  info.product = infoTree.get(L"product", L"");
  info.version = infoTree.get<std::wstring>(L"version");
  info.downloadUrl = infoTree.get<std::wstring>(L"downloadUrl");
  return info;
}
// -------------------------------------------------------------------------
VersionInfo getCurrentBinaryVersion()
{
  WCHAR fileName[_MAX_PATH];
  DWORD size = GetModuleFileName(NULL, fileName, _MAX_PATH);
  fileName[size] = 0;
  DWORD handle = 0;
  size = GetFileVersionInfoSize(fileName, &handle);
  boost::scoped_array<BYTE> versionInfo(new BYTE[size]);
  if (!GetFileVersionInfo(fileName, handle, size, versionInfo.get())) {
      ANCHO_THROW(EFail());
  }
  // we have version information
  UINT    			len = 0;
  VS_FIXEDFILEINFO*   vsfi = NULL;
  VerQueryValue(versionInfo.get(), L"\\", (void**)&vsfi, &len);

  return VersionInfo(
                HIWORD(vsfi->dwProductVersionMS),
                LOWORD(vsfi->dwProductVersionMS),
                HIWORD(vsfi->dwProductVersionLS),
                LOWORD(vsfi->dwProductVersionLS));
}

// -------------------------------------------------------------------------
void checkForUpdate(std::wstring aRegistryKey, std::wstring aName)
{
  std::wstring updateUrl = getCheckUpdateLinkFromRegistry(aRegistryKey);
  Ancho::Service::VersionInfo currentVersion = getVersionInfoFromRegistry(aRegistryKey);

  std::wstring updateInfoText = Ancho::Service::getUpdateInfoText(updateUrl);
  Ancho::Service::UpdateInfo info = Ancho::Service::parseUpdateInfoText(updateInfoText);

  Ancho::Service::VersionInfo availableVersion(info.version);

  if (currentVersion < availableVersion) {
    int result = ::MessageBox(NULL,
                              //Ancho::Service::WindowManager::instance().getCurrentWindowHWND(), //this blocks IE page loading :-(
                              boost::str(boost::wformat(L"New version of %1% was found. Do you want to go to the download page?") % aName).c_str(),
                              L"New version detected",
                              MB_ICONQUESTION | MB_YESNO | MB_TOPMOST | MB_SYSTEMMODAL);
    if (result == IDYES) {
      Ancho::Utils::JSObject properties;
      properties[L"url"] = info.downloadUrl;
      Ancho::Service::TabManager::instance().createTab(properties);
    }
  }
}
// -------------------------------------------------------------------------
}//namespace Service
}//namespace Ancho

