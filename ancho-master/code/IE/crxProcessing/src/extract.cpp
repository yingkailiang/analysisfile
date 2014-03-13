#include <crxProcessing/extract.hpp>
#include <boost/scope_exit.hpp>
#include <minizip/unzip.h>
#include <minizip/ioapi.h>
#include <boost/scoped_array.hpp>
#include <fstream>
#include <boost/archive/iterators/base64_from_binary.hpp>
#include <boost/archive/iterators/transform_width.hpp>
#include <iterator>

namespace crx {

std::string encodeToBase64(const char *aBuffer, size_t aLength)
{
  using namespace boost::archive::iterators;
  typedef base64_from_binary<transform_width<const char *, 6, 8> > Encoder;

  std::ostringstream os;
  std::copy(
        Encoder(aBuffer),
        Encoder(aBuffer + aLength),
        std::ostream_iterator<char>(os)
    );

  return os.str();
}

namespace detail {

class CRXFile
{
public:
  static CRXFile* create(boost::filesystem::wpath aPath, std::string aMode)
  {
    try {
      return new CRXFile(aPath, aMode);
    } catch (std::exception &) {
      return NULL;
    }
  }

  static int destroy(CRXFile* aFile)
  {
    delete aFile;
    return 0;
  }

public:

  struct Header
  {
    char magic[4];
    uint32_t version;
    uint32_t pubKeyLength;
    uint32_t signatureLength;
  };

  CRXFile(boost::filesystem::wpath aPath, std::string aMode)
  {
    if (fopen_s(&mFile, aPath.string().c_str(), aMode.c_str())) {
      BOOST_THROW_EXCEPTION(ExtractionError() << crx::CrxPathInfo(aPath));
    }
    Header header;
    size_t size = fread(&header, sizeof(Header), 1, mFile);
    assert(size == 1);

    mOffset = sizeof(Header) + header.pubKeyLength + header.signatureLength;

    //TODO - signature checking
    boost::scoped_array<char> pubKey(new char[header.pubKeyLength]);
    boost::scoped_array<char> signature(new char[header.signatureLength]);
    size = fread(pubKey.get(), sizeof(char), header.pubKeyLength, mFile);
    if (size != header.pubKeyLength) {
      BOOST_THROW_EXCEPTION(ExtractionError());
    }
    size = fread(signature.get(), sizeof(char), header.signatureLength, mFile);
    if (size != header.signatureLength) {
      BOOST_THROW_EXCEPTION(ExtractionError());
    }
    mEncodedSignature = encodeToBase64(signature.get(), header.signatureLength);
    fseek(mFile, mOffset, SEEK_SET);
  }

  ~CRXFile()
  {
    if (mFile) {
      fclose(mFile);
    }
  }

  size_t read(unsigned char* aBuff, size_t aSize)
  {
    return fread(aBuff, sizeof(unsigned char), aSize, mFile);
  }

  size_t write(const unsigned char* aBuff, size_t aSize)
  {
    return fwrite(aBuff, sizeof(unsigned char), aSize, mFile);
  }

  size_t zipPosition() const
  {
    return ftell(mFile) - mOffset;
  }

  int zipSeek(long offset, int origin)
  {
    if (origin == SEEK_SET) {
      return fseek(mFile, offset + mOffset, SEEK_SET);
    }

    return fseek(mFile, offset, origin);
  }

  int error()
  {
    return ferror(mFile);
  }

