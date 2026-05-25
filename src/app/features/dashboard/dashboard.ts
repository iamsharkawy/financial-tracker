import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatIcon } from '@angular/material/icon';
import { DashboardService } from './dashboard.service';
import { SummaryCardComponent } from './components/summary-card/summary-card';

@Component({
  selector: 'app-dashboard',
  imports: [SummaryCardComponent, BaseChartDirective, CurrencyPipe, DatePipe, RouterLink, MatIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private svc = inject(DashboardService);

  // expose service signals to template
  balance = this.svc.balance;
  thisMonthIncome = this.svc.thisMonthIncome;
  thisMonthExpenses = this.svc.thisMonthExpenses;
  savingsRate = this.svc.savingsRate;
  recentTransactions = this.svc.recentTransactions;

  // --- Donut chart config ---
  // computed so it rebuilds when expensesByCategory changes
  donutChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.svc.expensesByCategory().labels,
    datasets: [
      {
        data: this.svc.expensesByCategory().values,
        backgroundColor: [
          '#5e35b1',
          '#1d9e75',
          '#ef9f27',
          '#d4537e',
          '#378add',
          '#d85a30',
          '#639922',
        ],
        borderWidth: 0,
      },
    ],
  }));

  donutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, font: { size: 12 } },
      },
    },
    cutout: '70%', // makes it a thin ring — looks more modern
  };

  // --- Bar chart config ---
  barChartData = computed<ChartData<'bar'>>(() => {
    const data = this.svc.monthlyComparison();
    return {
      labels: data.labels,
      datasets: [
        {
          label: 'Income',
          data: data.income,
          backgroundColor: '#1d9e75',
          borderRadius: 6,
        },
        {
          label: 'Expenses',
          data: data.expenses,
          backgroundColor: '#d4537e',
          borderRadius: 6,
        },
      ],
    };
  });

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f5f5f5' },
        ticks: {
          // format y axis numbers as EGP amounts
          callback: (value) => `EGP ${Number(value).toLocaleString()}`,
        },
      },
      x: {
        grid: { display: false }, // cleaner look without vertical grid lines
      },
    },
  };
}
