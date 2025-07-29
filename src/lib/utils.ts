
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { currencies } from "@/lib/data/form-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(code: string): string {
  const currency = currencies.find(c => c.code === code);
  return currency ? currency.symbol : '';
}

