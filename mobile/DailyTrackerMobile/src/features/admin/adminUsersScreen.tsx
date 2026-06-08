import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { UserSummary } from '../../api/contracts';
import { AuthService } from '../auth/authService';
import { AdminService } from './adminService';
import { AdminUsersScreenModel, AdminUsersScreenState } from './adminUsersScreenModel';
import { EmptyState, ErrorState, LoadingState } from '../../shared/statusStates';

const initialState: AdminUsersScreenState = {
  loading: false,
  users: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  roleDrafts: {},
  passwordDrafts: {},
};

export interface AdminUsersScreenProps {
  authService: AuthService;
  apiBaseUrl?: string;
  userRole?: string;
}

export function AdminUsersScreen({
  authService,
  apiBaseUrl,
  userRole,
}: AdminUsersScreenProps): React.JSX.Element {
  const isAdmin = userRole === 'Admin';
  const model = useMemo(
    () => new AdminUsersScreenModel(new AdminService(authService, { apiBaseUrl })),
    [apiBaseUrl, authService],
  );
  const [state, setState] = useState<AdminUsersScreenState>(initialState);

  const refresh = async (): Promise<void> => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      setState(await model.load());
    } catch {
      setState(model.getState());
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    void refresh();
  }, [isAdmin, model]);

  if (!isAdmin) {
    return <ErrorState message='Admin role required.' />;
  }

  if (state.loading && state.users.length === 0) {
    return <LoadingState message='Loading admin users...' />;
  }

  return (
    <View style={styles.root}>
      {state.summary ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Summary</Text>
          <Text style={styles.meta}>Users: {state.summary.totalUsers}</Text>
          <Text style={styles.meta}>
            Monthly Transactions: {state.summary.totalTransactionsThisMonth}
          </Text>
          <Text style={styles.meta}>
            Monthly Amount: {state.summary.totalAmountThisMonth.toFixed(2)}
          </Text>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Users</Text>
        {state.loading ? <Text style={styles.meta}>Refreshing...</Text> : null}
      </View>

      {state.error ? <ErrorState message={state.error} onRetry={() => void refresh()} /> : null}
      {state.actionError ? <Text style={styles.error}>{state.actionError}</Text> : null}

      {state.users.length === 0 && !state.loading ? (
        <EmptyState message='No users found.' onRetry={() => void refresh()} />
      ) : null}

      <FlatList
        data={state.users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserRow
            item={item}
            roleDraft={state.roleDrafts[item.id] ?? item.role}
            passwordDraft={state.passwordDrafts[item.id] ?? ''}
            acting={state.actingUserId === item.id}
            deleting={state.deletingUserId === item.id}
            onRoleDraft={(value) => setState(model.setRoleDraft(item.id, value))}
            onPasswordDraft={(value) => setState(model.setPasswordDraft(item.id, value))}
            onAssignRole={() => {
              void (async () => {
                try {
                  setState(await model.assignRole(item.id));
                } catch {
                  setState(model.getState());
                }
              })();
            }}
            onChangePassword={() => {
              void (async () => {
                try {
                  setState(await model.changePassword(item.id));
                } catch {
                  setState(model.getState());
                }
              })();
            }}
            onDelete={() => {
              Alert.alert('Delete User', `Delete user ${item.username}?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      try {
                        setState(await model.deleteUser(item.id));
                      } catch {
                        setState(model.getState());
                      }
                    })();
                  },
                },
              ]);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.pager}>
        <Button
          title='Previous'
          onPress={() => {
            void (async () => {
              try {
                setState(await model.previousPage());
              } catch {
                setState(model.getState());
              }
            })();
          }}
          disabled={!model.canGoPrevious()}
        />
        <Text style={styles.meta}>Page {state.page}</Text>
        <Button
          title='Next'
          onPress={() => {
            void (async () => {
              try {
                setState(await model.nextPage());
              } catch {
                setState(model.getState());
              }
            })();
          }}
          disabled={!model.canGoNext()}
        />
      </View>
    </View>
  );
}

function UserRow({
  item,
  roleDraft,
  passwordDraft,
  acting,
  deleting,
  onRoleDraft,
  onPasswordDraft,
  onAssignRole,
  onChangePassword,
  onDelete,
}: {
  item: UserSummary;
  roleDraft: string;
  passwordDraft: string;
  acting: boolean;
  deleting: boolean;
  onRoleDraft: (value: string) => void;
  onPasswordDraft: (value: string) => void;
  onAssignRole: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.userTitle}>{item.username}</Text>
      <Text style={styles.meta}>{item.email}</Text>
      <Text style={styles.meta}>Role: {item.role}</Text>
      <Text style={styles.meta}>Transactions: {item.transactionCount}</Text>

      <TextInput
        autoCapitalize='none'
        style={styles.input}
        placeholder='Role'
        value={roleDraft}
        onChangeText={onRoleDraft}
      />
      <Button title={acting ? 'Updating...' : 'Assign Role'} onPress={onAssignRole} disabled={acting || deleting} />

      <TextInput
        secureTextEntry
        style={styles.input}
        placeholder='New Password (min 8 chars)'
        value={passwordDraft}
        onChangeText={onPasswordDraft}
      />
      <Button title={acting ? 'Updating...' : 'Change Password'} onPress={onChangePassword} disabled={acting || deleting} />

      <Button title={deleting ? 'Deleting...' : 'Delete User'} onPress={onDelete} disabled={acting || deleting} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    gap: 6,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  userTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    color: '#4b5563',
  },
  error: {
    color: '#b91c1c',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  pager: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
});
