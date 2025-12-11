"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPayload = extractPayload;
exports.extractProviderError = extractProviderError;
function extractPayload(response) {
    if (response && typeof response === 'object') {
        const respObj = response;
        return 'data' in respObj ? respObj['data'] : response;
    }
    return response;
}
function extractProviderError(err) {
    let status;
    let respData;
    if (err && typeof err === 'object') {
        const errorRecord = err;
        const responseValue = errorRecord['response'];
        if (responseValue && typeof responseValue === 'object') {
            const responseRecord = responseValue;
            const statusCandidate = responseRecord['status'];
            if (typeof statusCandidate === 'number')
                status = statusCandidate;
            respData = responseRecord['data'];
        }
    }
    return { status, data: respData };
}
//# sourceMappingURL=amadeusResponse.js.map