#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
s3cmd put --acl-public --guess-mime-type js/extension.min.js s3://get-creative/js/extension-012113.min.js
