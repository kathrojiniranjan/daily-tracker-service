import { AuthActionResult, AuthController } from "./authController";

export interface LoginFormValues {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
  form?: string;
}

export interface LoginScreenState {
  values: LoginFormValues;
  errors: LoginFormErrors;
  submitting: boolean;
}

export class LoginScreenModel {
  private state: LoginScreenState = {
    values: {
      username: "",
      password: "",
    },
    errors: {},
    submitting: false,
  };

  constructor(private readonly authController: AuthController) {}

  getState(): LoginScreenState {
    return {
      values: { ...this.state.values },
      errors: { ...this.state.errors },
      submitting: this.state.submitting,
    };
  }

  setUsername(username: string): LoginScreenState {
    this.state.values.username = username;
    this.state.errors.username = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  setPassword(password: string): LoginScreenState {
    this.state.values.password = password;
    this.state.errors.password = undefined;
    this.state.errors.form = undefined;
    return this.getState();
  }

  canSubmit(): boolean {
    return !this.state.submitting;
  }

  async submit(): Promise<AuthActionResult> {
    if (this.state.submitting) {
      throw new Error("Login already in progress.");
    }

    const errors = validate(this.state.values);
    if (hasErrors(errors)) {
      this.state.errors = errors;
      throw new Error("Please fix the highlighted fields.");
    }

    this.state.submitting = true;
    this.state.errors = {};

    try {
      return await this.authController.login({
        username: this.state.values.username.trim(),
        password: this.state.values.password,
      });
    } catch (error) {
      this.state.errors.form =
        error instanceof Error ? error.message : "Login failed.";
      throw error;
    } finally {
      this.state.submitting = false;
    }
  }
}

function validate(values: LoginFormValues): LoginFormErrors {
  const next: LoginFormErrors = {};

  const username = values.username.trim();
  if (!username) {
    next.username = "Username is required.";
  } else if (username.length < 3) {
    next.username = "Username must be at least 3 characters.";
  }

  if (!values.password) {
    next.password = "Password is required.";
  } else if (values.password.length < 6) {
    next.password = "Password must be at least 6 characters.";
  }

  return next;
}

function hasErrors(errors: LoginFormErrors): boolean {
  return Boolean(errors.username || errors.password || errors.form);
}
