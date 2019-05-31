import { unmock } from 'unmock-node';
import backendAPI from '../../src/api/backend';

let window;
beforeEach(async () => {
  window = (new JSDOM(``, {
    url: "http://localhost/",
    referrer: "http://localhost/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000,
    // runScripts: "outside-only"
  })).window;
  window.eval(`
    // This code executes in the jsdom global scope
    globalVariable = typeof XMLHttpRequest === "function";
    navigator = {
      userAgent: 'node.js',
    };
    // Date = Date;
  `);
  // unmock()
});

describe('backendAPI getUser()', () => {
  it('firt test response should be 200', async () => {
    const response = await backendAPI.getUser({ username: 'megumimegumi' });

    expect(response.status).to.equal(200);
  });
});
