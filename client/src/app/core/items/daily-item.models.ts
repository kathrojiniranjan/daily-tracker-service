export interface DailyItem {
  id: number;
  name: string;
  unit: string | null;
  defaultPrice: number | null;
  isSystem: boolean;
}

export interface CreateDailyItemRequest {
  name: string;
  unit?: string | null;
  defaultPrice?: number | null;
}
