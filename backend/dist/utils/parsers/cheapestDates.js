"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCheapestDates = parseCheapestDates;
const validators_1 = require("../validators");
const amount_1 = require("../amount");
function isAmadeusCheapestDate(value) {
    if (!(0, validators_1.isRecord)(value))
        return false;
    const v = value;
    const price = v.price;
    return (typeof v.origin === 'string' &&
        typeof v.destination === 'string' &&
        typeof v.departureDate === 'string' &&
        (v.returnDate === undefined || typeof v.returnDate === 'string') &&
        (0, validators_1.isRecord)(price) &&
        typeof price.total === 'string');
}
function toAmadeusCheapestDates(data) {
    if (!Array.isArray(data))
        return [];
    const out = [];
    for (const c of data)
        if (isAmadeusCheapestDate(c))
            out.push(c);
    return out;
}
function parseCheapestDates(data) {
    const dates = toAmadeusCheapestDates(data);
    return dates
        .map((entry) => ({
        origin: entry.origin,
        destination: entry.destination,
        departureDate: entry.departureDate,
        returnDate: entry.returnDate,
        price: (0, amount_1.parseAmount)(entry.price.total),
        currency: entry.price.currency ?? 'EUR',
        links: entry.links,
    }))
        .sort((a, b) => a.price - b.price);
}
//# sourceMappingURL=cheapestDates.js.map