#!/bin/bash

# setup java home - if this is already set in your env, comment the line below
export JAVA_HOME=/usr/lib/jvm/java-6-openjdk-amd64/jre/

# setup hbase env
export HBASE_INSTALL=/mnt/apps/hbase-0.94.5
export PATH=$PATH:$HBASE_INSTALL/bin

# setup hadoop env.  If not using, comment these lines below
export HADOOP_INSTALL=/mnt/apps/hadoop-1.0.4
HADOOP_CLASSPATH=`${HBASE_INSTALL}/bin/hbase classpath` ${HADOOP_INSTALL}/bin/hadoop jar ${HBASE_INSTALL}/hbase-0.94.5.jar
export HADOOP_OPTS="-Djava.security.krb5.realm=kdc0.ox.ac.uk:kdc1.ox.ac.uk"
export PATH=$PATH:$HADOOP_INSTALL/bin
