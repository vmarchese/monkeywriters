/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/search/:string
   Parameters: 
     string: 
   Method: GET
   Description: Returns the Monkey Info if public or an empty JSON otherwise
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
      "path" : "/monkeys/search/{monkeyq}",
      "notes" : "Returns a List of Monkey Profiles based on search string (on username)",
      "summary" : "Find Monkey by username",
      "method": "GET",
      "parameters" : [swagger.pathParam("monkeyq", "username or part of a username monkeys that needs to be fetched", "string")],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyq'), swagger.errors.notFound('monkey')],
      "nickname" : "getMonkeyByUsername"/*,
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


      // Getting collection from Mongo
      var collection = mongo.collection('monkeys');
      if(null == collection){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for monkey:",".*"+req.params.monkeyq+".*");
      collection.find({"monkeyid":{ $regex: ".*"+req.params.monkeyq+".*"} }).toArray(function(err,themonkeys){
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
