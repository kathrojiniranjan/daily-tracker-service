import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
} from "react-native";
import { AuthController } from "./features/auth/authController";
import { AuthService } from "./features/auth/authService";
import { LoginScreen } from "./features/auth/loginScreen";
import { RegisterScreen } from "./features/auth/registerScreen";
import { AdminUsersScreen } from "./features/admin/adminUsersScreen";
import { HomeDashboardScreen } from "./features/home/homeDashboardScreen";
import { ItemsScreen } from "./features/items/itemsScreen";
import { TransactionsScreen } from "./features/transactions/transactionsScreen";
import { AuthenticatedShell } from "./layout/AuthenticatedShell";
import {
  AppRoute,
  AuthNavigationState,
  canAccessRoute,
} from "./navigation/appNavigator";
import { NavigationStack } from "./navigation/navigationStack";

type BootstrapState = "loading" | "ready";
const API_BASE_URL = "http://localhost:5088";

export function App(): React.JSX.Element {
  const authService = useMemo(
    () => new AuthService({ apiBaseUrl: API_BASE_URL }),
    [],
  );
  const authController = useMemo(
    () => new AuthController(authService),
    [authService],
  );

  const [bootstrapState, setBootstrapState] =
    useState<BootstrapState>("loading");
  const [route, setRoute] = useState<AppRoute>("Login");
  const [routeStack, setRouteStack] = useState<NavigationStack>(
    () => new NavigationStack("Login"),
  );
  const [authState, setAuthState] = useState<AuthNavigationState>({
    isAuthenticated: false,
  });

  useEffect(() => {
    void (async () => {
      const result = await authController.bootstrap();
      setRouteStack(new NavigationStack(result.initialRoute));
      setRoute(result.initialRoute);
      setAuthState(result.authState);
      setBootstrapState("ready");
    })();
  }, [authController]);

  const navigate = async (
    nextRoute: AppRoute,
    mode: "push" | "replace" = "push",
  ): Promise<void> => {
    const ensured = await authController.ensureRouteAccess(nextRoute);

    if (canAccessRoute(ensured, authState)) {
      const nextStack = new NavigationStack(routeStack.current());
      routeStack
        .snapshot()
        .slice(1)
        .forEach((r) => nextStack.push(r));
      const next =
        mode === "replace"
          ? nextStack.replace(ensured)
          : nextStack.push(ensured);
      setRouteStack(nextStack);
      setRoute(next);
      return;
    }

    const result = await authController.bootstrap(ensured);
    setRouteStack(new NavigationStack(result.initialRoute));
    setAuthState(result.authState);
    setRoute(result.initialRoute);
  };

  const goBack = (): void => {
    if (!routeStack.canGoBack()) {
      return;
    }
    const nextStack = new NavigationStack(routeStack.current());
    routeStack
      .snapshot()
      .slice(1)
      .forEach((r) => nextStack.push(r));
    const next = nextStack.back();
    setRouteStack(nextStack);
    setRoute(next);
  };

  const onLogout = async (): Promise<void> => {
    const result = await authController.logout();
    setRouteStack(new NavigationStack(result.route));
    setAuthState(result.authState);
    setRoute(result.route);
  };

  if (bootstrapState === "loading") {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading session...</Text>
      </SafeAreaView>
    );
  }

  if (route === "Login") {
    return (
      <LoginScreen
        authController={authController}
        onNavigate={(next) => {
          void navigate(next, "replace");
        }}
      />
    );
  }

  if (route === "Register") {
    return (
      <RegisterScreen
        authController={authController}
        onNavigate={(next) => {
          void navigate(next, "replace");
        }}
      />
    );
  }

  const content = renderAuthenticatedContent(
    route,
    authService,
    authState.role,
  );

  return (
    <AuthenticatedShell
      route={route}
      authState={authState}
      stackDepth={routeStack.snapshot().length}
      canGoBack={routeStack.canGoBack()}
      onBack={goBack}
      onNavigate={(next) => {
        void navigate(next);
      }}
      onLogout={() => {
        void onLogout();
      }}
    >
      {content}
    </AuthenticatedShell>
  );
}

function renderAuthenticatedContent(
  route: AppRoute,
  authService: AuthService,
  role?: string,
): React.JSX.Element {
  if (route === "Items") {
    return (
      <ItemsScreen
        authService={authService}
        apiBaseUrl={API_BASE_URL}
        userRole={role}
      />
    );
  }

  if (route === "Transactions") {
    return (
      <TransactionsScreen
        authService={authService}
        apiBaseUrl={API_BASE_URL}
        userRole={role}
      />
    );
  }

  if (route === "Home") {
    return (
      <HomeDashboardScreen
        authService={authService}
        apiBaseUrl={API_BASE_URL}
      />
    );
  }

  if (route === "AdminUsers") {
    return (
      <AdminUsersScreen
        authService={authService}
        apiBaseUrl={API_BASE_URL}
        userRole={role}
      />
    );
  }

  return (
    <>
      <Text style={styles.contentTitle}>{route}</Text>
      <Text style={styles.contentSubtitle}>
        Feature content is being migrated for this screen.
      </Text>
    </>
  );
}

export default App;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#374151",
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  contentSubtitle: {
    color: "#4b5563",
  },
});
