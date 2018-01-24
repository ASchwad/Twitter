'use strict';
const Tweet = require('../models/tweet');
const User = require('../models/user');
const Joi = require('joi');
const cloudinary = require('cloudinary');
const fs = require('fs');

try {
  cloudinary.config({
    /* INSERT ACCOUNT DETAILS HERE */
  });
}
catch (e) {
  process.exit(1);
}

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
      tweetText: Joi.string().min(1).max(150),
      tweetImage: Joi.object().optional(),

    },

    failAction: function (request, reply, source, error) {
      reply.view('/timeline', {
        title: 'Error while Tweeting',
        errors: error.data.details,
      }).code(400);
    },

  },

  payload: {
    maxBytes: 209715200,
    output: 'stream',
    allow: 'multipart/form-data', // important
  },

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(user => {
      let data = request.payload;
      if (data.tweetImage.hapi.filename !== '') {
        /*
            Tweet includes picture
          */
        console.log('Create new tweet with picture');
        var name =  data.tweetImage.hapi.filename;
        var dir = './tmp';

        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        var path = dir + '/' + name;
        var file = fs.createWriteStream(path);

        file.on('error', function (err) {
          console.error(err);
        });

        data.tweetImage.pipe(file);
        data.tweetImage.on('end', function (err) {
          cloudinary.uploader.upload(path, result => {
            const tweet = new Tweet({
              tweetText: data.tweetText,
              userEmail: userEmail,
              picture_id: result.public_id,
              picture_src: result.secure_url,
            });
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
            if (minutes < 10) {
              tweet.timeUI = day + '/' + month + '/' + year + ' ' + hours + ':0' + minutes;
            } else {
              tweet.timeUI = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
            };
            console.log(tweet);
            tweet.save().then(newTweet => {
              reply.redirect('/timeline');
            });
          });
        });
      }else {

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
        if (minutes < 10) {
          tweet.timeUI = day + '/' + month + '/' + year + ' ' + hours + ':0' + minutes;
        } else {
          tweet.timeUI = day + '/' + month + '/' + year + ' ' + hours + ':' + minutes;
        }

        console.log(tweet);
        tweet.save().then(newTweet => {
          reply.redirect('/timeline');
        });
      }
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
