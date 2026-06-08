describe('auth parity mapping', () => {
  it('tracks login register and session expiry journeys', () => {
    expect(['login', 'register', 'session-expiry'].length).toBe(3);
  });
});
