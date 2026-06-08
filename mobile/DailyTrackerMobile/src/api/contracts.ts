export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  username: string;
  role: string;
}

export interface AuthSession {
  username: string;
  role: string;
  token: string;
  expiresAtUtc: string;
}

export interface DailyItem {
  id: number;
  name: string;
  unit: string | null;
  defaultPrice: number | null;
  isSystem: boolean;
}

export interface CreateDailyItemRequest {
  name: string;
  unit?: string | null;
  defaultPrice?: number | null;
}

export interface UpdateDailyItemRequest {
  name: string;
  unit?: string | null;
  defaultPrice?: number | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string | null;
  dailyItemId: number;
  dailyItemName: string;
  dailyItemUnit: string | null;
  quantity: number;
  amount: number;
  transactionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionRequest {
  dailyItemId: number;
  quantity: number;
  amount: number;
  transactionDate: string;
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

export interface TopSpender {
  username: string;
  total: number;
}

export interface AdminSummary {
  totalUsers: number;
  totalTransactionsThisMonth: number;
  totalAmountThisMonth: number;
  topSpenders: TopSpender[];
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  transactionCount: number;
}

export interface AssignRoleRequest {
  role: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}

export interface ParityApiRoutes {
  authLogin: "/api/auth/login";
  authRegister: "/api/auth/register";
  dailyItems: "/api/v1/dailyitems";
  transactions: "/api/v1/transactions";
  admin: "/api/v1/admin";
}

export const parityApiRoutes: ParityApiRoutes = {
  authLogin: "/api/auth/login",
  authRegister: "/api/auth/register",
  dailyItems: "/api/v1/dailyitems",
  transactions: "/api/v1/transactions",
  admin: "/api/v1/admin",
};
