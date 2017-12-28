'use strict';
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');

exports.home = {

  handler: function (request, reply) {
    reply.view('home');
  },

};

exports.tweet = {

  validate: {
    options: {
      abortEarly: false,
    },
    payload: {
      tweetText: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.redirect('/timeline', {
        title: 'Insert Text to Tweet',
        errors: error.data.details,
      }).code(400);
    },

  },

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
      var hours = x.getHours();
      var minutes = x.getMinutes();
      tweet.email = userEmail;
      tweet.timeUI = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;


      console.log(tweet);
      tweet.save().then(newTweet => {
        reply.redirect('/timeline');
      });
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