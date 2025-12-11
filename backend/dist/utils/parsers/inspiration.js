"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInspirationFlights = parseInspirationFlights;
const validators_1 = require("../validators");
const amount_1 = require("../amount");
function isAmadeusFlightDestination(value) {
    if (!(0, validators_1.isRecord)(value))
        return false;
    const v = value;
    const price = v.price;
    return (typeof v.origin === 'string' &&
        typeof v.destination === 'string' &&
        typeof v.departureDate === 'string' &&
        typeof v.returnDate === 'string' &&
        (0, validators_1.isRecord)(price) &&
        typeof price.total === 'string');
}
function toAmadeusFlightDestinations(data) {
    if (!Array.isArray(data))
        return [];
    const out = [];
    for (const c of data)
        if (isAmadeusFlightDestination(c))
            out.push(c);
    return out;
}
function parseInspirationFlights(data, filters) {
    const destinations = toAmadeusFlightDestinations(data);
    const destinationFilter = filters?.destination;
    const filtered = destinationFilter ? destinations.filter((d) => d.destination === destinationFilter) : destinations;
    return filtered.map((entry) => ({
        origin: entry.origin,
        destination: entry.destination,
        departureDate: entry.departureDate,
        returnDate: entry.returnDate,
        price: (0, amount_1.parseAmount)(entry.price.total),
        currency: entry.price.currency ?? 'EUR',
        airline: 'N/A',
        flightNumber: 'N/A',
    }));
}
//# sourceMappingURL=inspiration.js.map