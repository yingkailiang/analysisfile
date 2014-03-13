#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
mongod --dbpath "../data"
