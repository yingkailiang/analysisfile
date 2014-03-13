// dllmain.cpp : Defines the entry point for the DLL application.
#include "stdafx.h"
#include "PageActionModule.hpp"

PageActionModule _AtlModule;

BOOL APIENTRY DllMain( HMODULE hModule,
  DWORD  dwReason,
  LPVOID lpReserved )
{
  return _AtlModule.DllMain2(hModule, dwReason, lpReserved);
}

