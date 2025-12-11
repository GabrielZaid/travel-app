import type {
  Flight,
  FlightSegment,
  FlightAdultPricing,
} from '../../types/flights';
import { isRecord, isAirportPoint } from '../validators';
import { parseAmount } from '../amount';

export function parseFlights(data: unknown): Flight[] {
  if (!Array.isArray(data)) return [];

  const flights: Flight[] = [];

  for (const candidate of data) {
    if (!isRecord(candidate)) continue;

    const type = candidate.type;
    if (typeof type !== 'string' || type.toLowerCase() !== 'flight-offer')
      continue;

    const id = candidate.id;
    if (typeof id !== 'string') continue;

    const priceRecord = candidate.price;
    if (!isRecord(priceRecord) || typeof priceRecord.total !== 'string')
      continue;

    const itinerariesRaw = candidate.itineraries;
    if (!Array.isArray(itinerariesRaw) || itinerariesRaw.length === 0) continue;

    const firstItinerary = itinerariesRaw.find(isRecord);
    if (!firstItinerary) continue;

    const segmentsRaw = firstItinerary.segments;
    if (!Array.isArray(segmentsRaw) || segmentsRaw.length === 0) continue;

    const segments: FlightSegment[] = [];
    let ok = true;

    for (const seg of segmentsRaw) {
      if (!isRecord(seg)) {
        ok = false;
        break;
      }
      const carrierCode = seg.carrierCode;
      const number = seg.number;
      if (typeof carrierCode !== 'string' || typeof number !== 'string') {
        ok = false;
        break;
      }
      const departure = seg.departure;
      const arrival = seg.arrival;
      if (!isAirportPoint(departure) || !isAirportPoint(arrival)) {
        ok = false;
        break;
      }

      let operatingCarrier: string | undefined;
      const operating = seg.operating;
      if (isRecord(operating) && typeof (operating as any).carrierCode === 'string') {
        operatingCarrier = (operating as any).carrierCode;
      }

      segments.push({
        departureAirport: (departure as any).iataCode,
        departureAt: (departure as any).at,
        arrivalAirport: (arrival as any).iataCode,
        arrivalAt: (arrival as any).at,
        carrierCode: operatingCarrier ?? carrierCode,
        flightNumber: `${carrierCode}${number}`,
        duration: typeof (seg as any).duration === 'string' ? (seg as any).duration : undefined,
      });
    }

    if (!ok || segments.length === 0) continue;

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const priceCurrency = typeof (priceRecord as any).currency === 'string' ? (priceRecord as any).currency : 'EUR';

    const travelerPricingsRaw = candidate.travelerPricings;
    let adultPricing: FlightAdultPricing | undefined;

    if (Array.isArray(travelerPricingsRaw)) {
      for (const travelerRaw of travelerPricingsRaw) {
        if (!isRecord(travelerRaw)) continue;
        const travelerType = (travelerRaw as any).travelerType;
        if (typeof travelerType !== 'string') continue;
        if (travelerType.toUpperCase() !== 'ADULT') continue;

        const fareOption = (travelerRaw as any).fareOption;
        if (typeof fareOption !== 'string') continue;

        const travelerPrice = (travelerRaw as any).price;
        if (!isRecord(travelerPrice) || typeof (travelerPrice as any).total !== 'string') continue;

        const fareDetailsRaw = (travelerRaw as any).fareDetailsBySegment;
        let cabin: string | undefined;
        let fareBasis: string | undefined;
        if (Array.isArray(fareDetailsRaw)) {
          for (const d of fareDetailsRaw) {
            if (!isRecord(d)) continue;
            if (typeof (d as any).cabin === 'string' && cabin === undefined) cabin = (d as any).cabin;
            if (typeof (d as any).fareBasis === 'string' && fareBasis === undefined) fareBasis = (d as any).fareBasis;
            if (cabin && fareBasis) break;
          }
        }

        adultPricing = {
          travelerType,
          fareOption,
          cabin,
          fareBasis,
          price: {
            currency: typeof (travelerPrice as any).currency === 'string' ? (travelerPrice as any).currency : priceCurrency,
            total: parseAmount((travelerPrice as any).total),
            base: parseAmount(
            (travelerPrice as any).base 
            ?? 
            (travelerPrice as any).total),
          },
        };
        break;
      }
    }

    const flightPrice = {
      currency: priceCurrency,
      total: parseAmount((priceRecord as any).total),
      base: parseAmount((priceRecord as any).base ?? (priceRecord as any).total),
      grandTotal: parseAmount((priceRecord as any).grandTotal ?? (priceRecord as any).total),
    };

    const itineraryDuration = typeof (firstItinerary as any).duration === 'string' ? (firstItinerary as any).duration : '';

    let airline: string | undefined;
    const airlineCodes = candidate.validatingAirlineCodes;
    if (Array.isArray(airlineCodes)) {
      airline = airlineCodes.find((c): c is string => typeof c === 'string');
    }

    flights.push({
      id,
      origin: firstSegment.departureAirport,
      destination: lastSegment.arrivalAirport,
      departureDate: firstSegment.departureAt,
      arrivalDate: lastSegment.arrivalAt,
      duration: itineraryDuration,
      airline: airline ?? firstSegment.carrierCode,
      price: flightPrice,
      adultPricing,
      segments,
    });
  }

  return flights;
}
