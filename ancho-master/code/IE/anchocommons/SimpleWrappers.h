#pragma once

#include <map>
#include <sstream>
#include <algorithm>
#include <iterator>
#include <Exceptions.h>

class SimpleJSObject;
typedef CComObject<SimpleJSObject>  ComSimpleJSObject;
class SimpleJSArray;
typedef CComObject<SimpleJSArray>  ComSimpleJSArray;

//------------------------------------------------------------
// Simple std::map wrapper
// TODO - extend and move to more suitable place (some utility library)
class ATL_NO_VTABLE SimpleJSObject :
  public CComObjectRootEx<CComSingleThreadModel>,
  public IDispatchEx
{
public:

  static CComPtr<ComSimpleJSObject> createInstance()
  {
    ComSimpleJSObject * newObject = NULL;
    IF_FAILED_THROW(ComSimpleJSObject::CreateInstance(&newObject));
    return CComPtr<ComSimpleJSObject>(newObject);  // to have a refcount of 1
  }
  static HRESULT createInstance(CComPtr<ComSimpleJSObject> & aRet)
  {
    BEGIN_TRY_BLOCK;
    aRet = SimpleJSObject::createInstance();
    return S_OK;
    END_TRY_BLOCK_CATCH_TO_HRESULT;
  }

  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(SimpleJSObject)
    COM_INTERFACE_ENTRY(IDispatch)
    COM_INTERFACE_ENTRY(IDispatchEx)
  END_COM_MAP()

  // -------------------------------------------------------------------------
  // IDispatch methods
  STDMETHOD(GetTypeInfoCount)(UINT *pctinfo)
  {
    ENSURE_RETVAL(pctinfo);
    *pctinfo = 0;
    return S_OK;
  }

  STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
  {
    return E_INVALIDARG;
  }

  STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR *rgszNames, UINT cNames,
                                         LCID lcid, DISPID *rgDispId)
  {
    ATLASSERT(rgszNames != NULL);
    ENSURE_RETVAL(rgDispId);
    HRESULT hr = S_OK;
    for (size_t i = 0; i < cNames; ++i) {
      hr = GetDispID(rgszNames[i], fdexNameCaseSensitive, &(rgDispId[i]));
    }
    return hr;
  }

  STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags,
                                  DISPPARAMS *pDispParams, VARIANT *pVarResult,
                                  EXCEPINFO *pExcepInfo, UINT *puArgErr)
  {
    return InvokeEx(dispIdMember, lcid, wFlags, pDispParams, pVarResult, pExcepInfo, NULL);
  }
    // -------------------------------------------------------------------------
  // IDispatchEx methods
  STDMETHOD(GetDispID)(BSTR bstrName, DWORD grfdex, DISPID *pid)
  {
    ENSURE_RETVAL(pid);
    HRESULT hr = S_OK;
    *pid = getDispId(std::wstring(bstrName));
    if (*pid == DISPID_UNKNOWN && (grfdex & fdexNameEnsure) ) {
      *pid = (DISPID)mProperties.size() + 1;
      mNameToID[std::wstring(bstrName)] = *pid - 1;
      mProperties.push_back(CComVariant());
    }
    return *pid == DISPID_UNKNOWN ? DISP_E_UNKNOWNNAME : S_OK;
  }

  STDMETHOD(InvokeEx)(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp,
                      VARIANT *pvarRes, EXCEPINFO *pei,
                      IServiceProvider *pspCaller)
  {
    if (id > (int)mProperties.size() || id == 0) {
      if (pvarRes) {
        VariantClear(pvarRes);
      }
      return DISP_E_MEMBERNOTFOUND;
    }

    if (wFlags & DISPATCH_PROPERTYGET) {
      ENSURE_RETVAL(pvarRes);
      return VariantCopy(pvarRes, &(mProperties[id-1]));
    }

    if (wFlags & DISPATCH_PROPERTYPUT || wFlags & DISPATCH_PROPERTYPUTREF) {
      if (!pdp || pdp->cArgs == 0 || pdp->cArgs > 1) {
        return E_INVALIDARG;
      }
      ATLASSERT(pdp->rgvarg != NULL);
      mProperties[id-1] = CComVariant(pdp->rgvarg[0]);
      if (pvarRes) {
        VariantClear(pvarRes);
      }
      return S_OK;
    }
      /*if (pExcepInfo) {
        pExcepInfo->bstrDescription
      }*/
    return DISP_E_EXCEPTION;
  }

  STDMETHOD(DeleteMemberByName)(BSTR bstrName,DWORD grfdex)
  {
    DISPID did = getDispId(std::wstring(bstrName));
    return DeleteMemberByDispID(did);
  }

  STDMETHOD(DeleteMemberByDispID)(DISPID id)
  {
    return E_NOTIMPL;
  }
  STDMETHOD(GetMemberProperties)(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex)
  {
    return E_NOTIMPL;
  }

  STDMETHOD(GetMemberName)(DISPID id, BSTR *pbstrName)
  {
    return E_NOTIMPL;
  }

  STDMETHOD(GetNextDispID)(DWORD grfdex, DISPID id, DISPID *pid)
  {
    ENSURE_RETVAL(pid);
    if (id == DISPID_STARTENUM) {
      if (mProperties.empty()) {
        return S_FALSE;
      }
      *pid = 1;
      return S_OK;
    }
    if (*pid == mNameToID.size()-1) {
      return S_FALSE;
    }
    *pid += 1;
    return S_OK;
  }

  STDMETHOD(GetNameSpaceParent)(IUnknown **ppunk)
  {
    return E_NOTIMPL;
  }

  HRESULT setProperty(const std::wstring &aName, CComVariant &aValue)
  {
    MapDISPID::iterator it = mNameToID.find(aName);
    if (it != mNameToID.end()) {
      mProperties[it->second] = aValue;
    } else {
      mNameToID[aName] = (DISPID)mProperties.size();
      mProperties.push_back(aValue);
    }
    return S_OK;
  }

  DISPID getDispId(const std::wstring &aName)
  {
    MapDISPID::const_iterator it = mNameToID.find(aName);
    if (it != mNameToID.end()) {
      return it->second+1;
    }
    return DISPID_UNKNOWN;
  }
