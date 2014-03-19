# MonkeyWriters README 

MonkeyWriters Server project. This is the node.js server of MonkeyWriters, implementing the basic
authentication framework and the REST API for the project.



## Module Dependencies

1. [express] (https://github.com/visionmedia/express) HTTP Server and REST API 
2. [mongodb] (http://mongodb.github.com/node-mongodb-native/) MongoDB Connection
3. [passport] (http://passportjs.org/) Authentication Framework
4. [passport-http-bearer] (https://github.com/jaredhanson/passport-http-bearer) HTTP Bearer
5. [winston] (https://github.com/flatiron/winston) Logging Framework

## Directory Structure
```
--/
  |--server.js       (entry point)
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


