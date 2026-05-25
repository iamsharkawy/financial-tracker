import { Category } from './transaction.model';

export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number;
  month: string;
}
