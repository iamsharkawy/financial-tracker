import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/transactions').then((m) => m.TransactionsComponent),
  },
  {
    path: 'budgets',
    loadComponent: () => import('./features/budgets/budgets').then((m) => m.BudgetsComponent),
  },
];
