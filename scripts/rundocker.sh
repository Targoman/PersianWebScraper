#!/bin/sh
cwd=/opt/ws

RUNSleep=60

domains='
abantether
achareh
activeidea
afkarnews
aftabnews
aghigh
agorgani
alef
alomohtava
amuzeshtak
ana
apademy
aparat
arakhabar
arazcloud
armanmeli
arongroups
arshehonline
arzdigital
arzfi
asiatech
asriran
atiyeonline
avalpardakht
avayekhazar
ayandnews
azaronline
azki
baeghtesad
baharnews
bahjat
bankdariirani
barghnews
barnamenevis
bartarinha
basalam
basijnews
basna
bazarebours
bazarnews
bazicenter
bazmineh
behtarinideh
behzisti
bestfarsi
beytoote
bidarbourse
bitpin
blogir
blogsky
bonyadvokala
bookland
borna
boursenews
boursy
bultannews
cafeamoozeshgah
cann
chabokonline
chamedanmag
chemibazar
chetor
chtn
cinemapress
citna
clickaval
danakhabar
dargi
didarnews
didgahemrooz
digiato
digikala
digistyle
diibache
divar
doctoreto
doctoryab
donyaeeqtesad
donyayekhodro
donyayemadan
dotic
drsaina
dsport
ecoiran
econegar
eghtesadnews
eghtesadonline
ekhtebar
emalls
etemadonline
exbito
eximnews
extern
faab
faradars
faradeed
fararu
farazdaily
farazsms
fardaname
fardanews
fardayeeghtesad
farhangemrooz
farhangesadid
farsnews
fartaknews
filimoshot
fitamin
flightio
foodpress
gashtaninews
ghafaridiet
gishniz
goftareno
gostaresh
hamgardi
hamrah
hamshahrionline
hawzahnews
hitalki
honareseda
honarmrooz
honaronline
iana
ibna
ictnews
idpay
ifsm
ilna
imereport
imna
infogramacademy
ipresta
iqna
iranacademy
iranart
irancell
iraneconomist
iranestekhdam
iraneurope
iranhotelonline
iranicard
irasin
iribnews
irna
iscanews
isna
itna
ivahid
jabama
jadidpress
jadvalyab
jahanemana
jahannews
jamejamonline
javanonline
jobinja
jomhouriat
joomlafarsi
kalleh
kanoonnews
karafarinnews
karajemrouz
karlancer
karokasb
kayhan
keshavarzplus
khabaredagh
khabarfoori
khabaronline
khabarvarzeshi
khamenei
khanefootball
khanomsin
khanoumi
khatebazar
khodrotak
khordad
kidzy
labourlaw
lastsecond
liangroup
lioncomputer
madarsho
majidonline
maktabkhooneh
malltina
mamlekatonline
mana
mashreghnews
mednews
mefda
meghdadit
mehrdadcivil
mehrnews
melipayamak
mendellab
miare
mihanwebhost
mizanonline
mizbanfa
modireweb
mojnews
moniban
mopon
moroornews
mosalasonline
mosbatesabz
moshaver
mostaghelonline
myket
nabzemarketing
nabznaft
naghdfarsi
namava
namnak
nasim
neshanonline
niknews
niniban
ninisite
noandish
nobitex
novin
ofoghnews
oghyanos
oipf
okala
p30world
pana
panjahopanjonline
panjere
pansadonavadohasht
parscoders
parshistory
parsine
parspack
payamekhanevadeh
payamgostar
paydarymelli
paziresh24
pdf
persiantools
podium
ponisha
poonehmedia
portal
qavanin
qudsonline
quera
radareghtesad
rahbordemoaser
rajanews
ramzarz
rasadeghtesadi
rasanews
rastineh
rawanshenas
rayamarketing
raygansms
rcmajlis
revayatnameh
rokna
romanman
roozno
roshadent
saafi
saat24
sabakhabar
sahebkhabar
sakhtafzarmag
sakkook
salamatnews
salameno
samanehha
sarmadnews
scorize
sedayebourse
sedayiran
sellfree
sena
seratnews
sesotweb
sevenlearn
shahr
shahraranews
shahryarnews
shana
sharghdaily
shayanews
shereno
shenasname
sheypoor
shianews
shoaresal
shohadayeiran
shomanews
shomavaeghtesad
shoragc
sid
sinapub
sistani
snapp
snappfood
snappmarket
snapptrip
snn
soft98
sornakhabar
spnfa
sputnikaf
taaghche
tabnak
tabnakbato
tabnakjavan
tahlilbazaar
tahririeh
tapesh3
tarafdari
taraz
taraznameheghtesad
tarfandestan
tarjomic
tasnim
tebna
tebyan
technolife
techranco
tehrannews
tehranserver
tejaratefarda
tejaratemrouz
tejaratonline
telescope
titre20
titrekootah
tlyn
toseeirani
transis
trip
vananews
varzesh3
virgool
watereng
webhostingtalk
webkima
webpouya
wikibooks
wikifa
wikigardi
wikihoghoogh
wikiravan
wikishia
wikisource
wikivoyage
wppersian
yekpezeshk
yektanet
yjc
zenhar
zhaket
zibamoon
zoomit
'


