import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthService } from "../auth/authService";
import { AdminService } from "../admin/adminService";
import { TransactionsService } from "../transactions/transactionsService";
import { HomeDashboardModel, HomeDashboardState } from "./homeDashboardModel";
import { ErrorState, LoadingState } from "../../shared/statusStates";

const initialState: HomeDashboardState = {
  loading: false,
  greeting: "Hello",
  monthLabel: "",
  recentActivity: [],
};

export interface HomeDashboardScreenProps {
  authService: AuthService;
  apiBaseUrl?: string;
}

export function HomeDashboardScreen({
  authService,
  apiBaseUrl,
}: HomeDashboardScreenProps): React.JSX.Element {
  const model = useMemo(
    () =>
      new HomeDashboardModel(
        authService,
        new TransactionsService(authService, { apiBaseUrl }),
        new AdminService(authService, { apiBaseUrl }),
      ),
    [apiBaseUrl, authService],
  );
  const [state, setState] = useState<HomeDashboardState>(initialState);

  const refresh = async (): Promise<void> => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      setState(await model.load());
    } catch {
      setState(model.getState());
    }
  };

  useEffect(() => {
    void refresh();
  }, [model]);

  if (state.loading && !state.monthlySummary) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {state.greeting}
          {state.username ? `, ${state.username}` : ""}
        </Text>
        <Text style={styles.meta}>Role: {state.role ?? "User"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Monthly Summary ({state.monthLabel})
        </Text>
        <Text style={styles.metric}>
          Total: {state.monthlySummary?.total.toFixed(2) ?? "0.00"}
        </Text>
        <Text style={styles.metric}>
          Transactions: {state.monthlySummary?.transactionCount ?? 0}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {state.recentActivity.length === 0 ? (
          <Text style={styles.meta}>No activity in the current range.</Text>
        ) : (
          state.recentActivity.map((tx) => (
            <View key={tx.id} style={styles.row}>
              <Text style={styles.rowTitle}>{tx.dailyItemName}</Text>
              <Text style={styles.meta}>{tx.transactionDate}</Text>
              <Text style={styles.meta}>Amount: {tx.amount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      {state.role === "Admin" ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Summary</Text>
          <Text style={styles.metric}>
            Users: {state.adminSummary?.totalUsers ?? 0}
          </Text>
          <Text style={styles.metric}>
            Monthly Transactions:{" "}
            {state.adminSummary?.totalTransactionsThisMonth ?? 0}
          </Text>
          <Text style={styles.metric}>
            Monthly Amount:{" "}
            {state.adminSummary?.totalAmountThisMonth.toFixed(2) ?? "0.00"}
          </Text>
          <Text style={styles.meta}>Top Spenders</Text>
          {(state.adminSummary?.topSpenders ?? [])
            .slice(0, 5)
            .map((spender) => (
              <Text key={spender.username} style={styles.meta}>
                {spender.username}: {spender.total.toFixed(2)}
              </Text>
            ))}
        </View>
      ) : null}

      {state.error ? (
        <ErrorState message={state.error} onRetry={() => void refresh()} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    gap: 6,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },
  metric: {
    color: "#1f2937",
    fontSize: 15,
  },
  meta: {
    color: "#4b5563",
    fontSize: 13,
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 6,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
});
