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
      "path" : "/monkeys/{monkeyid}/follow/{monkeyfollowed}",
      "notes" : "Returns a Monkey Profile based on ID",
      "summary" : "Find Monkey by ID",
      "method": "POST",
      "parameters" : [swagger.pathParam("monkeyid", "ID of monkey", "string"),
                      swagger.pathParam("monkeyfollowed", "ID of monkey to follow", "string")
                      ],
      "type" : "Monkey",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "followMonkey"
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

      var follower = req.params.monkeyid;
      var followed = req.params.monkeyfollowed;

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
      logger.log('info',"Looking for monkey:",follower);

      collection.findOne({"monkeyid":follower},function(err,monkeyfollower){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        if (monkeyfollower) {
          //  Found MONKEY FOLLOWER
          logger.log('debug',"Found follower monkey:",monkeyfollower);
          logger.log('info',"Following monkey:",followed);
          collection.findOne({"monkeyid":followed},function(err,monkeyfollowed){
              if(err != null){
                res.send(500,"Error in inserting");
              }
              // Found monkey... now follow 
              if(monkeyfollowed){
                //  Found MONKEY TOBEFOLLOWED
                logger.log('debug',"Found monkey to be followed:",monkeyfollowed);

                // Ckecking that is not blocked
                blocks.findOne({"monkeyid":followed,"blocks":follower},function(errf,block){
                  if(block){
                    logger.log("error","Monkey:",follower," is blocked by ",followed);
                    res.send(404,JSON.stringify('Monkey:'+follower+' is blocked by '+followed));
                  }else{
                
                    // UPDATING INTERNAL LISTS
                    if(monkeyfollower.following.length < 20){
                      logger.log('debug','Followings is < 20... should update internal list too for ',monkeyfollower.monkeyid);
                      monkeyfollower.following[monkeyfollower.following.length] = monkeyfollowed.monkeyid;
                      // Updating cache list and ignoring on errors
                      collection.update({"monkeyid":follower},monkeyfollower,function(err,result){
                         // ignore on errors
                         if(err != null){
                           logger.log('warn','Error in updating internal list');
                         }
                      });
                    }
                    if(monkeyfollowed.followers.length < 20){
                      logger.log('debug','Followers is < 20... should update internal list too for ',monkeyfollowed.monkeyid);
                      monkeyfollowed.followers[monkeyfollowed.followers.length] = monkeyfollower.monkeyid;
                      // Updating cache list and ignoring on errors
                      collection.update({"monkeyid":followed},monkeyfollowed,function(err,result){
                         // ignore on errors
                         if(err != null){
                           logger.log('warn','Error in updating internal list');
                         }
                      });
                    }
                    
                    // CHILD LISTS
                    logger.debug('Adding child lists');
                    followings.update({"monkeyid":follower, "follows":followed},{"monkeyid":follower, "follows":followed},{upsert:true,w:1},function(erri, resulti){
                      if(erri != null){
                        res.send(500,"Error in inserting");
                      }
                      logger.log('debug','Added ',followed,' to the list of followings of ',follower);
                      // now adding to followed back
                      followings.update({"monkeyid":followed, "followedby":follower},{"monkeyid":followed, "followedby":follower},{upsert:true,w:1},function(errb, resultb){
                        if(errb != null){
                          res.send(500,"Error in inserting");
                        }
                        logger.log('debug','Added ',follower,' to the list of followed of ',followed);
                      });
                    });
                    res.send(JSON.stringify('ok'));
                  }
                });
              }else{
                res.send(404,JSON.stringify("Could not find Monkey:"+followed));
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

