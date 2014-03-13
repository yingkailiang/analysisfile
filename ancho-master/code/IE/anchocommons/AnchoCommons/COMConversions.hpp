#pragma once

#include <map>
#include <vector>
#include <boost/variant.hpp>
#include <AnchoCommons/JSValueWrapper.hpp>

namespace Ancho {
namespace Utils {

/**
 * Hides marshalling of COM interfaces between threads.
 */
template <typename TInterface>
class ObjectMarshaller: public boost::noncopyable
{
public:
  typedef boost::shared_ptr<ObjectMarshaller<TInterface> > Ptr;

  ObjectMarshaller(): mCookie(0)
  { /*empty*/ }

  ObjectMarshaller(CComPtr<TInterface> aPtr): mCookie(0)
  {
    if(!aPtr) {
      return;
    }
    //IF_FAILED_THROW(CoMarshalInterThreadInterfaceInStream(__uuidof(TInterface), aPtr.p, &mStream));

    IF_FAILED_THROW(::CoCreateInstance(CLSID_StdGlobalInterfaceTable, NULL, CLSCTX_INPROC_SERVER, IID_IGlobalInterfaceTable, (void **)&mIGlobalInterfaceTable));
    if (mIGlobalInterfaceTable) {
      CComPtr<IUnknown> pIUnknown = aPtr;
      if (pIUnknown) {
        IF_FAILED_THROW(mIGlobalInterfaceTable->RegisterInterfaceInGlobal(pIUnknown, __uuidof(TInterface), &mCookie));
      } else {
        ANCHO_THROW(EFail());
      }
    } else {
      ANCHO_THROW(EFail());
    }
  }

  ~ObjectMarshaller()
  {
    if (mCookie && mIGlobalInterfaceTable) {
      mIGlobalInterfaceTable->RevokeInterfaceFromGlobal(mCookie);
      mCookie = 0;
    }
  }

  /**
   * Can be called multiple times - unmarshalled from global table.
   **/
  CComPtr<TInterface> get()
  {
    if (mCookie == 0) {
      ANCHO_THROW(EFail());
    }
    CComPtr<TInterface> ptr;
    IF_FAILED_THROW(mIGlobalInterfaceTable->GetInterfaceFromGlobal(mCookie, __uuidof(TInterface), (void**)&ptr.p));

    //IF_FAILED_THROW(CoUnmarshalInterface(mStream, __uuidof(TInterface), (LPVOID *) &ptr));
    return ptr;
  }

  bool empty() const
  { return mCookie == 0; }
protected:
  CComPtr<IGlobalInterfaceTable> mIGlobalInterfaceTable;
  DWORD mCookie;
  //CComPtr<IStream> mStream;
};

//void is incomplete type, so this is the replacement for void template specialization
struct Empty {};

template<typename TType>
struct SafeVoidTraits
{
  typedef TType type;
};

template<>
struct SafeVoidTraits<void>
{
  typedef Empty type;
};


//* Variant which can contain arbitrary JSONable value (no functions)
typedef boost::make_recursive_variant<
                null_t,
                bool,
                int,
                double,
                std::wstring,
                std::vector<boost::recursive_variant_>,
                std::map<std::wstring, boost::recursive_variant_>
            >::type JSVariant;

enum JSTypeID {
  jsNull   = 0,
  jsBool   = 1,
  jsInt    = 2,
  jsDouble = 3,
  jsString = 4,
  jsArray  = 5,
  jsObject = 6
};


//* Array of JSONable values
typedef std::vector<JSVariant> JSArray;

//* JSONable object
typedef std::map<std::wstring, JSVariant> JSObject;


JSVariant convertToJSVariant(const Ancho::Utils::JSValueWrapperConst &aValue);
JSVariant convertToJSVariant(IDispatchEx &aDispatch);

namespace detail {
//forward declarations
JSObject convert(const Ancho::Utils::JSObjectWrapperConst &aValue);
JSArray convert(const Ancho::Utils::JSArrayWrapperConst &aValue);
JSVariant convert(const Ancho::Utils::JSValueWrapperConst &aValue);

struct ConvertToVariantVisitor
{
  typedef JSVariant result_type;

  template<typename TType>
  result_type operator()(const TType &aValue) const
  { return result_type(aValue); }

  result_type operator()(const Ancho::Utils::JSObjectWrapperConst &aObject) const
  {
    return convert(aObject);
  }

