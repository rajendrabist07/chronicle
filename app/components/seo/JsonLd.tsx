/**
 * Safe JSON-LD script component that escapes '<' characters to prevent XSS injection.
 */
export default function JsonLd<T extends Record<string, unknown>>({ data }: { data: T }) {
  const jsonString = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
