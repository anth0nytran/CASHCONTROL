export interface DataItem {
  [key: string]: string | number;
}

export type Data = DataItem[];

export type Categories = keyof DataItem;