import { parityApiRoutes } from '../../api/contracts';

export class DataService {
  getItemsRoute(): string {
    return parityApiRoutes.dailyItems;
  }

  getTransactionsRoute(): string {
    return parityApiRoutes.transactions;
  }
}
