#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
sass --watch sass:css --style compressed
