#!/usr/bin/env bash

npx jetify

cd ./ios && rm -rf Pods && pod cache clean --all && pod install && cd ..