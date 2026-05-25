import { Component, input } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-summary-card',
  imports: [CurrencyPipe, PercentPipe, MatIcon],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
})
export class SummaryCardComponent {
  label = input.required<string>();
  value = input.required<number>();
  icon = input.required<string>();
  type = input<'balance' | 'income' | 'expense' | 'savings'>('balance');
  format = input<'currency' | 'percent'>('currency');
}
