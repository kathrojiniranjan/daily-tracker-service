/**
 * The currently authenticated user, as we track it in the client.
 * Mirrors what we'd get back from POST /api/auth/login.
 */
export interface AuthUser {
  username: string;
  role: string;
  token: string;
  expiresAtUtc: string;
}
