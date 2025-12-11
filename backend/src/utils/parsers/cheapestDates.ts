import type { FlightCheapestDate, AmadeusCheapestDate } from '../../types/flights';
import { isRecord } from '../validators';
import { parseAmount } from '../amount';

function isAmadeusCheapestDate(value: unknown): value is AmadeusCheapestDate {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  const price = v.price as Record<string, unknown> | undefined;
  return (
    typeof v.origin === 'string' &&
    typeof v.destination === 'string' &&
    typeof v.departureDate === 'string' &&
    (v.returnDate === undefined || typeof v.returnDate === 'string') &&
    isRecord(price) &&
    typeof (price as any).total === 'string'
  );
}

function toAmadeusCheapestDates(data: unknown): AmadeusCheapestDate[] {
  if (!Array.isArray(data)) return [];
  const out: AmadeusCheapestDate[] = [];
  for (const c of data) if (isAmadeusCheapestDate(c)) out.push(c);
  return out;
}

export function parseCheapestDates(data: unknown): FlightCheapestDate[] {
  const dates = toAmadeusCheapestDates(data);
  return dates
    .map((entry): FlightCheapestDate => ({
      origin: entry.origin,
      destination: entry.destination,
      departureDate: entry.departureDate,
      returnDate: entry.returnDate,
      price: parseAmount((entry.price as any).total),
      currency: (entry.price as any).currency ?? 'EUR',
      links: (entry as any).links,
    }))
    .sort((a, b) => a.price - b.price);
}
