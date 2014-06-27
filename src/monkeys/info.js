/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/info/:id
   Parameters: 
     id: 
   Method: GET
   Description: Returns the Monkey Info if public or an empty JSON otherwise
*/
// Logging 
var loggerModule = require('../logger/logger');
var logger = loggerModule.logger;
//var util = require('../util/util');
var passport = require('passport');

/*

var getMonkeyById = function(app,mongo,config){
    app.get('/monkeys/info/:monkeyid',function(req,res){

      // Getting collection from Mongo
      var collection = mongo.collection('monkeys');
      if(null == collection){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for monkey:",req.params.monkeyid);
      collection.findOne({"monkeyid":req.params.monkeyid},function(err,themonkey){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        logger.log('debug',"Found monkey:",themonkey);
        if (themonkey) {
          res.send(JSON.stringify(themonkey));
        } else {
          res.send(404,"Could not find Monkey:"+req.params.monkeyid);
        }
      });
    });
}

module.exports= getMonkeyById;
*/



module.exports =  function(app,mongo,config,swagger){


  var info = {
    'spec': {
      "description" : "Operations about Monkeys",
      "path" : "/monkeys/info/{monkeyid}",
      "notes" : "Returns a Monkey Profile based on ID",
      "summary" : "Find Monkey by ID",
      "method": "GET",
      "parameters" : [swagger.pathParam("monkeyid", "ID of pet that needs to be fetched", "string")],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "getMonkeyById"
     /*
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
      logger.log('info',"Looking for monkey:",req.params.monkeyid);
      collection.findOne({"monkeyid":req.params.monkeyid},function(err,themonkey){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        logger.log('debug',"Found monkey:",themonkey);
        if (themonkey) {
          res.send(JSON.stringify(themonkey));
        } else {
//          throw swagger.errors.notFound('monkeyid');
          res.send(404,JSON.stringify("Could not find Monkey:"+req.params.monkeyid));
        }
      });

    }
  };

  swagger.addGet(info);

};

