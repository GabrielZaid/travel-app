"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCheapestDates = exports.parseInspirationFlights = exports.parseFlights = void 0;
var flights_1 = require("./parsers/flights");
Object.defineProperty(exports, "parseFlights", { enumerable: true, get: function () { return flights_1.parseFlights; } });
var inspiration_1 = require("./parsers/inspiration");
Object.defineProperty(exports, "parseInspirationFlights", { enumerable: true, get: function () { return inspiration_1.parseInspirationFlights; } });
var cheapestDates_1 = require("./parsers/cheapestDates");
Object.defineProperty(exports, "parseCheapestDates", { enumerable: true, get: function () { return cheapestDates_1.parseCheapestDates; } });
//# sourceMappingURL=treatData.js.map