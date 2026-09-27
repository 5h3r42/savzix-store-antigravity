import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

type Mode = "dry-run" | "run";

type PreparationResult = {
  keepa_row: number;
  slug: string;
  category_slug: string;
  package_path: string;
  result: "prepared" | "skipped_existing" | "failed";
};

type PreparationReport = {
  results: PreparationResult[];
};

type CliOptions = {
  mode: Mode;
  preparationReportPath: string;
  reportPath: string;
  dimension: number;
  concurrency: number;
  replace: boolean;
};

type Result = {
  keepa_row: number;
  slug: string;
  package_path: string;
  source_path: string | null;
  final_path: string;
  result: "created" | "skipped_existing" | "failed";
  error: string | null;
};

type FinalizationReport = {
  mode: Mode;
  preparation_report_path: string;
  dimension: number;
  candidates: number;
  created: number;
  skipped_existing: number;
  failed: number;
  created_at: string;
  results: Result[];
};

const DEFAULT_BATCH_DIRECTORY = path.join(
  process.cwd(),
  "data",
  "import-reports",
  "keepa-pricecheck-2026-09-27",
);

function normalizePath(input: string): string {
  return path.isAbsolute(input) ? path.normalize(input) : path.join(process.cwd(), input);
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
    preparationReportPath: path.join(DEFAULT_BATCH_DIRECTORY, "local-package-preparation-report.json"),
    reportPath: path.join(DEFAULT_BATCH_DIRECTORY, "final-image-preparation-report.json"),
    dimension: 1200,
    concurrency: 4,
    replace: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--dry-run":
        if (mode === "run") throw new Error("Use either --dry-run or --run, not both.");
        mode = "dry-run";
        break;
      case "--run":
        if (mode === "dry-run") throw new Error("Use either --dry-run or --run, not both.");
        mode = "run";
        break;
      case "--preparation-report":
        index += 1;
        options.preparationReportPath = normalizePath(argv[index] ?? "");
        break;
      case "--report":
        index += 1;
        options.reportPath = normalizePath(argv[index] ?? "");
        break;
      case "--dimension":
        index += 1;
        options.dimension = parsePositiveInt(argv[index] ?? "", "dimension");
        break;
      case "--concurrency":
        index += 1;
        options.concurrency = parsePositiveInt(argv[index] ?? "", "concurrency");
        break;
      case "--replace":
        options.replace = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (!mode) throw new Error("Specify exactly one mode: --dry-run or --run.");
  return { mode, ...options };
}

async function sourceImagePath(packagePath: string): Promise<string> {
  const entries = await fs.readdir(packagePath, { withFileTypes: true });
  const matches = entries
    .filter((entry) => entry.isFile() && /-source-original\.(avif|jpe?g|png|webp)$/i.test(entry.name))
    .map((entry) => path.join(packagePath, entry.name));

  if (matches.length !== 1) {
    throw new Error(`Expected exactly one retained source image; found ${matches.length}.`);
  }

  return matches[0];
}

async function processResult(item: PreparationResult, options: CliOptions): Promise<Result> {
  const finalPath = path.join(item.package_path, "01.webp");
  const existing = await fs.stat(finalPath).catch(() => null);

  if (existing?.isFile() && !options.replace) {
    return {
      keepa_row: item.keepa_row,
      slug: item.slug,
      package_path: item.package_path,
      source_path: null,
      final_path: finalPath,
      result: "skipped_existing",
      error: null,
    };
  }

  try {
    const sourcePath = await sourceImagePath(item.package_path);

    if (options.mode === "run") {
      const innerDimension = Math.floor(options.dimension * 0.9);
      const margin = (options.dimension - innerDimension) / 2;

      await sharp(sourcePath)
        .rotate()
        .resize(innerDimension, innerDimension, {
          fit: "contain",
          background: "#ffffff",
          withoutEnlargement: true,
        })
        .flatten({ background: "#ffffff" })
        .extend({
          top: margin,
          bottom: margin,
          left: margin,
          right: margin,
          background: "#ffffff",
        })
        .webp({ lossless: true, effort: 6 })
        .toFile(`${finalPath}.tmp`);
      await fs.rename(`${finalPath}.tmp`, finalPath);
    }

    return {
      keepa_row: item.keepa_row,
      slug: item.slug,
      package_path: item.package_path,
      source_path: sourcePath,
      final_path: finalPath,
      result: "created",
      error: null,
    };
  } catch (error) {
    return {
      keepa_row: item.keepa_row,
      slug: item.slug,
      package_path: item.package_path,
      source_path: null,
      final_path: finalPath,
      result: "failed",
      error: error instanceof Error ? error.message : "Unknown error.",
    };
  }
}

async function mapConcurrent<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const prepared = JSON.parse(
    await fs.readFile(options.preparationReportPath, "utf8"),
  ) as PreparationReport;
  const candidates = prepared.results.filter((item) => item.result === "prepared");
  const results = await mapConcurrent(candidates, options.concurrency, (item) => processResult(item, options));
  const report: FinalizationReport = {
    mode: options.mode,
    preparation_report_path: options.preparationReportPath,
    dimension: options.dimension,
    candidates: candidates.length,
    created: results.filter((item) => item.result === "created").length,
    skipped_existing: results.filter((item) => item.result === "skipped_existing").length,
    failed: results.filter((item) => item.result === "failed").length,
    created_at: new Date().toISOString(),
    results,
  };

  await fs.mkdir(path.dirname(options.reportPath), { recursive: true });
  await fs.writeFile(options.reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));

  if (report.failed > 0) process.exitCode = 1;
}

void main();
