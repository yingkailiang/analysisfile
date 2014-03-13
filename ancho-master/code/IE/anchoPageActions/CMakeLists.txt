cmake_minimum_required (VERSION 2.8.10) #required for extended generator expressions in add_custom_command
project (anchoPageActions)

set(CMAKE_CONFIGURATION_TYPES Debug Release )
set(CMAKE_CONFIGURATION_TYPES "${CMAKE_CONFIGURATION_TYPES}" CACHE STRING "Reset the configurations to those we need" FORCE)

#Variables describing project layout
set(${PROJECT_NAME}_GENERATED_FILES_DIR ${${PROJECT_NAME}_BINARY_DIR})
set(${PROJECT_NAME}_INC_DIR ${${PROJECT_NAME}_SOURCE_DIR} CACHE PATH "Path to ${PROJECT_NAME} include directory")
set(${PROJECT_NAME}_SRC_DIR ${${PROJECT_NAME}_SOURCE_DIR})

include_directories(
  ${${PROJECT_NAME}_INC_DIR}
  ${anchocommons_INC_DIR}
  ${AnchoBgSrv_GENERATED_FILES_DIR}
  )

set(${PROJECT_NAME}_HEADERS
  "${${PROJECT_NAME}_INC_DIR}/stdafx.h"
  "${${PROJECT_NAME}_INC_DIR}/targetver.h"
  "${${PROJECT_NAME}_INC_DIR}/PageActionModule.hpp"
  "${${PROJECT_NAME}_INC_DIR}/PageActionToolbar.hpp"
  "${${PROJECT_NAME}_INC_DIR}/PageActionIEWindow.hpp"
  )

set(${PROJECT_NAME}_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/dllmain.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/PageActionModule.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/PageActionToolbar.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/PageActionIEWindow.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/stdafx.cpp"
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

################# MAIN TARGET SETUP #########################

add_library(${PROJECT_NAME} SHARED
  ${${PROJECT_NAME}_HEADERS}
  ${${PROJECT_NAME}_SOURCES}
  )
target_link_libraries(${PROJECT_NAME} Comctl32 Gdiplus libbhohelper anchocommons)

# _WIN64
if (${CMAKE_CL_64})
  add_definitions(-DWIN64 -D_WIN64)
endif (${CMAKE_CL_64})

# set UNICODE
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_DEFINITIONS _UNICODE,UNICODE)

# export variables
set(${PROJECT_NAME}_INC_DIRS ${${PROJECT_NAME}_INC_DIRS} PARENT_SCOPE)

set(${PROJECT_NAME}_LIB_DIR "${${PROJECT_NAME}_BINARY_DIR}"  CACHE PATH "Path to ${PROJECT_NAME} lib directory")

message(STATUS "Configuring ${PROJECT_NAME}")
