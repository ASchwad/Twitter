const mongoose = require('mongoose');
const tweetSchema = mongoose.Schema({
  time: Date,
  timeUI: String,
  tweetText: String,
  firstName: String,
  lastName: String,
  email: String,
  picture_src: String,
  picture_id: String,
});
const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;
