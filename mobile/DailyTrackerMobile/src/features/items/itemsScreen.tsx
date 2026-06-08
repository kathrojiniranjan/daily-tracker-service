import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AuthService } from "../auth/authService";
import {
  DailyItemListItem,
  ItemsScreenModel,
  ItemsScreenState,
} from "./itemsScreenModel";
import { ItemsService } from "./itemsService";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../shared/statusStates";

const initialState: ItemsScreenState = {
  items: [],
  loading: false,
};

export interface ItemsScreenProps {
  authService: AuthService;
  apiBaseUrl?: string;
  userRole?: string;
}

export function ItemsScreen({
  authService,
  apiBaseUrl,
  userRole,
}: ItemsScreenProps): React.JSX.Element {
  const model = useMemo(
    () => new ItemsScreenModel(new ItemsService(authService, { apiBaseUrl })),
    [apiBaseUrl, authService],
  );
  const isAdmin = userRole === "Admin";
  const [state, setState] = useState<ItemsScreenState>(initialState);

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

  const submitCreate = async (): Promise<void> => {
    try {
      const next = await model.submitCreate();
      setState(next);
    } catch {
      setState(model.getState());
    }
  };

  if (state.loading && state.items.length === 0) {
    return <LoadingState message="Loading items..." />;
  }

  if (state.error) {
    return <ErrorState message={state.error} onRetry={() => void refresh()} />;
  }

  if (state.items.length === 0) {
    return (
      <EmptyState message="No items yet." onRetry={() => void refresh()} />
    );
  }

  return (
    <View style={styles.listWrap}>
      {isAdmin ? (
        <View style={styles.createCard}>
          <Text style={styles.createTitle}>Create Item</Text>

          <TextInput
            autoCapitalize="words"
            placeholder="Name"
            style={styles.input}
            value={state.createValues.name}
            onChangeText={(value) => setState(model.setCreateName(value))}
          />
          {state.createErrors.name ? (
            <Text style={styles.error}>{state.createErrors.name}</Text>
          ) : null}

          <TextInput
            autoCapitalize="words"
            placeholder="Unit (optional)"
            style={styles.input}
            value={state.createValues.unit}
            onChangeText={(value) => setState(model.setCreateUnit(value))}
          />
          {state.createErrors.unit ? (
            <Text style={styles.error}>{state.createErrors.unit}</Text>
          ) : null}

          <TextInput
            keyboardType="decimal-pad"
            placeholder="Default price (optional)"
            style={styles.input}
            value={state.createValues.defaultPrice}
            onChangeText={(value) =>
              setState(model.setCreateDefaultPrice(value))
            }
          />
          {state.createErrors.defaultPrice ? (
            <Text style={styles.error}>{state.createErrors.defaultPrice}</Text>
          ) : null}
          {state.createErrors.form ? (
            <Text style={styles.error}>{state.createErrors.form}</Text>
          ) : null}

          <Button
            title={state.creating ? "Creating..." : "Create Item"}
            onPress={() => void submitCreate()}
            disabled={!model.canCreate()}
          />
        </View>
      ) : (
        <View style={styles.readOnlyBanner}>
          <Text style={styles.status}>
            Read-only mode: admin role required for item changes.
          </Text>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.title}>Items</Text>
        <Button
          title="Refresh"
          onPress={() => void refresh()}
          disabled={state.loading}
        />
      </View>

      {state.deleteError ? (
        <Text style={styles.error}>{state.deleteError}</Text>
      ) : null}

      <FlatList
        data={state.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            isEditing={state.editingItemId === item.id}
            editValues={state.editValues}
            editErrors={state.editErrors}
            savingEdit={state.savingEdit}
            onStartEdit={() => setState(model.startEdit(item))}
            onCancelEdit={() => setState(model.cancelEdit())}
            onEditName={(value) => setState(model.setEditName(value))}
            onEditUnit={(value) => setState(model.setEditUnit(value))}
            onEditDefaultPrice={(value) =>
              setState(model.setEditDefaultPrice(value))
            }
            onSaveEdit={async () => {
              try {
                const next = await model.submitEdit();
                setState(next);
              } catch {
                setState(model.getState());
              }
            }}
            canSaveEdit={isAdmin && model.canSaveEdit()}
            deleting={state.deletingItemId === item.id}
            onDelete={() => {
              Alert.alert("Delete Item", `Delete "${item.name}"?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    void (async () => {
                      try {
                        const next = await model.deleteItem(item.id);
                        setState(next);
                      } catch {
                        setState(model.getState());
                      }
                    })();
                  },
                },
              ]);
            }}
            canDelete={isAdmin && model.canDelete(item.id)}
            canManage={isAdmin}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function ItemRow({
  item,
  isEditing,
  editValues,
  editErrors,
  savingEdit,
  onStartEdit,
  onCancelEdit,
  onEditName,
  onEditUnit,
  onEditDefaultPrice,
  onSaveEdit,
  canSaveEdit,
  deleting,
  onDelete,
  canDelete,
  canManage,
}: {
  item: DailyItemListItem;
  isEditing: boolean;
  editValues: { name: string; unit: string; defaultPrice: string };
  editErrors: {
    name?: string;
    unit?: string;
    defaultPrice?: string;
    form?: string;
  };
  savingEdit: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditName: (value: string) => void;
  onEditUnit: (value: string) => void;
  onEditDefaultPrice: (value: string) => void;
  onSaveEdit: () => void;
  canSaveEdit: boolean;
  deleting: boolean;
  onDelete: () => void;
  canDelete: boolean;
  canManage: boolean;
}): React.JSX.Element {
  if (isEditing) {
    return (
      <View style={styles.row}>
        <Text style={styles.name}>Editing: {item.name}</Text>

        <TextInput
          autoCapitalize="words"
          placeholder="Name"
          style={styles.input}
          value={editValues.name}
          onChangeText={onEditName}
        />
        {editErrors.name ? (
          <Text style={styles.error}>{editErrors.name}</Text>
        ) : null}

        <TextInput
          autoCapitalize="words"
          placeholder="Unit (optional)"
          style={styles.input}
          value={editValues.unit}
          onChangeText={onEditUnit}
        />
        {editErrors.unit ? (
          <Text style={styles.error}>{editErrors.unit}</Text>
        ) : null}

        <TextInput
          keyboardType="decimal-pad"
          placeholder="Default price (optional)"
          style={styles.input}
          value={editValues.defaultPrice}
          onChangeText={onEditDefaultPrice}
        />
        {editErrors.defaultPrice ? (
          <Text style={styles.error}>{editErrors.defaultPrice}</Text>
        ) : null}
        {editErrors.form ? (
          <Text style={styles.error}>{editErrors.form}</Text>
        ) : null}

        {canManage ? (
          <View style={styles.rowActions}>
            <Button
              title={savingEdit ? "Saving..." : "Save"}
              onPress={onSaveEdit}
              disabled={!canSaveEdit}
            />
            <Button
              title="Cancel"
              onPress={onCancelEdit}
              disabled={savingEdit}
            />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>Unit: {item.unit ?? "-"}</Text>
      <Text style={styles.meta}>
        Default price:{" "}
        {item.defaultPrice === null ? "-" : item.defaultPrice.toFixed(2)}
      </Text>
      <Text style={styles.meta}>
        Source: {item.isSystem ? "System" : "Custom"}
      </Text>
      {canManage ? (
        <View style={styles.rowActions}>
          <Button title="Edit" onPress={onStartEdit} />
          <Button
            title={deleting ? "Deleting..." : "Delete"}
            onPress={onDelete}
            disabled={!canDelete}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
    gap: 10,
  },
  createCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  readOnlyBanner: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#f9fafb",
  },
  createTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#111827",
  },
  error: {
    color: "#b91c1c",
  },
  row: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  rowActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
    marginTop: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  meta: {
    color: "#4b5563",
    fontSize: 13,
  },
  separator: {
    height: 8,
  },
});
