import { Component, input, output } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { BudgetProgress } from '../../budget.service';

@Component({
  selector: 'app-budget-progress',
  standalone: true,
  imports: [CurrencyPipe, MatIcon, MatIconButton, TitleCasePipe],
  templateUrl: './budget-progress.html',
  styleUrl: './budget-progress.scss',
})
export class BudgetProgressComponent {
  budget = input.required<BudgetProgress>();
  onEdit = output<void>();
  onDelete = output<void>();
}
