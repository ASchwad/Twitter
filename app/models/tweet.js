const mongoose = require('mongoose');
const tweetSchema = mongoose.Schema({
  time: Date,
  timeUI: String,
  tweetText: String,
  firstName: String,
  lastName: String,
  email: String,
});
const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
