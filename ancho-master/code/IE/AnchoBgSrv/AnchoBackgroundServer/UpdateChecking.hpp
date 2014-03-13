#pragma once

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>

#include <vector>
#include <algorithm>

#include <utility>
using namespace std::rel_ops; //importing relational operator overloads


#ifdef min
# undef min
#endif //min

namespace Ancho {
namespace Service {

struct UpdateInfo
{
  std::wstring product;
  std::wstring version;
  std::wstring downloadUrl;
};

class VersionInfo
{
public:
  VersionInfo(std::wstring aVersion)
  {
    std::vector<std::wstring> strs;
    boost::split(strs, aVersion, boost::is_any_of(L"."));

    size_t i = 0;
    for ( ; i < std::min(strs.size(), (size_t)4); ++i) {
      mVersion[i] = boost::lexical_cast<int>(strs[i]);
    }

    for ( ; i < 4; ++i) {
      mVersion[i] = 0;
    }
  }

  VersionInfo(int aMajor = 0, int aMinor = 0, int aRelease = 0, int aBuild = 0)
  {
      mVersion[0] = aMajor;
      mVersion[1] = aMinor;
      mVersion[2] = aRelease;
      mVersion[3] = aBuild;
  }

  int mVersion[4];
};

inline bool operator<(const VersionInfo &aArg1, const VersionInfo &aArg2)
{
  bool same = true;
  for (size_t i = 0; same && i < 4; ++i) {
    if (aArg1.mVersion[i] < aArg2.mVersion[i]) {
      return true;
    }
    same = aArg1.mVersion[i] == aArg2.mVersion[i];
  }
  return false;
}

inline bool operator==(const VersionInfo &aArg1, const VersionInfo &aArg2)
{
  for (size_t i = 0; i < 4; ++i) {
    if (aArg1.mVersion[i] != aArg2.mVersion[i]) {
      return false;
    }
  }
  return true;
}

std::wstring getCheckUpdateLinkFromRegistry(std::wstring aRegistryKey);

VersionInfo getVersionInfoFromRegistry(std::wstring aRegistryKey);

std::wstring getUpdateInfoText(std::wstring aUrl);

UpdateInfo parseUpdateInfoText(std::wstring aInfoText);

VersionInfo getCurrentBinaryVersion();

void checkForUpdate(std::wstring aRegistryKey, std::wstring aName);

struct UpdateChecker
{
  UpdateChecker(std::wstring aRegistryKey, std::wstring aName): mRegistryKey(aRegistryKey), mName(aName)
  {}
  void operator()() {
    checkForUpdate(mRegistryKey, mName);
  }

  std::wstring mRegistryKey;
  std::wstring mName;
};

}//namespace Service
}//namespace Ancho

