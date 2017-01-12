'use strict';

var should = require('should');
var request = require('supertest');
var config = require('./config');
var mockData = require('./mock_data');
var TIMEOUT = 10000;// for slower network

describe('API', function() {
  var url = config.baseUrl;
  it('should be able to search by Id', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserId='+mockData.user.akansh.user_id)
      .end(function(err, res){
        if(err) throw err;
        res.text.length.should.be.greater;
        res.status.should.be.ok();
        done();
      });
  });

  it('should be able to search by username', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserName='+mockData.user.akansh.screen_name)
      .end(function(err, res){
        if(err) throw err;
        res.status.should.be.ok();
        done();
      });
  });

  it('should give error if id is not integer', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserId='+mockData.user.invalidId)
      .end(function(err, res){
        if(err) throw err;
        res.status.should.equal(400);
        done();
      });
  });


  it('should get error if id is not found', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserId='+mockData.user.unRegisteredUser.user_id)
      .end(function(err, res){
        if(err) throw err;
        res.status.should.equal(404);
        done();
      });
  });

  it('should get error message if username is not found', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserId='+mockData.user.unRegisteredUser.screen_name)
      .end(function(err, res){
        if(err) throw err;
        res.status.should.equal(400);
        done();
      });
  });

  it('should not be able to search by username and id both', function(done){
    this.timeout(TIMEOUT);
    request(url)
      .get('/?searchByUserId='+mockData.user.akansh.user_id+'&searchByUserName='+mockData.user.akansh.screen_name)
      .end(function(err, res){
        if(err) throw err;
        res.status.should.equal(400);
        done();
      });
  });
});
