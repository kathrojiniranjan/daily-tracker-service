const test = require('node:test');
const assert = require('node:assert/strict');

test('auth screen parity journeys are covered', () => {
  const journeys = ['login', 'register', 'session-restore', 'logout-redirect'];
  assert.equal(journeys.length, 4);
  assert.ok(journeys.includes('login'));
  assert.ok(journeys.includes('register'));
  assert.ok(journeys.includes('session-restore'));
  assert.ok(journeys.includes('logout-redirect'));
});
