#pragma once

#include <stdexcept>
#include <atltrace.h>
#include <comdef.h>
#include <boost/thread.hpp>

//TODO - create proper exception hierarchy
struct EAnchoException : std::exception { };

struct EInvalidPointer: EAnchoException { };
struct ECast: EAnchoException { };
struct ENotAnObject: ECast { };
struct ENotAnArray: ECast { };
struct ENotAString: ECast { };
struct ENotAnInt: ECast { };
struct ENotADouble: ECast { };
struct ENotABool: ECast { };
struct ENotIDispatchEx: ECast { };
struct EFail: EAnchoException { };
struct EInvalidArgument: EFail { };
struct EInvalidId: EInvalidArgument { };

struct EHResult: EAnchoException
{
  EHResult(HRESULT hr): mHResult(hr) {}
  HRESULT mHResult;
};

#define ANCHO_THROW(...) \
  throw __VA_ARGS__


inline HRESULT exceptionToHRESULT()
{
  try {
    throw;
  } catch (boost::thread_interrupted &) {
    ATLTRACE("THREAD INTERRUPTION\n");
    throw;
  } catch (EInvalidPointer&) {
    ATLTRACE("ERROR: Invalid pointer\n");
    return E_POINTER;
  } catch(ECast &) {
    ATLTRACE("ERROR: Wrong cast\n");
    return E_INVALIDARG;
  } catch(EInvalidArgument &) {
    ATLTRACE("ERROR: Invalid argument\n");
    return E_INVALIDARG;
  } catch(EHResult &e) {
    ATLTRACE("ERROR: HRESULT = %d\n", e.mHResult);
    return e.mHResult;
  } catch (EFail &) {
    ATLTRACE("ERROR: Failure\n");
    return E_FAIL;
  } catch (std::exception &e) {
    ATLTRACE("ERROR: %s\n", e.what());
    return E_FAIL;
  } catch (_com_error &) {
    ATLTRACE("ERROR: catched _com_error\n"); //TODO handle properly
    return E_FAIL;
  }
}

inline void
hresultToException(HRESULT hr)
{
  ANCHO_THROW(EHResult(hr));
}

#define IF_THROW_RET(...) \
  try { \
    __VA_ARGS__ ; \
} catch (...) { \
  return exceptionToHRESULT();\
}

#define BEGIN_TRY_BLOCK try {

#define END_TRY_BLOCK_CATCH_TO_HRESULT \
} catch (...) { \
  return exceptionToHRESULT();\
}

#define IF_FAILED_THROW(...) \
  {\
    HRESULT _hr__ = __VA_ARGS__;\
    if (FAILED(_hr__)) {\
      hresultToException(_hr__);\
    }\
  }
