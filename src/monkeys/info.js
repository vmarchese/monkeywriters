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


module.exports =  function(app,mongo,config,swagger){


  var info = {
    'spec': {
      "description" : "Operations about pets",
      "path" : "/monkeys/info/{id}",
      "notes" : "Returns a Monkey Profile based on ID",
      "summary" : "Find Monkey by ID",
      "method": "GET",
      "parameters" : [swagger.pathParam("id", "ID of pet that needs to be fetched", "string")],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('id'), swagger.errors.notFound('monkey')],
      "nickname" : "getMonkeyById"
    },
    'action': function (req,res) {


      // Getting collection from Mongo
      var collection = mongo.collection('monkeys');
      if(null == collection){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for monkey:",req.params.id);
      collection.findOne({"monkeyid":req.params.id},function(err,themonkey){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        logger.log('debug',"Found monkey:",themonkey);
        if (themonkey) {
          res.send(JSON.stringify(themonkey));
        } else {
          throw swagger.errors.notFound('monkey');
        }
      });

    }
  };

  // GET 
  swagger.addGet(info);

};
