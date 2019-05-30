import { unmock } from 'unmock-node';
import backendAPI from '../../src/api/backend';

beforeEach(async () => unmock());

describe('backendAPI getUser()', () => {
  it('firt test response should be 200', async () => {
    const response = await backendAPI.getUser({ username: 'megumimegumi' });
    expect(response.status).to.equal(200);
  });
});
