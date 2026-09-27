import { createClient } from "@supabase/supabase-js";

type Mode = "dry-run" | "run";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  ean_barcodes: string[];
};

type ProposedChange = {
  id: string;
  slug: string;
  currentTitle: string;
  proposedTitle: string;
  matchedBarcode: string;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseMode(args: string[]): Mode {
  if (args.length !== 1 || !["--dry-run", "--run"].includes(args[0])) {
    throw new Error("Use exactly one argument: --dry-run or --run.");
  }

  return args[0] === "--run" ? "run" : "dry-run";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normaliseTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-GB");
}

function removeTrailingBarcode(title: string, barcodes: string[]): {
  title: string;
  barcode: string | null;
} {
  for (const barcode of barcodes.filter((value) => /^\d{8,14}$/.test(value))) {
    const suffix = new RegExp(`(?:\\s*(?:[-–—|,:]|[[(])?\\s*)${escapeRegExp(barcode)}[\\])]?$`);
    if (!suffix.test(title)) continue;

    const cleaned = title
      .replace(suffix, "")
      .replace(/[\s,;:|–—-]+$/g, "")
      .trim();
    if (cleaned) return { title: cleaned, barcode };
  }

  return { title, barcode: null };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const supabase = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, ean_barcodes")
    .order("name");
  if (error) throw new Error(`Failed to load products: ${error.message}`);

  const products = (data ?? []) as ProductRow[];
  const existingTitles = new Map<string, string[]>();
  for (const product of products) {
    const key = normaliseTitle(product.name);
    existingTitles.set(key, [...(existingTitles.get(key) ?? []), product.id]);
  }

  const candidates = products.flatMap((product): ProposedChange[] => {
    const result = removeTrailingBarcode(product.name, product.ean_barcodes ?? []);
    if (!result.barcode || result.title === product.name) return [];

    return [{
      id: product.id,
      slug: product.slug,
      currentTitle: product.name,
      proposedTitle: result.title,
      matchedBarcode: result.barcode,
    }];
  });
  const candidatesByTitle = new Map<string, ProposedChange[]>();
  for (const candidate of candidates) {
    const key = normaliseTitle(candidate.proposedTitle);
    candidatesByTitle.set(key, [...(candidatesByTitle.get(key) ?? []), candidate]);
  }

  const conflicts = candidates.filter((candidate) => {
    const titleKey = normaliseTitle(candidate.proposedTitle);
    const existingIds = existingTitles.get(titleKey) ?? [];
    return existingIds.some((id) => id !== candidate.id) || (candidatesByTitle.get(titleKey)?.length ?? 0) > 1;
  });
  const conflictIds = new Set(conflicts.map((conflict) => conflict.id));
  const changes = candidates.filter((candidate) => !conflictIds.has(candidate.id));

  if (mode === "run") {
    for (const batch of chunk(changes, 25)) {
      const results = await Promise.all(
        batch.map((change) =>
          supabase.from("products").update({ name: change.proposedTitle }).eq("id", change.id),
        ),
      );
      const updateError = results.find((result) => result.error)?.error;
      if (updateError) throw new Error(`Failed to remove barcode from title: ${updateError.message}`);
    }

    const { data: verification, error: verificationError } = await supabase
      .from("products")
      .select("id, name")
      .in("id", changes.map((change) => change.id));
    if (verificationError) throw new Error(`Failed to verify title updates: ${verificationError.message}`);

    const verifiedTitles = new Map((verification ?? []).map((product) => [product.id, product.name]));
    const mismatches = changes.filter(
      (change) => verifiedTitles.get(change.id) !== change.proposedTitle,
    );
    if (mismatches.length > 0) {
      throw new Error(`Title verification failed for ${mismatches.length} products.`);
    }
  }

  console.log(JSON.stringify({
    mode,
    productsScanned: products.length,
    barcodeTitlesFound: candidates.length,
    updated: changes.length,
    skippedForTitleConflict: conflicts.length,
    changes,
    conflicts,
  }, null, 2));
}

void main();
