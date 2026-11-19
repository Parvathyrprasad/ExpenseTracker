import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with Indian Rupee (₹) as default.
 * Handles string or number decimals accurately.
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'INR',
  currencySymbol: string = '₹'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return `${currencySymbol}0.00`;

  // Standard Indian numbering format if INR
  if (currency === 'INR') {
    return `${currencySymbol}${numericAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(numericAmount);
}

/**
 * Parses user input amounts into clean two-decimal-place strings.
 */
export function sanitizeDecimal(val: string | number): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0.00';
  return (Math.round(num * 100) / 100).toFixed(2);
}
