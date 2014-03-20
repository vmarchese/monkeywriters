# MonkeyWriters README 

MonkeyWriters Server project. This is the node.js server of MonkeyWriters, implementing the basic
authentication framework and the REST API for the project.



## Module Dependencies

1. [express] (https://github.com/visionmedia/express) HTTP Server and REST API 
2. [mongodb] (http://mongodb.github.com/node-mongodb-native/) MongoDB Connection
3. [passport] (http://passportjs.org/) Authentication Framework
4. [passport-http-bearer] (https://github.com/jaredhanson/passport-http-bearer) HTTP Bearer
5. [winston] (https://github.com/flatiron/winston) Logging Framework
6. [url] (http://nodejs.org/api/url.html) node.js  URL Module
7. [swagger-node-express] (https://github.com/wordnik/swagger-node-express) Wordnik swagger implementation for the express framework


## REST API Automatic generation and Documentation
We use the Swagger spec and swagger-node-express auto-documentation framework.
In order to document the API:
1. Build a module for each endpoint (e.g. /monkeys/info.js) swagger-compliant
2. Add the module in the monkeyserver.js with a require directive


To access the REST API Docs, download [swagger-ui] (https://github.com/wordnik/swagger-ui), follow
the instructions to build it and point the UI to the public MonkeyWriters API Url 
(i.e. http://<server>:<port>/api-docs



## Directory Structure
```
--/
  |--monkeyserver.js (entry point)
  |--stories/        (REST API for Stories)
  |     |--stream.js (Example API for Stories Stream)
  |--README.md       (this file)
  |--logger/         (logger submodule)
  |     |--logger.js (implementation of logger)
  |--config.json     (Configuration File)
  |--package.json    (Package.json file)
```

## Configuration File Syntax
At present a config.json file is loaded by the server with the main configuration items.
There's probably a smarter way to do this for a multi-node installation (Zookeeper?).
```
{
  "mongo":{                
    "address":"127.0.0.1",   Mongo DB Bind address
    "port":27017             Mongo DB Bind Port
  },
  "app":{
    "address":"127.0.0.1",   MonkeyWriters Server Bind Address
    "port":8180              MonkeyWriters Server Bind Port
  },
  "logger":{
    "level":7                Not used at the moment
  }

}
```


