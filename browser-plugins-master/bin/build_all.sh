#!/bin/bash

#fetch the current dir.
CURRENT_DIR=`pwd`

#assuming the extensions source dir is a level up.
EXTENSIONS_SRC="${CURRENT_DIR}/src"

#assuming the extensions bin dir is a level up.
EXTENSIONS_BUILD="${CURRENT_DIR}/out"


#echo "building all the extensions. " $EXTENSIONS_SRC

for f in $( ls $EXTENSIONS_SRC ); 
do
	#copy the source to build.
	echo "building the extension : ${f}"
#	`cp -aR ${EXTENSIONS_SRC}/${f} ${EXTENSIONS_BUILD}/`
#	`rm -rf ${EXTENSIONS_BUILD}/${f}/.svn`
	
	#compile the javascripts.
	for js in `ls ${EXTENSIONS_SRC}/${f}/*.js`
	do
		echo "js files are : ${js}" 
#	`java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js main.js --js_output_file ../main.js`
	done
done

