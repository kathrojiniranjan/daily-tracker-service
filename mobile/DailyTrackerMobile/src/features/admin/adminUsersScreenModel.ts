import { AdminSummary, UserSummary } from "../../api/contracts";
import { AdminService } from "./adminService";

export interface AdminUsersScreenState {
  loading: boolean;
  error?: string;
  users: UserSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  summary?: AdminSummary;
  roleDrafts: Record<string, string>;
  passwordDrafts: Record<string, string>;
  actingUserId?: string;
  deletingUserId?: string;
  actionError?: string;
}

export class AdminUsersScreenModel {
  private state: AdminUsersScreenState = {
    loading: false,
    users: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    roleDrafts: {},
    passwordDrafts: {},
  };

  constructor(private readonly admin: AdminService) {}

  getState(): AdminUsersScreenState {
    return {
      loading: this.state.loading,
      error: this.state.error,
      users: [...this.state.users],
      page: this.state.page,
      pageSize: this.state.pageSize,
      totalCount: this.state.totalCount,
      summary: this.state.summary,
      roleDrafts: { ...this.state.roleDrafts },
      passwordDrafts: { ...this.state.passwordDrafts },
      actingUserId: this.state.actingUserId,
      deletingUserId: this.state.deletingUserId,
      actionError: this.state.actionError,
    };
  }

  setRoleDraft(userId: string, role: string): AdminUsersScreenState {
    this.state.roleDrafts[userId] = role;
    this.state.actionError = undefined;
    return this.getState();
  }

  setPasswordDraft(userId: string, password: string): AdminUsersScreenState {
    this.state.passwordDrafts[userId] = password;
    this.state.actionError = undefined;
    return this.getState();
  }

  async load(): Promise<AdminUsersScreenState> {
    this.state.loading = true;
    this.state.error = undefined;

    try {
      const now = new Date();
      const [users, summary] = await Promise.all([
        this.admin.getUsers(this.state.page, this.state.pageSize),
        this.admin.getSummary(now.getFullYear(), now.getMonth() + 1),
      ]);

      this.state.users = users.items;
      this.state.totalCount = users.totalCount;
      this.state.summary = summary;

      users.items.forEach((u) => {
        if (this.state.roleDrafts[u.id] === undefined) {
          this.state.roleDrafts[u.id] = u.role;
        }
        if (this.state.passwordDrafts[u.id] === undefined) {
          this.state.passwordDrafts[u.id] = "";
        }
      });

      return this.getState();
    } catch (error) {
      this.state.error =
        error instanceof Error ? error.message : "Failed to load admin users.";
      throw error;
    } finally {
      this.state.loading = false;
    }
  }

  canGoNext(): boolean {
    return (
      this.state.page * this.state.pageSize < this.state.totalCount &&
      !this.state.loading
    );
  }

  canGoPrevious(): boolean {
    return this.state.page > 1 && !this.state.loading;
  }

  async nextPage(): Promise<AdminUsersScreenState> {
    if (!this.canGoNext()) {
      return this.getState();
    }
    this.state.page += 1;
    return this.load();
  }

  async previousPage(): Promise<AdminUsersScreenState> {
    if (!this.canGoPrevious()) {
      return this.getState();
    }
    this.state.page -= 1;
    return this.load();
  }

  async assignRole(userId: string): Promise<AdminUsersScreenState> {
    const role = (this.state.roleDrafts[userId] ?? "").trim();
    if (!role) {
      this.state.actionError = "Role cannot be empty.";
      throw new Error("Role cannot be empty.");
    }

    this.state.actingUserId = userId;
    this.state.actionError = undefined;

    try {
      await this.admin.assignRole(userId, role);
      return this.load();
    } catch (error) {
      this.state.actionError =
        error instanceof Error ? error.message : "Failed to assign role.";
      throw error;
    } finally {
      this.state.actingUserId = undefined;
    }
  }

  async changePassword(userId: string): Promise<AdminUsersScreenState> {
    const password = this.state.passwordDrafts[userId] ?? "";
    if (password.length < 8) {
      this.state.actionError = "Password must be at least 8 characters.";
      throw new Error("Password must be at least 8 characters.");
    }

    this.state.actingUserId = userId;
    this.state.actionError = undefined;

    try {
      await this.admin.changePassword(userId, password);
      this.state.passwordDrafts[userId] = "";
      return this.getState();
    } catch (error) {
      this.state.actionError =
        error instanceof Error ? error.message : "Failed to change password.";
      throw error;
    } finally {
      this.state.actingUserId = undefined;
    }
  }

  async deleteUser(userId: string): Promise<AdminUsersScreenState> {
    this.state.deletingUserId = userId;
    this.state.actionError = undefined;

    try {
      await this.admin.deleteUser(userId);
      delete this.state.roleDrafts[userId];
      delete this.state.passwordDrafts[userId];
      if (
        this.state.totalCount - 1 <=
          (this.state.page - 1) * this.state.pageSize &&
        this.state.page > 1
      ) {
        this.state.page -= 1;
      }
      return this.load();
    } catch (error) {
      this.state.actionError =
        error instanceof Error ? error.message : "Failed to delete user.";
      throw error;
    } finally {
      this.state.deletingUserId = undefined;
    }
  }
}
