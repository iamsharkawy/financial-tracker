import { Component, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Budget } from '../../../../core/models/budget.model';
import { Category } from '../../../../core/models/transaction.model';

export interface BudgetDialogData {
  budget?: Budget;
  existingCategories: string[]; // to prevent duplicate budgets per category
}

@Component({
  selector: 'app-budget-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.scss',
})
export class BudgetFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<BudgetFormComponent>);
  data: BudgetDialogData = inject(MAT_DIALOG_DATA);

  isEditMode = !!this.data?.budget;

  // only expense categories make sense for budgets
  allCategories: { value: Category; label: string }[] = [
    { value: 'food', label: '🍔 Food' },
    { value: 'transport', label: '🚗 Transport' },
    { value: 'housing', label: '🏠 Housing' },
    { value: 'entertainment', label: '🎬 Entertainment' },
    { value: 'health', label: '💊 Health' },
    { value: 'other', label: '📦 Other' },
  ];

  // in add mode, hide categories that already have a budget this month
  availableCategories = computed(() =>
    this.isEditMode
      ? this.allCategories // editing existing — show all
      : this.allCategories.filter((c) => !this.data.existingCategories.includes(c.value)),
  );

  form = this.fb.group({
    category: [this.data?.budget?.category ?? '', Validators.required],
    monthlyLimit: [
      this.data?.budget?.monthlyLimit ?? null,
      [Validators.required, Validators.min(1)],
    ],
  });

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
