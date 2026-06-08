import { Transaction } from '../../api/contracts';
import { TransactionsService } from './transactionsService';

export interface TransactionsFilterValues {
  from: string;
  to: string;
  userId: string;
}

export interface CreateTransactionValues {
  dailyItemId: string;
  quantity: string;
  amount: string;
  transactionDate: string;
  notes: string;
}

export interface EditTransactionValues {
  quantity: string;
  amount: string;
  transactionDate: string;
  notes: string;
}

export interface TransactionsFilterErrors {
  from?: string;
  to?: string;
  range?: string;
  form?: string;
}

export interface CreateTransactionErrors {
  dailyItemId?: string;
  quantity?: string;
  amount?: string;
  transactionDate?: string;
  notes?: string;
  form?: string;
}

export interface EditTransactionErrors {
  quantity?: string;
  amount?: string;
  transactionDate?: string;
  notes?: string;
  form?: string;
}

export interface TransactionsScreenState {
  items: Transaction[];
  loading: boolean;
  error?: string;
  filters: TransactionsFilterValues;
  filterErrors: TransactionsFilterErrors;
  page: number;
  pageSize: number;
  totalCount: number;
  createValues: CreateTransactionValues;
  createErrors: CreateTransactionErrors;
  creating: boolean;
  editingTransactionId: string | null;
  editValues: EditTransactionValues;
  editErrors: EditTransactionErrors;
  savingEdit: boolean;
  deletingTransactionId: string | null;
  deleteError?: string;
  monthlySummary?: {
    year: number;
    month: number;
    total: number;
    transactionCount: number;
  };
}

export class TransactionsScreenModel {
  private state: TransactionsScreenState = {
    items: [],
    loading: false,
    filters: currentMonthRange(),
    filterErrors: {},
    page: 1,
    pageSize: 20,
    totalCount: 0,
    createValues: {
      dailyItemId: '',
      quantity: '',
      amount: '',
      transactionDate: toIsoDate(new Date()),
      notes: '',
    },
    createErrors: {},
    creating: false,
    editingTransactionId: null,
    editValues: {
      quantity: '',
      amount: '',
      transactionDate: toIsoDate(new Date()),
      notes: '',
    },
    editErrors: {},
    savingEdit: false,
    deletingTransactionId: null,
  };

  constructor(
    private readonly service: TransactionsService,
    private readonly isAdmin: boolean,
  ) {}

  getState(): TransactionsScreenState {
    return {
      items: [...this.state.items],
      loading: this.state.loading,
      error: this.state.error,
      filters: { ...this.state.filters },
      filterErrors: { ...this.state.filterErrors },
      page: this.state.page,
      pageSize: this.state.pageSize,
      totalCount: this.state.totalCount,
      createValues: { ...this.state.createValues },
      createErrors: { ...this.state.createErrors },
      creating: this.state.creating,
      editingTransactionId: this.state.editingTransactionId,
      editValues: { ...this.state.editValues },
      editErrors: { ...this.state.editErrors },
      savingEdit: this.state.savingEdit,
      deletingTransactionId: this.state.deletingTransactionId,
      deleteError: this.state.deleteError,
      monthlySummary: this.state.monthlySummary,
    };
  }

  setUserId(userId: string): TransactionsScreenState {
    this.state.filters.userId = userId;
    this.state.page = 1;
    this.state.filterErrors.form = undefined;
    return this.getState();
  }

  startEdit(item: Transaction): TransactionsScreenState {
    this.state.editingTransactionId = item.id;
    this.state.editValues = {
      quantity: String(item.quantity),
      amount: String(item.amount),
      transactionDate: item.transactionDate,
      notes: item.notes ?? '',
    };
    this.state.editErrors = {};
    return this.getState();
  }

  cancelEdit(): TransactionsScreenState {
    this.state.editingTransactionId = null;
    this.state.editErrors = {};
    this.state.savingEdit = false;
    return this.getState();
  }

