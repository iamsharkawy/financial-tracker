import { computed, Injectable, Signal, signal } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { Budget } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _transactions = signal<Transaction[]>(this.loadFromStorage('ft_transaction', []));

  private _budgets = signal<Budget[]>(this.loadFromStorage('ft_budget', []));

  readonly transactions = this._transactions.asReadonly();
  readonly budgets = this._budgets.asReadonly();

  readonly totalIncome: Signal<any> = computed(() => {
    this._transactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  readonly totalExpenses: Signal<any> = computed(() => {
    this._transactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  });

  readonly balance: Signal<any> = computed(() => {
    this.totalIncome() - this.totalExpenses();
  });

  addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>): void {
    const tx: Transaction = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this._transactions.update((list) => [...list, tx]);
    this.saveToStorage('ft_transactions', this._transactions());
  }

  updateTransaction(id: string, changes: Partial<Transaction>): void {
    this._transactions.update((list) => list.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    this.saveToStorage('ft_transactions', this._transactions());
  }

  deleteTransaction(id: string): void {
    this._transactions.update((list) => list.filter((t) => t.id !== id));
    this.saveToStorage('ft_transactions', this._transactions());
  }

  addBudget(data: Omit<Budget, 'id'>): void {
    const budget: Budget = { ...data, id: crypto.randomUUID() };
    this._budgets.update((list) => [...list, budget]);
    this.saveToStorage('ft_budgets', this._budgets());
  }

  updateBudget(id: string, changes: Partial<Budget>): void {
    this._budgets.update((list) => list.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    this.saveToStorage('ft_budgets', this._budgets());
  }

  deleteBudget(id: string): void {
    this._budgets.update((list) => list.filter((b) => b.id !== id));
    this.saveToStorage('ft_budgets', this._budgets());
  }

  private saveToStorage<T>(key: string, data: T) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
}
