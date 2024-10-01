# mosaic-oms-api


## Pre-reqs
  - Docker
  - Java
  - Node
  - application.yml: to the resources folder, which holds the client secrets - contents are:
      auth0:
        domain: dev-milessmiles.auth0.com
        clientId: "VlxEHMHlqE19Mj37PFXAbu4iW60X6fVF"
        clientSecret: "y29uau2diGCykTUfRne8nTsgzlzsZ75U1-Mlrzh4E1Ucimt37mpaUn6emwh3F8EY"

## Setup
  - Make sure you have docker running, then you can do ./gradlew bootRun , and npm run dev from frontend to get a working app at http://localhost:5173



### Rebuilding proto files
`protoc -I=/Users/milesressler/workspace/mosaic/mosaic-oms/src/main/proto --java_out=/Users/milesressler/workspace/mosaic/mosaic-oms/src/main/java /Users/milesressler/workspace/mosaic/mosaic-oms/src/main/proto/gtfs-realtime.proto`
