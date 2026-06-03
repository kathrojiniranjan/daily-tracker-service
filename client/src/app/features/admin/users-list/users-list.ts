import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, catchError, finalize, map, of, startWith, switchMap } from 'rxjs';

import { AdminService } from '../../../core/admin/admin.service';
import { UserSummary } from '../../../core/admin/admin.models';
import { AuthService } from '../../../core/auth/auth.service';

interface UsersState {
  items: UserSummary[];
  loading: boolean;
  error: string | null;
}

type PanelMode = 'role' | 'password' | null;

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersList {
  private readonly admin = inject(AdminService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal<UsersState>(
    this.refresh$.pipe(
      switchMap(() =>
        this.admin.getUsers().pipe(
          map((items) => ({ items, loading: false, error: null }) satisfies UsersState),
          startWith({ items: [], loading: true, error: null } satisfies UsersState),
          catchError((err: { message?: string }) =>
            of({
              items: [],
              loading: false,
              error: err.message ?? 'Failed to load users.',
            } satisfies UsersState),
          ),
        ),
      ),
    ),
    { requireSync: true },
  );

  protected readonly totalTransactions = computed(() =>
    this.state().items.reduce((sum, u) => sum + u.transactionCount, 0),
  );

  protected readonly currentUsername = computed(() => this.auth.user()?.username ?? '');

  // Per-row UI state.
  protected readonly openId = signal<string | null>(null);
  protected readonly mode = signal<PanelMode>(null);
  protected readonly busyId = signal<string | null>(null);
  protected readonly rowError = signal<string | null>(null);

  protected readonly roleForm = this.fb.nonNullable.group({
    role: ['User' as 'User' | 'Admin', Validators.required],
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected openRole(u: UserSummary): void {
    this.openId.set(u.id);
    this.mode.set('role');
    this.rowError.set(null);
    this.roleForm.reset({ role: u.role === 'Admin' ? 'Admin' : 'User' });
  }

  protected openPassword(u: UserSummary): void {
    this.openId.set(u.id);
    this.mode.set('password');
    this.rowError.set(null);
    this.passwordForm.reset({ newPassword: '' });
  }

  protected closePanel(): void {
    this.openId.set(null);
    this.mode.set(null);
    this.rowError.set(null);
  }

  protected submitRole(u: UserSummary): void {
    if (this.roleForm.invalid) return;
    const role = this.roleForm.controls.role.value;
    this.busyId.set(u.id);
    this.rowError.set(null);
    this.admin
      .assignRole(u.id, role)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.closePanel();
          this.refresh$.next();
        },
        error: (err: { error?: { detail?: string }; message?: string }) =>
          this.rowError.set(err.error?.detail ?? err.message ?? 'Failed to change role.'),
      });
  }

  protected submitPassword(u: UserSummary): void {
    if (this.passwordForm.invalid) return;
    const newPassword = this.passwordForm.controls.newPassword.value;
    this.busyId.set(u.id);
    this.rowError.set(null);
    this.admin
      .changePassword(u.id, newPassword)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => this.closePanel(),
        error: (err: { error?: { detail?: string }; message?: string }) =>
          this.rowError.set(err.error?.detail ?? err.message ?? 'Failed to change password.'),
      });
  }

  protected deleteUser(u: UserSummary): void {
    const msg =
      u.transactionCount > 0
        ? `Delete ${u.username}? This will also remove ${u.transactionCount} transaction(s).`
        : `Delete ${u.username}?`;
    if (!confirm(msg)) return;

    this.busyId.set(u.id);
    this.rowError.set(null);
    this.admin
      .deleteUser(u.id)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.closePanel();
          this.refresh$.next();
        },
        error: (err: { error?: { detail?: string }; message?: string }) =>
          this.rowError.set(err.error?.detail ?? err.message ?? 'Failed to delete user.'),
      });
  }
}
