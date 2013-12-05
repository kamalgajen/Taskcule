#!/bin/bash

# Taskcule setup on Ubuntu
# assumption that the user running this has sudo access

sudo apt-get update

# install java
sudo apt-get install openjdk-6-jre

# install required utilities
sudo apt-get install -y python-software-properties python g++ make
sudo apt-get install libboost-dev libboost-test-dev libboost-program-options-dev libevent-dev automake libtool flex bison pkg-config libssl-dev
sudo apt-add-repository -y ppa:cassou/emacs
sudo apt-get update
sudo apt-get install -y emacs24 emacs24-el emacs24-common-non-dfsg




# install nodejs
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install -y nodejs

# install git core
sudo apt-get install -y git-core

# enable ssh to localhost without pwd
cd ~
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# setup heroku toolbelt
wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh
