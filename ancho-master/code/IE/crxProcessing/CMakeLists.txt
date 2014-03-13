cmake_minimum_required (VERSION 2.8)
project (crxProcessing)

set(${PROJECT_NAME}_INC_DIR ${${PROJECT_NAME}_SOURCE_DIR} CACHE PATH "Path to ${PROJECT_NAME} include directory")
set(${PROJECT_NAME}_SRC_DIR ${${PROJECT_NAME}_SOURCE_DIR}/src)

set(MINIZIP_SRC_DIR ../zlib/contrib/minizip)
set(MINIZIP_INC_DIR ../zlib/contrib)

include_directories(
  ${${PROJECT_NAME}_INC_DIR} 
  ${MINIZIP_INC_DIR}
  )


set(${PROJECT_NAME}_HEADERS
  "${${PROJECT_NAME}_INC_DIR}/crxProcessing/extract.hpp"
  )

set(${PROJECT_NAME}_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/extract.cpp"
  "${MINIZIP_SRC_DIR}/ioapi.c"
  "${MINIZIP_SRC_DIR}/iowin32.c"
  "${MINIZIP_SRC_DIR}/unzip.c"
  )

add_library(${PROJECT_NAME} STATIC ${${PROJECT_NAME}_HEADERS} ${${PROJECT_NAME}_SOURCES})

# set UNICODE
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_DEFINITIONS _UNICODE,UNICODE)

# _WIN64
if (${CMAKE_CL_64})
  add_definitions(-DWIN64 -D_WIN64)
endif (${CMAKE_CL_64})

#set(${PROJECT_NAME}_LIB_DIR "${${PROJECT_NAME}_BINARY_DIR}"  CACHE PATH "Path to ${PROJECT_NAME} lib directory")

message(STATUS "Configuring ${PROJECT_NAME}")
