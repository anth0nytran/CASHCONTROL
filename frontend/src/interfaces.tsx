// export interface DataItem extends Transaction, RecurringTransaction {}

export interface DataItem {
  [key: string]: string | number;
}

export interface Transaction {
  account_id: string;
  amount: number;
  iso_currency_code: string;
  category: string[];
  category_id: string;
  date: string;
  datetime: string;
  authorized_date: string;
  authorized_datetime: string;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    store_number: string | null;
  };
  name: string;
  merchant_name: string | null;
  payment_channel: string;
  pending: boolean;
  pending_transaction_id: string | null;
  account_owner: string | null;
  transaction_id: string;
  transaction_code: string | null;
  
}
export interface RecurringTransaction{
  last_date: string;
  description: string;
  frequency: string;
  average_amount: {amount: number};
}


export type Data = DataItem[];

export type Categories = keyof DataItem;