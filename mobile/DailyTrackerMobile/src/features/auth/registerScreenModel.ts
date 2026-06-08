import { AuthActionResult, AuthController } from './authController';

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

export interface RegisterScreenState {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  submitting: boolean;
}

export class RegisterScreenModel {
  private state: RegisterScreenState = {
    values: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    errors: {},
    submitting: false,
  };

  constructor(private readonly authController: AuthController) {}

  getState(): RegisterScreenState {
    return {
      values: { ...this.state.values },
      errors: { ...this.state.errors },
      submitting: this.state.submitting,
    };
  }

  setUsername(username: string): RegisterScreenState {
    this.state.values.username = username;
    this.state.errors.username = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  setEmail(email: string): RegisterScreenState {
    this.state.values.email = email;
    this.state.errors.email = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  setPassword(password: string): RegisterScreenState {
    this.state.values.password = password;
    this.state.errors.password = undefined;
    this.state.errors.confirmPassword = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  setConfirmPassword(confirmPassword: string): RegisterScreenState {
    this.state.values.confirmPassword = confirmPassword;
    this.state.errors.confirmPassword = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  canSubmit(): boolean {
    return !this.state.submitting;
  }

  async submit(): Promise<AuthActionResult> {
    if (this.state.submitting) {
      throw new Error('Registration already in progress.');
    }

    const errors = validate(this.state.values);
    if (hasErrors(errors)) {
      this.state.errors = errors;
      throw new Error('Please fix the highlighted fields.');
    }

    this.state.submitting = true;
    this.state.errors = {};

    try {
      return await this.authController.register({
        username: this.state.values.username.trim(),
        email: this.state.values.email.trim(),
        password: this.state.values.password,
      });
    } catch (error) {
      this.state.errors.form =
        error instanceof Error ? error.message : 'Registration failed.';
      throw error;
    } finally {
      this.state.submitting = false;
    }
  }
}

function validate(values: RegisterFormValues): RegisterFormErrors {
  const next: RegisterFormErrors = {};

  const username = values.username.trim();
  if (!username) {
    next.username = 'Username is required.';
  } else if (username.length < 3) {
    next.username = 'Username must be at least 3 characters.';
  }

  const email = values.email.trim();
  if (!email) {
    next.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    next.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    next.password = 'Password is required.';
  } else if (values.password.length < 6) {
    next.password = 'Password must be at least 6 characters.';
  }

  if (!values.confirmPassword) {
    next.confirmPassword = 'Confirm password is required.';
  } else if (values.confirmPassword !== values.password) {
    next.confirmPassword = 'Passwords do not match.';
  }

  return next;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hasErrors(errors: RegisterFormErrors): boolean {
  return Boolean(
    errors.username ||
      errors.email ||
      errors.password ||
      errors.confirmPassword ||
      errors.form,
  );
}
