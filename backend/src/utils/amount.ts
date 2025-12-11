export function parseAmount(value?: string): number {
  const amount = Number.parseFloat(value ?? '0');
  return Number.isFinite(amount) ? amount : 0;
}
