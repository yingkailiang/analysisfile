cmake_minimum_required (VERSION 2.8)
project (anchocommons)

set(${PROJECT_NAME}_INC_DIR ${${PROJECT_NAME}_SOURCE_DIR} CACHE PATH "Path to ${PROJECT_NAME} include directory")
set(${PROJECT_NAME}_SRC_DIR ${${PROJECT_NAME}_SOURCE_DIR})

include_directories(${${PROJECT_NAME}_INC_DIR})

set(${PROJECT_NAME}_HEADERS
  "${${PROJECT_NAME}_INC_DIR}/anchocommons.h"
  "${${PROJECT_NAME}_INC_DIR}/AnchoCommons/JSValueWrapper.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoCommons/AsynchronousTaskManager.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoCommons/COMConversions.hpp"
  "${${PROJECT_NAME}_INC_DIR}/AnchoCommons/JavaScriptCallback.hpp"
  "${${PROJECT_NAME}_INC_DIR}/Exceptions.h"
  "${${PROJECT_NAME}_INC_DIR}/SimpleWrappers.h"
  "${${PROJECT_NAME}_INC_DIR}/IPCHeartbeat.h"
  "${${PROJECT_NAME}_INC_DIR}/PageActionBase.hpp"
  )

set(${PROJECT_NAME}_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/strings.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/utilities.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/PageActionBase.cpp"
  "${${PROJECT_NAME}_SRC_DIR}/src/AsynchronousTaskManager.cpp"
  )

add_library(${PROJECT_NAME} STATIC ${${PROJECT_NAME}_HEADERS} ${${PROJECT_NAME}_SOURCES})

# set UNICODE
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_DEFINITIONS _UNICODE,UNICODE)

# _WIN64
if (${CMAKE_CL_64})
  add_definitions(-DWIN64 -D_WIN64)
endif (${CMAKE_CL_64})

set(${PROJECT_NAME}_LIB_DIR "${${PROJECT_NAME}_BINARY_DIR}"  CACHE PATH "Path to ${PROJECT_NAME} lib directory")

# export variables
set(${PROJECT_NAME}_INC_DIRS ${${PROJECT_NAME}_INC_DIR} PARENT_SCOPE)

message(STATUS "Configuring ${PROJECT_NAME}")
