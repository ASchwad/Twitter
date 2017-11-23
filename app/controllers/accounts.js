'use strict';

const User = require('../models/user');
const Joi = require('joi');
const Tweet = require('../models/tweet');

exports.main = {
  auth: false,
  handler: function (request, reply) {
    reply.view('main', { title: 'Welcome to Twitter' });
  },

};

exports.signup = {

  auth: false,
  handler: function (request, reply) {
    reply.view('signup', { title: 'Sign up' });
  },

};

exports.login = {

  auth: false,
  handler: function (request, reply) {
    reply.view('login', { title: 'Login to Tweet' });
  },

};

exports.register = {
  auth: false,

  validate: {
    options: {
      abortEarly: false,
    },
    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('signup', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

  },

  handler: function (request, reply) {
    const user = new User(request.payload);
    user.following[0] = user.email;
    user.save().then(newUser => {
      reply.redirect('/login');
    }).catch(err => {
      reply.redirect('/timeline');
    });
  },

};

exports.authenticate = {
  auth: false,

  validate: { //validate input errors (Blank fields or Email formatting)
    options: {
      abortEarly: false,
    },
    payload: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('login', {
        title: 'Sign up error',
        errors: error.data.details,
      }).code(400);
    },

  },
  handler: function (request, reply) {
    const user = request.payload;
    User.findOne({ email: user.email }).then(foundUser => {
      if (foundUser && foundUser.password === user.password) {
        request.cookieAuth.set({
          loggedIn: true,
          loggedInUser: user.email,
        });
        reply.redirect('/timeline');
      } else {
        reply.redirect('signup');
      }
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.logout = {
  auth: false,
  handler: function (request, reply) {
    request.cookieAuth.clear();
    reply.redirect('/');
  },

};

exports.viewSettings = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.findOne({ email: userEmail }).then(foundUser => {
      reply.view('settings', { title: 'Edit Account Settings', user: foundUser });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};
exports.updateSettings = {
  validate: {
    options: {
      abortEarly: false,
    },
    payload: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },

    failAction: function (request, reply, source, error) {
      reply.view('settings', {
        title: 'Edit Account Settings',
        errors: error.data.details,
      }).code(400);
    },

  },

  handler: function (request, reply) {
    const editedUser = request.payload;
    User.findOne({ email: request.auth.credentials.loggedInUser }).then(user => {
      user.firstName = editedUser.firstName;
      user.lastName = editedUser.lastName;
      user.email = editedUser.email;
      user.password = editedUser.password;
      return user.save();
    }).then(user => {
      request.cookieAuth.set({
        loggedIn: true,
        loggedInUser: user.email,
      });
      reply.view('settings', { title: 'Edit Account Settings', user: user });
    });
  },
};

exports.search = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    User.find({}).then(allUsers => {
      reply.view('search', { title: 'Search User', users: allUsers });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.follow = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    var data = request.payload;
    User.findOne({ email: userEmail }).then(foundUser => { //eintrag für Following
              var x = foundUser.following.length;
              foundUser.following.set(x, data.selectedUserMail);
              foundUser.markModified(foundUser.following);
              return foundUser.save();
            }).then(User.findOne({ email: data.selectedUserMail }).then(selectedUser => { //eintrag für followers
              var x = selectedUser.followers.length;
              selectedUser.followers.set(x, userEmail);
              selectedUser.markModified(selectedUser.following);
              return selectedUser.save();
            })).then(foundUser => {reply.view('search', { title: 'Search User',});
    });
  },
};

exports.personalTimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    Tweet.find({ email: userEmail }).then(allTweets => {
      User.findOne({ email: userEmail }).then(foundUser => {
        var fullName = foundUser.firstName + ' ' + foundUser.lastName;
        reply.view('timeline', {
          title: 'All your Tweets',
          tweets: allTweets,
          followers: foundUser.followers,
          following: foundUser.following,
          userFullName: fullName,
          email: foundUser.email,
        });
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.otherTimeline = {

  handler: function (request, reply) {
    var data = request.payload;
    Tweet.find({ email: data.selectedUserMail }).then(allTweets => {
      User.findOne({ email: data.selectedUserMail }).then(foundUser => {
        var fullName = foundUser.firstName + ' ' + foundUser.lastName;
        reply.view('otherTimeline', {
          title: 'All your Tweets',
          tweets: allTweets,
          followers: foundUser.followers,
          following: foundUser.following,
          userFullName: fullName,
          email: foundUser.email,
        });
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};