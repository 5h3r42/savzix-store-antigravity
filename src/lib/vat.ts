export function calculateIncludedVat(grossAmount: number, vatRate: number): number {
  if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
    return 0;
  }

  if (!Number.isFinite(vatRate) || vatRate <= 0) {
    return 0;
  }

  const vatAmount = grossAmount - grossAmount / (1 + vatRate);

  return Math.round(vatAmount * 100) / 100;
}

export function formatVatRate(vatRate: number): string {
  return `${Math.round(vatRate * 100)}%`;
}
