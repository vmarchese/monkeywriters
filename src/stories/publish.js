/*
   MonkeyWriters Stories Module
   REST URI: /stories/:id/publish
   Parameters: 
     id: 
   Method: POST
   Description: Publish a story
*/
// Logging 
var loggerModule = require('../logger/logger');
var logger = loggerModule.logger;
//var util = require('../util/util');
var passport = require('passport');


module.exports =  function(app,mongo,config,swagger){


  var info = {
    'spec': {
      "description" : "Operations about Stories",
      "path" : "/stories/publish",
      "notes" : "Publishes a story",
      "summary" : "Publishes a story",
      "method": "POST",
      "parameters" : [
                       {"name":"body",
                        "description":"Story to be published",
                        "required":true,
                        "type":"string",
                        "paramType":"body"
                       }
                      ],
      "type" : "Story",
      "produces" : ["application/json"],
      "errorResponses" : [swagger.errors.invalid('monkeyid'), swagger.errors.notFound('monkeyid')],
      "nickname" : "publishStory"
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

      var jsonbody = JSON.stringify(req.body);
      var story     = JSON.parse(jsonbody);
      var publisher = story.monkeyid;
      logger.log('debug','STORY',story);
      logger.log('debug','     ');


      // Getting collections from Mongo
      var monkeys = mongo.collection('monkeys');
      if(null == monkeys){
        logger.log('error',"Monkeys Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Monkeys Collection not found. Something very wrong happened");
      }

      var stories = mongo.collection('stories');
      if(null == stories){
        logger.log('error',"monkeyfollowings Collection not found. Something very wrong happened");
        throw swagger.errors.notFound("Stories Collection not found. Something very wrong happened");
      }


      // Searching monkey
      logger.log('info',"Looking for monkey:",publisher);

      monkeys.findOne({"monkeyid":publisher},function(err,monkeypublisher){
        if(err!=null){
          logger.log('error',"Error in getting profile","err",err);
        }
        if (monkeypublisher) {
          logger.log('debug',"Found Publisher monkey:",monkeypublisher);
          // now publishing
          story.monkeyid = monkeypublisher.monkeyid;
          stories.insert(story,{w:1},function(err,result){
            if(err!=null){
              logger.log('error',"Error in inserting story","err",err);
              res.send(500,JSON.stringify("Error in publishing story by: "+publisher));
            }
            res.send(200,JSON.stringify("Story '"+story.title+"' published"));

          });

        } else {
          res.send(404,JSON.stringify("Could not find Monkey:"+publisher));
        }
      });
    }
  };

  swagger.addPost(info);

};

