import React from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AppRoute, AuthNavigationState } from "../navigation/appNavigator";

export type AuthenticatedShellProps = {
  route: AppRoute;
  authState: AuthNavigationState;
  stackDepth: number;
  canGoBack: boolean;
  onBack: () => void;
  onNavigate: (route: AppRoute) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export function AuthenticatedShell({
  route,
  authState,
  stackDepth,
  canGoBack,
  onBack,
  onNavigate,
  onLogout,
  children,
}: AuthenticatedShellProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text style={styles.title}>DailyTracker Mobile</Text>
          <Text style={styles.meta}>Route: {route}</Text>
          <Text style={styles.meta}>Stack depth: {stackDepth}</Text>
          <Text style={styles.meta}>Role: {authState.role ?? "User"}</Text>
        </View>

        <View style={styles.content}>{children}</View>

        <View style={styles.navSection}>
          <Button title="Back" onPress={onBack} disabled={!canGoBack} />
          <Button title="Home" onPress={() => onNavigate("Home")} />
          <Button title="Items" onPress={() => onNavigate("Items")} />
          <Button
            title="Transactions"
            onPress={() => onNavigate("Transactions")}
          />
          <Button
            title="Admin Users"
            onPress={() => onNavigate("AdminUsers")}
          />
          <Button title="Logout" onPress={onLogout} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 20,
  },
  shell: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  meta: {
    color: "#4b5563",
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
  },
  navSection: {
    gap: 8,
  },
});
