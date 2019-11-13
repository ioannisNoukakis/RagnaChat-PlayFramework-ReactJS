#!/usr/bin/env bash
docker-compose -f docker-compose.dev.yml up -d
docker exec -it mongo1 mongo

rs.initiate()
rs.add('mongo2')
rs.add('mongo3')
rs.printSlaveReplicationInfo()
