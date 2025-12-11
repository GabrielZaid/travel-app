import type {
  FlightAvailability,
  FlightAvailabilityClass,
  FlightAvailabilitySegment,
} from '../../types/flights';
import { isRecord } from '../validators';

export function parseAvailabilityFlights(
  payload: unknown,
): FlightAvailability[] {
  const data = extractDataArray(payload);
  const results: FlightAvailability[] = [];

  for (const item of data) {
    if (!isRecord(item)) continue;

    const type = typeof item.type === 'string' ? item.type : '';
    if (type.toLowerCase() !== 'flight-availability') continue;

    const id = typeof item.id === 'string' ? item.id : undefined;
    if (!id) continue;

    const duration =
      typeof item.duration === 'string' ? item.duration : undefined;

    const segments = parseSegments(item.segments);
    if (segments.length === 0) continue;

    results.push({
      type: 'flight-availability',
      id,
      duration,
      segments,
    });
  }

  return results;
}

function extractDataArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    const data = payload.data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

function parseSegments(value: unknown): FlightAvailabilitySegment[] {
  if (!Array.isArray(value)) return [];

  const segments: FlightAvailabilitySegment[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;

    const id = typeof raw.id === 'string' ? raw.id : undefined;
    const carrierCode =
      typeof raw.carrierCode === 'string' ? raw.carrierCode : undefined;
    const number = typeof raw.number === 'string' ? raw.number : undefined;

    if (!id || !carrierCode || !number) continue;

    const departure = parseFlightPoint(raw.departure);
    const arrival = parseFlightPoint(raw.arrival);
    if (!departure || !arrival) continue;

    const availabilityClasses = parseAvailabilityClasses(
      raw.availabilityClasses,
    );
    if (availabilityClasses.length === 0) continue;

    segments.push({
      id,
      carrierCode,
      number,
      departure,
      arrival,
      availabilityClasses,
    });
  }
  return segments;
}

function parseFlightPoint(value: unknown): {
  iataCode: string;
  terminal?: string;
  at: string;
} | null {
  if (!isRecord(value)) return null;
  const iataCode =
    typeof value.iataCode === 'string' ? value.iataCode : undefined;
  const atRaw = typeof value.at === 'string' ? value.at : undefined;
  if (!iataCode || !atRaw) return null;

  const normalized = normalizeDate(atRaw) ?? atRaw;
  const terminal =
    typeof value.terminal === 'string' ? value.terminal : undefined;
  return { iataCode, at: normalized, terminal };
}

function parseAvailabilityClasses(value: unknown): FlightAvailabilityClass[] {
  if (!Array.isArray(value)) return [];
  const classes: FlightAvailabilityClass[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const cabinClass = typeof item.class === 'string' ? item.class : undefined;
    const seatsRaw = item.numberOfBookableSeats;
    const numberOfBookableSeats =
      typeof seatsRaw === 'number' && Number.isFinite(seatsRaw)
        ? Math.max(0, Math.floor(seatsRaw))
        : undefined;
    if (!cabinClass || numberOfBookableSeats === undefined) continue;
    classes.push({ class: cabinClass, numberOfBookableSeats });
  }
  return classes;
}

function normalizeDate(value: string): string | undefined {
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return value;
  }
  return new Date(ts).toISOString();
}
