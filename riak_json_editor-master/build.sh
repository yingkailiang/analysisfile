#/bin/sh

python /home/roman/projects/kango-framework-latest/kango.py build ../riak_editor/

rm update.zip

cp certificates/chrome.pem output/chrome/key.pem

cd output/chrome/
zip -r ../update.zip .
cd -

rm output/chrome/key.pem