// Premium pricing constants. Real subscription state lives in Supabase (subscriptions table).
export type PremiumPlan = '1m' | '3m' | '12m';

export const PRICING = {
  uzs: { '1m': 59_000, '3m': 159_000, '12m': 590_000 },
  usd: { '1m': 4.99, '3m': 12.99, '12m': 49.99 },
} as const;

export const PLAN_DAYS: Record<PremiumPlan, number> = { '1m': 30, '3m': 90, '12m': 365 };
export const PLAN_LABEL: Record<PremiumPlan, string> = { '1m': '1 oylik', '3m': '3 oylik', '12m': '12 oylik' };

export const formatUZS = (n: number) => n.toLocaleString('uz-UZ') + " so'm";
export const formatUSD = (n: number) => '$' + n.toFixed(2);
