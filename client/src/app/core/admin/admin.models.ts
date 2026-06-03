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
