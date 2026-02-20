import { Injectable, signal } from '@angular/core';
import {
  BudgetInput,
  BudgetResult,
  CategoryBudget,
  PriceReference,
  ProfileType
} from '../models/budget.models';
import { PRICE_REFERENCES } from '../data/price-reference';

const STORAGE_LAST = 'statsfestas:last-budget';
const STORAGE_LIST = 'statsfestas:budgets';
const STORAGE_RULES = 'statsfestas:rules';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly references = signal<PriceReference[]>(this.restoreRules());

  calculate(input: BudgetInput): BudgetResult {
    const categories = this.buildCategories(input);

    const total = categories.reduce(
      (acc, item) => {
        acc.min += item.min;
        acc.med += item.med;
        acc.max += item.max;
        return acc;
      },
      { min: 0, med: 0, max: 0 }
    );

    const id = this.createId();
    const cityHasStrongSample = categories.every((item) => item.sampleSize >= 8);

    const result: BudgetResult = {
      id,
      input,
      regionApplied: cityHasStrongSample ? input.city : 'RJ Geral (fallback)',
      createdAtIso: new Date().toISOString(),
      categories,
      total,
      referencesUsed: categories.reduce((sum, item) => sum + item.sampleSize, 0),
      fallbackUsed: !cityHasStrongSample
    };

    this.persistBudget(result);
    return result;
  }

  saveLead(id: string, lead: { email?: string; whatsapp?: string }): BudgetResult | null {
    const list = this.getBudgetList();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }

    list[index] = {
      ...list[index],
      leadContact: {
        email: lead.email || undefined,
        whatsapp: lead.whatsapp || undefined
      }
    };

    localStorage.setItem(STORAGE_LIST, JSON.stringify(list));
    localStorage.setItem(STORAGE_LAST, JSON.stringify(list[index]));
    return list[index];
  }

  getBudgetById(id: string): BudgetResult | null {
    const list = this.getBudgetList();
    return list.find((item) => item.id === id) ?? null;
  }

  getLastBudget(): BudgetResult | null {
    const raw = localStorage.getItem(STORAGE_LAST);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as BudgetResult;
    } catch {
      return null;
    }
  }

  getReferences(): PriceReference[] {
    return this.references();
  }

  replaceReferences(references: PriceReference[]): void {
    this.references.set(references);
    localStorage.setItem(STORAGE_RULES, JSON.stringify(references));
  }

  importCsv(csv: string): { imported: number; errors: string[] } {
    const rows = csv
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean);

    if (rows.length <= 1) {
      return { imported: 0, errors: ['CSV vazio ou sem dados.'] };
    }

    const errors: string[] = [];
    const parsed: PriceReference[] = [];

    for (let index = 1; index < rows.length; index += 1) {
      const cols = rows[index].split(',').map((col) => col.trim());
      if (cols.length < 11) {
        errors.push(`Linha ${index + 1}: colunas insuficientes.`);
        continue;
      }

      const [eventType, city, category, calcType, guestMin, guestMax, min, med, max, sampleSize, reliability] = cols;
      const tier = {
        guestMin: Number(guestMin),
        guestMax: Number(guestMax),
        min: Number(min),
        med: Number(med),
        max: Number(max)
      };

      const isTiered = calcType === 'tiered';
      const reference: PriceReference = {
        eventType: eventType as PriceReference['eventType'],
        city,
        category,
        calcType: calcType as PriceReference['calcType'],
        min: Number(min),
        med: Number(med),
        max: Number(max),
        tiers: isTiered ? [tier] : undefined,
        sampleSize: Number(sampleSize),
        reliability: reliability as PriceReference['reliability'],
        sourceLabel: 'CSV importado manualmente'
      };

      if (!reference.eventType || Number.isNaN(reference.min) || Number.isNaN(reference.med) || Number.isNaN(reference.max)) {
        errors.push(`Linha ${index + 1}: valores inválidos.`);
        continue;
      }

      parsed.push(reference);
    }

    if (parsed.length) {
      this.replaceReferences(parsed);
    }

    return { imported: parsed.length, errors };
  }

  private buildCategories(input: BudgetInput): CategoryBudget[] {
    const refs = this.references();
    const profileWeight = this.profileWeight(input.profile);

    const cityMatches = refs.filter((ref) => ref.eventType === input.eventType && ref.city === input.city);
    const fallbackMatches = refs.filter((ref) => ref.eventType === input.eventType && ref.city === 'RJ Geral');

    const categories = new Set([
      ...cityMatches.map((item) => item.category),
      ...fallbackMatches.map((item) => item.category)
    ]);

    return Array.from(categories).map((category) => {
      const primary = cityMatches.find((item) => item.category === category);
      const fallback = fallbackMatches.find((item) => item.category === category);
      const source = primary ?? fallback;

      if (!source) {
        return {
          category,
          min: 0,
          med: 0,
          max: 0,
          sampleSize: 0,
          reliability: 'baixa' as const,
          sourceLabel: 'Sem referencia'
        };
      }

      const { min, med, max } = this.resolveValues(source, input.guests, profileWeight);
      return {
        category,
        min,
        med,
        max,
        sampleSize: source.sampleSize,
        reliability: source.reliability,
        sourceLabel: source.sourceLabel
      };
    });
  }

  private resolveValues(reference: PriceReference, guests: number, profileWeight: number): { min: number; med: number; max: number } {
    if (reference.calcType === 'perPerson') {
      return {
        min: Math.round(reference.min * guests * profileWeight),
        med: Math.round(reference.med * guests * profileWeight),
        max: Math.round(reference.max * guests * profileWeight)
      };
    }

    if (reference.calcType === 'tiered' && reference.tiers?.length) {
      const tier =
        reference.tiers.find((item) => guests >= item.guestMin && guests <= item.guestMax) ??
        reference.tiers[reference.tiers.length - 1];
      return {
        min: Math.round(tier.min * profileWeight),
        med: Math.round(tier.med * profileWeight),
        max: Math.round(tier.max * profileWeight)
      };
    }

    return {
      min: Math.round(reference.min * profileWeight),
      med: Math.round(reference.med * profileWeight),
      max: Math.round(reference.max * profileWeight)
    };
  }

  private profileWeight(profile?: ProfileType): number {
    if (profile === 'Economico') {
      return 0.86;
    }
    if (profile === 'Premium') {
      return 1.2;
    }
    return 1;
  }

  private createId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

  private persistBudget(result: BudgetResult): void {
    const list = this.getBudgetList();
    const next = [result, ...list].slice(0, 100);
    localStorage.setItem(STORAGE_LIST, JSON.stringify(next));
    localStorage.setItem(STORAGE_LAST, JSON.stringify(result));
  }

  private getBudgetList(): BudgetResult[] {
    const raw = localStorage.getItem(STORAGE_LIST);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as BudgetResult[];
    } catch {
      return [];
    }
  }

  private restoreRules(): PriceReference[] {
    const raw = localStorage.getItem(STORAGE_RULES);
    if (!raw) {
      return PRICE_REFERENCES;
    }

    try {
      const parsed = JSON.parse(raw) as PriceReference[];
      return parsed.length ? parsed : PRICE_REFERENCES;
    } catch {
      return PRICE_REFERENCES;
    }
  }
}
