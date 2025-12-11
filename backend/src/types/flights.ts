export interface FlightPrice {
  currency: string;
  total: number;
  base: number;
  grandTotal: number;
}

export interface FlightSegment {
  departureAirport: string;
  departureAt: string;
  arrivalAirport: string;
  arrivalAt: string;
  carrierCode: string;
  flightNumber: string;
  duration?: string;
}

export interface FlightAdultPricing {
  travelerType: string;
  fareOption: string;
  cabin?: string;
  fareBasis?: string;
  price: {
    currency: string;
    total: number;
    base: number;
  };
}

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  duration: string;
  airline: string;
  price: FlightPrice;
  adultPricing?: FlightAdultPricing;
  segments: FlightSegment[];
}

export interface AmadeusFlightDestination {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: { total: string; currency?: string };
  links?: unknown;
}

export interface AmadeusCheapestDate {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: { total: string; currency?: string };
  links?: unknown;
}

export interface AmadeusFlightSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration?: string;
  operating?: { carrierCode?: string };
}

export interface AmadeusFlightItinerary {
  duration?: string;
  segments: AmadeusFlightSegment[];
}

export interface AmadeusTravelerFareDetail {
  cabin?: string;
  fareBasis?: string;
  operatingCarrierCode?: string;
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  travelerType: string;
  fareOption: string;
  price: { currency?: string; total: string; base?: string };
  fareDetailsBySegment?: AmadeusTravelerFareDetail[];
}

export interface AmadeusFlightOfferPrice {
  currency?: string;
  total: string;
  base?: string;
  grandTotal?: string;
}

export interface AmadeusFlightOffer {
  type: string;
  id: string;
  itineraries: AmadeusFlightItinerary[];
  price: AmadeusFlightOfferPrice;
  travelerPricings?: AmadeusTravelerPricing[];
  validatingAirlineCodes?: string[];
}

export interface FlightInspiration {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber: string;
}

export interface FlightCheapestDate {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: number;
  currency: string;
  links?: unknown;
}
