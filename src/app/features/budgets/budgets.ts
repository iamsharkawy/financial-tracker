import { Component, inject, computed } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { StorageService } from '../../core/services/storage.service';
import { BudgetService } from './budget.service';
import { BudgetFormComponent } from './components/budget-form/budget-form';
import { BudgetProgressComponent } from './components/budget-progress/budget-progress';
import { Budget } from '../../core/models/budget.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-budgets',
  imports: [MatIcon, MatButtonModule, CurrencyPipe, BudgetProgressComponent],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class BudgetsComponent {
  private storage = inject(StorageService);
  private budgetSvc = inject(BudgetService);
  private dialog = inject(MatDialog);

  budgetProgress = this.budgetSvc.budgetProgress;
  totalBudgeted = this.budgetSvc.totalBudgeted;
  totalSpent = this.budgetSvc.totalSpent;
  overallPercentage = this.budgetSvc.overallPercentage;

  currentMonthLabel = format(new Date(), 'MMMM yyyy'); // e.g. "March 2024"

  existingCategories = computed(() => this.budgetSvc.currentBudgets().map((b) => b.category));

  openForm(budget?: Budget): void {
    const ref = this.dialog.open(BudgetFormComponent, {
      width: '440px',
      data: {
        budget,
        existingCategories: this.existingCategories(),
      },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;

      if (budget) {
        this.storage.updateBudget(budget.id, result);
      } else {
        this.storage.addBudget({
          ...result,
          month: format(new Date(), 'yyyy-MM'),
        });
      }
    });
  }

  delete(id: string): void {
    if (confirm('Delete this budget?')) {
      this.storage.deleteBudget(id);
    }
  }

  getBudgetById(id: string): Budget | undefined {
    return this.storage.budgets().find((b) => b.id === id);
  }
}