protected:
  SimpleJSObject() {}

  typedef std::map<std::wstring, DISPID> MapDISPID;

  VariantVector mProperties;
  MapDISPID mNameToID;
};

//------------------------------------------------------------
// Simple std::vector wrapper
// TODO - extend and move to more suitable place (some utility library)
class ATL_NO_VTABLE SimpleJSArray :
  public CComObjectRootEx<CComSingleThreadModel>,
  public IDispatch,
  public VariantVector
{
public:

  enum {LENGTH_DISPID = 1,
    PUSH_DISPID = 2,
    INDEX_START = 3
  };

  static CComPtr<ComSimpleJSArray> createInstance()
  {
    ComSimpleJSArray * newObject = NULL;
    IF_FAILED_THROW(ComSimpleJSArray::CreateInstance(&newObject));
    return CComPtr<ComSimpleJSArray>(newObject);  // to have a refcount of 1
  }
  static HRESULT createInstance(CComPtr<ComSimpleJSArray> & aRet)
  {
    BEGIN_TRY_BLOCK;
    aRet = SimpleJSArray::createInstance();
    return S_OK;
    END_TRY_BLOCK_CATCH_TO_HRESULT;
  }

  static HRESULT createInstance(const VariantVector &aVector, CComPtr<ComSimpleJSArray> & aRet)
  {
    BEGIN_TRY_BLOCK;
    aRet = SimpleJSArray::createInstance();
    std::copy(aVector.begin(), aVector.end(), aRet->begin());
    return S_OK;
    END_TRY_BLOCK_CATCH_TO_HRESULT;
  }

  // -------------------------------------------------------------------------
  // COM interface map
  BEGIN_COM_MAP(SimpleJSArray)
    COM_INTERFACE_ENTRY(IDispatch)
  END_COM_MAP()

  // -------------------------------------------------------------------------
  // IDispatch methods
  STDMETHOD(GetTypeInfoCount)(UINT *pctinfo)
  {
    ENSURE_RETVAL(pctinfo);
    *pctinfo = 0;
    return S_OK;
  }

  STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
  {
    return E_INVALIDARG;
  }

  STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR *rgszNames, UINT cNames,
                                         LCID lcid, DISPID *rgDispId)
  {
    ATLASSERT(rgszNames != NULL);
    ENSURE_RETVAL(rgDispId);
    HRESULT hr = S_OK;
    for (size_t i = 0; i < cNames; ++i) {
      if (std::wstring(L"length") == rgszNames[i]) {
        rgDispId[i] = LENGTH_DISPID;
        continue;
      }
      if (std::wstring(L"push") == rgszNames[i]) {
        rgDispId[i] = PUSH_DISPID;
        continue;
      }
      std::wstring name(rgszNames[i]);
      std::wistringstream iss (name, std::istringstream::in);
      long int idx = -1;
      iss >> idx;
      if (idx >= 0) {
        rgDispId[i] = idx + INDEX_START;
        continue;
      }
      hr = DISP_E_UNKNOWNNAME;
      rgDispId[i] = DISPID_UNKNOWN;
    }
    return hr;
  }

  STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags,
                                  DISPPARAMS *pDispParams, VARIANT *pVarResult,
                                  EXCEPINFO *pExcepInfo, UINT *puArgErr)
  {
    ENSURE_RETVAL(pVarResult);
    if (dispIdMember >= ((int)this->size() + INDEX_START)
      || dispIdMember <= 0)
    {
      VariantClear(pVarResult);
      return DISP_E_MEMBERNOTFOUND;
    }
    if (dispIdMember == LENGTH_DISPID) {
      CComVariant length(static_cast<int>(this->size()));
      return length.Detach(pVarResult);
    }
    if (wFlags == DISPATCH_METHOD) {
      for (size_t i = 0; i < pDispParams->cArgs; ++i) {
        push_back(CComVariant(pDispParams->rgvarg[i]));
      }
      if (pVarResult) {
        CComVariant res = size();
        IF_FAILED_RET(res.Detach(pVarResult));
      }
      return S_OK;
    }
    //read-only
    if (wFlags != DISPATCH_PROPERTYGET) {
      /*if (pExcepInfo) { //TODO
        pExcepInfo->bstrDescription
      }*/
      return DISP_E_EXCEPTION;
    }
    return VariantCopy(pVarResult, &(this->at(dispIdMember-INDEX_START)));
  }

protected:
  SimpleJSArray() {}
};

