const assert = require('assert');
import backendAPI from '../src/api/backend';

describe('backendAPI.', function() {
  describe('getUser()', function() {
    it('firt test response should be 200', async function() {
      const response = await backendAPI.getUser({ username: megumimegumi });
      assert(response.status === 200, 'response should be 200');
    });
  });
});