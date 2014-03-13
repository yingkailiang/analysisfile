cmake_minimum_required (VERSION 2.8.10)  #required for extended generator expressions in add_custom_command
project (anchoPageActionsBroker)

set(CMAKE_CONFIGURATION_TYPES Debug Release )
set(CMAKE_CONFIGURATION_TYPES "${CMAKE_CONFIGURATION_TYPES}" CACHE STRING "Reset the configurations to those we need" FORCE)


#Variables describing project layout
set(${PROJECT_NAME}_INC_DIR ${${PROJECT_NAME}_SOURCE_DIR}  CACHE PATH "Path to ${PROJECT_NAME} include directory")
set(${PROJECT_NAME}_SRC_DIR ${${PROJECT_NAME}_SOURCE_DIR})


include_directories(
  ${${PROJECT_NAME}_INC_DIR}
  )

set(${PROJECT_NAME}_HEADERS
  "${${PROJECT_NAME}_INC_DIR}/stdafx.h"
  "${${PROJECT_NAME}_INC_DIR}/targetver.h"
  )

set(${PROJECT_NAME}_SOURCES
  "${${PROJECT_NAME}_SRC_DIR}/broker.cpp"
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

add_definitions(-DSQLITE_THREADSAFE=1)

add_executable(${PROJECT_NAME} WIN32
  ${${PROJECT_NAME}_HEADERS}
  ${${PROJECT_NAME}_SOURCES}
  )

# _WIN64
if (${CMAKE_CL_64})
  add_definitions(-DWIN64 -D_WIN64)
endif (${CMAKE_CL_64})

# set UNICODE
set_target_properties(${PROJECT_NAME} PROPERTIES COMPILE_DEFINITIONS _UNICODE,UNICODE)

# export variables
set(${PROJECT_NAME}_INC_DIRS ${${PROJECT_NAME}_INC_DIRS} PARENT_SCOPE)

message(STATUS "Configuring ${PROJECT_NAME}")
