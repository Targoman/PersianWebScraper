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
if [ $? -ne 0 ];then 
	exit 1
fi 

LastVersion=`sudo docker images | grep "$ImageName" | cut -d ' ' -f 4 | sort | tail -n 1`
Date=$(date +"%Y%m%d%H%M%S")

if [ -z "$LastVersion" ];then 
    NewVersion="latest_$Date"
else
    NewVersion=$(echo $LastVersion | sed "s/\_.*//g")"_$Date"
fi
sudo docker rm -f $Container; \
# Pull older versions of the builder and final images from the registry (if any)
#sudo docker pull ${ImageName}:builder || true && \
sudo docker pull ${ImageName}:latest || true && \
# Build the builder image by using the older builder image as a cache
#sudo docker build --cache-from ${ImageName}:builder -t ${ImageName}:builder . && \
# Build the final image by using the older final image as a cache
# ...but also the local cache from the previous builder build
sudo docker build --cache-from ${IMAGE}:latest -t ${ImageName}:$NewVersion . && \
sudo docker rmi "$ImageName:latest" || true && \
sudo docker tag "$ImageName:$NewVersion" "$ImageName:latest" && \
#sudo docker push "$ImageName:builder"  && \
sudo docker push "$ImageName:$NewVersion"  && \
sudo docker push "$ImageName:latest"  


