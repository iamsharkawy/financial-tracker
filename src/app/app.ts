import { Component, inject, OnInit } from '@angular/core';
import { StorageService } from './core/services/storage.service';
import { SEED_TRANSACTIONS } from './core/utils/seed-data';
import { Sidebar } from './layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private storage = inject(StorageService);

  ngOnInit() {
    if (this.storage.transactions().length === 0) {
      SEED_TRANSACTIONS.map((t) => this.storage.addTransaction(t));
    }
  }
}
