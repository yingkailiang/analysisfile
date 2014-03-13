cmake_minimum_required (VERSION 2.8)
project (AnchoFramework)

#load the version string
file(STRINGS "../../version.txt" VERSION_FILE)

macro(SET_FROM_ENV varName varValue varType varDescription)
  if (DEFINED ENV{${varName}})
    message(STATUS "Found ${varName} in environment variables.")
    set(${varName} $ENV{${varName}} CACHE ${varType} ${varDescription})
  else (DEFINED ENV{${varName}})
    set(${varName} ${varValue} CACHE ${varType} ${varDescription})
  endif (DEFINED ENV{${varName}})
endmacro(SET_FROM_ENV)


SET_FROM_ENV(${PROJECT_NAME}_SRV_VERSION_COMPANY "\"Salsita Software\"" STRING "Company name, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_SRV_VERSION_PRODUCT_NAME "\"Ancho\"" STRING "Product name, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_SRV_VERSION_FILE_DESCRIPTION "\"Background Service for Ancho based addons.\"" STRING "File description, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_SRV_VERSION_LEGAL_COPYRIGHT "\"\(c\) Salsita Software 2013. All rights reserved.\"" STRING "Copyright, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_SRV_VERSION_PRODUCT_VERSION "\"${VERSION_FILE}\"" STRING "Product version, which will be put into the resources")

SET_FROM_ENV(${PROJECT_NAME}_BHO_VERSION_COMPANY "\"Salsita Software\"" STRING "Company name, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_BHO_VERSION_PRODUCT_NAME "\"Ancho BHO\"" STRING "Product name, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_BHO_VERSION_FILE_DESCRIPTION "\"Browser Helper Object for Ancho based addons.\"" STRING "File description, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_BHO_VERSION_LEGAL_COPYRIGHT "\"\(c\) Salsita Software 2013. All rights reserved.\"" STRING "Copyright, which will be put into the resources")
SET_FROM_ENV(${PROJECT_NAME}_BHO_VERSION_PRODUCT_VERSION "\"${VERSION_FILE}\"" STRING "Product version, which will be put into the resources")


add_definitions(-DANCHO_SRV_VERSION_COMPANY=${${PROJECT_NAME}_SRV_VERSION_COMPANY})
add_definitions(-DANCHO_SRV_VERSION_PRODUCT_NAME=${${PROJECT_NAME}_SRV_VERSION_PRODUCT_NAME})
add_definitions(-DANCHO_SRV_VERSION_FILE_DESCRIPTION=${${PROJECT_NAME}_SRV_VERSION_FILE_DESCRIPTION})
add_definitions(-DANCHO_SRV_VERSION_LEGAL_COPYRIGHT=${${PROJECT_NAME}_SRV_VERSION_LEGAL_COPYRIGHT})
add_definitions(-DANCHO_SRV_VERSION_PRODUCT_VERSION=${${PROJECT_NAME}_SRV_VERSION_PRODUCT_VERSION})

add_definitions(-DANCHO_BHO_VERSION_COMPANY=${${PROJECT_NAME}_BHO_VERSION_COMPANY})
add_definitions(-DANCHO_BHO_VERSION_PRODUCT_NAME=${${PROJECT_NAME}_BHO_VERSION_PRODUCT_NAME})
add_definitions(-DANCHO_BHO_VERSION_FILE_DESCRIPTION=${${PROJECT_NAME}_BHO_VERSION_FILE_DESCRIPTION})
add_definitions(-DANCHO_BHO_VERSION_LEGAL_COPYRIGHT=${${PROJECT_NAME}_BHO_VERSION_LEGAL_COPYRIGHT})
add_definitions(-DANCHO_BHO_VERSION_PRODUCT_VERSION=${${PROJECT_NAME}_BHO_VERSION_PRODUCT_VERSION})


add_definitions(-DUNICODE -D_UNICODE)

option(DISABLE_REGISTRATION "Disable registration" OFF)

#-----------------------------------------
if(NOT BOOST_ROOT)
  set(BOOST_ROOT "BOOST_ROOT-NOT_FOUND" CACHE PATH "Where you installed boost?")
endif(NOT BOOST_ROOT)
set(Boost_USE_STATIC_LIBS ON)
set(Boost_USE_MULTITHREADED ON) 
set(Boost_USE_STATIC_RUNTIME OFF)
find_package(Boost REQUIRED COMPONENTS filesystem thread)

