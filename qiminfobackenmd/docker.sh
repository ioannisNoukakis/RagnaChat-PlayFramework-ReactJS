#!/usr/bin/env bash
docker-compose -f docker-compose.dev.yml up -d
docker exec -it localmongo1 mongo

rs.initiate(
  {
    _id : 'rs0',
    members: [
      { _id : 0, host : "mongo1:27017" },
      { _id : 1, host : "mongo2:27017", arbiterOnly: true }
    ]
  }
)

exit