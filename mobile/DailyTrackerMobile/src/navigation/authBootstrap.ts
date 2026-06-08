import { AuthService } from '../features/auth/authService';
import {
  AppRoute,
  AuthNavigationState,
  buildAuthNavigationState,
  canAccessRoute,
  resolveInitialRoute,
} from './appNavigator';

export interface NavigationBootstrapResult {
  initialRoute: AppRoute;
  authState: AuthNavigationState;
}

export async function bootstrapNavigation(
  auth: AuthService,
  preferredRoute?: AppRoute,
): Promise<NavigationBootstrapResult> {
  const authState = await buildAuthNavigationState(auth);

  if (preferredRoute && canAccessRoute(preferredRoute, authState)) {
    return {
      initialRoute: preferredRoute,
      authState,
    };
  }

  const initialRoute = await resolveInitialRoute(auth);
  return {
    initialRoute,
    authState,
  };
}
