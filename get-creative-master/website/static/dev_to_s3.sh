#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
s3cmd put --acl-public --guess-mime-type js/popup.min.js s3://get-creative/js/popup-dev.min.js
s3cmd put --acl-public --guess-mime-type css/popup.min.css s3://get-creative/css/popup-dev.min.css
