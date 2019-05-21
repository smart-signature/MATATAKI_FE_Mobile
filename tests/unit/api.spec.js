import { assert } from 'chai';
import backendAPI from '@/api/backend';

describe('backendAPI getUser()', () => {
  it('firt test response should be 200', async () => {
    const response = await backendAPI.getUser({ username: 'megumimegumi' });
    assert(response.status === 200, 'response should be 200');
  });
});
