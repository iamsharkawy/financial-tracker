import { Component, computed, inject, signal } from '@angular/core';
import { StorageService } from '../../core/services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { Transaction } from '../../core/models/transaction.model';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  imports: [
    MatIcon,
    MatIconButton,
    CurrencyPipe,
    DatePipe,
    // FormsModule removed — no longer needed
  ],
})
export class TransactionsComponent {
  private storage = inject(StorageService);
  private dialog = inject(MatDialog);

  searchQuery = signal(''); // ← now a signal
  activeFilter = signal<'all' | 'income' | 'expense' | string>('all'); // ← removed string from union type, not needed

  filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  filteredTransactions = computed(() => {
    let list = this.storage.transactions();

    if (this.activeFilter() !== 'all') {
      list = list.filter((t) => t.type === this.activeFilter());
    }

    if (this.searchQuery().trim()) {
      // ← now called as a function
      const q = this.searchQuery().toLowerCase();
      list = list.filter(
        (t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  openForm(transaction?: Transaction): void {
    const ref = this.dialog.open(TransactionFormComponent, {
      width: '480px',
      data: { transaction },
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (transaction) {
        this.storage.updateTransaction(transaction.id, result);
      } else {
        this.storage.addTransaction(result);
      }
    });
  }

  delete(id: string): void {
    if (confirm('Delete this transaction?')) {
      this.storage.deleteTransaction(id);
    }
  }
}
