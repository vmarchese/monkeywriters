/*
   MonkeyWriters Stories Module
   Exported REST URI: 
    /stories/stream
*/
// Logging 
var loggerModule = require('../logger/logger');
var logger = loggerModule.logger;
var util = require('../util/util');
var passport = require('passport');


module.exports =  function(app,mongo,config){

  // INSERT URI
  app.get('/stories/stream', 
   function(req,resp){

     // IMPLEMENTATION HERE
  });
};
