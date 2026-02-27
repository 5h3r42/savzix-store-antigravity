import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type Mode = "dry-run" | "run";

type CliOptions = {
  mode: Mode;
  source: string;
  bucket: string;
  prefix: string;
  quality: number;
  concurrency: number;
  maxDimension: number;
  manifestPath: string;
  summaryPath: string;
  csvPath: string;
};

type DiscoveryStats = {
  skippedHidden: number;
  skippedNonImage: number;
};

type FolderInfo = {
  folderName: string;
  folderPath: string;
  folderSlug: string;
};

type SourceImage = {
  sourcePath: string;
  folderName: string;
  folderSlug: string;
  sequence: string;
  storagePath: string;
};

type ManifestRow = {
  source_path: string;
  folder_name: string;
  folder_slug: string;
  sequence: string;
  storage_path: string;
  public_url: string;
  width: number;
  height: number;
  bytes_before: number;
  bytes_after: number;
  sha1: string;
  uploaded_at: string | null;
};

type FailureRow = {
  source_path: string;
  storage_path: string;
  error: string;
};

type SummaryRow = {
  mode: Mode;
  source_root: string;
  bucket: string;
  prefix: string;
  quality: number;
  max_dimension: number;
  concurrency: number;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  folders_discovered: number;
  discovered_images: number;
  processed_images: number;
  succeeded: number;
  failed: number;
  skipped_hidden: number;
  skipped_non_image: number;
  bytes_before_total: number;
  bytes_after_total: number;
  bytes_saved_total: number;
  reduction_percent: number;
  per_folder_counts: Record<string, { folder_name: string; succeeded: number; failed: number }>;
  failures: FailureRow[];
  manifest_path: string;
  manifest_csv_path: string;
};

const DEFAULT_SOURCE =
  "/Users/sherazkhalid/Documents/AITECHINNOVATIONS/savzix.com/product_images";
const DEFAULT_BUCKET = "product-images";
const DEFAULT_PREFIX = "products";
const DEFAULT_QUALITY = 80;
const DEFAULT_CONCURRENCY = 6;
const DEFAULT_MAX_DIMENSION = 1200;

const IMAGE_EXTENSIONS = new Set([".webp", ".jpg", ".jpeg", ".png", ".avif"]);
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizePath(input: string): string {
  if (path.isAbsolute(input)) {
    return path.normalize(input);
  }

  return path.join(process.cwd(), input);
}

function slugify(value: string): string {
  const ascii = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "");

  return ascii
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";
}

function parsePositiveInt(value: string, field: string): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return parsed;
}

function parseArgs(argv: string[]): CliOptions {
  let mode: Mode | null = null;

  const options: Omit<CliOptions, "mode"> = {
    source: DEFAULT_SOURCE,
    bucket: DEFAULT_BUCKET,
    prefix: DEFAULT_PREFIX,
    quality: DEFAULT_QUALITY,
    concurrency: DEFAULT_CONCURRENCY,
    maxDimension: DEFAULT_MAX_DIMENSION,
    manifestPath: path.join(process.cwd(), "data", "image-import-manifest.json"),
    summaryPath: path.join(process.cwd(), "data", "image-import-summary.json"),
    csvPath: path.join(process.cwd(), "data", "image-import-manifest.csv"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--dry-run":
        if (mode === "run") {
          throw new Error("Use either --dry-run or --run, not both.");
        }
        mode = "dry-run";
        break;
      case "--run":
        if (mode === "dry-run") {
          throw new Error("Use either --dry-run or --run, not both.");
        }
        mode = "run";
        break;
      case "--source":
        index += 1;
        options.source = normalizePath(argv[index] ?? "");
        break;
      case "--bucket":
        index += 1;
        options.bucket = argv[index] ?? "";
        break;
      case "--prefix":
        index += 1;
        options.prefix = argv[index] ?? "";
        break;
      case "--quality":
        index += 1;
        options.quality = parsePositiveInt(argv[index] ?? "", "quality");
        break;
      case "--concurrency":
        index += 1;
        options.concurrency = parsePositiveInt(argv[index] ?? "", "concurrency");
        break;
      case "--max-dimension":
        index += 1;
        options.maxDimension = parsePositiveInt(argv[index] ?? "", "max-dimension");
        break;
      case "--manifest-path":
        index += 1;
        options.manifestPath = normalizePath(argv[index] ?? "");
        break;
      case "--summary-path":
        index += 1;
        options.summaryPath = normalizePath(argv[index] ?? "");
        break;
      case "--csv-path":
        index += 1;
        options.csvPath = normalizePath(argv[index] ?? "");
        break;
      default:
        if (!arg.startsWith("--")) {
          throw new Error(`Unexpected positional argument: ${arg}`);
        }

        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!mode) {
    throw new Error("Specify exactly one mode: --dry-run or --run.");
  }

  if (!options.source) {
    throw new Error("source is required.");
  }

  if (!options.bucket.trim()) {
    throw new Error("bucket is required.");
  }

  if (!options.prefix.trim()) {
    throw new Error("prefix is required.");
  }

  if (options.quality > 100) {
    throw new Error("quality must be <= 100.");
  }

  return { mode, ...options };
}

async function listProductFolders(sourceRoot: string): Promise<FolderInfo[]> {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  const folders: FolderInfo[] = [];
  const slugOwner = new Map<string, string>();

  const directoryEntries = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((a, b) => collator.compare(a.name, b.name));

  for (const entry of directoryEntries) {
    const folderName = entry.name;
    const folderPath = path.join(sourceRoot, folderName);
    const folderSlug = slugify(folderName);

    const existingOwner = slugOwner.get(folderSlug);
    if (existingOwner && existingOwner !== folderName) {
      throw new Error(
        `Folder slug collision: "${existingOwner}" and "${folderName}" both normalize to "${folderSlug}".`,
      );
    }

    slugOwner.set(folderSlug, folderName);
    folders.push({ folderName, folderPath, folderSlug });
  }

  return folders;
}

async function collectImageFiles(
  directory: string,
  stats: DiscoveryStats,
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    entries.sort((a, b) => collator.compare(a.name, b.name));

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        stats.skippedHidden += 1;
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(extension)) {
        stats.skippedNonImage += 1;
        continue;
      }

      files.push(fullPath);
    }
  }

  await walk(directory);

  files.sort((first, second) => {
    const fileNameCompare = collator.compare(path.basename(first), path.basename(second));
    if (fileNameCompare !== 0) {
      return fileNameCompare;
    }

    return collator.compare(first, second);
  });

  return files;
}

