/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/blockedby/:string
   Parameters: 
     string: 
   Method: GET
   Description: Returns list of monkeys blocked by a monkey
*/
// Logging 
var loggerModule = require('../logger/logger');
var logger = loggerModule.logger;
//var util = require('../util/util');
var passport = require('passport');


module.exports =  function(app,mongo,config,swagger){


  var info = {
    'spec': {
      "description" : "Operations about Monkeys",
      "path" : "/monkeys/{monkeyid}/blockedby",
      "notes" : "Returns a List of  Monkeys blocked by a Monkey",
      "summary" : "Find Monkey's Blocks ",
      "method": "GET",
      "parameters" : [swagger.pathParam("monkeyid", "username of the monkey", "string")],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkey')],
      "nickname" : "getMonkeyBlocks"/*,
     "authorizations": {
            "oauth2": [
              {
                "scope": "test:anything",
                "description": "anything"
              }
            ]
          } 
          */
    },
    'action': function (req,res) {

      var monkey   = req.params.monkeyid;

      // Getting collection from Mongo
      var collection = mongo.collection('monkeyblocks');
      if(null == collection){
        logger.log('error',"MonkeyBlocks Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("MonkeyBlocks Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for blocks of monkey:",monkey);
      collection.find({"monkeyid":monkey }).toArray(function(err,themonkeys){
            if(err!=null){
              logger.log('error',"Error in getting monkeys:","err",err);
            }
            logger.log('debug',"Found monkeys:",themonkeys);
            if (themonkeys) {
              res.send(JSON.stringify(themonkeys));
            } else {
              res.send([]);
            }
      });


    }
  };

  // GET 
  swagger.addGet(info);

};
