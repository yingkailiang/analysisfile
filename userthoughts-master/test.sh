#!/bin/bash
ruby create_fixtures.rb
while getopts  "j:t:" flag
do
  if [ $flag == "j" ]; then
    JSTD=$OPTARG
  elif [ $flag == "t" ]; then
    TESTS=$OPTARG
  fi
done

if [ -z "$JSTD" ]; then
	JSTD=`ls [jJ]s[tT]est[dD]river*.jar`
fi

if [ -z "$TESTS" ]; then
  TESTS="ALL"
  echo "Running all tests"
else
  echo "Running '$TESTS'"
fi

java -jar $JSTD --reset --tests "$TESTS" --verbose --browserTimeout "60"
