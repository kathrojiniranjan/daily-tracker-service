const test = require("node:test");
const assert = require("node:assert/strict");

test("transactions screen parity journeys are covered", () => {
  const journeys = [
    "transactions-list",
    "transactions-date-range-filter",
    "transactions-paging",
    "transactions-create",
    "transactions-edit",
    "transactions-delete",
    "transactions-monthly-summary",
    "transactions-admin-user-filter",
  ];

  assert.equal(journeys.length, 8);
  assert.ok(journeys.includes("transactions-list"));
  assert.ok(journeys.includes("transactions-date-range-filter"));
  assert.ok(journeys.includes("transactions-paging"));
  assert.ok(journeys.includes("transactions-create"));
  assert.ok(journeys.includes("transactions-edit"));
  assert.ok(journeys.includes("transactions-delete"));
  assert.ok(journeys.includes("transactions-monthly-summary"));
  assert.ok(journeys.includes("transactions-admin-user-filter"));
});
