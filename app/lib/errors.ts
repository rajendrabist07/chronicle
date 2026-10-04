/**
 * Maps errors from apiFetch or fetch to user-friendly, honest copy.
 * Ensures internal database errors, proxy HTML, or network timeouts are translated cleanly.
 */
export function describeApiError(error: unknown): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }

  const errObj = error as {
    status?: number;
    statusCode?: number;
    message?: string;
    name?: string;
  };

  const status = errObj.status || errObj.statusCode;
  const message = typeof errObj.message === "string" ? errObj.message : "";
  const lowerMsg = message.toLowerCase();

  // 1. Network / Connection Refused / Timeout errors
  if (
    errObj.name === "TypeError" ||
    errObj.name === "AbortError" ||
    lowerMsg.includes("failed to fetch") ||
    lowerMsg.includes("networkerror") ||
    lowerMsg.includes("fetch failed") ||
    lowerMsg.includes("timed out") ||
    lowerMsg.includes("network timeout") ||
    lowerMsg.includes("econnrefused")
  ) {
    return "We can't reach the server right now. It may be waking up — please try again in a minute.";
  }

  // 2. Proxy HTML 502/504 or syntax parse error
  if (
    lowerMsg.includes("is not valid json") ||
    lowerMsg.includes("unexpected token '<'") ||
    lowerMsg.includes("bad gateway") ||
    lowerMsg.includes("gateway timeout")
  ) {
    return "Something went wrong on our side. Your data was not lost. Please try again shortly.";
  }

  // 3. 5xx Server Errors (e.g. 500 DB migration missing, 503 service unavailable)
  if (status && status >= 500 && status <= 599) {
    return "Something went wrong on our side. Your data was not lost. Please try again shortly.";
  }

  // 4. Also catch raw database or Prisma error strings if status was omitted
  if (
    lowerMsg.includes("prisma") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("syntaxerror") ||
    lowerMsg.includes("column") ||
    lowerMsg.includes("table")
  ) {
    return "Something went wrong on our side. Your data was not lost. Please try again shortly.";
  }

  // 5. 429 Rate Limit
  if (status === 429 || lowerMsg.includes("too many requests") || lowerMsg.includes("rate limit")) {
    return message || "Too many requests. Please wait a moment and try again.";
  }

  // 6. 4xx Client Errors (Validation, Credentials, Duplicate, Not Found)
  if (message && message !== "Something went wrong") {
    return message;
  }

  return "An unexpected error occurred. Please try again.";
}
