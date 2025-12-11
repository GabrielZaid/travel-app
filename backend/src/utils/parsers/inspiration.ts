import type { FlightInspiration, AmadeusFlightDestination } from '../../types/flights';
import { isRecord } from '../validators';
import { parseAmount } from '../amount';

function isAmadeusFlightDestination(value: unknown): value is AmadeusFlightDestination {
  if (!isRecord(value)) return false;
  const v = value as Record<string, unknown>;
  const price = v.price as Record<string, unknown> | undefined;
  return (
    typeof v.origin === 'string' &&
    typeof v.destination === 'string' &&
    typeof v.departureDate === 'string' &&
    typeof v.returnDate === 'string' &&
    isRecord(price) &&
    typeof (price as any).total === 'string'
  );
}

function toAmadeusFlightDestinations(data: unknown): AmadeusFlightDestination[] {
  if (!Array.isArray(data)) return [];
  const out: AmadeusFlightDestination[] = [];
  for (const c of data) if (isAmadeusFlightDestination(c)) out.push(c);
  return out;
}

export function parseInspirationFlights(data: unknown, filters?: { destination?: string }): FlightInspiration[] {
  const destinations = toAmadeusFlightDestinations(data);
  const destinationFilter = filters?.destination;
  const filtered = destinationFilter ? destinations.filter((d) => d.destination === destinationFilter) : destinations;

  return filtered.map((entry): FlightInspiration => ({
    origin: entry.origin,
    destination: entry.destination,
    departureDate: entry.departureDate,
    returnDate: entry.returnDate,
    price: parseAmount((entry.price as any).total),
    currency: (entry.price as any).currency ?? 'EUR',
    airline: 'N/A',
    flightNumber: 'N/A',
  }));
}
