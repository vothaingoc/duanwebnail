import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

type PricingWindow = {
  GOLYN_PRICING_LANGS?: string[];
  GOLYN_PRICING_CATEGORIES?: Record<string, any>;
  GOLYN_PRICING_HOME_CARDS?: any[];
  GOLYN_PRICING_ITEMS?: any[];
  GOLYN_PRICING_CAMPAIGN?: any;
};

export async function getPricingFallback() {
  const file = resolve(process.cwd(), 'public', 'assets', 'js', 'pricing-data.js');
  const source = await readFile(file, 'utf8');
  const window: PricingWindow = {};
  runInNewContext(source, { window, Date, Intl });
  return {
    langs: window.GOLYN_PRICING_LANGS || ['ja'],
    categories: window.GOLYN_PRICING_CATEGORIES || {},
    homeCards: window.GOLYN_PRICING_HOME_CARDS || [],
    items: window.GOLYN_PRICING_ITEMS || [],
    campaign: window.GOLYN_PRICING_CAMPAIGN || null,
  };
}

export function formatYen(value: unknown) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') return `¥${value.toLocaleString('ja-JP')}`;
  return String(value);
}
