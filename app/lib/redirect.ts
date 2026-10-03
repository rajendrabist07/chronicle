/**
 * Validates and sanitizes a redirect target path to prevent open redirect vulnerabilities.
 * Only allows same-origin relative paths starting with a single '/' and rejects protocols, backslashes, and protocol-relative URLs.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/posts",
): string {
  if (!next || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();

  // Reject protocol-relative URLs (//evil.com), backslashes, schemes, and data/javascript URIs
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("\\") &&
    !trimmed.includes(":")
  ) {
    return trimmed;
  }

  return fallback;
}
