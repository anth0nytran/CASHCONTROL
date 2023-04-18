// export interface DataItem extends Transaction, RecurringTransaction {}

export interface DataItem {
  [key: string]: string | number;
}

export interface Transaction {
  date: string;
  name: string;
  amount: number;
  category: string[];
  
}
export interface RecurringTransaction{
  last_date: string;
  description: string;
  frequency: string;
  average_amount: {amount: number};
}


export type Data = DataItem[];

export type Categories = keyof DataItem;