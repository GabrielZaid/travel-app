"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFlights = parseFlights;
const validators_1 = require("../validators");
const amount_1 = require("../amount");
function parseFlights(data) {
    if (!Array.isArray(data))
        return [];
    const flights = [];
    for (const candidate of data) {
        if (!(0, validators_1.isRecord)(candidate))
            continue;
        const type = candidate.type;
        if (typeof type !== 'string' || type.toLowerCase() !== 'flight-offer')
            continue;
        const id = candidate.id;
        if (typeof id !== 'string')
            continue;
        const priceRecord = candidate.price;
        if (!(0, validators_1.isRecord)(priceRecord) || typeof priceRecord.total !== 'string')
            continue;
        const itinerariesRaw = candidate.itineraries;
        if (!Array.isArray(itinerariesRaw) || itinerariesRaw.length === 0)
            continue;
        const firstItinerary = itinerariesRaw.find(validators_1.isRecord);
        if (!firstItinerary)
            continue;
        const segmentsRaw = firstItinerary.segments;
        if (!Array.isArray(segmentsRaw) || segmentsRaw.length === 0)
            continue;
        const segments = [];
        let ok = true;
        for (const seg of segmentsRaw) {
            if (!(0, validators_1.isRecord)(seg)) {
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
            if (!(0, validators_1.isAirportPoint)(departure) || !(0, validators_1.isAirportPoint)(arrival)) {
                ok = false;
                break;
            }
            let operatingCarrier;
            const operating = seg.operating;
            if ((0, validators_1.isRecord)(operating) && typeof operating.carrierCode === 'string') {
                operatingCarrier = operating.carrierCode;
            }
            segments.push({
                departureAirport: departure.iataCode,
                departureAt: departure.at,
                arrivalAirport: arrival.iataCode,
                arrivalAt: arrival.at,
                carrierCode: operatingCarrier ?? carrierCode,
                flightNumber: `${carrierCode}${number}`,
                duration: typeof seg.duration === 'string' ? seg.duration : undefined,
            });
        }
        if (!ok || segments.length === 0)
            continue;
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        const priceCurrency = typeof priceRecord.currency === 'string' ? priceRecord.currency : 'EUR';
        const travelerPricingsRaw = candidate.travelerPricings;
        let adultPricing;
        if (Array.isArray(travelerPricingsRaw)) {
            for (const travelerRaw of travelerPricingsRaw) {
                if (!(0, validators_1.isRecord)(travelerRaw))
                    continue;
                const travelerType = travelerRaw.travelerType;
                if (typeof travelerType !== 'string')
                    continue;
                if (travelerType.toUpperCase() !== 'ADULT')
                    continue;
                const fareOption = travelerRaw.fareOption;
                if (typeof fareOption !== 'string')
                    continue;
                const travelerPrice = travelerRaw.price;
                if (!(0, validators_1.isRecord)(travelerPrice) || typeof travelerPrice.total !== 'string')
                    continue;
                const fareDetailsRaw = travelerRaw.fareDetailsBySegment;
                let cabin;
                let fareBasis;
                if (Array.isArray(fareDetailsRaw)) {
                    for (const d of fareDetailsRaw) {
                        if (!(0, validators_1.isRecord)(d))
                            continue;
                        if (typeof d.cabin === 'string' && cabin === undefined)
                            cabin = d.cabin;
                        if (typeof d.fareBasis === 'string' && fareBasis === undefined)
                            fareBasis = d.fareBasis;
                        if (cabin && fareBasis)
                            break;
                    }
                }
                adultPricing = {
                    travelerType,
                    fareOption,
                    cabin,
                    fareBasis,
                    price: {
                        currency: typeof travelerPrice.currency === 'string' ? travelerPrice.currency : priceCurrency,
                        total: (0, amount_1.parseAmount)(travelerPrice.total),
                        base: (0, amount_1.parseAmount)(travelerPrice.base ?? travelerPrice.total),
                    },
                };
                break;
            }
        }
        const flightPrice = {
            currency: priceCurrency,
            total: (0, amount_1.parseAmount)(priceRecord.total),
            base: (0, amount_1.parseAmount)(priceRecord.base ?? priceRecord.total),
            grandTotal: (0, amount_1.parseAmount)(priceRecord.grandTotal ?? priceRecord.total),
        };
        const itineraryDuration = typeof firstItinerary.duration === 'string' ? firstItinerary.duration : '';
        let airline;
        const airlineCodes = candidate.validatingAirlineCodes;
        if (Array.isArray(airlineCodes)) {
            airline = airlineCodes.find((c) => typeof c === 'string');
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
//# sourceMappingURL=flights.js.map