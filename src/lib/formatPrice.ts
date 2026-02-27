// ADDED: Central GBP formatter for PLP pricing.
const gbpFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatPrice(value: number): string {
  return gbpFormatter.format(value);
}
