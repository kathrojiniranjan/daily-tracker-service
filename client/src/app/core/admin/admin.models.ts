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
