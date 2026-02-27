// ADDED: Minimal text normalizer for odd encodings and spacing.
export function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}
