export type AppRoute =
  | 'Login'
  | 'Register'
  | 'Home'
  | 'Items'
  | 'Transactions'
  | 'AdminUsers';

export const appRouteMap: AppRoute[] = [
  'Login',
  'Register',
  'Home',
  'Items',
  'Transactions',
  'AdminUsers',
];

export interface AuthNavigationState {
  isAuthenticated: boolean;
  role?: string;
}

export interface AuthBootstrapPort {
  restoreSession(): Promise<unknown>;
  isLoggedIn(): boolean;
  getSession(): { role?: string } | null;
}

export async function resolveInitialRoute(auth: AuthBootstrapPort): Promise<AppRoute> {
  await auth.restoreSession();

  if (!auth.isLoggedIn()) {
    return 'Login';
  }

  return 'Home';
}

export function canAccessRoute(route: AppRoute, state: AuthNavigationState): boolean {
  if (route === 'Login' || route === 'Register') {
    return !state.isAuthenticated;
  }

  if (!state.isAuthenticated) {
    return false;
  }

  if (route === 'AdminUsers') {
    return state.role === 'Admin';
  }

  return true;
}

export async function buildAuthNavigationState(
  auth: AuthBootstrapPort,
): Promise<AuthNavigationState> {
  await auth.restoreSession();
  const session = auth.getSession();

  return {
    isAuthenticated: auth.isLoggedIn(),
    role: session?.role,
  };
}
