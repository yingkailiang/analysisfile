#pragma once

#include <boost/thread/future.hpp>
#include <boost/filesystem.hpp>
#include <boost/exception/all.hpp>
#include <stdexcept>

namespace crx {

struct ExtractionError: virtual std::exception, virtual boost::exception {};
typedef boost::error_info<struct tag_crx_path, boost::filesystem::wpath> CrxPathInfo;

void extract(const boost::filesystem::wpath &aCRXFile, const boost::filesystem::wpath &aOutputPath);

std::string getCRXSignature(const boost::filesystem::wpath &aCRXFile);

} //namespace crx
