export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isAirportPoint(value: unknown): value is {
    iataCode: string;
    at: string;
};
