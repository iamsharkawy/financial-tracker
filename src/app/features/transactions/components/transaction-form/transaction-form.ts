import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Transaction } from '../../../../core/models/transaction.model';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton } from '@angular/material/button';

export interface TransactionDialogData {
  transaction?: Transaction; // if present = edit mode, absent = add mode
}

@Component({
  selector: 'app-transaction-from',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
  ],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.scss',
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<TransactionFormComponent>);
  private data: TransactionDialogData = inject(MAT_DIALOG_DATA);

  isEditMode = !!this.data?.transaction;

  categories = [
    { value: 'salary', label: '💼 Salary' },
    { value: 'freelance', label: '💻 Freelance' },
    { value: 'investment', label: '📈 Investment' },
    { value: 'food', label: '🍔 Food' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'housing', label: '🏠 Housing' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'health', label: '💊 Health' },
    { value: 'other', label: '📦 Other' },
  ];

  // FormBuilder builds the form schema — each key maps to a form control
  // Validators run on every value change and block submission if invalid
  form = this.fb.group({
    type: [this.data?.transaction?.type ?? 'expense'],
    amount: [this.data?.transaction?.amount ?? null, [Validators.required, Validators.min(1)]],
    category: [this.data?.transaction?.category ?? 'other', Validators.required],
    description: [this.data?.transaction?.description ?? ''],
    date: [
      this.data?.transaction?.date ?? new Date().toISOString().split('T')[0],
      Validators.required,
    ],
  });

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.form.invalid) return; // safety guard — button is disabled but just in case
    // dialogRef.close(data) passes data back to whoever opened the dialog
    this.dialogRef.close(this.form.value);
  }
}