function toSequence(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function toCsv(rows: ManifestRow[]): string {
  const header: Array<keyof ManifestRow> = [
    "source_path",
    "folder_name",
    "folder_slug",
    "sequence",
    "storage_path",
    "public_url",
    "width",
    "height",
    "bytes_before",
    "bytes_after",
    "sha1",
    "uploaded_at",
  ];

  const escape = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;

  const lines = [header.join(",")];
  for (const row of rows) {
    const values = header.map((field) => escape(String(row[field] ?? "")));
    lines.push(values.join(","));
  }

  return `${lines.join("\n")}\n`;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= attempts) {
        break;
      }

      const waitMs = 250 * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown upload error.");
}

async function processImage(
  image: SourceImage,
  options: CliOptions,
  runUpload: boolean,
  supabase: SupabaseClient,
): Promise<ManifestRow> {
  const sourceBuffer = await fs.readFile(image.sourcePath);
  const bytesBefore = sourceBuffer.length;

  const optimized = await sharp(sourceBuffer)
    .rotate()
    .resize({
      width: options.maxDimension,
      height: options.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: options.quality,
      effort: 4,
    })
    .toBuffer({ resolveWithObject: true });

  const bytesAfter = optimized.data.length;
  const sha1 = createHash("sha1").update(optimized.data).digest("hex");

  if (runUpload) {
    await withRetry(async () => {
      const { error } = await supabase.storage
        .from(options.bucket)
        .upload(image.storagePath, optimized.data, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }
    }, 3);
  }

  const { data: urlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(image.storagePath);

  return {
    source_path: image.sourcePath,
    folder_name: image.folderName,
    folder_slug: image.folderSlug,
    sequence: image.sequence,
    storage_path: image.storagePath,
    public_url: urlData.publicUrl,
    width: optimized.info.width ?? 0,
    height: optimized.info.height ?? 0,
    bytes_before: bytesBefore,
    bytes_after: bytesAfter,
    sha1,
    uploaded_at: runUpload ? new Date().toISOString() : null,
  };
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let cursor = 0;
  const totalWorkers = Math.min(Math.max(limit, 1), items.length || 1);

  const tasks = Array.from({ length: totalWorkers }, async () => {
    while (true) {
      const current = cursor;
      cursor += 1;

      if (current >= items.length) {
        return;
      }

      await worker(items[current], current);
    }
  });

  await Promise.all(tasks);
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function main() {
  const startedAt = new Date();
  const options = parseArgs(process.argv.slice(2));
  const sourceRoot = normalizePath(options.source);

  const sourceStat = await fs.stat(sourceRoot).catch(() => null);
  if (!sourceStat?.isDirectory()) {
    throw new Error(`Source directory does not exist: ${sourceRoot}`);
  }

  const url = required("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const discoveryStats: DiscoveryStats = {
    skippedHidden: 0,
    skippedNonImage: 0,
  };

  const folders = await listProductFolders(sourceRoot);
  const sourceImages: SourceImage[] = [];
  const pathSet = new Set<string>();

  for (const folder of folders) {
    const files = await collectImageFiles(folder.folderPath, discoveryStats);

    for (const [index, filePath] of files.entries()) {
      const sequence = toSequence(index);
      const storagePath = `${options.prefix}/${folder.folderSlug}/${folder.folderSlug}-${sequence}.webp`;

      if (pathSet.has(storagePath)) {
        throw new Error(`Duplicate storage path generated: ${storagePath}`);
      }

      pathSet.add(storagePath);
      sourceImages.push({
        sourcePath: filePath,
        folderName: folder.folderName,
        folderSlug: folder.folderSlug,
        sequence,
        storagePath,
      });
    }
  }

  if (sourceImages.length === 0) {
    throw new Error("No image files discovered under the source directory.");
  }

  console.log(
    `Discovered ${sourceImages.length} images across ${folders.length} folders. Mode: ${options.mode}.`,
  );

  const runUpload = options.mode === "run";
  const manifestRows: Array<ManifestRow | null> = Array.from(
    { length: sourceImages.length },
    () => null,
  );
  const failures: FailureRow[] = [];

  await runWithConcurrency(sourceImages, options.concurrency, async (image, index) => {
    try {
      const row = await processImage(image, options, runUpload, supabase);
      manifestRows[index] = row;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown processing error.";
      failures.push({
        source_path: image.sourcePath,
        storage_path: image.storagePath,
        error: message,
      });
    }
  });

  const successfulRows = manifestRows.filter((row): row is ManifestRow => row !== null);
  successfulRows.sort((first, second) => collator.compare(first.storage_path, second.storage_path));
  failures.sort((first, second) => collator.compare(first.storage_path, second.storage_path));

  const bytesBeforeTotal = successfulRows.reduce(
    (total, row) => total + row.bytes_before,
    0,
  );
  const bytesAfterTotal = successfulRows.reduce(
    (total, row) => total + row.bytes_after,
    0,
  );
  const bytesSavedTotal = bytesBeforeTotal - bytesAfterTotal;
  const reductionPercent =
    bytesBeforeTotal > 0 ? (bytesSavedTotal / bytesBeforeTotal) * 100 : 0;

  const perFolderCounts: SummaryRow["per_folder_counts"] = {};
  for (const folder of folders) {
    perFolderCounts[folder.folderSlug] = {
      folder_name: folder.folderName,
      succeeded: 0,
      failed: 0,
    };
  }

  for (const row of successfulRows) {
    perFolderCounts[row.folder_slug].succeeded += 1;
  }
  for (const failure of failures) {
    const parts = failure.storage_path.split("/");
    const folderSlug = parts.length >= 2 ? parts[1] : null;
    if (folderSlug && perFolderCounts[folderSlug]) {
      perFolderCounts[folderSlug].failed += 1;
    }
  }

  await fs.mkdir(path.dirname(options.manifestPath), { recursive: true });
  await fs.mkdir(path.dirname(options.summaryPath), { recursive: true });
  await fs.mkdir(path.dirname(options.csvPath), { recursive: true });

  const completedAt = new Date();
  const summary: SummaryRow = {
    mode: options.mode,
    source_root: sourceRoot,
    bucket: options.bucket,
    prefix: options.prefix,
    quality: options.quality,
    max_dimension: options.maxDimension,
    concurrency: options.concurrency,
    started_at: startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
    duration_ms: completedAt.getTime() - startedAt.getTime(),
    folders_discovered: folders.length,
    discovered_images: sourceImages.length,
    processed_images: successfulRows.length + failures.length,
    succeeded: successfulRows.length,
    failed: failures.length,
    skipped_hidden: discoveryStats.skippedHidden,
    skipped_non_image: discoveryStats.skippedNonImage,
    bytes_before_total: bytesBeforeTotal,
    bytes_after_total: bytesAfterTotal,
    bytes_saved_total: bytesSavedTotal,
    reduction_percent: Number(reductionPercent.toFixed(2)),
    per_folder_counts: perFolderCounts,
    failures,
    manifest_path: options.manifestPath,
    manifest_csv_path: options.csvPath,
  };

  await fs.writeFile(
    options.manifestPath,
    `${JSON.stringify(successfulRows, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    options.summaryPath,
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(options.csvPath, toCsv(successfulRows), "utf8");

  console.log(`Succeeded: ${successfulRows.length}`);
  console.log(`Failed: ${failures.length}`);
  console.log(`Bytes before: ${formatBytes(bytesBeforeTotal)}`);
  console.log(`Bytes after: ${formatBytes(bytesAfterTotal)}`);
  console.log(`Saved: ${formatBytes(bytesSavedTotal)} (${summary.reduction_percent}%)`);
  console.log(`Manifest: ${options.manifestPath}`);
  console.log(`Summary: ${options.summaryPath}`);
  console.log(`CSV: ${options.csvPath}`);

  if (failures.length > 0) {
    throw new Error(`Import completed with ${failures.length} failures. Check summary file.`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown import error.";
  console.error(message);
  process.exit(1);
});
