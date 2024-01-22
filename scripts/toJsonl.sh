#!/bin/sh
if [ -z "$1" ];then
        echo "No domain specified"
        exit 1
fi
basePath=./ws/corpora/$1
jsonlPath=./ws/jsonl/$1
cwd=$(pwd)

rm -rf $jsonlPath
mkdir -p $jsonlPath

for date in $(ls $basePath); do
    year=$(echo $date | cut -d '-' -f1)
    month=$(echo $date | cut -d '-' -f2)
    if [ -n "$month" ];then
        jlfilename="$year-$month.jsonl"
    else
        jlfilename="$year.jsonl"
    fi

    for file in $(find $basePath/$date -type f -name "*.json"); do 
        json=$(jq -c < $file)
        if [ -n "$json" ];then 
            echo $json >> $jsonlPath/$jlfilename
            echo "Moved: $file"
        else 
            echo "Failed: $file"
        fi
    done 
    cd $jsonlPath
    #gzip $jlfilename
    cd $cwd
done
