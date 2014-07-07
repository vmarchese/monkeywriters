/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/:monkey/block/:id
   Parameters: 
     id: 
   Method: POST
   Description: Blocks a monkey from future followings and removes it from the blockers list.
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
      "path" : "/monkeys/{monkeyid}/block/{monkeytoblock}",
      "notes" : "Blocks a monkey from following and removes it from the blockers' list",
      "summary" : "Blocks a Monkey",
      "method": "POST",
      "parameters" : [swagger.pathParam("monkeyid", "ID of monkey", "string"),
                      swagger.pathParam("monkeytoblock", "ID of monkey to block", "string")
                      ],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "blockMonkey"
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

      var blocker  = req.params.monkeyid;
      var toblock  = req.params.monkeytoblock;

      // Getting collections from Mongo
      var collection = mongo.collection('monkeys');
      if(null == collection){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }

      var followings = mongo.collection('monkeyfollowings');
      if(null == followings){
        logger.log('error',"monkeyfollowings Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("monkeyfollowings Collection not found. Something very wrong happened");
      }

      var blocks = mongo.collection('monkeyblocks');
      if(null == blocks){
        logger.log('error',"monkeyblocks Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("monkeyblocks Collection not found. Something very wrong happened");
      }

      // Searching monkey
      logger.log('info',"Looking for monkey:",blocker);

      collection.findOne({"monkeyid":blocker},function(err,monkeyblocker){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        if (monkeyblocker) {
          //  Found MONKEY BLOCKER
          logger.log('debug',"Found blocker monkey:",monkeyblocker);
          logger.log('info',"blocking monkey:",toblock);
          collection.findOne({"monkeyid":toblock},function(err,monkeyblocked){
              if(err != null){
                res.send(500,"Error in finding monkey:",toblock);
              }
              // Found monkey... now follow 
              if(monkeyblocked){
                //  Found MONKEY TOBLOCK
                logger.log('debug',"Found monkey to be blocked:",monkeyblocked);

                // Blocking monkey in internal list

                
                // UPDATING INTERNAL LISTS
                //TBD
                var iblocked = monkeyblocker.followers.indexOf(toblock);
                if(iblocked != -1){
                  monkeyblocker.followers.splice(iblocked,1);
                }

                var iblocker = monkeyblocked.following.indexOf(blocker);
                if(iblocker != -1){
                  monkeyblocked.following.splice(iblocker,1);
                }

                collection.update({"monkeyid":blocker},monkeyblocker,function(err,result){
                   // ignore on errors
                   if(err != null){
                     logger.log('warn','Error in updating internal list');
                   }
                });
                collection.update({"monkeyid":toblock},monkeyblocked,function(err,result){
                   // ignore on errors
                   if(err != null){
                     logger.log('warn','Error in updating internal list');
                   }
                });

                // REMOVING FROM CHILD LISTS
                logger.debug('Removing from child lists');
                followings.remove({"monkeyid":blocker, "followedby":toblock},{w:1},function(erri, resulti){
                  if(erri != null){
                    res.send(500,"Error in removing");
                  }
                  logger.log('debug','Removed ',toblock,' from the list of followers of ',blocker);
                  // now removing to blocked back
                  followings.remove({"monkeyid":toblock, "follows":blocker},{w:1},function(errb, resultb){
                    if(errb != null){
                      res.send(500,"Error in removing");
                    }
                    logger.log('debug','Removed ',blocker,' from the list of followings of ',toblock);
                  });
                });




                // CHILD LISTS
                logger.debug('Adding to blocked lists');
                blocks.update({"monkeyid":blocker, "blocks":toblock},{"monkeyid":blocker, "blocks":toblock},{upsert:true,w:1},function(erri, resulti){
                  if(erri != null){
                    res.send(500,"Error in inserting");
                  }
                  logger.log('debug','Added ',toblock,' to the list of blocks of ',blocker);
                });
                res.send(JSON.stringify('ok'));
              }else{
                res.send(404,JSON.stringify("Could not find Monkey:"+toblock));
              }
          });

        } else {
          res.send(404,JSON.stringify("Could not find Monkey:"+blocker));
        }
      });
    }
  };

  swagger.addPost(info);

};

