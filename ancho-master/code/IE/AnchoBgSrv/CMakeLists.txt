cmake_minimum_required (VERSION 2.8.10)  #required for extended generator expressions in add_custom_command
project (AnchoBgSrv)

option(${PROJECT_NAME}_DISABLE_LOGWINDOW "Disable log window" OFF)

if(${${PROJECT_NAME}_DISABLE_LOGWINDOW})
  add_definitions(-DANCHO_DISABLE_LOGWINDOW)
endif(${${PROJECT_NAME}_DISABLE_LOGWINDOW})

add_definitions(-D_SCL_SECURE_NO_WARNINGS) #Disable few paranoic warnings
set(CMAKE_CONFIGURATION_TYPES Debug Release )
set(CMAKE_CONFIGURATION_TYPES "${CMAKE_CONFIGURATION_TYPES}" CACHE STRING "Reset the configurations to those we need" FORCE)


#Variables describing project layout
set(${PROJECT_NAME}_GENERATED_FILES_DIR ${${PROJECT_NAME}_BINARY_DIR})
set(${PROJECT_NAME}_INC_DIR ${${PROJECT_NAME}_SOURCE_DIR}  CACHE PATH "Path to ${PROJECT_NAME} include directory")
set(${PROJECT_NAME}_SRC_DIR ${${PROJECT_NAME}_SOURCE_DIR})
set(${PROJECT_NAME}_RC_DIR ${${PROJECT_NAME}_SOURCE_DIR})


include_directories(
  ${${PROJECT_NAME}_INC_DIR}
  ${anchocommons_INC_DIR}
  ${${PROJECT_NAME}_GENERATED_FILES_DIR}
  )

set(${PROJECT_NAME}_HEADERS
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackGroundServer/UpdateChecking.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackGroundServer/PeriodicTimer.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackGroundServer/WindowManager.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackGroundServer/PageActionProxy.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundServer/UpdateChecking.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundServer/PeriodicTimer.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundServer/TabManager.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundServer/WindowManager.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundServer/JSConstructorManager.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoAddonService.h"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackgroundAPI.h"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBackground.h"
  "${${PROJECT_NAME}_INC_DIR}/AnchoBgSrvModule.h"
  "${${PROJECT_NAME}_INC_DIR}/BackgroundWindow.h"
  "${${PROJECT_NAME}_INC_DIR}/CommandQueue.h"
  "${${PROJECT_NAME}_INC_DIR}/IECookie.h"
  "${${PROJECT_NAME}_INC_DIR}/IECookieManager.h"
  "${${PROJECT_NAME}_INC_DIR}/LogView.h"
  "${${PROJECT_NAME}_INC_DIR}/LogViewRE.h"
  "${${PROJECT_NAME}_INC_DIR}/LogWindow.h"
  "${${PROJECT_NAME}_INC_DIR}/PopupWindow.h"
  "${${PROJECT_NAME}_INC_DIR}/resource.h"
  "${${PROJECT_NAME}_INC_DIR}/stdafx.h"
  "${${PROJECT_NAME}_INC_DIR}/StorageDatabase.h"
  "${${PROJECT_NAME}_INC_DIR}/targetver.h"
  "${${PROJECT_NAME}_INC_DIR}/sqlite3.h"
  )

set(${PROJECT_NAME}_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/src/TabManager.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/src/WindowManager.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/src/UpdateChecking.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/src/PageActionProxy.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/AnchoAddonService.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/AnchoBackgroundAPI.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/AnchoBackground.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/AnchoBgSrv.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/AnchoBgSrvModule.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/BackgroundWindow.cpp"
  #  "${${PROJECT_NAME}_SRC_DIR}/dlldata.c"
  "${${PROJECT_NAME}_SRC_DIR}/IECookie.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/IECookieManager.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/LogView.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/LogViewRE.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/LogWindow.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/PopupWindow.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/stdafx.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/StorageDatabase.cpp"
  )
set(${PROJECT_NAME}_C_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/sqlite3.c"
  )

