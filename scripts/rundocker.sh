#!/bin/sh

cwd=/opt/ws

function stop(){
        docker rm -f $1
}

function run() {
        stop $1
        docker run -d --name $1 \
        -v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora \
        -v$cwd/log:/log \
        --mount type=bind,source=$cwd/config.json,target=/etc/config.json \
        docker-registry.tip.co.ir/webscrap/scrapper:latest \
        node .build/index.js $1 -c /etc/config.json ${@:2}
}

function reset() {
       stop $1
       docker run -t --name $1 -v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json docker-registry.tip.co.ir/webscrap/scrapper:latest node .build/index.js $1 -c /etc/config.json --runQuery "UPDATE tblURLs set status = 'N', lastError=NULL WHERE status = 'F' OR status='E' "
       run $1
}

domains='
arzdigital
joomlafarsi
moshaver
oghyanos
bazicenter
sakhtafzarmag
sid
digiato
wikifa
majidonline
persiantools
soft98
boursy
tarfandestan
barnamenevis
p30world
webhostingtalk
tebyan
farsnews
irna
mashreghnews
mehrnews
aftabnews
isna
ilna
imna
tasnim
pana
snn
yjc
virgool
rokna
ninisite
jahannews
varzesh3
tarafdari
lastsecond
fardanews
bultannews
boursenews
shahr
fararu
parsine
shianews
hawzahnews
khabarfoori
bartarinha
iribnews
mizanonline
basijnews
shahraranews
rasanews
didarnews
faradeed
niniban
roozno
noandish
javanonline
aghigh
sedayiran
tejaratonline
sarmadnews
vananews
shoaresal

hamshahrionline
seratnews
rajanews
baharnews
tabnakbato
iqna
shana
alef
chtn
shohadayeiran
goftareno
tejaratemrouz
khamenei
spnfa
sputnikaf
ibna
itna
kayhan
goftareno
tejaratemrouz
bankdariirani
paydarymelli
danakhabar
niknews
iraneconomist
barghnews
romanman
blogir
yektanet
bazmineh
ana
beytoote
namnak
mojnews
tabnak
technolife
blogsky
wppersian
naghdfarsi
ramzarz
citna
'
if [ -z "$1" ]; then
    for i in $domains; do
            run $i
    done
elif [ "$1" == "reset" ]; then
        if [ -z "$2" ]; then
                for i in $domains; do
                        reset $i
                done
        else
                reset $2
        fi
elif [ "$2" == "query" ];then
    stop $1
    docker run -t --name $1 -v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json docker-registry.tip.co.ir/webscrap/scrapper:latest node .build/index.js $1 -c /etc/config.json --runQuery "$3"
elif [ $1 == "show" ]; then
    cat log/lastStats
    echo "--------------------------------------------------------------------------------"
    twc=0
    tur=0
    tdc=0
    tpu=0
    for i in $domains; do
        res=`docker logs --tail 100 $i 2>/dev/null | grep fetching | tail -n 1`
        echo "$res  $i"
        wc=`echo $res | cut -d ',' -f 7 | cut -d ':' -f 2 | xargs | sed -e 's/\x1b\[[0-9;]*m//g'`
        dc=`echo $res | cut -d ',' -f 6 | cut -d ':' -f 2 | xargs | sed -e 's/\x1b\[[0-9;]*m//g'`
        ur=`echo $res | cut -d ',' -f 2 | cut -d ':' -f 2 | xargs | sed -e 's/\x1b\[[0-9;]*m//g'`
        pu=`echo $res | cut -d ',' -f 5 | cut -d ':' -f 2 | xargs | sed -e 's/\x1b\[[0-9;]*m//g'`
#       echo $ur
        twc=$(($wc + $twc))
        tdc=$(($dc + $tdc))
        tur=$(($ur + $tur))
        tpu=$(($pu + $tpu))
    done
    echo "--------------------------------------------------------------------------------"
    printf "Total URLs: %'.0f \t Processed URLs: %'.0f \t Total Docs: %'.0f \t Total WC: %'.0f \t\n" $tur $tpu $tdc $twc
    printf "Total URLs: %'.0f \t Processed URLs: %'.0f \t Total Docs: %'.0f \t Total WC: %'.0f \t\n" $tur $tpu $tdc $twc > log/lastStats
elif [ "$1" == "stop" ];then
    for i in $domains; do
        stop $i
    done
elif [ "$1" == "recheck" ];then
    for i in $domains; do
            run $i --recheck
    done
elif  [ "$1" == "stats" ];then
    docker run -t --name $1 -v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json docker-registry.tip.co.ir/webscrap/scrapper:latest node .build/process.js catStats -c /etc/config.json -s /log/stats.csv
else
    run $*
    docker logs -f $1
fi
