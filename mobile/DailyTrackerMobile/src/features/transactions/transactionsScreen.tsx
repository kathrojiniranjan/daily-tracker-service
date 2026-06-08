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
import { Transaction } from '../../api/contracts';
import { AuthService } from '../auth/authService';
import { TransactionsScreenModel, TransactionsScreenState } from './transactionsScreenModel';
import { TransactionsService } from './transactionsService';
import { EmptyState, ErrorState, LoadingState } from '../../shared/statusStates';

const initialState: TransactionsScreenState = {
  items: [],
  loading: false,
  filters: {
    from: '',
    to: '',
  },
  filterErrors: {},
  page: 1,
  pageSize: 20,
  totalCount: 0,
};

export interface TransactionsScreenProps {
  authService: AuthService;
  apiBaseUrl?: string;
  userRole?: string;
}

export function TransactionsScreen({
  authService,
  apiBaseUrl,
  userRole,
}: TransactionsScreenProps): React.JSX.Element {
  const isAdmin = userRole === 'Admin';
  const model = useMemo(
    () => new TransactionsScreenModel(new TransactionsService(authService, { apiBaseUrl }), isAdmin),
    [apiBaseUrl, authService, isAdmin],
  );
  const [state, setState] = useState<TransactionsScreenState>(() => ({
    ...initialState,
    ...model.getState(),
  }));

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async (): Promise<void> => {
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const next = await model.load();
      setState(next);
    } catch {
      setState(model.getState());
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Transactions</Text>

        <TextInput
          autoCapitalize='none'
          placeholder='From (YYYY-MM-DD)'
          style={styles.input}
          value={state.filters.from}
          onChangeText={(value) => setState(model.setFrom(value))}
        />
        {state.filterErrors.from ? <Text style={styles.error}>{state.filterErrors.from}</Text> : null}

        <TextInput
          autoCapitalize='none'
          placeholder='To (YYYY-MM-DD)'
          style={styles.input}
          value={state.filters.to}
          onChangeText={(value) => setState(model.setTo(value))}
        />
        {state.filterErrors.to ? <Text style={styles.error}>{state.filterErrors.to}</Text> : null}
        {state.filterErrors.range ? <Text style={styles.error}>{state.filterErrors.range}</Text> : null}

        {isAdmin ? (
          <>
            <TextInput
              autoCapitalize='none'
              placeholder='User Id (optional, admin only)'
              style={styles.input}
              value={state.filters.userId}
              onChangeText={(value) => setState(model.setUserId(value))}
            />
          </>
        ) : null}

        <Button title='Apply Filter' onPress={() => void refresh()} disabled={state.loading} />
      </View>

      {state.monthlySummary ? (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            Summary {state.monthlySummary.year}-{String(state.monthlySummary.month).padStart(2, '0')}
          </Text>
          <Text style={styles.status}>Total Amount: {state.monthlySummary.total.toFixed(2)}</Text>
          <Text style={styles.status}>Transaction Count: {state.monthlySummary.transactionCount}</Text>
        </View>
      ) : null}

      <View style={styles.createCard}>
        <Text style={styles.sectionTitle}>Create Transaction</Text>

        <TextInput
          autoCapitalize='none'
          placeholder='Daily Item Id'
          style={styles.input}
          keyboardType='number-pad'
          value={state.createValues.dailyItemId}
          onChangeText={(value) => setState(model.setCreateDailyItemId(value))}
        />
        {state.createErrors.dailyItemId ? (
          <Text style={styles.error}>{state.createErrors.dailyItemId}</Text>
        ) : null}

        <TextInput
          autoCapitalize='none'
          placeholder='Quantity'
          style={styles.input}
          keyboardType='decimal-pad'
          value={state.createValues.quantity}
          onChangeText={(value) => setState(model.setCreateQuantity(value))}
        />
        {state.createErrors.quantity ? <Text style={styles.error}>{state.createErrors.quantity}</Text> : null}

        <TextInput
          autoCapitalize='none'
          placeholder='Amount'
          style={styles.input}
          keyboardType='decimal-pad'
          value={state.createValues.amount}
          onChangeText={(value) => setState(model.setCreateAmount(value))}
        />
        {state.createErrors.amount ? <Text style={styles.error}>{state.createErrors.amount}</Text> : null}

        <TextInput
          autoCapitalize='none'
          placeholder='Transaction Date (YYYY-MM-DD)'
          style={styles.input}
          value={state.createValues.transactionDate}
          onChangeText={(value) => setState(model.setCreateTransactionDate(value))}
        />
        {state.createErrors.transactionDate ? (
          <Text style={styles.error}>{state.createErrors.transactionDate}</Text>
        ) : null}

        <TextInput
          autoCapitalize='sentences'
          placeholder='Notes (optional)'
          style={styles.input}
          value={state.createValues.notes}
          onChangeText={(value) => setState(model.setCreateNotes(value))}
        />
        {state.createErrors.notes ? <Text style={styles.error}>{state.createErrors.notes}</Text> : null}
        {state.createErrors.form ? <Text style={styles.error}>{state.createErrors.form}</Text> : null}

        <Button
          title={state.creating ? 'Creating...' : 'Create Transaction'}
          onPress={() => {
            void (async () => {
              try {
                const next = await model.submitCreate();
                setState(next);
              } catch {
                setState(model.getState());
              }
            })();
          }}
          disabled={!model.canCreate()}
        />
      </View>

      {state.error ? <ErrorState message={state.error} onRetry={() => void refresh()} /> : null}
      {state.deleteError ? <Text style={styles.error}>{state.deleteError}</Text> : null}

      <View style={styles.paginationMeta}>
        <Text style={styles.status}>Page {state.page}</Text>
        <Text style={styles.status}>Total rows: {state.totalCount}</Text>
      </View>

      {state.loading && state.items.length === 0 ? (
        <LoadingState message='Loading transactions...' />
      ) : null}

      {!state.loading && state.items.length === 0 ? (
        <EmptyState message='No transactions found for this date range.' />
      ) : null}

      {state.items.length > 0 ? (
        <>
          <FlatList
            data={state.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionRow
                item={item}
                isEditing={state.editingTransactionId === item.id}
                editValues={state.editValues}
                editErrors={state.editErrors}
                savingEdit={state.savingEdit}
                deleting={state.deletingTransactionId === item.id}
                onStartEdit={() => setState(model.startEdit(item))}
                onCancelEdit={() => setState(model.cancelEdit())}
                onEditQuantity={(value) => setState(model.setEditQuantity(value))}
                onEditAmount={(value) => setState(model.setEditAmount(value))}
                onEditTransactionDate={(value) => setState(model.setEditTransactionDate(value))}
                onEditNotes={(value) => setState(model.setEditNotes(value))}
                onSaveEdit={() => {
                  void (async () => {
                    try {
                      const next = await model.submitEdit();
                      setState(next);
                    } catch {
                      setState(model.getState());
                    }
                  })();
                }}
                canSaveEdit={model.canSaveEdit()}
                onDelete={() => {
                  Alert.alert('Delete Transaction', `Delete ${item.dailyItemName} on ${item.transactionDate}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        void (async () => {
                          try {
                            const next = await model.deleteTransaction(item.id);
                            setState(next);
                          } catch {
                            setState(model.getState());
                          }
                        })();
                      },
                    },
                  ]);
                }}
                canDelete={model.canDelete(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View style={styles.paginationControls}>
            <Button
              title='Previous'
              onPress={() => {
                void (async () => {
                  try {
                    const next = await model.previousPage();
                    setState(next);
                  } catch {
                    setState(model.getState());
                  }
                })();
              }}
              disabled={!model.canGoPrevious()}
            />
            <Button
              title='Next'
              onPress={() => {
                void (async () => {
                  try {
                    const next = await model.nextPage();
                    setState(next);
                  } catch {
                    setState(model.getState());
                  }
                })();
              }}
              disabled={!model.canGoNext()}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

function TransactionRow({
  item,
  isEditing,
  editValues,
  editErrors,
  savingEdit,
  deleting,
  onStartEdit,
  onCancelEdit,
  onEditQuantity,
  onEditAmount,
  onEditTransactionDate,
  onEditNotes,
  onSaveEdit,
  canSaveEdit,
  onDelete,
  canDelete,
}: {
  item: Transaction;
  isEditing: boolean;
  editValues: { quantity: string; amount: string; transactionDate: string; notes: string };
  editErrors: {
    quantity?: string;
    amount?: string;
    transactionDate?: string;
    notes?: string;
    form?: string;
  };
  savingEdit: boolean;
  deleting: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditQuantity: (value: string) => void;
  onEditAmount: (value: string) => void;
  onEditTransactionDate: (value: string) => void;
  onEditNotes: (value: string) => void;
  onSaveEdit: () => void;
  canSaveEdit: boolean;
  onDelete: () => void;
  canDelete: boolean;
}): React.JSX.Element {
  if (isEditing) {
    return (
      <View style={styles.row}>
        <Text style={styles.itemName}>Editing {item.dailyItemName}</Text>

        <TextInput
          autoCapitalize='none'
          keyboardType='decimal-pad'
          placeholder='Quantity'
          style={styles.input}
          value={editValues.quantity}
          onChangeText={onEditQuantity}
        />
        {editErrors.quantity ? <Text style={styles.error}>{editErrors.quantity}</Text> : null}

        <TextInput
          autoCapitalize='none'
          keyboardType='decimal-pad'
          placeholder='Amount'
          style={styles.input}
          value={editValues.amount}
          onChangeText={onEditAmount}
        />
        {editErrors.amount ? <Text style={styles.error}>{editErrors.amount}</Text> : null}

        <TextInput
          autoCapitalize='none'
          placeholder='Transaction Date (YYYY-MM-DD)'
          style={styles.input}
          value={editValues.transactionDate}
          onChangeText={onEditTransactionDate}
        />
        {editErrors.transactionDate ? <Text style={styles.error}>{editErrors.transactionDate}</Text> : null}

        <TextInput
          autoCapitalize='sentences'
          placeholder='Notes (optional)'
          style={styles.input}
          value={editValues.notes}
          onChangeText={onEditNotes}
        />
        {editErrors.notes ? <Text style={styles.error}>{editErrors.notes}</Text> : null}
        {editErrors.form ? <Text style={styles.error}>{editErrors.form}</Text> : null}

        <View style={styles.rowActions}>
          <Button title={savingEdit ? 'Saving...' : 'Save'} onPress={onSaveEdit} disabled={!canSaveEdit} />
          <Button title='Cancel' onPress={onCancelEdit} disabled={savingEdit} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.itemName}>{item.dailyItemName}</Text>
      <Text style={styles.meta}>Date: {item.transactionDate}</Text>
      <Text style={styles.meta}>Qty: {item.quantity}</Text>
      <Text style={styles.meta}>Amount: {item.amount.toFixed(2)}</Text>
      {item.notes ? <Text style={styles.meta}>Notes: {item.notes}</Text> : null}
      <View style={styles.rowActions}>
        <Button title='Edit' onPress={onStartEdit} />
        <Button title={deleting ? 'Deleting...' : 'Delete'} onPress={onDelete} disabled={!canDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
  },
  filterCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  createCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    gap: 4,
    backgroundColor: '#f9fafb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  status: {
    color: '#4b5563',
  },
  error: {
    color: '#b91c1c',
  },
  paginationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  row: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    color: '#4b5563',
    fontSize: 13,
  },
  separator: {
    height: 8,
  },
});
