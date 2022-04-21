#!/bin/bash
#remove comments for installation on the host machine and comment out the docker commands.
#npm init -y
#apt update -y & apt upgrade -y
#apt install npm -y
docker build . -t helloworld/node-web-app
docker run -p 49160:8080 -d --name helloworld helloworld/node-web-app
