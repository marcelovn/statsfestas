import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../services/budget.service';
import { BudgetResult, EventType, ProfileType } from '../models/budget.models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css'
})
export class HomePage {
  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);

  readonly cities = ['Rio de Janeiro', 'Niteroi', 'Sao Goncalo', 'Marica', 'Itaborai'];
  readonly eventTypes: EventType[] = ['Infantil', '15 anos', 'Casamento'];
  readonly profiles: ProfileType[] = ['Economico', 'Medio', 'Premium'];

  readonly result = signal<BudgetResult | null>(this.budgetService.getLastBudget());
  readonly leadOpen = signal(false);
  readonly statusMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    eventType: ['Infantil' as EventType, Validators.required],
    guests: [80, [Validators.required, Validators.min(10), Validators.max(500)]],
    city: ['Niteroi', Validators.required],
    neighborhood: [''],
    profile: ['Medio' as ProfileType]
  });

  readonly leadForm = this.fb.group({
    email: ['', Validators.email],
    whatsapp: ['']
  });

  calculate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const result = this.budgetService.calculate({
      eventType: payload.eventType,
      guests: payload.guests,
      city: payload.city,
      neighborhood: payload.neighborhood || undefined,
      profile: payload.profile || undefined
    });

    this.statusMessage.set('Orcamento calculado com sucesso.');
    this.result.set(result);
  }

  publicLink(): string {
    const budget = this.result();
    if (!budget) {
      return '';
    }

    return `${window.location.origin}/orcamento/${budget.id}`;
  }

  copyLink(): void {
    const link = this.publicLink();
    if (!link) {
      return;
    }

    navigator.clipboard.writeText(link);
    this.statusMessage.set('Link publico copiado.');
  }

  whatsappLink(): string {
    const budget = this.result();
    if (!budget) {
      return 'https://wa.me/';
    }

    const text = encodeURIComponent(
      `Meu orcamento estimado para ${budget.input.eventType} (${budget.input.guests} convidados, ${budget.input.city}): ${this.formatCurrency(
        budget.total.med
      )}. Link: ${this.publicLink()}`
    );

    return `https://wa.me/?text=${text}`;
  }

  exportPdf(): void {
    window.print();
  }

  openLead(): void {
    this.leadOpen.set(true);
  }

  closeLead(): void {
    this.leadOpen.set(false);
  }

  saveLead(): void {
    const budget = this.result();
    if (!budget) {
      return;
    }

    const lead = this.leadForm.getRawValue();
    const saved = this.budgetService.saveLead(budget.id, {
      email: lead.email ?? undefined,
      whatsapp: lead.whatsapp ?? undefined
    });
    if (saved) {
      this.result.set(saved);
      this.statusMessage.set('Contato salvo no orcamento.');
      this.closeLead();
    }
  }

  trackByCategory(_: number, item: { category: string }): string {
    return item.category;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
