#!/bin/sh
cwd=/opt/ws

RUNSleep=60

domains='
farsnews
hamshahrionline
irna
mashreghnews
khabaronline
mehrnews
aftabnews
seratnews
rajanews
alef
mojnews
iqna
isna
ilna
imna
shana
ana
chtn
tasnim
tabnak
spnfa
sputnikaf
pana
ibna
iana
snn
yjc
virgool
baharnews
khamenei
citna
rokna
itna
ninisite
ictnews
asriran
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
kayhan
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
paydarymelli
danakhabar
niknews
iraneconomist
barghnews
shohadayeiran
sedayiran
tejaratonline
sarmadnews
goftareno
tejaratemrouz
vananews
tabnakbato
shoaresal
bankdariirani
tebyan
digikala
romanman
webhostingtalk
barnamenevis
p30world
tarfandestan
boursy
soft98
persiantools
majidonline
lioncomputer
wikifa
yekpezeshk
digiato
blogir
yektanet
bazmineh
namnak
beytoote
blogsky
technolife
sid
sakhtafzarmag
bazicenter
wppersian
joomlafarsi
moshaver
oghyanos
naghdfarsi
arzdigital
ramzarz
donyaeeqtesad
eghtesadonline
sabakhabar
avayekhazar
khabarvarzeshi
sena
mefda
iscanews
behzisti
tahlilbazaar
kanoonnews
imereport
oipf
salameno
tehrannews
tahririeh
atiyeonline
salamatnews
eximnews
payamekhanevadeh
qudsonline
karafarinnews
bidarbourse
shahryarnews
sahebkhabar
saat24
zoomit
farhangemrooz
cinemapress
ifsm
sedayebourse
donyayekhodro
chamedanmag
irasin
tebna
foodpress
fardayeeghtesad
radareghtesad
karajemrouz
titre20
khabaredagh
bazarnews
khordad
wikihoghoogh
wikivoyage
wikibooks
wikisource
arakhabar
nabznaft
diibache
mana
rahbordemoaser
mednews
khatebazar
tabnakjavan
dsport
farhangesadid
basna
jomhouriat
titrekootah
didgahemrooz
wikigardi
jahanemana
shomavaeghtesad
borna
ecoiran
eghtesadnews
sharghdaily
nasim
afkarnews
etemadonline
gostaresh
moniban
honaronline
mosalasonline
tejaratefarda
fartaknews
shayanews
cann
shomanews
mostaghelonline
iranart
neshanonline
chabokonline
toseeirani
baeghtesad
mamlekatonline
khanefootball
honarmrooz
moroornews
keshavarzplus
armanmeli
farazdaily
arshehonline
jadidpress
khodrotak
zenhar
ayandnews
tapesh3
panjahopanjonline
donyayemadan
taraznameheghtesad
bazarebours
panjere
econegar
rasadeghtesadi
gashtaninews
revayatnameh
sornakhabar
jamejamonline
pansadonavadohasht
ofoghnews
snapp
snappfood
snapptrip
nobitex
snappmarket
flightio
namava
achareh
aparat
taaghche
jabama
fidibo
jobinja
rayamarketing
miare
abantether
okala
faradars
limoonad
kalleh
chetor
madarsho
filimoshot
sarakco
avalpardakht
maktabkhooneh
sevenlearn
modireweb
doctoreto
bookland
iranhotelonline
bonyadvokala
apademy
iranicard
hamrah
asiatech
ponisha
trip
parshistory
rawanshenas
telescope
mendellab
faab
wikiravan
arzfi
gishniz
chemibazar
mehrdadcivil
sakkook
bestfarsi
hamgardi
novin
zibamoon
iranacademy
digistyle
iranserver
parscoders
liangroup
honareseda
malltina
webpouya
followshe
watereng
iraneurope
emalls
shereno
scorize
exbito
tarjomic
ompfinex
sesotweb
amuzeshtak
tehranserver
iranestekhdam
sinapub
mihanwebhost
fitamin
ivahid
cafeamoozeshgah
khanoumi
portal
arongroups
taraz
zhaket
azaronline
arazcloud
poonehmedia
kidzy
khanomsin
techranco
tlyn
parspack
pdf
ipresta
irancell
farazsms
raygansms
zarinpal
melipayamak
mopon
clickaval
alomohtava
behtarinideh
podium
infogramacademy
idpay
payamgostar
nabzemarketing
transis
bitpin
fardaname
roshadent
activeidea
doctoryab
paziresh24
webkima
sellfree
dargi
quera
karlancer
hitalki
azki
mosbatesabz
karokasb
mizbanfa
jadvalyab
basalam
ghafaridiet
myket
samanehha
meghdadit
sheypoor
divar
'


VOLUMES="-v/var/lib/ws/db:/db -v/var/lib/ws/corpora:/corpora -v$cwd/log:/log --mount type=bind,source=$cwd/config.json,target=/etc/config.json" 
IMAGE=docker-registry.tip.co.ir/webscrap/scrapper:latest
COMMAND="node .build/index.js"
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
       sudo docker run --rm -t --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --runQuery "UPDATE tblURLs SET status = 'N' WHERE status='E' OR (wc=0 AND (status IN ('F', 'C')))"
       sudo docker run -d --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG ${@:2}
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
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $COMMAND catStats $CONFIG -s /log/stats.csv   ${@:2}
elif  [ "$1" == "normalize" ];then
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $COMMAND normalize $CONFIG ${@:2}
    if [ -n "$3" ];then
            rm -rvf /var/lib/ws/corpora/$3/13*
            rm -rvf /var/lib/ws/corpora/$3/14*
            rm -rvf /var/lib/ws/corpora/$3/NO_DATE*
            ls /var/lib/ws/corpora/$3/
    fi
elif  [ "$1" == "toText" ];then
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $COMMAND toText $CONFIG -t /out ${@:2}
    if [ -n "$3" ];then
        cd /var/lib/ws/text
        tar -czv $3 > $3.tgz
    fi
else
    run $*
    sudo docker logs -f $1
fi
