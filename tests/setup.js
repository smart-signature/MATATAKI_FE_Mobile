global.expect = require('chai').expect;
global.axios = require('axios');
const https = require('https');
global.axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });
global.navigator = {
  userAgent: 'node.js',
};
// https://stackoverflow.com/questions/41772956/unit-testing-http-request-with-vue-axios-and-mocha