set(${PROJECT_NAME}_API_JS
  "${${PROJECT_NAME}_RC_DIR}/res/js/"
  "${${PROJECT_NAME}_RC_DIR}/res/js/api.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/bookmarks.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/browserAction.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/browsingData.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/contentSettings.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/contextMenus.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/cookies.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/debugger.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/events.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/extension.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/fileBrowserHandler.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/history.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/i18n.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/idle.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/management.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/omnibox.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/pageAction.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/pageCapture.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/permissions.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/privacy.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/proxy.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/runtime.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/storage.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/tabs.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/topSites.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/ttsEngine.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/tts.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/webNavigation.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/webRequest.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/webstore.js"
  "${${PROJECT_NAME}_RC_DIR}/res/js/windows.js"
  )
source_group("API_JS" FILES ${${PROJECT_NAME}_API_JS})
set_source_files_properties(
  ${${PROJECT_NAME}_API_JS}
  PROPERTIES
    HEADER_FILE_ONLY 1
  )

# precompiled headers
foreach( src_file ${${PROJECT_NAME}_SOURCES} )
        set_source_files_properties(
            ${src_file}
            PROPERTIES
            COMPILE_FLAGS "/Yustdafx.h"
            )
endforeach( src_file ${${PROJECT_NAME}_SOURCES} )
set_source_files_properties("${${PROJECT_NAME}_SRC_DIR}/stdafx.cpp" PROPERTIES COMPILE_FLAGS "/Ycstdafx.h")

################# IDL FILE #########################
set (${PROJECT_NAME}_IDL_FILE
  "${${PROJECT_NAME}_SRC_DIR}/${PROJECT_NAME}.idl"
)
set_source_files_properties(
  ${${PROJECT_NAME}_IDL_FILE}
  PROPERTIES
    HEADER_FILE_ONLY 1
  )
source_group("IDL" FILES ${${PROJECT_NAME}_IDL_FILE})

################# GENERATED FILES #########################
set(${PROJECT_NAME}_MIDL_TLB_FILE "${${PROJECT_NAME}_GENERATED_FILES_DIR}/${PROJECT_NAME}.tlb")

set(${PROJECT_NAME}_MIDL_I_H_FILE  "${${PROJECT_NAME}_GENERATED_FILES_DIR}/${PROJECT_NAME}_i.h")

set(${PROJECT_NAME}_MIDL_I_C_FILE  "${${PROJECT_NAME}_GENERATED_FILES_DIR}/${PROJECT_NAME}_i.c")

set(${PROJECT_NAME}_MIDL_P_C_FILE  "${${PROJECT_NAME}_GENERATED_FILES_DIR}/${PROJECT_NAME}_p.c")

set(${PROJECT_NAME}_GENERATED_FILES
  "${${PROJECT_NAME}_MIDL_TLB_FILE}"
  "${${PROJECT_NAME}_MIDL_I_H_FILE}"
  "${${PROJECT_NAME}_MIDL_I_C_FILE}"
  #  "${${PROJECT_NAME}_MIDL_P_C_FILE}"
  )
source_group("Generated files" FILES ${${PROJECT_NAME}_GENERATED_FILES})

set_source_files_properties(
  ${${PROJECT_NAME}_MIDL_TLB_FILE}
  ${${PROJECT_NAME}_MIDL_I_H_FILE}
  PROPERTIES
    HEADER_FILE_ONLY 1
    GENERATED 1
  )
set_source_files_properties(
  ${${PROJECT_NAME}_MIDL_I_C_FILE}
  ${${PROJECT_NAME}_MIDL_P_C_FILE}
  PROPERTIES
    GENERATED 1
  )

set(MIDL_ENV_ARG win32)
if (${CMAKE_CL_64})
  set(MIDL_ENV_ARG win64)
endif (${CMAKE_CL_64})

# MIDL
set(MIDL_ENV_ARG win32)
if (${CMAKE_CL_64})
  set(MIDL_ENV_ARG win64)
endif (${CMAKE_CL_64})

