#!/bin/sh 

if [ -z "$1" ];then
    Registry="docker-registry.tip.co.ir"
else 
    Registry = $1
fi 

ImageName="$Registry/webscrap/scrapper"
Container="scrapper"
ContainerParams=""

yarn dev

LastVersion=`sudo docker images | grep "$ImageName" | cut -d ' ' -f 4 | sort | tail -n 1`
Date=$(date +"%Y%m%d%H%M%S")

if [ -z "$LastVersion" ];then 
    NewVersion="latest_$Date"
else
    NewVersion=$(echo $LastVersion | sed "s/\_.*//g")"_$Date"
fi
sudo docker rm -f $Container; \
sudo docker build -t "$ImageName:$NewVersion" .  --cache-from $ImageName:latest && \
sudo docker rmi "$ImageName:latest"; \
sudo docker tag "$ImageName:$NewVersion" "$ImageName:latest" && \
sudo docker push "$ImageName:$NewVersion"  && \
sudo docker push "$ImageName:latest"  


