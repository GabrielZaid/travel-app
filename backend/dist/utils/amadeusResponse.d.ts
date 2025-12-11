export declare function extractPayload(response: unknown): unknown;
export declare function extractProviderError(err: unknown): {
    status?: number;
    data?: unknown;
};
