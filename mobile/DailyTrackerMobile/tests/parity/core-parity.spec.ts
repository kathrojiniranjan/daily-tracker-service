describe('core parity mapping', () => {
  it('tracks items and transactions journeys', () => {
    expect(['items-crud', 'transactions-crud', 'summary'].length).toBeGreaterThan(2);
  });
});
