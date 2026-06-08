import { LoginRequest, RegisterRequest } from "../../api/contracts";
import {
  AppRoute,
  AuthNavigationState,
  canAccessRoute,
} from "../../navigation/appNavigator";
import {
  NavigationBootstrapResult,
  bootstrapNavigation,
} from "../../navigation/authBootstrap";
import { AuthService } from "./authService";

export interface AuthActionResult {
  route: AppRoute;
  authState: AuthNavigationState;
}

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  async bootstrap(
    preferredRoute?: AppRoute,
  ): Promise<NavigationBootstrapResult> {
    return bootstrapNavigation(this.auth, preferredRoute);
  }

  async login(input: LoginRequest): Promise<AuthActionResult> {
    await this.auth.login(input);
    const authState = await resolveAuthState(this.auth);
    return { route: "Home", authState };
  }

  async register(input: RegisterRequest): Promise<AuthActionResult> {
    await this.auth.register(input);
    const authState = await resolveAuthState(this.auth);
    return { route: "Home", authState };
  }

  async logout(): Promise<AuthActionResult> {
    await this.auth.logout();
    const authState = await resolveAuthState(this.auth);
    return { route: "Login", authState };
  }

  async ensureRouteAccess(route: AppRoute): Promise<AppRoute> {
    const authState = await resolveAuthState(this.auth);
    if (canAccessRoute(route, authState)) {
      return route;
    }

    return authState.isAuthenticated ? "Home" : "Login";
  }
}

async function resolveAuthState(
  auth: AuthService,
): Promise<AuthNavigationState> {
  await auth.restoreSession();
  const session = auth.getSession();

  return {
    isAuthenticated: auth.isLoggedIn(),
    role: session?.role,
  };
}
