"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAmount = parseAmount;
function parseAmount(value) {
    const amount = Number.parseFloat(value ?? '0');
    return Number.isFinite(amount) ? amount : 0;
}
//# sourceMappingURL=amount.js.map