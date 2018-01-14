'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//let dbURI = 'mongodb://localhost/twitter';
let dbURI = 'mongodb://twitteruser:twitteruser@ds135817.mlab.com:35817/twitter';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);

  //if (process.env.NODE_ENV != 'production') {
    var seeder = require('mongoose-seeder');
    const data = require('./data.json');
    const Tweet = require('./tweet');
    const User = require('./user');
    seeder.seed(data, { dropDatabase: true, dropCollections: true }).then(dbData => {
    }).catch(err => {
      console.log(error);
    });
  //}
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});
