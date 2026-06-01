import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);

  // The form. Each field is a FormControl with an initial value + validators.
  protected readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched so error messages appear.
      this.loginForm.markAllAsTouched();
      return;
    }

    // For now, just log. API call comes later.
    console.log('Login submitted:', this.loginForm.getRawValue());
  }
}
