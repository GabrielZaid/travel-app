export interface FlightResponse {
  data: Flight[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;     // ISO date string
  arrivalDate: string;       // ISO date string
  duration: string;          // Ej: "PT1H55M"
  airline: string;           // Código de aerolínea (UX)
  price: FlightPrice;
  adultPricing: AdultPricing;
  segments: FlightSegment[];
}

export interface FlightPrice {
  currency: string;
  total: number;
  base: number;
  grandTotal: number;
}

export interface AdultPricing {
  travelerType: string;   // "ADULT"
  fareOption: string;     // "STANDARD"
  cabin: string;          // "ECONOMY"
  fareBasis: string;      // "PYYO5L"
  price: AdultPrice;
}

export interface AdultPrice {
  currency: string;
  total: number;
  base: number;
}

export interface FlightSegment {
  departureAirport: string;  // "MAD"
  departureAt: string;       // ISO date
  arrivalAirport: string;    // "ORY"
  arrivalAt: string;         // ISO date
  carrierCode: string;       // "UX"
  flightNumber: string;      // "UX1027"
  duration: string;          // "PT1H55M"
}