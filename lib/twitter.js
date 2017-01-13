var Twitter = require('twitter');
var async = require('async');
var _ = require('lodash');
var utils = require('./utils');
//var Promise = require('bluebird');

var client = new Twitter({
  consumer_key: 'rmAet5KwWXb9DvTliKMkqHa5W',
  consumer_secret: '1XhEGyz10R4Bcwm1zLX40q53B6AlGGEx7YT7FEKzqjudJ1p6Ga',
  access_token_key: '141571506-fLjRyRVpIQRHBRkHeEzFl4sKa9NXmXbiUEAIWpxs',
  access_token_secret: 'qgPmXLGVSQXXP9HoUSwQ26B9rY2OTHSC371cLeu1Tgu8O'
});

exports.getUser = function(data,next)  {
	var list_criteria = _.clone(data);
	list_criteria.cursor = -1;
	list_criteria.count = 5000;	
	var time = [],days = [],followersIdList = [];
	var maxTime = {},maxDay = {};
	var number = 1;
	client.get('users/show', data,function(error,user,response) {
		if(error) {
			return next('User not found',null);
		}
		if(user.followers_count === 0) {
			return next('User have no followers',null);
		}
		number += Math.floor(user.followers_count/5000);
		async.series([
			function getFollowers(callback) {
				getAllFollowers(list_criteria,number,followersIdList,function() {
					return callback();
				});
			},
			function getLastPost(callback) {
				getLastPostOfAllFollowers(followersIdList,time,days,function() {
					return callback();
				});
			},
			function getMaxTime(callback) {
				getMaxValue(time,function(obj) {
					maxTime = obj;
					return callback();
				});
			},
			function getMaxDay(callback) {
				getMaxValue(days,function(obj) {
					maxDay = obj;
					return callback();
				});
			}
			],function() {
			return next(null,{maxTime : maxTime,maxDay : maxDay});
		});
	});
};

function getAllFollowers(list_criteria,number,followerList,done) {
	// sync loop to get all the followers
	async.timesSeries(number,function(num,cb)  {
		client.get('followers/ids', list_criteria,function(error,followers,response) {
			list_criteria.cursor = followers.next_cursor;
			followerList.push.apply(followerList,followers.ids);
			cb();
		});
	},function(err){
		if(err) {
			console.log(err);
		}
		done();
	});
}

function getLastPostOfAllFollowers(ids,time,days,done) {
	// it get all the followers last post in chunk of 100 users each
	var arrays = utils.getChunkedArrays(ids,100);
	async.forEach(arrays,function(users,cb)  {
		var crit = {user_id : users+"",include_entities : false};
		client.get('users/lookup',crit,function(err,tweets,resp) {
			async.forEach(tweets,function(tweet,cb2)  {
				if(!_.isEmpty(tweet) && !_.isEmpty(tweet.status)) {
					var timeOfDay = utils.getTimeOFDay(new Date(tweet.status.created_at));
					var dayInWeek = utils.getDayInWeek(new Date(tweet.status.created_at));
					time[timeOfDay] = (time[timeOfDay]) ? time[timeOfDay]+1 : 1;
					days[dayInWeek] = (days[dayInWeek]) ? days[dayInWeek]+1 : 1;
					cb2();
				}
				else {
					cb2();
				}
			},function(err){
				if(err) {
					console.log(err);
				}
				cb();
			});
		});
	},function(err){
		if(err) {
			console.log(err);
		}
		done();
	});
}

function getMaxValue(array,done) {
	var index = -1,maxValue=0,ind = 0;
	async.forEachSeries(array,function(value,cb)  {
		if(value>maxValue) {
			index = ind;
			maxValue = value;
			cb();
			ind++;
		}
		else {
			cb();
			ind++;
		}
	},function(err){
		if(err) {
			console.log(err);
		}
		done(index);
	});
}

//NOTE: Using Promise before but there is some issue may be with twiiter npm module itself.

// exports.getUser = (data) => {
	
// 	var list_criteria = _.clone(data);
// 	// list_criteria.cursor = -1;
// 	// list_criteria.count = 5000;	
// 	var time = [],days = [];
// 	console.log(list_criteria);
// 	return client.get('followers/ids', list_criteria).then(followers => {
// 		console.log('came first');
// 		if(_.isEmpty(followers)) {
// 			throw new Error('User have no followers');
// 		}

// 		return Promise.join(
// 		(!_.isEmpty(followers.ids)) ?
// 		Promise.map(followers.ids,user => {
// 			var crit = {user_id : user,count : 1};
// 			console.log(crit);
// 			return client.get('statuses/user_timeline',crit).then(tweet => {
// 				if(!_.isEmpty(tweet[0]) && tweet.length > 0) {
// 					console.log(tweet[0].created_at);
// 					var timeOfDay = utils.getTimeOFDay(new Date(tweet[0].created_at));
// 					var dayInWeek = utils.getDayInWeek(new Date(tweet[0].created_at));
// 					time[timeOfDay] = (time[timeOfDay]) ? time[timeOfDay]+1 : 1;
// 					days[dayInWeek] = (days[dayInWeek]) ? days[dayInWeek]+1 : 1;
// 					return Promise.resolve(null);
// 				}
// 				else {
// 					return Promise.resolve(null);
// 				}
// 			}).catch(err => {
// 				console.log('pro');
// 				console.log(err);
// 				throw err;
// 			});
// 		}) : null,user_tweets => {
// 			console.log(true);
// 			console.log(days);
// 			return Promise.resolve({time : time,days : days});
// 		}).catch(err => {
// 			console.log(err);
// 			throw err;
// 		})
// 	}).catch(err => {
// 		console.log(err);
// 		throw err;
// 		return Promise.reject(err);
// 	});
// };