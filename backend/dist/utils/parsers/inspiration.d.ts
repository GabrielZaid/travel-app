import type { FlightInspiration } from '../../types/flights';
export declare function parseInspirationFlights(data: unknown, filters?: {
    destination?: string;
}): FlightInspiration[];
