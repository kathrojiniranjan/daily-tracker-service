import { AdminSummary, MonthlySummary, Transaction } from "../../api/contracts";
import { AdminService } from "../admin/adminService";
import { AuthService } from "../auth/authService";
import { TransactionsService } from "../transactions/transactionsService";

export interface HomeDashboardState {
  loading: boolean;
  error?: string;
  greeting: string;
  monthLabel: string;
  role?: string;
  username?: string;
  monthlySummary?: MonthlySummary;
  recentActivity: Transaction[];
  adminSummary?: AdminSummary;
}

export class HomeDashboardModel {
  private state: HomeDashboardState = {
    loading: false,
    greeting: greetingForHour(new Date().getHours()),
    monthLabel: monthLabel(new Date()),
    recentActivity: [],
  };

  constructor(
    private readonly auth: AuthService,
    private readonly transactions: TransactionsService,
    private readonly admin: AdminService,
  ) {}

  getState(): HomeDashboardState {
    return {
      loading: this.state.loading,
      error: this.state.error,
      greeting: this.state.greeting,
      monthLabel: this.state.monthLabel,
      role: this.state.role,
      username: this.state.username,
      monthlySummary: this.state.monthlySummary,
      recentActivity: [...this.state.recentActivity],
      adminSummary: this.state.adminSummary,
    };
  }

  async load(): Promise<HomeDashboardState> {
    this.state.loading = true;
    this.state.error = undefined;

    try {
      await this.auth.restoreSession();
      const session = this.auth.getSession();
      const now = new Date();
      const role = session?.role;
      const username = session?.username;

      this.state.greeting = greetingForHour(now.getHours());
      this.state.monthLabel = monthLabel(now);
      this.state.role = role;
      this.state.username = username;

      const summary = await this.transactions.getMonthlySummary(
        now.getFullYear(),
        now.getMonth() + 1,
      );
      this.state.monthlySummary = summary;

      const recentFrom = toIsoDate(
        new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      );
      const recentTo = toIsoDate(now);
      const recent = await this.transactions.getRange(recentFrom, recentTo);
      this.state.recentActivity = (
        role === "Admin" && username
          ? recent.filter((x) => x.username === username)
          : recent
      )
        .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
        .slice(0, 5);

      if (role === "Admin") {
        this.state.adminSummary = await this.admin.getSummary(
          now.getFullYear(),
          now.getMonth() + 1,
        );
      } else {
        this.state.adminSummary = undefined;
      }

      return this.getState();
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : "Failed to load dashboard.";
      throw error;
    } finally {
      this.state.loading = false;
    }
  }
}

function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  if (hour < 21) {
    return "Good evening";
  }
  return "Hello";
}

function monthLabel(date: Date): string {
  return date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
