import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BudgetResult } from '../models/budget.models';
import { BudgetService } from '../services/budget.service';

@Component({
  selector: 'app-shared-budget-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './shared-budget.page.html',
  styleUrl: './shared-budget.page.css'
})
export class SharedBudgetPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly budgetService = inject(BudgetService);

  readonly budget = signal<BudgetResult | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.budget.set(this.budgetService.getBudgetById(id));
  }
}
