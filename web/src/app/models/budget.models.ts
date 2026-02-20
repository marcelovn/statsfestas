export type EventType = 'Infantil' | '15 anos' | 'Casamento';
export type ProfileType = 'Economico' | 'Medio' | 'Premium';
export type CalcType = 'perPerson' | 'fixed' | 'tiered';

export interface BudgetInput {
  eventType: EventType;
  guests: number;
  city: string;
  neighborhood?: string;
  profile?: ProfileType;
}

export interface PriceTier {
  guestMin: number;
  guestMax: number;
  min: number;
  med: number;
  max: number;
}

export interface PriceReference {
  eventType: EventType;
  city: string;
  category: string;
  calcType: CalcType;
  min: number;
  med: number;
  max: number;
  tiers?: PriceTier[];
  sampleSize: number;
  reliability: 'baixa' | 'media' | 'alta';
  sourceLabel: string;
}

export interface CategoryBudget {
  category: string;
  min: number;
  med: number;
  max: number;
  sampleSize: number;
  reliability: 'baixa' | 'media' | 'alta';
  sourceLabel: string;
}

export interface BudgetResult {
  id: string;
  input: BudgetInput;
  regionApplied: string;
  createdAtIso: string;
  categories: CategoryBudget[];
  total: {
    min: number;
    med: number;
    max: number;
  };
  referencesUsed: number;
  fallbackUsed: boolean;
  leadContact?: {
    email?: string;
    whatsapp?: string;
  };
}