VOLUMES="-v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json" 
IMAGE=docker-registry.tip.co.ir/webscrap/scrapper:latest
COMMAND="node .build/index.js"
PROC_COMMAND="node .build/process.js"
CONFIG="-c /etc/config.json"
function stop(){
       sudo  docker rm -f $1
}

function run() {
        stop $1
        sudo docker run -d --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG ${@:2}
}

function reset() {
       stop $1
       sudo docker run --rm -t --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --runQuery "UPDATE tblURLs SET status = 'D' WHERE status NOT IN ('C') AND (url LIKE 'https://www.static%' OR url LIKE 'https://static%')" -v 4
       sudo docker run --rm -t --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --runQuery "UPDATE tblURLs SET status = 'N' WHERE (status='E' AND lastError NOT LIKE '%code 400%' AND lastError NOT LIKE '%code 403%' AND lastError NOT LIKE '%code 404%' AND lastError NOT LIKE '%code 414%' ) OR (wc=0 AND (status IN ('F', 'C')))" -v 4
       sudo docker run -d --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --recheck ${@:2}
}

function update() {
        stop $1
        sudo docker run -d --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --recheck
}

if [ -z "$1" ]; then
    for d in $domains; do
            run $d
            sleep $RUNSleep
    done
elif [ "$1" == "reset" ]; then
    if [ -z "$2" ]; then
        for i in $domains; do
            reset $i
            sleep $RUNSleep
        done
    else
        reset $2
    fi
elif [ "$2" == "query" ];then
    stop $1
    docker run -t --rm --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --runQuery "$3"
elif [ $1 == "show" ]; then
    if [ -n "$2" ]; then
        domains=$2
    fi
    cat log/lastStats
    echo "--------------------------------------------------------------------------------"
    twc=0
    tur=0
    tdc=0
    tpu=0
    for i in $domains; do
        res=`sudo docker logs --tail 100 $i 2>/dev/null | grep fetching | tail -n 1`
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
    if [ -z "$2" ]; then
        for d in $domains; do
            stop $d
        done
    else
        stop $2
    fi

elif  [ "$1" == "update" ]; then
    if [ -z "$2" ]; then
        for d in $domains; do
            update $d
            sleep $RUNSleep
        done
    else
        update $2
    fi

elif  [ "$1" == "stats" ];then
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $PROC_COMMAND catStats $CONFIG -s /log/stats.csv ${@:2}
elif  [ "$1" == "stats2" ];then
    if [ -n "$2" ]; then statsFile=$3; else statsFile='stats'; fi
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $PROC_COMMAND catStats $CONFIG -s /log/$statFile.csv ${@:2}
elif  [ "$1" == "normalize" ];then
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $PROC_COMMAND normalize $CONFIG ${@:2}
    if [ -n "$3" ];then
            rm -rvf /var/lib/ws/corpora/$3/13*
            rm -rvf /var/lib/ws/corpora/$3/14*
            rm -rvf /var/lib/ws/corpora/$3/NO_DATE*
            ls /var/lib/ws/corpora/$3/
    fi
elif  [ "$1" == "toText" ];then
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $PROC_COMMAND toText $CONFIG -t /out ${@:2}
    if [ -n "$3" ];then
        cd /var/lib/ws/text
        tar -czv $3 > $3.tgz
    fi
else
    run $*
    sudo docker logs -f $1
fi
