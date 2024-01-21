#!/bin/sh
cwd=/opt/ws

RUNSleep=60

domains='
baeghtesad
sheypoor
roshadent
gishniz
jobinja
chemibazar
infogramacademy
irancell
transis
didgahemrooz
khanomsin
saat24
parspack
naghdfarsi
faab
tlyn
rawanshenas
iraneurope
techranco
alomohtava
pdf
apademy
miare
abantether
trip
webpouya
podium
asiatech
honareseda
bazmineh
arazcloud
raygansms
nabzemarketing
behtarinideh
kidzy
activeidea
portal
fardaname
azki
clickaval
aparat
doctoryab
yektanet
sakkook
novin
ghafaridiet
telescope
farazsms
liangroup
taraz
azaronline
webkima
samanehha
cafeamoozeshgah
poonehmedia
mendellab
nobitex
modireweb
revayatnameh
hitalki
malltina
bitpin
idpay
iranacademy
karokasb
watereng
sesotweb
ivahid
amuzeshtak
scorize
keshavarzplus
mopon
snapp
oipf
jabama
bestfarsi
payamgostar
iranestekhdam
arzfi
melipayamak
kayhan
snappfood
parshistory
mizbanfa
tapesh3
snappmarket
khanoumi
iranicard
snapptrip
mehrdadcivil
tehranserver
romanman
fitamin
madarsho
achareh
kalleh
tarjomic
basna
sena
sinapub
eghtesadonline
wikiravan
dsport
taraznameheghtesad
namava
karajemrouz
ramzarz
zibamoon
technolife
cann
chamedanmag
payamekhanevadeh
zhaket
econegar
niknews
farhangesadid
iranhotelonline
okala
sevenlearn
dargi
gashtaninews
zoomit
asriran
rajanews
mednews
wikigardi
panjere
paydarymelli
roozno
ictnews
fardayeeghtesad
honarmrooz
donyayemadan
blogir
farazdaily
sornakhabar
khatebazar
bazarebours
arakhabar
foodpress
mosbatesabz
ayandnews
divar
armanmeli
nasim
wppersian
jadidpress
tejaratefarda
karafarinnews
rayamarketing
imereport
shahr
maktabkhooneh
diibache
iqna
chetor
bidarbourse
shomavaeghtesad
chabokonline
quera
khanefootball
javanonline
behzisti
titrekootah
jahanemana
sputnikaf
zenhar
kanoonnews
spnfa
tahririeh
rasadeghtesadi
yekpezeshk
shana
namnak
ecoiran
toseeirani
irasin
chtn
iranart
neshanonline
nabznaft
karlancer
khodrotak
honaronline
sellfree
tejaratemrouz
salamatnews
titre20
sharghdaily
beytoote
ibna
shayanews
tebna
eximnews
tabnakbato
myket
atiyeonline
faradeed
mosalasonline
radareghtesad
sabakhabar
filimoshot
mamlekatonline
mana
itna
khamenei
paziresh24
donyayekhodro
mostaghelonline
digiato
moniban
bazarnews
arshehonline
faradars
jomhouriat
barghnews
didarnews
citna
bankdariirani
shomanews
khabarvarzeshi
gostaresh
bonyadvokala
panjahopanjonline
shahraranews
goftareno
varzesh3
salameno
bookland
arzdigital
tehrannews
moroornews
iraneconomist
taaghche
rahbordemoaser
tahlilbazaar
danakhabar
tabnakjavan
jadvalyab
iscanews
ofoghnews
shohadayeiran
digikala
avayekhazar
shereno
lastsecond
niniban
alef
etemadonline
eghtesadnews
hamgardi
fartaknews
doctoreto
rasanews
vananews
meghdadit
digistyle
khabarfoori
hawzahnews
seratnews
hamshahrionline
ponisha
parscoders
ipresta
bultannews
ana
donyaeeqtesad
noandish
qudsonline
pansadonavadohasht
jamejamonline
baharnews
mojnews
khabaronline
fardanews
imna
jahannews
tabnak
afkarnews
virgool
khordad
fararu
aghigh
lioncomputer
boursenews
ilna
sarmadnews
basijnews
bartarinha
mehrnews
isna
basalam
aftabnews
shianews
mizanonline
irna
rokna
pana
tebyan
blogsky
majidonline
tejaratonline
borna
parsine
oghyanos
mashreghnews
iribnews
snn
sedayiran
shoaresal
tasnim
joomlafarsi
persiantools
sid
emalls
webhostingtalk
sakhtafzarmag
boursy
sedayebourse
moshaver
bazicenter
farsnews
farhangemrooz
khabaredagh
cinemapress
shahryarnews
ifsm
p30world
barnamenevis
mefda
ninisite
soft98
yjc
tarfandestan
wikihoghoogh
tarafdari
wikibooks
wikifa
sahebkhabar
wikisource
wikivoyage
iana
flightio
avalpardakht
hamrah
exbito
mihanwebhost
arongroups
dotic
ekhtebar
qavanin
shenasname
rcmajlis
labourlaw
sistani
agorgani
shoragc
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
       sudo docker run --rm -t --name $1 $VOLUMES $IMAGE $COMMAND $1 $CONFIG --runQuery "UPDATE tblURLs SET status = 'N' WHERE status='E' OR (wc=0 AND (status IN ('F', 'C')))"
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
    sudo docker run --rm -t --name $1-$3 $VOLUMES $IMAGE $PROC_COMMAND catStats $CONFIG -s /log/stats.csv   ${@:2}
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
