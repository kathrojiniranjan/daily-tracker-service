import { DailyItem } from '../../api/contracts';
import { ItemsService } from './itemsService';

export type DailyItemListItem = DailyItem;

export interface CreateItemValues {
  name: string;
  unit: string;
  defaultPrice: string;
}

export interface CreateItemErrors {
  name?: string;
  unit?: string;
  defaultPrice?: string;
  form?: string;
}

export interface ItemsScreenState {
  items: DailyItemListItem[];
  loading: boolean;
  error?: string;
  createValues: CreateItemValues;
  createErrors: CreateItemErrors;
  creating: boolean;
  editingItemId: number | null;
  editValues: CreateItemValues;
  editErrors: CreateItemErrors;
  savingEdit: boolean;
  deletingItemId: number | null;
  deleteError?: string;
}

export class ItemsScreenModel {
  constructor(private readonly service: ItemsService) {}

  private state: ItemsScreenState = {
    items: [],
    loading: false,
    createValues: {
      name: '',
      unit: '',
      defaultPrice: '',
    },
    createErrors: {},
    creating: false,
    editingItemId: null,
    editValues: {
      name: '',
      unit: '',
      defaultPrice: '',
    },
    editErrors: {},
    savingEdit: false,
    deletingItemId: null,
  };

  getState(): ItemsScreenState {
    return {
      items: [...this.state.items],
      loading: this.state.loading,
      error: this.state.error,
      createValues: { ...this.state.createValues },
      createErrors: { ...this.state.createErrors },
      creating: this.state.creating,
      editingItemId: this.state.editingItemId,
      editValues: { ...this.state.editValues },
      editErrors: { ...this.state.editErrors },
      savingEdit: this.state.savingEdit,
      deletingItemId: this.state.deletingItemId,
      deleteError: this.state.deleteError,
    };
  }

  canDelete(itemId: number): boolean {
    return this.state.deletingItemId === null || this.state.deletingItemId !== itemId;
  }

  startEdit(item: DailyItemListItem): ItemsScreenState {
    this.state.editingItemId = item.id;
    this.state.editValues = {
      name: item.name,
      unit: item.unit ?? '',
      defaultPrice: item.defaultPrice === null ? '' : String(item.defaultPrice),
    };
    this.state.editErrors = {};
    return this.getState();
  }

  cancelEdit(): ItemsScreenState {
    this.state.editingItemId = null;
    this.state.editErrors = {};
    this.state.savingEdit = false;
    return this.getState();
  }

