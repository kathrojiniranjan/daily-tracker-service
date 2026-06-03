import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI state as signals — template auto-updates when these change.
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      const { username, password } = this.loginForm.getRawValue();
      await this.auth.login(username, password);
      const target = safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl'));
      await this.router.navigateByUrl(target);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      this.loading.set(false);
    }
  }
}

// Only allow internal paths. Reject protocol-relative (//evil.com)
// and absolute URLs (https://evil.com) to prevent open-redirect attacks.
function safeReturnUrl(raw: string | null): string {
  if (!raw) return '/items';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/items';
  return raw;
}
