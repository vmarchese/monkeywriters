var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');
var config = require('./config.json');
var MongoClient = require('mongodb').MongoClient
   ,Server      = require('mongodb').Server;
var mongoClient = new MongoClient(new Server(config.mongo.address, config.mongo.port));

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: 'debug' })
    ]
});


describe('Monkeys', function() {
  var url    = config.url;
  var monkeyfollower   = config.monkeyfollower;
  var monkeyfollowed   = config.monkeyfollowed;
  var monkeyunfollower = config.monkeyunfollower;
  var monkeyblocker    = config.monkeyblocker;
  var monkeyblocked    = config.monkeyblocked;
  var monkeytoblock    = config.monkeytoblock;

  beforeEach(function(done) {
    mongoClient.open(function(err, mongoClient) {
      var db = mongoClient.db('test');

      var cMonkeys          = db.collection('monkeys');
      var cMonkeyFollowings = db.collection('monkeyfollowings');
      var cMonkeyBlocks     = db.collection('monkeyblocks');
      (null != cMonkeys).should.be.ok;
      (null != cMonkeyFollowings).should.be.ok;
      (null != cMonkeyBlocks).should.be.ok;

      // Clearing database
      cMonkeys.remove(null,{w:1},function(err,n){ 
         assert.equal(null,err);

         // Inserting monkeys
         cMonkeys.insert(config.monkeys,function(err,result){ 
            assert.equal(null,err);
            cMonkeyFollowings.remove(null,{w:1},function(err,n){ 
              assert.equal(null,err);
              cMonkeyFollowings.insert(config.followings,{w:1},function(err,n){ 
                assert.equal(null,err);
                 cMonkeyBlocks.remove(null,{w:1},function(err,n){ 
                   assert.equal(null,err);
                   cMonkeyBlocks.insert(config.blocks,{w:1},function(err,n){ 
                     assert.equal(null,err);
                     
                     
                     // Close connection
                     mongoClient.close();
                     
                     done();
                   });
                 });
              });
            });
         });
      });
    });
  });


  // INFO 
  describe('Info',function(){
    it('should get correct info for monkey '+monkeyfollower,function(done){
      var path = "/monkeys/info/"+monkeyfollower;
      request(url)
        .get(path)
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err,res){
          if (err){
            return done(err);
          }
          res.body.should.have.property('monkeyid');
          res.body.monkeyid.should.equal(monkeyfollower);
          res.body.should.have.property('name');
          res.body.should.have.property('surname');
          done();
        });
    });
  });

  // SEARCH 
  describe('Search',function(){
    it("should get correct list of monkeys with string 'le' in the query string" ,function(done){
      var path = "/monkeys/search/le";
      request(url)
        .get(path)
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err,res){
          if (err){
            return done(err);
          }

          res.body.should.containDeep([{"monkeyid":"lemur"},{"monkeyid":"howler"}]);
          done();
        });
    });
  });

  // FOLLOW 
  describe('Follow',function(){
    it('should have monkey '+monkeyfollower+' follow monkey '+monkeyfollowed, function(done){
      var followpath    = "/monkeys/"+monkeyfollower+"/follow/"+monkeyfollowed;
      var followerspath  = "/monkeys/"+monkeyfollowed+"/followers";
      var followingspath = "/monkeys/"+monkeyfollower+"/followings";
      // follow
      request(url)
        .post(followpath)
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err,res){ 
          if (err){
            return done(err);
          }
          // checking followers
          request(url)
            .get(followerspath)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err,res){
              if (err){
                 return done(err);
              }
              res.body.should.containDeep([{"monkeyid":monkeyfollowed,"followedby":monkeyfollower}]);

              //checking followings
              request(url)
                .get(followingspath)
                .set('Accept', 'application/json')
                .expect('Content-type', /json/)
                .expect(200)
                .end(function(err,res){
                  if (err){
                     return done(err);
                  }
                  res.body.should.containDeep([{"monkeyid":monkeyfollowed,"followedby":monkeyfollower}]);

                  done();
                });
            });
        });
    });
  });


  // UNFOLLOW 
  describe('Unfollow',function(){
    it('should have monkey '+monkeyunfollower+' unfollow monkey '+monkeyfollowed, function(done){
      var unfollowpath   = "/monkeys/"+monkeyunfollower+"/unfollow/"+monkeyfollowed;
      var followerspath  = "/monkeys/"+monkeyfollowed+"/followers";
      var followingspath = "/monkeys/"+monkeyunfollower+"/followings";
      // follow
      request(url)
        .post(unfollowpath)
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err,res){ 
          if (err){
            return done(err);
          }
          // checking followers
          request(url)
            .get(followerspath)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err,res){
              if (err){
                 return done(err);
              }
              res.body.should.not.containDeep([{"monkeyid":monkeyfollowed,"followedby":monkeyunfollower}]);

              //checking followings
              request(url)
                .get(followingspath)
                .set('Accept', 'application/json')
                .expect('Content-type', /json/)
                .expect(200)
                .end(function(err,res){
                  if (err){
                     return done(err);
                  }
                  res.body.should.not.containDeep([{"monkeyid":monkeyfollowed,"followedby":monkeyunfollower}]);

                  done();
                });
            });
        });
    });
  });

  // BLOCK 
  describe('Block',function(){
    it('should have monkey '+monkeyblocker+' block monkey '+monkeytoblock, function(done){
      var blockpath     = "/monkeys/"+monkeyblocker+"/block/"+monkeytoblock;
      var blockedbypath = "/monkeys/"+monkeyblocker+"/blockedby";
      // follow
      request(url)
        .post(blockpath)
        .set('Accept', 'application/json')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function(err,res){ 
          if (err){
            return done(err);
          }
          // checking followers
          request(url)
            .get(blockedbypath)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err,res){
              if (err){
                 return done(err);
              }
              res.body.should.containDeep([{"monkeyid":monkeyblocker,"blocks":monkeytoblock}]);

              done();
            });
        });
    });
  });

  // Check Block
  describe('Check Block',function(){
    it('should forbid '+monkeyblocked+' to follow '+monkeyblocker,function(done){
      var followpath = "/monkeys/"+monkeyblocked+"/follow/"+monkeyblocker;

      request(url)
       .post(followpath)
       .set('Accept', 'application/json')
       .expect('Content-type', /json/)
       .expect(404)
       .end(function(err,res){
          if (err){
            return done(err);
          }
          done();
       });

    });
  });

  // Check unblock
  describe('Check Unblock',function(){
    it('should permit to '+monkeyblocked+' to follow '+monkeyblocker+' after explicit unblocking',function(done){
      var followpath     = "/monkeys/"+monkeyblocked+"/follow/"+monkeyblocker;
      var unblockpath    = "/monkeys/"+monkeyblocker+"/unblock/"+monkeyblocked;
      var followerspath  = "/monkeys/"+monkeyblocker+"/followers";
      var followingspath = "/monkeys/"+monkeyblocked+"/followings";

      request(url)
       .post(unblockpath)
       .set('Accept', 'application/json')
       .expect('Content-type', /json/)
       .expect(200)
       .end(function(err,res){
          if (err){
            return done(err);
          }

          request(url)
            .post(followpath)
            .set('Accept', 'application/json')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function(err,res){ 
              if (err){
                return done(err);
              }
              // checking followers
              request(url)
                .get(followerspath)
                .set('Accept', 'application/json')
                .expect('Content-type', /json/)
                .expect(200)
                .end(function(err,res){
                  if (err){
                     return done(err);
                  }
                  res.body.should.containDeep([{"monkeyid":monkeyblocker,"followedby":monkeyblocked}]);
          
                  //checking followings
                  request(url)
                    .get(followingspath)
                    .set('Accept', 'application/json')
                    .expect('Content-type', /json/)
                    .expect(200)
                    .end(function(err,res){
                      if (err){
                         return done(err);
                      }
                      res.body.should.containDeep([{"monkeyid":monkeyblocker,"followedby":monkeyblocked}]);
          
                      done();
                    });
                });
            });
       });
    });
  });




});



