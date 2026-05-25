import { Injectable, computed, inject } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export interface BudgetProgress {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentage: number; // 0–100
  status: 'safe' | 'warning' | 'exceeded';
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private storage = inject(StorageService);

  readonly currentMonth = format(new Date(), 'yyyy-MM');

  readonly currentBudgets = computed(() =>
    this.storage.budgets().filter((b) => b.month === this.currentMonth),
  );

  readonly budgetProgress = computed<BudgetProgress[]>(() => {
    const now = new Date();
    const rangeStart = startOfMonth(now);
    const rangeEnd = endOfMonth(now);

    const monthExpenses = this.storage
      .transactions()
      .filter(
        (t) =>
          t.type === 'expense' &&
          isWithinInterval(new Date(t.date), { start: rangeStart, end: rangeEnd }),
      );

    return this.currentBudgets().map((budget) => {
      const spent = monthExpenses
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = Math.min((spent / budget.monthlyLimit) * 100, 100);
      const remaining = Math.max(budget.monthlyLimit - spent, 0);

      const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe';

      return {
        id: budget.id,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spent,
        remaining,
        percentage: Math.round(percentage),
        status,
      };
    });
  });

  readonly totalBudgeted = computed(() =>
    this.currentBudgets().reduce((sum, b) => sum + b.monthlyLimit, 0),
  );

  readonly totalSpent = computed(() => this.budgetProgress().reduce((sum, b) => sum + b.spent, 0));

  readonly overallPercentage = computed(() => {
    const budgeted = this.totalBudgeted();
    if (budgeted === 0) return 0;
    return Math.round((this.totalSpent() / budgeted) * 100);
  });
}
