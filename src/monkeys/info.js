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

      var monkey;


      if (monkey) {
        res.send(JSON.stringify(monkey));
      } else {
        throw swagger.errors.notFound('monkey');
      }
    }
  };

  swagger.addGet(info);


};
