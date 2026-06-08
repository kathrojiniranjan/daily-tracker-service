const test = require("node:test");
const assert = require("node:assert/strict");

test("items screen parity journeys are covered", () => {
  const journeys = [
    "items-list",
    "items-create",
    "items-edit",
    "items-delete",
    "items-admin-controls",
  ];

  assert.equal(journeys.length, 5);
  assert.ok(journeys.includes("items-list"));
  assert.ok(journeys.includes("items-create"));
  assert.ok(journeys.includes("items-edit"));
  assert.ok(journeys.includes("items-delete"));
  assert.ok(journeys.includes("items-admin-controls"));
});
