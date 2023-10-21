#!/bin/sh

cwd=/opt/ws

function stop(){
        docker rm -f $1
}

function run() {
        stop $1
        docker run -d --name $1 \
        -v$cwd/db/:/db -v/var/lib/corpora:/corpora \
        -v$cwd/log:/log \
        --mount type=bind,source=$cwd/config.json,target=/etc/config.json \
        docker-registry.tip.co.ir/webscrap/scrapper:latest \
        node .build/index.js $1 -c /etc/config.json ${@:2}
}

domains='
ninisite
jahannews
varzesh3
tarafdari
farsnews 
irna 
mashreghnews 
khabaronline 
aftabnews 
iqna 
ilna 
tasnim 
pana 
snn 
yjc 
virgool 
baharnews
khamenei
citna
rokna
ictnews
itna
hamshahrionline 
rajanews 
alef 
imna 
shana 
chtn 
spnfa 
sputnikaf 
seratnews 
mojnews 
mehrnews 
isna 
ana 
tabnak 
ibna 
iana 
'
if [ -z "$1" ]; then
    for i in $domains; do
            run $i
    done
elif [ "$2" == "query" ];then
    stop $1
    docker run -t --name $1 -v$cwd/db/:/db -v/var/lib/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json docker-registry.tip.co.ir/webscrap/scrapper:latest node .build/index.js $1 -c /etc/config.json --runQuery "$3"
elif [ $1 == "show" ]; then
    for i in $domains; do
        echo $i
        docker logs --tail 100 $i 2>/dev/null | grep fetching | tail -n 1
    done
elif [ "$1" == "stop" ];then
    for i in $domains; do
        stop $i
    done
elif [ "$1" == "recheck" ];then
    for i in $domains; do
            run $i --recheck
    done
else
    run $*
    docker logs -f $1
fi
