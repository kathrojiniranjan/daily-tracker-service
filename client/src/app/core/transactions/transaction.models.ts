export interface Transaction {
  id: string; // Guid
  dailyItemId: number;
  dailyItemName: string;
  dailyItemUnit: string | null;
  quantity: number;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  notes: string | null;
  createdAt: string; // ISO timestamp
}

export interface CreateTransactionRequest {
  dailyItemId: number;
  quantity: number;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  notes?: string | null;
}

export interface UpdateTransactionRequest {
  quantity: number;
  amount: number;
  transactionDate: string;
  notes?: string | null;
}

export interface MonthlySummary {
  year: number;
  month: number;
  total: number;
  transactionCount: number;
}
