export interface DataItem {
  [key: string]: string | number;
}

export interface Transaction {
  date: string;
  name: string;
  amount: number;
  category: string[];
}

export type Data = DataItem[];

export type Categories = keyof DataItem;