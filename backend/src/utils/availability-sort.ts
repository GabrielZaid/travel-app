import { AvailabilitySort, type FlightAvailability } from '../types/flights';

export function sortAvailabilityResults(
  flights: FlightAvailability[],
  sortBy?: AvailabilitySort,
  referenceDateTime?: string,
): FlightAvailability[] {
  if (!sortBy) {
    return flights;
  }

  const copy = [...flights];
  const referenceTimestamp = normalizeTimestamp(referenceDateTime);

  copy.sort((left, right) => {
    switch (sortBy) {
      case AvailabilitySort.ClosestDeparture:
        return compareNumbers(
          departureDelta(left, referenceTimestamp),
          departureDelta(right, referenceTimestamp),
        );
      case AvailabilitySort.ShortestDuration:
        return compareNumbers(
          durationInMinutes(left),
          durationInMinutes(right),
        );
      case AvailabilitySort.MostSeats:
        return compareNumbers(
          -totalSeats(left),
          -totalSeats(right),
        );
      case AvailabilitySort.LeastSeats:
        return compareNumbers(totalSeats(left), totalSeats(right));
      default:
        return 0;
    }
  });

  return copy;
}

function departureDelta(
  flight: FlightAvailability,
  referenceTimestamp?: number,
): number {
  if (!referenceTimestamp) {
    return Number.MAX_SAFE_INTEGER;
  }
  const flightTimestamp = firstDepartureTimestamp(flight);
  if (!flightTimestamp) {
    return Number.MAX_SAFE_INTEGER - 1;
  }
  return Math.abs(flightTimestamp - referenceTimestamp);
}

function firstDepartureTimestamp(flight: FlightAvailability): number | null {
  const firstSegment = flight.segments[0];
  if (!firstSegment) {
    return null;
  }
  const ts = Date.parse(firstSegment.departure.at);
  if (Number.isNaN(ts)) {
    return null;
  }
  return ts;
}

function durationInMinutes(flight: FlightAvailability): number {
  const duration = flight.duration;
  if (!duration) {
    return Number.MAX_SAFE_INTEGER;
  }
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/i;
  const match = regex.exec(duration);
  if (!match) {
    return Number.MAX_SAFE_INTEGER - 1;
  }
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  return hours * 60 + minutes;
}

function totalSeats(flight: FlightAvailability): number {
  const maybeSegments = (flight as unknown as { segments?: unknown }).segments;
  if (!Array.isArray(maybeSegments)) {
    return 0;
  }

  let total = 0;
  for (const segment of maybeSegments) {
    const maybeClasses = (segment as unknown as { availabilityClasses?: unknown }).availabilityClasses;
    if (!Array.isArray(maybeClasses)) {
      continue;
    }

    for (const availabilityClass of maybeClasses) {
      const seats = (availabilityClass as unknown as { numberOfBookableSeats?: unknown }).numberOfBookableSeats;
      const count =
        typeof seats === 'number' && Number.isFinite(seats)
          ? seats
          : typeof seats === 'string' && /^\d+$/.test(seats)
          ? Number(seats)
          : 0;
      total += count;
    }
  }

  return total;
}

function normalizeTimestamp(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) {
    return undefined;
  }
  return ts;
}

function compareNumbers(a: number, b: number): number {
  return a - b;
}
