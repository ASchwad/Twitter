'use strict';
const dateFormat = require('dateformat');
const Tweet = require('../models/tweet');
const User = require('../models/user');

exports.home = {

  handler: function (request, reply) {
    reply.view('home');
  },

};

exports.tweet = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(user => {
      let data = request.payload;
      const tweet = new Tweet(data);
      tweet.firstName = user.firstName;
      tweet.lastName = user.lastName;
      tweet.time = new Date();
      var x = new Date();
      var year = x.getFullYear();
      var month = x.getMonth();
      month = month + 1;
      var day = x.getDate();
      tweet.email = userEmail;
      tweet.timeUI = day + '/' + month + '/' + year;
      console.log(tweet);
      tweet.save().then(newTweet => {
        reply.redirect('/timeline');
      });
    });
  },
};
exports.personalTimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    Tweet.find({ email: userEmail}).then(allTweets => {
      reply.view('timeline', {
        title: 'All your Tweets',
        tweets: allTweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.delete = {
  handler: function (request, reply) {
    var ObjectId = require('mongodb').ObjectId;
    var o_id = ObjectId(request.payload.Object_id);
    Tweet.remove({ _id: o_id }).then(newTweet => {
        reply.redirect('/timeline');
      });
  },
};