  result_type operator()(const Ancho::Utils::JSArrayWrapperConst &aArray) const
  {
    return convert(aArray);
  }
};

inline JSObject convert(const Ancho::Utils::JSObjectWrapperConst &aValue)
{
  JSObject result;

  Ancho::Utils::JSObjectWrapperConst::NameIterator namesIterator = aValue.memberNames();
  Ancho::Utils::JSObjectWrapperConst::NameIterator namesEnd;
  for (; namesIterator != namesEnd; ++namesIterator) {
    result[*namesIterator] = convertToJSVariant(aValue[*namesIterator]);
  }
  return result;
}

inline JSArray convert(const Ancho::Utils::JSArrayWrapperConst &aValue)
{
  JSArray result;
  size_t len = aValue.length();
  result.reserve(len);
  for (size_t i = 0; i < len; ++i) {
    result.push_back(convertToJSVariant(aValue[i]));
  }
  return result;
}

inline JSVariant convert(const Ancho::Utils::JSValueWrapperConst &aValue)
{
  if (aValue.isObject()) {
    return convert(aValue.toObject());
  }
  if (aValue.isArray()) {
    return convert(aValue.toArray());
  }

  ANCHO_THROW(EInvalidArgument());
  return JSVariant();
}

inline JSVariant convert(IDispatchEx &aDispatch)
{
  Ancho::Utils::JSValueWrapperConst jsvalue((CComVariant(&aDispatch)));//Double parenthese because of the "most vexing parse"
  return convert(jsvalue);
}

} //namespace detail

/** This will convert JavaScript value wrapper into native C++ representation
 **/
inline JSVariant convertToJSVariant(const Ancho::Utils::JSValueWrapperConst &aValue)
{
  return aValue.applyVisitor(detail::ConvertToVariantVisitor());
}

inline JSVariant convertToJSVariant(IDispatchEx &aDispatch)
{
  return detail::convert(aDispatch);
}

namespace detail {
/** Conversion traits implementation - generic version is undefined - compile time error when using conversion without specialization
 **/
template<typename TFrom, typename TTo>
struct ConversionTraits;

/** Specialization for cases when we don't need any conversion
 **/
template<typename TType>
struct ConversionTraits<TType, TType>
{
  static void convert(TType &aFrom, TType &aTo)
  { aTo = aFrom; }
};

template<>
struct ConversionTraits<int, CComVariant>
{
  static void convert(int &aFrom, CComVariant &aTo)
  { aTo = CComVariant(aFrom); }
};

template<>
struct ConversionTraits<std::wstring, CComVariant>
{
  static void convert(std::wstring &aFrom, CComVariant &aTo)
  { aTo = CComVariant(aFrom.c_str()); }
};

template<>
struct ConversionTraits<_bstr_t, CComVariant>
{
  static void convert(_bstr_t &aFrom, CComVariant &aTo)
  { aTo = CComVariant(static_cast<wchar_t*>(aFrom)); }
};

template<>
struct ConversionTraits<bool, CComVariant>
{
  static void convert(bool &aFrom, CComVariant &aTo)
  { aTo = CComVariant(aFrom); }
};

template<typename TInterface>
struct ConversionTraits<CComPtr<TInterface>, CComVariant>
{
  static void convert(CComPtr<TInterface> &aFrom, CComVariant &aTo)
  { aTo = CComVariant(aFrom.p); }
};

template<typename TFrom>
struct ConversionTraits<TFrom, Empty>
{
  //This will ignore the aFrom value
  static void convert(TFrom &aFrom, Empty &aTo)
  { /*empty*/ }
};
//---------------------------------------------------------------------
template<typename TFrom, bool tIsSequence, typename TTo>
struct ConversionTraitsToContainer;

template<typename TFrom>
struct ConversionTraitsToContainer<TFrom, false, std::vector<CComVariant> >
{
  static void convert(TFrom &aFrom, std::vector<CComVariant> &aTo)
  {
    //Single value to vector
    ATLASSERT(aTo.empty());
    CComVariant tmp;
    ConversionTraits<TFrom, CComVariant>::convert(aFrom, tmp);
    aTo.push_back(tmp);
  }
};

template<typename TFrom>
struct ConversionTraitsToContainer<TFrom, true, std::vector<CComVariant> >
{
  struct MemberConvertor
  {
    MemberConvertor(std::vector<CComVariant> &aData): data(aData)
    {}
    mutable std::vector<CComVariant> &data;

    template<typename T>
    void operator()(T& aArg)const
    {
      CComVariant tmp;
      ConversionTraits<T, CComVariant>::convert(aArg, tmp);
      data.push_back(tmp);
    }
  };

  static void convert(TFrom &aFrom, std::vector<CComVariant> &aTo)
  {
    ATLASSERT(aTo.empty());
    fusion::for_each(aFrom, MemberConvertor(aTo));
  }
};

template<typename TFrom>
struct ConversionTraits<TFrom, std::vector<CComVariant> >
  : ConversionTraitsToContainer<TFrom, fusion::traits::is_sequence<TFrom>::value, std::vector<CComVariant> >
{
  /* convert() inherited */
};

} //namespace detail

//Generic conversions between types.
template<typename TFrom, typename TTo >
void convert(TFrom &aFrom, TTo &aTo)
{
  detail::ConversionTraits<TFrom, TTo>::convert(aFrom, aTo);
}

//Generic conversions between types.
template<typename TFrom, typename TTo >
TTo convert(TFrom &aFrom)
{
  TTo tmp;
  convert(aFrom, tmp);
  return tmp;
}

} //namespace Utils
} //namespace Ancho
