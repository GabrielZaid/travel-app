"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigValue = getConfigValue;
function getConfigValue(configService, key, errorPrefix) {
    const value = configService.get(key);
    if (value === undefined || value === null || value === '') {
        const message = errorPrefix
            ? `${errorPrefix}: ${String(key)}`
            : `Missing config value: ${String(key)}`;
        throw new Error(message);
    }
    return value;
}
//# sourceMappingURL=configValue.js.map