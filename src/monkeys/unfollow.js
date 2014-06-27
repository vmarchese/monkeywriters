/*
   MonkeyWriters Monkeys Module
   REST URI: /monkeys/info/:id
   Parameters: 
     id: 
   Method: POST
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
      "path" : "/monkeys/{monkeyid}/unfollow/{monkeyunfollowed}",
      "notes" : "Unfollows a Monkey",
      "summary" : "Unfollows a Monkey ",
      "method": "POST",
      "parameters" : [swagger.pathParam("monkeyid", "ID of monkey", "string"),
                      swagger.pathParam("monkeyunfollowed", "ID of monkey to unfollow", "string")
                      ],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "unfollowMonkey"
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

      var follower   = req.params.monkeyid;
      var unfollowed = req.params.monkeyunfollowed;

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

      // Searching monkey
      logger.log('info',"Looking for monkey:",follower);

      collection.findOne({"monkeyid":follower},function(err,monkeyfollower){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        if (monkeyfollower) {
          //  Found MONKEY FOLLOWER
          logger.log('debug',"Found follower monkey:",monkeyfollower);
          logger.log('info',"Following monkey:",unfollowed);
          collection.findOne({"monkeyid":unfollowed},function(err,monkeyunfollowed){
              if(err != null){
                res.send(500,"Error in inserting");
              }
              // Found monkey... now follow 
              if(monkeyunfollowed){
                //  Found MONKEY TOBEFOLLOWED
                logger.log('debug',"Found monkey to be unfollowed:",monkeyunfollowed);
                
                // UPDATING INTERNAL LISTS
                var ifollowed = monkeyfollower.following.indexOf(unfollowed);
                if(ifollowed != -1){
                  monkeyfollower.following.splice(ifollowed,1);
                }

                var ifollower = monkeyunfollowed.followers.indexOf(follower);
                if(ifollower != -1){
                  monkeyunfollowed.followers.splice(ifollower,1);
                }
                collection.update({"monkeyid":follower},monkeyfollower,function(err,result){
                   // ignore on errors
                   if(err != null){
                     logger.log('warn','Error in updating internal list');
                   }
                });
                collection.update({"monkeyid":unfollowed},monkeyunfollowed,function(err,result){
                   // ignore on errors
                   if(err != null){
                     logger.log('warn','Error in updating internal list');
                   }
                });

                // REMOVING FROM CHILD LISTS
                logger.debug('Removing from child lists');
                followings.remove({"monkeyid":follower, "follows":unfollowed},{w:1},function(erri, resulti){
                  if(erri != null){
                    res.send(500,"Error in removing");
                  }
                  logger.log('debug','Removed ',unfollowed,' to the list of followings of ',follower);
                  // now removing to followed back
                  followings.remove({"monkeyid":unfollowed, "followedby":follower},{w:1},function(errb, resultb){
                    if(errb != null){
                      res.send(500,"Error in removing");
                    }
                    logger.log('debug','Removed ',follower,' to the list of followed of ',unfollowed);
                  });
                });
                res.send(JSON.stringify('ok'));
              }else{
                res.send(404,JSON.stringify("Could not find Monkey:"+unfollowed));
              }
          });

        } else {
          res.send(404,JSON.stringify("Could not find Monkey:"+follower));
        }
      });
    }
  };

  swagger.addPost(info);

};

