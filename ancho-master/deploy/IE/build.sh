#!/bin/bash

version=`cat ../../version.txt`

if [ -z "${INNOSETUP}" ]; then
  echo "INNOSETUP variable with path to Inno Setup needs to be set"
  exit 1;
fi

# run Inno setup to create installer
"${INNOSETUP}" -O"." -DappCompany="Salsita" -DappName="Ancho" -DsetupPrefix="ancho-ie" -DappVersion="${version}"  setup.iss

