export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isAirportPoint(
  value: unknown,
): value is { iataCode: string; at: string } {
  return (
    isRecord(value) &&
    typeof (value as any).iataCode === 'string' &&
    typeof (value as any).at === 'string'
  );
}
