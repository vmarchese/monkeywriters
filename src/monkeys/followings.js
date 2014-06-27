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
      "path" : "/monkeys/{monkeyid}/followings",
      "notes" : "Returns a List of Followings of Monkey",
      "summary" : "Find Monkey's Followings ",
      "method": "GET",
      "parameters" : [swagger.pathParam("monkeyid", "username of the following monkey", "string")],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkey')],
      "nickname" : "getMonkeyFollowings"/*,
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
      var collection = mongo.collection('monkeyfollowings');
      if(null == collection){
        logger.log('error',"MonkeyFollowings Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("MonkeyFollowings Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for followers of monkey:",monkey);
      collection.find({"followedby":monkey }).toArray(function(err,themonkeys){
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
