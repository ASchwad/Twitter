const Accounts = require('./app/controllers/accounts');
const Tweets = require('./app/controllers/tweets');
const Assets = require('./app/controllers/assets');

module.exports = [

  { method: 'GET', path: '/', config: Accounts.main },
  { method: 'GET', path: '/signup', config: Accounts.signup },
  { method: 'GET', path: '/login', config: Accounts.login },
  { method: 'POST', path: '/login', config: Accounts.authenticate },
  { method: 'POST', path: '/register', config: Accounts.register },
  { method: 'GET', path: '/logout', config: Accounts.logout },
  { method: 'GET', path: '/settings', config: Accounts.viewSettings },
  { method: 'POST', path: '/settings', config: Accounts.updateSettings },
  { method: 'GET', path: '/search', config: Accounts.search },
  { method: 'POST', path: '/search', config: Accounts.follow },
  { method: 'GET', path: '/globalTimeline', config: Accounts.globalTimeline },
  { method: 'GET', path: '/aggregatedTimeline', config: Accounts.aggregatedTimeline },
  { method: 'POST', path: '/otherTimeline', config: Accounts.otherTimeline },
  { method: 'GET', path: '/timeline', config: Accounts.personalTimeline },


  { method: 'GET', path: '/home', config: Tweets.home },
  { method: 'POST', path: '/timeline', config: Tweets.delete },
  { method: 'POST', path: '/tweet', config: Tweets.tweet },

  {
    method: 'GET',
    path: '/{param*}',
    config: { auth: false },
    handler: Assets.servePublicDirectory,
  },

];