import { AppRoute } from "./appNavigator";

export class NavigationStack {
  private readonly stack: AppRoute[];

  constructor(initialRoute: AppRoute) {
    this.stack = [initialRoute];
  }

  current(): AppRoute {
    return this.stack[this.stack.length - 1];
  }

  push(route: AppRoute): AppRoute {
    this.stack.push(route);
    return this.current();
  }

  replace(route: AppRoute): AppRoute {
    this.stack[this.stack.length - 1] = route;
    return this.current();
  }

  canGoBack(): boolean {
    return this.stack.length > 1;
  }

  back(): AppRoute {
    if (this.canGoBack()) {
      this.stack.pop();
    }
    return this.current();
  }

  reset(route: AppRoute): AppRoute {
    this.stack.length = 0;
    this.stack.push(route);
    return this.current();
  }

  snapshot(): readonly AppRoute[] {
    return [...this.stack];
  }
}