  setEditName(name: string): ItemsScreenState {
    this.state.editValues.name = name;
    this.state.editErrors.name = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  setEditUnit(unit: string): ItemsScreenState {
    this.state.editValues.unit = unit;
    this.state.editErrors.unit = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  setEditDefaultPrice(defaultPrice: string): ItemsScreenState {
    this.state.editValues.defaultPrice = defaultPrice;
    this.state.editErrors.defaultPrice = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  canSaveEdit(): boolean {
    return this.state.editingItemId !== null && !this.state.savingEdit;
  }

  setCreateName(name: string): ItemsScreenState {
    this.state.createValues.name = name;
    this.state.createErrors.name = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateUnit(unit: string): ItemsScreenState {
    this.state.createValues.unit = unit;
    this.state.createErrors.unit = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateDefaultPrice(defaultPrice: string): ItemsScreenState {
    this.state.createValues.defaultPrice = defaultPrice;
    this.state.createErrors.defaultPrice = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  canCreate(): boolean {
    return !this.state.creating;
  }

  async load(): Promise<ItemsScreenState> {
    this.state.loading = true;
    this.state.error = undefined;

    try {
      const result = await this.service.getPaged(1, 20);
      this.state.items = result.items;
      return this.getState();
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Failed to load items.';
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  async submitCreate(): Promise<ItemsScreenState> {
    if (this.state.creating) {
      throw new Error('Create already in progress.');
    }

    const createErrors = validateCreate(this.state.createValues);
    if (hasCreateErrors(createErrors)) {
      this.state.createErrors = createErrors;
      throw new Error('Please fix the highlighted fields.');
    }

    this.state.creating = true;
    this.state.createErrors = {};

    try {
      const unit = this.state.createValues.unit.trim();
      const defaultPriceRaw = this.state.createValues.defaultPrice.trim();

      await this.service.create({
        name: this.state.createValues.name.trim(),
        unit: unit ? unit : null,
        defaultPrice: defaultPriceRaw ? Number(defaultPriceRaw) : null,
      });

      this.state.createValues = {
        name: '',
        unit: '',
        defaultPrice: '',
      };

      const result = await this.service.getPaged(1, 20);
      this.state.items = result.items;
      return this.getState();
    } catch (error) {
      this.state.createErrors.form =
        error instanceof Error ? error.message : 'Failed to create item.';
      throw error;
    } finally {
      this.state.creating = false;
    }
  }

  async submitEdit(): Promise<ItemsScreenState> {
    if (this.state.editingItemId === null) {
      throw new Error('No item selected for editing.');
    }
    if (this.state.savingEdit) {
      throw new Error('Edit already in progress.');
    }

    const editErrors = validateCreate(this.state.editValues);
    if (hasCreateErrors(editErrors)) {
      this.state.editErrors = editErrors;
      throw new Error('Please fix the highlighted fields.');
    }

    this.state.savingEdit = true;
    this.state.editErrors = {};

    try {
      const unit = this.state.editValues.unit.trim();
      const defaultPriceRaw = this.state.editValues.defaultPrice.trim();

      await this.service.update(this.state.editingItemId, {
        name: this.state.editValues.name.trim(),
        unit: unit ? unit : null,
        defaultPrice: defaultPriceRaw ? Number(defaultPriceRaw) : null,
      });

      this.state.editingItemId = null;
      const result = await this.service.getPaged(1, 20);
      this.state.items = result.items;
      return this.getState();
    } catch (error) {
      this.state.editErrors.form = error instanceof Error ? error.message : 'Failed to update item.';
      throw error;
    } finally {
      this.state.savingEdit = false;
    }
  }

  async deleteItem(itemId: number): Promise<ItemsScreenState> {
    if (this.state.deletingItemId !== null) {
      throw new Error('Delete already in progress.');
    }

    this.state.deletingItemId = itemId;
    this.state.deleteError = undefined;

    try {
      await this.service.delete(itemId);

      if (this.state.editingItemId === itemId) {
        this.state.editingItemId = null;
        this.state.editErrors = {};
      }

      const result = await this.service.getPaged(1, 20);
      this.state.items = result.items;
      return this.getState();
    } catch (error) {
      this.state.deleteError = error instanceof Error ? error.message : 'Failed to delete item.';
      throw error;
    } finally {
      this.state.deletingItemId = null;
    }
  }
}

function validateCreate(values: CreateItemValues): CreateItemErrors {
  const next: CreateItemErrors = {};

  const name = values.name.trim();
  if (!name) {
    next.name = 'Name is required.';
  } else if (name.length > 128) {
    next.name = 'Name cannot exceed 128 characters.';
  }

  const unit = values.unit.trim();
  if (unit.length > 32) {
    next.unit = 'Unit cannot exceed 32 characters.';
  }

  const defaultPriceRaw = values.defaultPrice.trim();
  if (defaultPriceRaw) {
    const value = Number(defaultPriceRaw);
    if (Number.isNaN(value)) {
      next.defaultPrice = 'Default price must be a number.';
    } else if (value < 0) {
      next.defaultPrice = 'Default price cannot be negative.';
    } else if (value > 1_000_000) {
      next.defaultPrice = 'Default price is too large.';
    }
  }

  return next;
}

function hasCreateErrors(errors: CreateItemErrors): boolean {
  return Boolean(errors.name || errors.unit || errors.defaultPrice || errors.form);
}
