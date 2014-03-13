#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
s3cmd put --acl-public --guess-mime-type css/extension.min.css s3://get-creative/css/extension-012113.min.css
