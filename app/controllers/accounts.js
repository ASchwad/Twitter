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
//anzeigen aller User außer eingeloggtem User
exports.search = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;

    User.find({}).then(allUsers => {
      for (let x = 0; x < allUsers.length; x++) {
        if (allUsers[x].email.localeCompare(userEmail) == 0) {
          delete allUsers[x];
        }
      }

      reply.view('search', { title: 'Search User', users: allUsers });
    }).catch(err => {
      reply.redirect('/');
    });
  },
};

exports.follow = {

  handler: function (request, reply) {
    let userEmail = request.auth.credentials.loggedInUser;
    let data = request.payload;
    $('.special.cards .image').dimmer({
      on: 'hover'
    });
    User.findOne({ email: userEmail }).then(foundUser => { //eintrag für Following
              var x = foundUser.following.length;
              for (let i = 0; i < x; i++) {
                if (foundUser.following[i].localeCompare(data.selectedUserMail) == 0) {
                  return null;
                }
              }

              foundUser.following.set(x, data.selectedUserMail);
              foundUser.markModified(foundUser.following);
              return foundUser.save();
            }).then(User.findOne({ email: data.selectedUserMail }).then(selectedUser => { //eintrag für followers
              var x = selectedUser.followers.length;
              for (let i = 0; i < x; i++) {
                if (selectedUser.followers[i].localeCompare(userEmail) == 0) {
                  return null;
                }
              }

              selectedUser.followers.set(x, userEmail);
              selectedUser.markModified(selectedUser.following);
              return selectedUser.save();
            })).then(foundUser => {
              reply.redirect('/search', { title: 'Search User', });
            });
  },
};
//verwenden von Splice da Datenbank sonst nicht speichert (schneidet den Index aus und verschiebt
//die folgenden Indizies nach vorne
exports.deFollow = {

  handler: function (request, reply) {
    let userEmail = request.auth.credentials.loggedInUser;
    let data = request.payload;
    User.findOne({ email: userEmail }).then(foundUser => { //wenn enthalten, löschen
      var x = foundUser.following.length;
      for (let i = 0; i < x; i++) {
        if (foundUser.following[i].localeCompare(data.selectedUserMail) == 0) {

          foundUser.following.splice(i, 1);
          foundUser.markModified(foundUser.following);
          return foundUser.save((error3) => {
            if (error3) {
              return handleError(error3);
            }

            console.log('Successfully saved');
          });
        }
      }

      return null;
    }).then(User.findOne({ email: data.selectedUserMail }).then(selectedUser => { //eintrag für followers
      var x = selectedUser.followers.length;
      for (let i = 0; i < x; i++) {
        if (selectedUser.followers[i].localeCompare(userEmail) == 0) {
          selectedUser.followers.splice(i, 1);
          selectedUser.markModified(selectedUser.followers);
          return selectedUser.save();
        }
      }

      return null;
    })).then(foundUser => {
      reply.redirect('/search', { title: 'Search User', });
    });
  },
};

exports.personalTimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    Tweet.find({ email: userEmail }).then(allTweets => {
      User.findOne({ email: userEmail }).then(foundUser => {
        var fullName = foundUser.firstName + ' ' + foundUser.lastName;

        for (let i = 0; i < foundUser.followers.length; i++) { // durchgehen der Follower, nachschlagen der Namen und abspeichern im Array statt email
          User.findOne({ email: foundUser.followers[i] }).then(currentFollower => {
            foundUser.followers[i] = ' ' + currentFollower.firstName + ' ' + currentFollower.lastName;
          });
        };

        for (let i = 0; i < foundUser.following.length; i++) {
          User.findOne({ email: foundUser.following[i] }).then(currentFollowing => {
            foundUser.following[i] = ' ' + currentFollowing.firstName + ' ' + currentFollowing.lastName;
          });
        };

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
        for (let i = 0; i < foundUser.followers.length; i++) { // durchgehen der Follower, nachschlagen der Namen und abspeichern im Array statt email
          User.findOne({ email: foundUser.followers[i] }).then(currentFollower => {
            foundUser.followers[i] = ' ' + currentFollower.firstName + ' ' + currentFollower.lastName;
          });
        };

        for (let i = 0; i < foundUser.following.length; i++) {
          User.findOne({ email: foundUser.following[i] }).then(currentFollowing => {
            foundUser.following[i] = ' ' + currentFollowing.firstName + ' ' + currentFollowing.lastName;
          });
        };

        reply.view('otherTimeline', {
          title: 'Discover',
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

exports.globalTimeline = {

  handler: function (request, reply) {
    var data = request.payload;
    Tweet.find().then(allTweets => {
      reply.view('globalTimeline', {
        title: 'Global Timeline',
        tweets: allTweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

exports.aggregatedTimeline = {

  handler: function (request, reply) {
    var userEmail = request.auth.credentials.loggedInUser;
    Tweet.find().then(allTweets => {
      User.findOne({ email: userEmail }).then(foundUser => { //sieht zu jedem Tweet nach, ob dem Verfasser des Tweets vom eingeloggtem Nutzer gefolgt wird
          for (let i = 0; i < allTweets.length; i++) {
            var elementGefunden;
            for (let x = 0; x < foundUser.following.length; x++) {
              elementGefunden = new Boolean(false);
              var tweetCreator = allTweets[i].email;
              if (tweetCreator.localeCompare(foundUser.following[x]) == 0) {
                elementGefunden = true;
                break;
              }
            }

            if (elementGefunden == false) {
              delete allTweets[i];
            }
          }
        });
      reply.view('aggregatedTimeline', {
        title: 'Your Network',
        tweets: allTweets,
      });
    }).catch(err => {
      reply.redirect('/');
    });
  },

};

