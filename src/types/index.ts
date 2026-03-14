export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  checked: boolean;
  note?: string;
}

export interface PurchaseList {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'done' | 'archive';
  products: Product[];
  reminder?: Reminder;
}

export interface Reminder {
  id: string;
  listId: string;
  date: string;
  time: string;
  enabled: boolean;
  label: string;
}

export type Screen = 'home' | 'create' | 'editor' | 'reminders' | 'export' | 'settings';
