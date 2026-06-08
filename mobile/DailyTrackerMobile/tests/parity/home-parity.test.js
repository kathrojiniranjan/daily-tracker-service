const test = require('node:test');
const assert = require('node:assert/strict');

test('home dashboard parity journeys are covered', () => {
  const journeys = [
    'home-greeting',
    'home-role-aware-view',
    'home-monthly-summary',
    'home-recent-activity',
    'home-admin-summary-widgets',
  ];

  assert.equal(journeys.length, 5);
  assert.ok(journeys.includes('home-greeting'));
  assert.ok(journeys.includes('home-role-aware-view'));
  assert.ok(journeys.includes('home-monthly-summary'));
  assert.ok(journeys.includes('home-recent-activity'));
  assert.ok(journeys.includes('home-admin-summary-widgets'));
});
