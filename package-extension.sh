#!/bin/sh

version=$1

new_dir_name=zipped-builds-$version
new_firefox_build=firefox-$version.zip
new_chrome_build=chrome-$version.zip

if [ -z "${version}" ]; 
then
    echo "A version must be passed as an argument"
    exit 42;
fi

npm run build-firefox
npm run build-chrome

mkdir -p $PWD/build/$new_dir_name

cd $PWD/build
zip -r ./$new_dir_name/$new_firefox_build ./firefox/*
zip -r ./$new_dir_name/$new_chrome_build ./chrome/*