  std::string encodedSignature() const
  {
    return mEncodedSignature;
  }
protected:
  FILE *mFile;
  long mOffset;
  std::string mEncodedSignature;
};


static voidpf ZCALLBACK fopen64_file_func (voidpf opaque, const void* filename, int mode)
{
    CRXFile* file = NULL;
    const char* mode_fopen = NULL;
    if ((mode & ZLIB_FILEFUNC_MODE_READWRITEFILTER)==ZLIB_FILEFUNC_MODE_READ)
        mode_fopen = "rb";
    else
    if (mode & ZLIB_FILEFUNC_MODE_EXISTING)
        mode_fopen = "r+b";
    else
    if (mode & ZLIB_FILEFUNC_MODE_CREATE)
        mode_fopen = "wb";

    if ((filename!=NULL)) {
      file = CRXFile::create((const wchar_t*)filename, mode_fopen);
    }
    return file;
}

static int ZCALLBACK fclose_file_func(voidpf opaque, voidpf stream)
{
    int ret;
    ret = CRXFile::destroy(reinterpret_cast<CRXFile*>(stream));
    return ret;
}

static uLong ZCALLBACK fread_file_func (voidpf opaque, voidpf stream, void* buf, uLong size)
{
    uLong ret;
    ret = reinterpret_cast<CRXFile*>(stream)->read(reinterpret_cast<unsigned char*>(buf), size); //in bytes
    return ret;
}

static uLong ZCALLBACK fwrite_file_func (voidpf opaque, voidpf stream, const void* buf, uLong size)
{
    uLong ret;
    ret = reinterpret_cast<CRXFile*>(stream)->write(reinterpret_cast<const unsigned char*>(buf), size); //in bytes
    return ret;
}

static ZPOS64_T ZCALLBACK ftell64_file_func (voidpf opaque, voidpf stream)
{
    ZPOS64_T ret;
    ret = reinterpret_cast<CRXFile*>(stream)->zipPosition();
    return ret;
}

static long ZCALLBACK fseek64_file_func (voidpf  opaque, voidpf stream, ZPOS64_T offset, int origin)
{
    int fseek_origin=0;
    long ret = 0;
    switch (origin)
    {
    case ZLIB_FILEFUNC_SEEK_CUR :
        fseek_origin = SEEK_CUR;
        break;
    case ZLIB_FILEFUNC_SEEK_END :
        fseek_origin = SEEK_END;
        break;
    case ZLIB_FILEFUNC_SEEK_SET :
        fseek_origin = SEEK_SET;
        break;
    default: return -1;
    }
    ret = reinterpret_cast<CRXFile*>(stream)->zipSeek(static_cast<long>(offset), fseek_origin);
    return ret;
}



static int ZCALLBACK ferror_file_func (voidpf opaque, voidpf stream)
{
    int ret;
    ret = reinterpret_cast<CRXFile*>(stream)->error();
    return ret;
}

//-----------------------------------------------------------------------

} //namespace detail
//-----------------------------------------------------------

void extractCurrentFile(unzFile aFileHandle, const boost::filesystem::wpath &aOutputPath)
{
  char filename_inzip[256];

  unz_file_info64 file_info;
  int err = UNZ_OK;
  err = unzGetCurrentFileInfo64(aFileHandle, &file_info, filename_inzip, sizeof(filename_inzip), NULL, 0, NULL, 0);
  if (err != UNZ_OK){
    BOOST_THROW_EXCEPTION(ExtractionError());
  }
  boost::filesystem::wpath p = (aOutputPath / filename_inzip).make_preferred();
  boost::filesystem::wpath filename = p.filename();
  if (!p.has_filename() || filename == ".") {
    boost::filesystem::create_directory(p);
  } else {
    static const size_t sBufferSize = 1024;
    boost::filesystem::wpath parentPath = p.parent_path();
    if (!boost::filesystem::exists(parentPath)) {
      boost::filesystem::create_directories(p);
    }

    err = unzOpenCurrentFile(aFileHandle);
    if (err != UNZ_OK){
      BOOST_THROW_EXCEPTION(ExtractionError());
    }
    BOOST_SCOPE_EXIT_ALL(=) { unzCloseCurrentFile(aFileHandle); };
    boost::scoped_array<char> buffer(new char[sBufferSize]);

    std::ofstream outputStream(p.string().c_str(), std::ofstream::out | std::ofstream::binary);
    //Enable exceptions for stream errors
    outputStream.exceptions(std::ofstream::failbit | std::ofstream::badbit);
    int bytes = 0;
    do {
      bytes = unzReadCurrentFile(aFileHandle, buffer.get(), sBufferSize);

      if (bytes > 0) {
        outputStream.write(buffer.get(), bytes);
      }
    } while (bytes > 0);
    if (bytes < 0) {
      BOOST_THROW_EXCEPTION(ExtractionError());
    }
    outputStream.flush();
  }
}


void extract(const boost::filesystem::wpath &aCRXFilePath, const boost::filesystem::wpath &aOutputPath)
{
  unzFile crxFileHandle = NULL;

  zlib_filefunc64_def helperFunctions;

  helperFunctions.zopen64_file = detail::fopen64_file_func;
  helperFunctions.zread_file = detail::fread_file_func;
  helperFunctions.zwrite_file = detail::fwrite_file_func;
  helperFunctions.ztell64_file = detail::ftell64_file_func;
  helperFunctions.zseek64_file = detail::fseek64_file_func;
  helperFunctions.zclose_file = detail::fclose_file_func;
  helperFunctions.zerror_file = detail::ferror_file_func;
  helperFunctions.opaque = NULL;


  crxFileHandle = unzOpen2_64(aCRXFilePath.wstring().c_str(), &helperFunctions);

  if (!crxFileHandle) {
    BOOST_THROW_EXCEPTION(ExtractionError());
  }

  BOOST_SCOPE_EXIT_ALL(=) {
    if (UNZ_OK != unzClose(crxFileHandle)) {
      BOOST_THROW_EXCEPTION(ExtractionError());
    }
  };
  int err = UNZ_OK;
  unz_global_info64 globalInfo;
  err = unzGetGlobalInfo64(crxFileHandle, &globalInfo);
  if (err != UNZ_OK){
    BOOST_THROW_EXCEPTION(ExtractionError());
  }

  for (int i = 0; i < globalInfo.number_entry; ++i) {
      extractCurrentFile(crxFileHandle, aOutputPath);

      if ((i+1) < globalInfo.number_entry) {
          err = unzGoToNextFile(crxFileHandle);
          if (err != UNZ_OK) {
            BOOST_THROW_EXCEPTION(ExtractionError());
          }
      }
  }

}

std::string getCRXSignature(const boost::filesystem::wpath &aCRXFile)
{
  detail::CRXFile file(aCRXFile, "rb");

  return file.encodedSignature();
}

} //namespace crx
