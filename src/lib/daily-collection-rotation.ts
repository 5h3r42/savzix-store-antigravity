type RotatableProduct = {
  id: string;
};

const UK_TIME_ZONE = "Europe/London";

function getLondonDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: UK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: partValue("year"),
    month: partValue("month"),
    day: partValue("day"),
  };
}

function getDayNumber(date: Date) {
  const { year, month, day } = getLondonDateParts(date);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function getCollectionOffset(collectionName: string) {
  return [...collectionName].reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 10_000,
    0,
  );
}

export function selectDailyCollection<T extends RotatableProduct>(
  products: T[],
  collectionName: string,
  size: number,
  candidateLimit: number,
  date = new Date(),
): T[] {
  const candidates = products.slice(0, candidateLimit);

  if (candidates.length <= size) {
    return candidates;
  }

  const startIndex = (getDayNumber(date) + getCollectionOffset(collectionName)) % candidates.length;

  return Array.from({ length: size }, (_, offset) => candidates[(startIndex + offset) % candidates.length]);
}
