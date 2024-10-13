# mosaic-oms-api


## Pre-reqs
  - Docker
  - Java
  - Node
  - application-dev.yml: add this file to the src/main/resources folder

## Setup
  - Make sure you have Docker running
  - Run: ./gradlew bootRun 
  - Run: npm run dev from ./frontend to get a working app at http://localhost:5173



### Rebuilding proto files
`protoc -I=/Users/milesressler/workspace/mosaic/mosaic-oms/src/main/proto --java_out=/Users/milesressler/workspace/mosaic/mosaic-oms/src/main/java /Users/milesressler/workspace/mosaic/mosaic-oms/src/main/proto/gtfs-realtime.proto`
