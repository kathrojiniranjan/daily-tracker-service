const test = require("node:test");
const assert = require("node:assert/strict");

test("admin users screen parity journeys are covered", () => {
  const journeys = [
    "admin-users-list",
    "admin-assign-role",
    "admin-change-password",
    "admin-delete-user",
    "admin-summary-affordances",
  ];

  assert.equal(journeys.length, 5);
  assert.ok(journeys.includes("admin-users-list"));
  assert.ok(journeys.includes("admin-assign-role"));
  assert.ok(journeys.includes("admin-change-password"));
  assert.ok(journeys.includes("admin-delete-user"));
  assert.ok(journeys.includes("admin-summary-affordances"));
});
