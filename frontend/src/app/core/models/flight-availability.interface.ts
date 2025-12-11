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

export interface SearchAvailabilityPayload {
  origin: string;
  destination: string;
  date: string;
  time: string;
}

export type FlightAvailabilityResponse = ApiResponse<FlightAvailability[]>;