if(Boost_FOUND)
  include_directories(${Boost_INCLUDE_DIRS})
  link_directories(${Boost_LIBRARY_DIRS})
  #add_definitions(-DBOOST_THREAD_VERSION=3 -DBOOST_RESULT_OF_USE_TR1 )#-DBOOST_NO_RVALUE_REFERENCES -DBOOST_NO_CXX11_RVALUE_REFERENCES)
  add_definitions(-DBOOST_THREAD_VERSION=3 -DBOOST_RESULT_OF_USE_TR1 -DBOOST_NO_RVALUE_REFERENCES -DBOOST_NO_CXX11_RVALUE_REFERENCES)
endif(Boost_FOUND)

option(ANCHO_WTL_SEARCH "Whether cmake should look for the WTL" OFF)
if(${ANCHO_WTL_SEARCH})
  find_path(WTL_INCLUDE_DIR "atlapp.h")
  include_directories(${WTL_INCLUDE_DIR})
endif(${ANCHO_WTL_SEARCH})

#This sets size of the heap used for generating precompiled headers
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /Zm1000")
#-----------------------------------------

if( CMAKE_CL_64 )
  set(ANCHO_PLATFORM "x64" )
else( CMAKE_CL_64 )
  set( ANCHO_PLATFORM "x86" )
endif( CMAKE_CL_64 )

set(ANCHO_DEBUG_POSTFIX "_${ANCHO_PLATFORM}d" )
set(ANCHO_RELEASE_POSTFIX "_${ANCHO_PLATFORM}" ) 

#set(CMAKE_DEBUG_POSTFIX ${ANCHO_DEBUG_POSTFIX})
#set(CMAKE_RELEASE_POSTFIX ${ANCHO_RELEASE_POSTFIX})
#-----------------------------------------

include_directories(${${PROJECT_NAME}_SOURCE_DIR})

add_subdirectory(libbhohelper)
include_directories(${libbhohelper_INC_DIR})
link_directories(${libbhohelper_ARCHIVE_DIR})

add_subdirectory(Magpie)
add_dependencies(Magpie libbhohelper)
include_directories(${MagpieProject_INC_DIRS})

add_subdirectory(libprothandlers)
include_directories(${libprothandlers_INC_DIR})

add_subdirectory(passthruapp)
include_directories(${passthruapp_INC_DIR})

#Ancho components
add_subdirectory(anchocommons)
include_directories(${anchocommons_INC_DIR})

add_subdirectory(AnchoShared)
add_dependencies(AnchoShared Magpie anchocommons)
include_directories(${AnchoShared_INC_DIR})
include_directories(${AnchoShared_GENERATED_FILES_DIR})

set(BUILD_SHARED_LIBS false CACHE BOOL "ZLib build option")
add_subdirectory(zlib EXCLUDE_FROM_ALL)
include_directories(zlib ${zlib_BINARY_DIR})

add_subdirectory(crxProcessing)
add_dependencies(crxProcessing zlibstatic)
include_directories(${crxProcessing_INC_DIR})

add_subdirectory(AnchoBgSrv)
add_dependencies(AnchoBgSrv anchocommons Magpie libbhohelper libprothandlers AnchoShared crxProcessing)# passthruapp)
include_directories(${AnchoBgSrv_INC_DIR})

#Ancho page actions
add_subdirectory(anchoPageActions)
add_dependencies(anchoPageActions libbhohelper AnchoBgSrv)
include_directories(${anchoPageActions_INC_DIR})

add_subdirectory(anchoPageActionsBroker)
include_directories(${anchoPageActionsBroker_INC_DIR})

#Ancho BHO
add_subdirectory(ancho)
add_dependencies(ancho anchocommons Magpie libbhohelper libprothandlers AnchoShared AnchoBgSrv) #also dependent on AnchoBgSrv - but this will often cause needless rebuild

set_target_properties(Magpie PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")
set_target_properties(anchoPageActions PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")
set_target_properties(anchoPageActionsBroker PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")
set_target_properties(AnchoShared PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")
set_target_properties(ancho PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")
set_target_properties(AnchoBgSrv PROPERTIES RUNTIME_OUTPUT_DIRECTORY "${${PROJECT_NAME}_BINARY_DIR}/")


#get_cmake_property(_variableNames VARIABLES)
#foreach (_variableName ${_variableNames})
#    message(STATUS "${_variableName}=${${_variableName}}")
#endforeach()
