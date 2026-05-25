import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Transaction } from '../../core/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private storage = inject(StorageService);

  // helper: filter transactions within a date range
  // private because only this service needs it
  private transactionsInRange(start: Date, end: Date): Transaction[] {
    return this.storage
      .transactions()
      .filter((t) => isWithinInterval(new Date(t.date), { start, end }));
  }

  // current month transactions — recomputes when storage changes
  readonly thisMonthTransactions = computed(() => {
    const now = new Date();
    return this.transactionsInRange(startOfMonth(now), endOfMonth(now));
  });

  readonly thisMonthIncome = computed(() =>
    this.thisMonthTransactions()
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly thisMonthExpenses = computed(() =>
    this.thisMonthTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  );

  readonly balance = this.storage.balance;

  readonly savingsRate = computed(() => {
    const income = this.thisMonthIncome();
    if (income === 0) return 0;
    return (income - this.thisMonthExpenses()) / income;
  });

  // recent 5 transactions for the dashboard preview list
  readonly recentTransactions = computed(() =>
    [...this.storage.transactions()]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
  );

  // donut chart: expenses grouped by category
  readonly expensesByCategory = computed(() => {
    const expenses = this.storage.transactions().filter((t) => t.type === 'expense');

    // reduce into a map: { food: 1700, housing: 11000, ... }
    const grouped = expenses.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      labels: Object.keys(grouped).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
      values: Object.values(grouped),
    };
  });

  // bar chart: last 6 months income vs expenses
  readonly monthlyComparison = computed(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i); // oldest first
      return {
        label: format(date, 'MMM'), // "Jan", "Feb"...
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    return {
      labels: months.map((m) => m.label),
      income: months.map((m) =>
        this.transactionsInRange(m.start, m.end)
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
      ),
      expenses: months.map((m) =>
        this.transactionsInRange(m.start, m.end)
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      ),
    };
  });
}
