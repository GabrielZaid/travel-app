export function extractPayload(response: unknown): unknown {
  if (response && typeof response === 'object') {
    const respObj = response as Record<string, unknown>;
    return 'data' in respObj ? respObj['data'] : response;
  }
  return response;
}

export function extractProviderError(err: unknown): {
  status?: number;
  data?: unknown;
} {
  let status: number | undefined;
  let respData: unknown;

  if (err && typeof err === 'object') {
    const errorRecord = err as Record<string, unknown>;
    const responseValue = errorRecord['response'];
    if (responseValue && typeof responseValue === 'object') {
      const responseRecord = responseValue as Record<string, unknown>;
      const statusCandidate = responseRecord['status'];
      if (typeof statusCandidate === 'number') status = statusCandidate;
      respData = responseRecord['data'];
    }
  }

  return { status, data: respData };
}
