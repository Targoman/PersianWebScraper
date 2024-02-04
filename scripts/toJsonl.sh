#!/bin/sh

if [ -z "$1" ];then
                echo "No domain specified"
                        exit 1
fi
cwd=$(pwd)
basePath=$cwd/ws/corpora/$1
jsonlPath=$cwd/ws/jsonl/$1


#./rundocker.sh $1 query "SELECT SUM(1) AS totalURLs, SUM(CASE WHEN(status = 'E') THEN 1 ELSE 0 END) AS errors, SUM(CASE WHEN(status = 'D') THEN 1 ELSE 0 END) AS discarded, SUM(CASE WHEN(status = 'F') THEN 1 ELSE 0 END) AS noContent, SUM(CASE WHEN(status = 'C') THEN 1 ELSE 0 END) AS retrievedDocs, MAX(lastChange) AS lastUpdate FROM tblURLs" > $cwd/log/$1.readme.tmp
#echo "{" > $cwd/log/$1.stat.json
#grep "totalURLs" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ t/ "t/g'>> $cwd/log/$1.stat.json 
#grep "errors" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g'  | sed 's/:/":/g' | sed 's/ e/ "e/g' >> $cwd/log/$1.stat.json 
#grep "discarded" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ d/ "d/g'>> $cwd/log/$1.stat.json 
#grep "noContent" $cwd/log/$1.readme.tmp |sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ n/ "n/g'>> $cwd/log/$1.stat.json 
#grep "retrievedDocs" $cwd/log/$1.readme.tmp |sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ r/ "r/g'>> $cwd/log/$1.stat.json 
#grep "lastUpdate" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ l/ "l/g' | sed "s/'/\"/g">> $cwd/log/$1.stat.json 
#echo "}" >> $cwd/log/$1.stat.json

#cd $jsonlPath
#for file in *; do gzip -v $file; done 
#mv -v $cwd/log/$1.csv $jsonlPath
#mv -v $cwd/log/$1.stat.json $jsonlPath
#cd ..
#tar -czv $1 > $1.tgz
#cp -v $1/$1.csv .
#cp -v $1/$1.stat.json .
#
#cat $1.stat.json
#cat $1.csv
#
#exit

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
done

cd $cwd
./rundocker.sh stats2 -d $1
./rundocker.sh $1 query "SELECT SUM(1) AS totalURLs, SUM(CASE WHEN(status = 'E') THEN 1 ELSE 0 END) AS errors, SUM(CASE WHEN(status = 'D') THEN 1 ELSE 0 END) AS discarded, SUM(CASE WHEN(status = 'F') THEN 1 ELSE 0 END) AS noContent, SUM(CASE WHEN(status = 'C') THEN 1 ELSE 0 END) AS retrievedDocs, MAX(lastChange) AS lastUpdate FROM tblURLs" > $cwd/log/$1.readme.tmp
echo "{" > $cwd/log/$1.stat.json
grep "totalURLs" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ t/ "t/g'>> $cwd/log/$1.stat.json
grep "errors" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g'  | sed 's/:/":/g' | sed 's/ e/ "e/g' >> $cwd/log/$1.stat.json
grep "discarded" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ d/ "d/g'>> $cwd/log/$1.stat.json
grep "noContent" $cwd/log/$1.readme.tmp |sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ n/ "n/g'>> $cwd/log/$1.stat.json
grep "retrievedDocs" $cwd/log/$1.readme.tmp |sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ r/ "r/g'>> $cwd/log/$1.stat.json
grep "lastUpdate" $cwd/log/$1.readme.tmp | sed -e 's/\x1b\[[0-9;]*m//g' | sed 's/:/":/g' | sed 's/ l/ "l/g' | sed "s/'/\"/g">> $cwd/log/$1.stat.json
echo "}" >> $cwd/log/$1.stat.json

cd $jsonlPath
for file in *; do gzip -v $file; done
mv -v $cwd/log/$1.csv $jsonlPath
mv -v $cwd/log/$1.stat.json $jsonlPath
cd ..
tar -czv $1 > $1.tgz
cp -v $1/$1.csv .
cp -v $1/$1.stat.json .

cat $1.stat.json
cat $1.csv

