/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/:monkey/unblock/:id
   Parameters: 
     id: 
   Method: POST
   Description: Unblocks a Monkey from block list
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
      "path" : "/monkeys/{monkeyid}/unblock/{monkeytounblock}",
      "notes" : "Unblocks a monkey",
      "summary" : "Unblocks a Monkey",
      "method": "POST",
      "parameters" : [swagger.pathParam("monkeyid", "ID of monkey", "string"),
                      swagger.pathParam("monkeytounblock", "ID of monkey to unblock", "string")
                      ],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "unblockMonkey"
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

      logger.log('debug','----------------- Follow --------------');

      var unblocker    = req.params.monkeyid;
      var tounblock  = req.params.monkeytounblock;

      // Getting collections from Mongo
      var collection = mongo.collection('monkeys');
      if(null == collection){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }


      var blocks = mongo.collection('monkeyblocks');
      if(null == blocks){
        logger.log('error',"monkeyblocks Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("monkeyblocks Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for monkey:",unblocker);

      collection.findOne({"monkeyid":unblocker},function(err,monkeyunblocker){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        if (monkeyunblocker) {
          //  Found MONKEY BLOCKER
          logger.log('debug',"Found unblocker monkey:",monkeyunblocker);
          logger.log('info',"unblocking monkey:",tounblock);
          collection.findOne({"monkeyid":tounblock},function(err,monkeyunblocked){
              if(err != null){
                res.send(500,"Error in finding monkey:",tounblock);
              }
              // Found monkey... now follow 
              if(monkeyunblocked){
                //  Found MONKEY TOBLOCK
                logger.log('debug',"Found monkey to be unblocked:",monkeyunblocked);

                // CHILD LISTS
                logger.debug('Removing from unblocked lists');
                blocks.remove({"monkeyid":unblocker, "blocks":tounblock},{w:1},function(erri, resulti){
                  if(erri != null){
                    res.send(500,"Error in removing");
                  }
                  logger.log('debug','Removed ',tounblock,' to the list of blocks of ',unblocker);
                });
                res.send(JSON.stringify('ok'));
              }else{
                res.send(404,JSON.stringify("Could not find Monkey:"+tounblock));
              }
          });

        } else {
          res.send(404,JSON.stringify("Could not find Monkey:"+unblocker));
        }
      });
    }
  };

  swagger.addPost(info);

};