  setEditQuantity(quantity: string): TransactionsScreenState {
    this.state.editValues.quantity = quantity;
    this.state.editErrors.quantity = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  setEditAmount(amount: string): TransactionsScreenState {
    this.state.editValues.amount = amount;
    this.state.editErrors.amount = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  setEditTransactionDate(transactionDate: string): TransactionsScreenState {
    this.state.editValues.transactionDate = transactionDate;
    this.state.editErrors.transactionDate = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  setEditNotes(notes: string): TransactionsScreenState {
    this.state.editValues.notes = notes;
    this.state.editErrors.notes = undefined;
    this.state.editErrors.form = undefined;
    return this.getState();
  }

  canSaveEdit(): boolean {
    return this.state.editingTransactionId !== null && !this.state.savingEdit;
  }

  canDelete(id: string): boolean {
    return this.state.deletingTransactionId === null || this.state.deletingTransactionId !== id;
  }

  setCreateDailyItemId(dailyItemId: string): TransactionsScreenState {
    this.state.createValues.dailyItemId = dailyItemId;
    this.state.createErrors.dailyItemId = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateQuantity(quantity: string): TransactionsScreenState {
    this.state.createValues.quantity = quantity;
    this.state.createErrors.quantity = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateAmount(amount: string): TransactionsScreenState {
    this.state.createValues.amount = amount;
    this.state.createErrors.amount = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateTransactionDate(transactionDate: string): TransactionsScreenState {
    this.state.createValues.transactionDate = transactionDate;
    this.state.createErrors.transactionDate = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  setCreateNotes(notes: string): TransactionsScreenState {
    this.state.createValues.notes = notes;
    this.state.createErrors.notes = undefined;
    this.state.createErrors.form = undefined;
    return this.getState();
  }

  canCreate(): boolean {
    return !this.state.creating;
  }

  setFrom(from: string): TransactionsScreenState {
    this.state.filters.from = from;
    this.state.page = 1;
    this.state.filterErrors.from = undefined;
    this.state.filterErrors.range = undefined;
    this.state.filterErrors.form = undefined;
    return this.getState();
  }

  setTo(to: string): TransactionsScreenState {
    this.state.filters.to = to;
    this.state.page = 1;
    this.state.filterErrors.to = undefined;
    this.state.filterErrors.range = undefined;
    this.state.filterErrors.form = undefined;
    return this.getState();
  }

  async load(): Promise<TransactionsScreenState> {
    this.state.loading = true;
    this.state.error = undefined;
    this.state.filterErrors = {};

    const errors = validateFilters(this.state.filters);
    if (hasFilterErrors(errors)) {
      this.state.loading = false;
      this.state.filterErrors = errors;
      throw new Error('Please fix the date range.');
    }

    try {
      const result = await this.service.getRangePaged(
        this.state.filters.from,
        this.state.filters.to,
        this.state.page,
        this.state.pageSize,
        this.isAdmin ? this.state.filters.userId.trim() || undefined : undefined,
      );
      this.state.items = result.items;
      this.state.totalCount = result.totalCount;

      const [year, month] = this.state.filters.to.split('-').map(Number);
      if (year && month) {
        const summary = await this.service.getMonthlySummary(year, month);
        this.state.monthlySummary = {
          year: summary.year,
          month: summary.month,
          total: summary.total,
          transactionCount: summary.transactionCount,
        };
      }

      return this.getState();
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : 'Failed to load transactions.';
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  canGoNext(): boolean {
    return this.state.page * this.state.pageSize < this.state.totalCount && !this.state.loading;
  }

  canGoPrevious(): boolean {
    return this.state.page > 1 && !this.state.loading;
  }

  async nextPage(): Promise<TransactionsScreenState> {
    if (!this.canGoNext()) {
      return this.getState();
    }
    this.state.page += 1;
    return this.load();
  }

  async previousPage(): Promise<TransactionsScreenState> {
    if (!this.canGoPrevious()) {
      return this.getState();
    }
    this.state.page -= 1;
    return this.load();
  }

  async submitCreate(): Promise<TransactionsScreenState> {
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
      await this.service.create({
        dailyItemId: Number(this.state.createValues.dailyItemId),
        quantity: Number(this.state.createValues.quantity),
        amount: Number(this.state.createValues.amount),
        transactionDate: this.state.createValues.transactionDate,
        notes: this.state.createValues.notes.trim() || null,
      });

      this.state.createValues = {
        dailyItemId: '',
        quantity: '',
        amount: '',
        transactionDate: toIsoDate(new Date()),
        notes: '',
      };

      this.state.page = 1;
      const result = await this.service.getRangePaged(
        this.state.filters.from,
        this.state.filters.to,
        this.state.page,
        this.state.pageSize,
      );
      this.state.items = result.items;
      this.state.totalCount = result.totalCount;
      return this.getState();
    } catch (error) {
      this.state.createErrors.form =
        error instanceof Error ? error.message : 'Failed to create transaction.';
      throw error;
    } finally {
      this.state.creating = false;
    }
  }

  async submitEdit(): Promise<TransactionsScreenState> {
    if (!this.state.editingTransactionId) {
      throw new Error('No transaction selected for editing.');
    }
    if (this.state.savingEdit) {
      throw new Error('Edit already in progress.');
    }

    const editErrors = validateEdit(this.state.editValues);
    if (hasEditErrors(editErrors)) {
      this.state.editErrors = editErrors;
      throw new Error('Please fix the highlighted fields.');
    }

    this.state.savingEdit = true;
    this.state.editErrors = {};

    try {
      await this.service.update(this.state.editingTransactionId, {
        quantity: Number(this.state.editValues.quantity),
        amount: Number(this.state.editValues.amount),
        transactionDate: this.state.editValues.transactionDate,
        notes: this.state.editValues.notes.trim() || null,
      });

      this.state.editingTransactionId = null;
      const result = await this.service.getRangePaged(
        this.state.filters.from,
        this.state.filters.to,
        this.state.page,
        this.state.pageSize,
      );
      this.state.items = result.items;
      this.state.totalCount = result.totalCount;
      return this.getState();
    } catch (error) {
      this.state.editErrors.form =
        error instanceof Error ? error.message : 'Failed to update transaction.';
      throw error;
    } finally {
      this.state.savingEdit = false;
    }
  }

  async deleteTransaction(id: string): Promise<TransactionsScreenState> {
    if (this.state.deletingTransactionId !== null) {
      throw new Error('Delete already in progress.');
    }

    this.state.deletingTransactionId = id;
    this.state.deleteError = undefined;

    try {
      await this.service.delete(id);

      if (this.state.editingTransactionId === id) {
        this.state.editingTransactionId = null;
        this.state.editErrors = {};
      }

      const result = await this.service.getRangePaged(
        this.state.filters.from,
        this.state.filters.to,
        this.state.page,
        this.state.pageSize,
      );
      this.state.items = result.items;
      this.state.totalCount = result.totalCount;
      return this.getState();
    } catch (error) {
      this.state.deleteError =
        error instanceof Error ? error.message : 'Failed to delete transaction.';
      throw error;
    } finally {
      this.state.deletingTransactionId = null;
    }
  }
}

function validateFilters(values: TransactionsFilterValues): TransactionsFilterErrors {
  const next: TransactionsFilterErrors = {};

  if (!isIsoDate(values.from)) {
    next.from = 'From date must use YYYY-MM-DD.';
  }
  if (!isIsoDate(values.to)) {
    next.to = 'To date must use YYYY-MM-DD.';
  }

  if (!next.from && !next.to && values.from > values.to) {
    next.range = 'From date cannot be after To date.';
  }

  return next;
}

function hasFilterErrors(errors: TransactionsFilterErrors): boolean {
  return Boolean(errors.from || errors.to || errors.range || errors.form);
}

function validateCreate(values: CreateTransactionValues): CreateTransactionErrors {
  const next: CreateTransactionErrors = {};

  const dailyItemId = Number(values.dailyItemId);
  if (!values.dailyItemId.trim()) {
    next.dailyItemId = 'Daily item id is required.';
  } else if (!Number.isInteger(dailyItemId) || dailyItemId <= 0) {
    next.dailyItemId = 'Daily item id must be a positive integer.';
  }

  const quantity = Number(values.quantity);
  if (!values.quantity.trim()) {
    next.quantity = 'Quantity is required.';
  } else if (Number.isNaN(quantity) || quantity <= 0) {
    next.quantity = 'Quantity must be greater than 0.';
  }

  const amount = Number(values.amount);
  if (!values.amount.trim()) {
    next.amount = 'Amount is required.';
  } else if (Number.isNaN(amount) || amount < 0) {
    next.amount = 'Amount must be 0 or greater.';
  }

  if (!isIsoDate(values.transactionDate)) {
    next.transactionDate = 'Transaction date must use YYYY-MM-DD.';
  }

  if (values.notes.length > 500) {
    next.notes = 'Notes cannot exceed 500 characters.';
  }

  return next;
}

function hasCreateErrors(errors: CreateTransactionErrors): boolean {
  return Boolean(
    errors.dailyItemId ||
      errors.quantity ||
      errors.amount ||
      errors.transactionDate ||
      errors.notes ||
      errors.form,
  );
}

function validateEdit(values: EditTransactionValues): EditTransactionErrors {
  const next: EditTransactionErrors = {};

  const quantity = Number(values.quantity);
  if (!values.quantity.trim()) {
    next.quantity = 'Quantity is required.';
  } else if (Number.isNaN(quantity) || quantity <= 0) {
    next.quantity = 'Quantity must be greater than 0.';
  }

  const amount = Number(values.amount);
  if (!values.amount.trim()) {
    next.amount = 'Amount is required.';
  } else if (Number.isNaN(amount) || amount < 0) {
    next.amount = 'Amount must be 0 or greater.';
  }

  if (!isIsoDate(values.transactionDate)) {
    next.transactionDate = 'Transaction date must use YYYY-MM-DD.';
  }

  if (values.notes.length > 500) {
    next.notes = 'Notes cannot exceed 500 characters.';
  }

  return next;
}

function hasEditErrors(errors: EditTransactionErrors): boolean {
  return Boolean(
    errors.quantity ||
      errors.amount ||
      errors.transactionDate ||
      errors.notes ||
      errors.form,
  );
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function currentMonthRange(): TransactionsFilterValues {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return {
    from: toIsoDate(first),
    to: toIsoDate(last),
    userId: '',
  };
}

function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
