/****************************************************************************
 * broker.cpp : Broker process for injecting ancho page actions.
 * Copyright 2013 Salsita software (http://www.salsitasoft.com).
 * Author: Arne Seib <arne@salsitasoft.com>
 ****************************************************************************/

#include "stdafx.h"

#pragma comment(linker, "/SUBSYSTEM:CONSOLE")

// make sure this fits code\IE\anchocommons\PageActionBase.cpp
LPCTSTR sDllFilename = _T("anchoPageActions.dll");

//----------------------------------------------------------------------
// request debug privileges
BOOL DebugPrivileges(BOOL aEnable)
{
  CHandle token;
  if( !::OpenProcessToken( ::GetCurrentProcess(),
      TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY | TOKEN_READ, &token.m_h ) ) {
    return FALSE;
  }

  LUID luid;
  if( !::LookupPrivilegeValue( NULL, SE_DEBUG_NAME, &luid ) ) {
    return FALSE;
  }

  TOKEN_PRIVILEGES privileges;

  privileges.PrivilegeCount = 1;
  privileges.Privileges[ 0 ].Luid = luid;
  privileges.Privileges[ 0 ].Attributes = aEnable ? SE_PRIVILEGE_ENABLED : 0;

  return ::AdjustTokenPrivileges( token, FALSE, &privileges, 0, NULL, NULL );
}

//----------------------------------------------------------------------
// inject the dll sDllFilename in target process
LRESULT InjectDll(DWORD aProcessId)
{
  if (!aProcessId) {
    return ERROR_INVALID_HANDLE;
  }

  // request debug privileges for writing process memory
  if( !DebugPrivileges( TRUE ) ) {
    return ::GetLastError();
  }

  CHandle process(::OpenProcess( PROCESS_ALL_ACCESS, FALSE, aProcessId ));
  if( !process ) {
    return ::GetLastError();
  }

  // format dll filename
  TCHAR path[ MAX_PATH ] = {0};
  if( !::GetModuleFileName( NULL, path, MAX_PATH ) ) {
    return ::GetLastError();
  }

  TCHAR* sp = _tcsrchr( path, L'\\' ) + 1;
  _tcscpy_s( sp, path + MAX_PATH - sp, sDllFilename );

  // allocate memory for filename
  LPVOID address = ::VirtualAllocEx( process, NULL, sizeof( path ),
      MEM_COMMIT, PAGE_READWRITE );
  if( !address ) {
    return ::GetLastError();
  }

  // NOTE: From here on address has to be VirtualFreeEx'd, so don't return here!
  LRESULT ret = 0;
  // and write filename
  if( ::WriteProcessMemory( process, address, path, sizeof( path ), NULL ) ) {
    // if it worked, create remote thread with LoadLibrary
#ifdef UNICODE
    CHandle thread(::CreateRemoteThread( process, NULL, 0,
        (LPTHREAD_START_ROUTINE)::GetProcAddress( ::GetModuleHandle( L"Kernel32" ),
          "LoadLibraryW" ),
        address, 0, NULL ));
#else
    CHandle thread(::CreateRemoteThread( process, NULL, 0,
        (LPTHREAD_START_ROUTINE)::GetProcAddress( ::GetModuleHandle( L"Kernel32" ),
          "LoadLibraryA" ),
        address, 0, NULL ));
#endif
    if( thread ) {
      ::WaitForSingleObject( thread, INFINITE );
      thread.Close();
    }
    else {
      ret = ::GetLastError();
    }
  }
  else {
    ret = ::GetLastError();
  }
  ::VirtualFreeEx( process, address, sizeof( path ), MEM_RELEASE );

  process.Close();
  DebugPrivileges( FALSE );

  return ret;
}

/*============================================================================
 * windows MAIN
 */
int _tmain(int argc, _TCHAR* argv[])
{
  if( argc > 0 )
  {
    return (int)InjectDll( (DWORD)_wtoi( argv[ 0 ] ) );
  }
  return ERROR_INVALID_PARAMETER;
}

