var twitter = require('../lib/twitter');
var daysEnum = require('../models/day');
var _ = require('lodash');
var utils = require('../lib/utils');

exports.search = function(req,res) {
  var maxDay = '',maxTime = '';
  // Handling cases
  if(!req.query.searchByUserName && !req.query.searchByUserId) {
    var response = {
      searchUserId : '',
      searchUserName : '',
      maxTime : maxTime,
      maxDay :  maxDay
    }
    res.render('user.ejs',response);
  }
  else if(req.query.searchByUserName && req.query.searchByUserId) {
    return res.status(utils.statusCode.bad_request).send({err : 'You can either search by Id or Username'});
  }
  else {
    let criteria = {};
    if(req.query.searchByUserName) {
      criteria.screen_name = req.query.searchByUserName;
    }
    if(req.query.searchByUserId) {
      criteria.user_id = req.query.searchByUserId;
      // Checking whether id is valid or not
      var id = utils.sanitizeNumber(req.query.searchByUserId);
      if(!id) {
        return res.status(utils.statusCode.bad_request).send({err : 'Please enter id in numbers'});
      }
    }

    let searchUserName = (req.query.searchByUserName) ? req.query.searchByUserName : '';
    let searchUserId = (req.query.searchByUserId) ? req.query.searchByUserId : '';
    // twitter call to fetch data
    twitter.getUser(criteria,function(err,doc)  {
      if(err || !doc) {
         return res.status(utils.statusCode.not_found).send({err : err});
      }
      // Formatting date and time
      if(!_.isEmpty(doc) && doc.maxDay && doc.maxDay>=0) {
        maxDay = daysEnum.DaysEnum[doc.maxDay];
      }
      if(!_.isEmpty(doc) && doc.maxTime && doc.maxTime>=0) {
        maxTime = utils.convertTime(doc.maxTime+1);
      }
      // IF user not found
      if(doc.maxTime === -1 && doc.maxDay === -1) {
        return res.status(utils.statusCode.not_found).send({err : 'User not found'});
      }
      var response = {
        searchUserId : searchUserId,
        searchUserName : searchUserName,
        maxDay : maxDay,
        maxTime : maxTime
      }
      res.render('user.ejs',response);
    })
  }
}
 

// NOTE : Using promise but seems there is some issue with npm module

// exports.search = (req,res) => {
//   if(!req.query.searchByUserName && !req.query.searchByUserId) {
//     res.render('user.ejs',{searchUserId : '',searchUserName : ''});
//     return null;
//   }
//   else {
//     let criteria = {};
//     if(req.query.searchByUserName) {
//       criteria.screen_name = req.query.searchByUserName;
//     }
//     if(req.query.searchByUserId) {
//       criteria.user_id = req.query.searchByUserId;
//     }
//     let searchUserName = (req.query.searchByUserName) ? req.query.searchByUserName : '';
//     let searchUserId = (req.query.searchByUserId) ? req.query.searchByUserId : '';
//     return twitter.getUser(criteria).then(doc => {
//       if(!doc) { 
//         throw new Error('No result found');
//       }
//       res.render('user.ejs',{searchUserId : searchUserId,searchUserName : searchUserName});
//       return null;
//     }).catch(err => {
//         return res.status(404).send({err : err.message});
//     })
//   }
// }