set(${PROJECT_NAME}_MIDL_ARGUMENTS
                     "${${PROJECT_NAME}_IDL_FILE}"
                     /D $<$<CONFIG:Debug>:"_DEBUG"> $<$<CONFIG:Release>:"NDEBUG">
                     /D "MODULES_HAVE_EXPORT_PROPERTY"
                     /I "${AnchoBgSrv_GENERATED_FILES_DIR}"
                     /nologo
                     /char signed
                     /env ${MIDL_ENV_ARG}
                     /Oicf
                     /tlb "${${PROJECT_NAME}_MIDL_TLB_FILE}"
                     /h "${${PROJECT_NAME}_MIDL_I_H_FILE}"
                     /iid "${${PROJECT_NAME}_MIDL_I_C_FILE}"
                     /proxy "${${PROJECT_NAME}_MIDL_P_C_FILE}"
                     /error stub_data
                     )

                   #add_custom_command(OUTPUT ${${PROJECT_NAME}_GENERATED_FILES}
                   #COMMAND midl.exe ${${PROJECT_NAME}_MIDL_ARGUMENTS}
                   #WORKING_DIRECTORY "${${PROJECT_NAME}_GENERATED_FILES_DIR}"
                   #DEPENDS "${${PROJECT_NAME}_IDL_FILE}"
                   #)
################# RESOURCES #########################
set (${PROJECT_NAME}_RC_FILES
  ${${PROJECT_NAME}_RC_DIR}/${PROJECT_NAME}.rc
  ${${PROJECT_NAME}_RC_DIR}/${PROJECT_NAME}.rgs
  ${${PROJECT_NAME}_RC_DIR}/AnchoAddonService.rgs
)
source_group("Resources" FILES ${${PROJECT_NAME}_RC_FILES})

################# MAIN TARGET SETUP #########################

add_definitions(-DSQLITE_THREADSAFE=1)

# _WIN64
if (${CMAKE_CL_64})
  add_definitions(-DWIN64 -D_WIN64)
endif (${CMAKE_CL_64})


add_executable(${PROJECT_NAME} WIN32
  ${${PROJECT_NAME}_HEADERS}
  ${${PROJECT_NAME}_SOURCES}
  ${${PROJECT_NAME}_C_SOURCES}
  ${${PROJECT_NAME}_GENERATED_FILES}
  ${${PROJECT_NAME}_RC_FILES}
  ${${PROJECT_NAME}_IDL_FILE}
  ${${PROJECT_NAME}_API_JS}
  )
target_link_libraries(${PROJECT_NAME} Gdiplus libbhohelper anchocommons libprothandlers Wininet AnchoShared)

target_link_libraries(${PROJECT_NAME} libbhohelper anchocommons libprothandlers Wininet AnchoShared crxProcessing zlibstatic)

# set UNICODE
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_DEFINITIONS _UNICODE,UNICODE)


#Generating files in pre-build step
add_custom_command(TARGET ${PROJECT_NAME}
                   PRE_BUILD
                   COMMAND midl.exe ${${PROJECT_NAME}_MIDL_ARGUMENTS}
                   WORKING_DIRECTORY "${${PROJECT_NAME}_GENERATED_FILES_DIR}"
                   )

# Register service - using start to handle bug in cmake (wrong quote escaping in COMMAND section
if (NOT ${DISABLE_REGISTRATION} AND NOT ${CMAKE_CL_64})
  add_custom_command(TARGET ${PROJECT_NAME}
                     POST_BUILD
                     COMMAND "start" ARGS "\"DUMMY\"" "/B" "/WAIT" "\"\$(TargetPath)\"" "/RegServer" "/s"
                     )
endif (NOT ${DISABLE_REGISTRATION} AND NOT ${CMAKE_CL_64})

# export variables
set(${PROJECT_NAME}_INC_DIRS ${${PROJECT_NAME}_INC_DIRS} PARENT_SCOPE)
set(${PROJECT_NAME}_GENERATED_FILES_DIR ${${PROJECT_NAME}_GENERATED_FILES_DIR} PARENT_SCOPE)

message(STATUS "Configuring ${PROJECT_NAME}")
