const CandidatesApi = require('./api/candidatesapi');

module.exports = [
  { method: 'GET', path: '/api/candidates', config: CandidatesApi.find },
  { method: 'GET', path: '/api/candidates/{id}', config: CandidatesApi.findOne },
  { method: 'POST', path: '/api/candidates', config: CandidatesApi.create },
  { method: 'DELETE', path: '/api/candidates/{id}', config: CandidatesApi.deleteOne },
  { method: 'DELETE', path: '/api/candidates', config: CandidatesApi.deleteAll },
];