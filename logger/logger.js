/*
/*
   MonkeyWriters Logger module
   Exported vars: 
    logger
*/

var config  = require('../config.json');
var winston = require('winston');


var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug' })
    ]
});

exports.logger = logger;

