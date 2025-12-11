"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecord = isRecord;
exports.isAirportPoint = isAirportPoint;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function isAirportPoint(value) {
    return (isRecord(value) &&
        typeof value.iataCode === 'string' &&
        typeof value.at === 'string');
}
//# sourceMappingURL=validators.js.map