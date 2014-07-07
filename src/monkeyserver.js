/*
   MonkeyWriter Main Entry Point
   Dependencies:
   - Express
   - Mongodb
   - Configuration file: config.json
*/

// Main variables and requirements
var express = require('express');
var url     = require('url');
var swagger = require('swagger-node-express');
var config  = require('./config.json');

var MongoClient = require('mongodb').MongoClient
   ,Server      = require('mongodb').Server;

//var passport = require('passport')
//  , BearerStrategy = require('passport-http-bearer').Strategy;
//var users    =require('./users/users');

// Logging 
var loggerModule = require('./logger/logger');
var logger = loggerModule.logger;

// Mongo DB Init.
var mongoClient = new MongoClient(new Server(config.mongo.address, config.mongo.port));
var mongo;

//  Passport
// TO BE ENABLED WHEN THE AUTHENTICATION FRAMEWORK IS DONE
/*
passport.use(new BearerStrategy({ },
  function(token, done) {
   // asynchronous validation, for effect...
   process.nextTick(function () {
     users.findByToken(mongo,token, function(err, user) {
      logger.log('debug',user);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
     })
   });
  }
));
*/


// Express App initialization
var app = express();
app.configure(function() {
//  app.use(passport.initialize()); // TO BE ENABLED WHEN THE AUTHENTICATION FRAMEWORK  IS DONE
  app.use(express.bodyParser());
  app.use(express.json());
  app.use(express.urlencoded());
});


swagger.setAppHandler(app);


// MongoDB Open and app startup. 
mongoClient.open(function(err, mongoClient) {

  // Opening connection to DB
  logger.log('info','Opening connection to mongodb to ',config.mongo.address,":",config.mongo.port);
  var db = mongoClient.db('test');
  logger.log('info','Connection opened');
  mongo = db;



  // REST API
  require('./monkeys/info.js')       (app,mongo,config,swagger);
  require('./monkeys/search.js')     (app,mongo,config,swagger);
  require('./monkeys/follow.js')     (app,mongo,config,swagger);
  require('./monkeys/unfollow.js')   (app,mongo,config,swagger);
  require('./monkeys/followers.js')  (app,mongo,config,swagger);
  require('./monkeys/followings.js') (app,mongo,config,swagger);
  require('./monkeys/block.js')      (app,mongo,config,swagger);
  require('./monkeys/unblock.js')    (app,mongo,config,swagger);
  require('./monkeys/blockedby.js')  (app,mongo,config,swagger);



  swagger.configureSwaggerPaths("", "api-docs", "")
  swagger.configure("http://"+config.app.address+":"+config.app.port, "1.0.0");

  logger.log('info','Starting app on ',config.app.address,':',config.app.port);
  app.listen(config.app.port,config.app.address);
  logger.log('info','Monkey Server started! Have Fun!');
});




