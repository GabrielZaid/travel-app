import type { ApiResponse } from './flight.interface';

export interface FlightAvailabilityClass {
  class: string;
  numberOfBookableSeats: number;
}

export interface FlightAvailabilityPoint {
  iataCode: string;
  at: string;
  terminal?: string;
}

export interface FlightAvailabilitySegment {
  id: string;
  carrierCode: string;
  number: string;
  departure: FlightAvailabilityPoint;
  arrival: FlightAvailabilityPoint;
  availabilityClasses: FlightAvailabilityClass[];
}

export interface FlightAvailability {
  type: 'flight-availability';
  id: string;
  duration?: string;
  segments: FlightAvailabilitySegment[];
}

export type AvailabilitySortOption =
  | 'closestDeparture'
  | 'shortestDuration'
  | 'mostSeats'
  | 'leastSeats';

export interface SearchAvailabilityPayload {
  origin: string;
  destination: string;
  date: string;
  time: string;
  page?: number;
  limit?: number;
  sortBy?: AvailabilitySortOption;
}

export interface FlightAvailabilityResponse
  extends ApiResponse<FlightAvailability[]> {
  total: number;
  page: number;
  pageSize: number;
}

export type FlightAvailabilityQuery = Omit<SearchAvailabilityPayload, 'page' | 'limit'>;
