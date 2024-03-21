#!/bin/sh 

if [ -z "$1" ];then
    Registry="docker-hub.targoman.com/projects"
else 
    Registry = $1
fi 

ImageName="$Registry/persian-web-scrapper/scrapper"
Container="scrapper"
ContainerParams=""

fingerprint=$(cat package.json yarn.lock .eslintrc.js tsconfig.json | md5sum | cut -d ' ' -f 1) 
rebuild=0
if [ -f docker/.fingerprint ]; then    
    if [ "$(cat docker/.fingerprint)" != "$fingerprint" ]; then
        rebuild=1
    fi
else
    rebuild=1
fi

echo $fingerprint > docker/.fingerprint

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

LastVersion=`sudo docker images | grep "$ImageName" | cut -d ' ' -f 4 | sort | tail -n 1`

echo "$fingerprint => rebuild: $rebuild"

sudo docker pull ${ImageName}:builder || true && \

if [ $rebuild -eq 1 ];then
    sudo docker build -t ${ImageName}:builder -f docker/Dockerfile.builder . && \
    sudo docker push "${ImageName}:builder"   

    if [ $? -ne 0 ];then exit 1; fi 
fi

sudo docker rm -f $Container; 
# Pull older versions of the builder and final images from the registry (if any)
#sudo docker pull ${ImageName}:builder || true && \
sudo docker pull ${ImageName}:latest || true && \
# Build the builder image by using the older builder image as a cache
#sudo docker build --cache-from ${ImageName}:builder -t ${ImageName}:builder . && \
# Build the final image by using the older final image as a cache
# ...but also the local cache from the previous builder build
if [ $rebuild -eq 1 ];then
    sudo docker build -f docker/Dockerfile.app --build-arg BUILDER_IMAGE=${ImageName}:builder -t ${ImageName}:$NewVersion . 
    sudo docker tag ${ImageName}:$NewVersion ${ImageName}:base
    sudo docker push {ImageName}:base
else 
    sudo docker build -f docker/Dockerfile.partial --build-arg BUILDER_IMAGE=${ImageName}:builder --build-arg BASE_IMAGE=${ImageName}:base -t ${ImageName}:$NewVersion . 
fi && \
sudo docker rmi "$ImageName:latest" || true && \
sudo docker tag "$ImageName:$NewVersion" "$ImageName:latest" && \
#sudo docker push "$ImageName:builder"  && \
sudo docker push "$ImageName:$NewVersion"  && \
sudo docker push "$ImageName:latest"  


