import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const placeholder = (value) =>
  !value ||
  value === "<REPLACE_ME>" ||
  /^00000000-0000-0000-0000-00000000000[012]$/.test(value);
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;

export function resolvePreviewConfig(
  source,
  env = process.env,
  root = projectRoot,
) {
  const config = structuredClone(source);
  const preview = config.previews;
  if (!preview) throw new Error("wrangler.jsonc に previews 設定が必要です。");
  const database = preview.d1_databases?.find((item) => item.binding === "DB");
  const bucket = preview.r2_buckets?.find((item) => item.binding === "BUCKET");
  if (!database || !bucket)
    throw new Error("previews に DB と BUCKET の両bindingを設定してください。");
  database.database_id =
    env.PREVIEW_D1_DATABASE_ID?.trim() || database.database_id;
  bucket.bucket_name = env.PREVIEW_R2_BUCKET_NAME?.trim() || bucket.bucket_name;
  if (placeholder(database.database_id) || !uuid.test(database.database_id)) {
    throw new Error(
      "プレビュー専用D1の実際のIDを PREVIEW_D1_DATABASE_ID または previews.d1_databases[0].database_id に設定してください。初回は npx wrangler d1 create barcode-battler-ii-preview で作成します。",
    );
  }
  if (
    config.d1_databases?.some(
      (item) =>
        item.database_id?.toLowerCase() === database.database_id.toLowerCase(),
    )
  ) {
    throw new Error(
      "プレビューD1に本番と同じdatabase_idは使用できません。専用のD1を指定してください。",
    );
  }
  if (
    placeholder(bucket.bucket_name) ||
    !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket.bucket_name)
  ) {
    throw new Error(
      "プレビュー専用R2の名前を PREVIEW_R2_BUCKET_NAME または previews.r2_buckets[0].bucket_name に設定してください。",
    );
  }
  if (
    config.r2_buckets?.some((item) => item.bucket_name === bucket.bucket_name)
  ) {
    throw new Error(
      "プレビューR2に本番と同じbucket_nameは使用できません。専用のR2を指定してください。",
    );
  }
  // Generated files live below .wrangler; preserve paths relative to the project.
  config.main = path.resolve(root, config.main);
  if (config.tsconfig) config.tsconfig = path.resolve(root, config.tsconfig);
  if (config.assets?.directory)
    config.assets.directory = path.resolve(root, config.assets.directory);
  for (const item of preview.d1_databases) {
    item.migrations_dir = path.resolve(
      root,
      item.migrations_dir || "migrations",
    );
  }
  return config;
}

export function migrationConfig(previewConfig) {
  // D1 CLI reads top-level bindings, not the `previews` block. Project exactly
  // the already-validated Preview bindings, never the production bindings.
  const config = structuredClone(previewConfig);
  config.d1_databases = structuredClone(config.previews.d1_databases);
  config.r2_buckets = structuredClone(config.previews.r2_buckets);
  delete config.previews;
  delete config.env;
  return config;
}

export function validatePreviewArguments(args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json") continue;
    if (
      !["--name", "--tag", "--message"].includes(args[i]) ||
      !args[i + 1] ||
      args[i + 1].startsWith("--")
    ) {
      throw new Error(
        "プレビューに渡せる引数は --name・--tag・--message・--json です。接続先の上書きは許可していません。",
      );
    }
    i++;
  }
}

const runWrangler = (args) => {
  const binary = path.join(
    projectRoot,
    "node_modules",
    "wrangler",
    "bin",
    "wrangler.js",
  );
  const result = spawnSync(process.execPath, [binary, ...args], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `Wranglerの処理が失敗しました（${result.status ?? result.signal}）。`,
    );
};

export function executePreview(
  mode,
  source,
  { env = process.env, root = projectRoot, args = [], run = runWrangler } = {},
) {
  if (!["check", "migrate", "deploy", "dry-run"].includes(mode))
    throw new Error("previewコマンドが正しくありません。");
  validatePreviewArguments(args);
  const config = resolvePreviewConfig(source, env, root);
  if (mode === "check") return config;
  const parent = path.join(root, ".wrangler", "bb2-preview");
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const directory = fs.mkdtempSync(path.join(parent, "config-"));
  const previewPath = path.join(directory, "wrangler.json");
  const migrationPath = path.join(directory, "migrations.json");
  try {
    fs.writeFileSync(previewPath, JSON.stringify(config, null, 2));
    fs.writeFileSync(
      migrationPath,
      JSON.stringify(migrationConfig(config), null, 2),
    );
    if (mode === "dry-run") {
      run(["deploy", "--dry-run", "--config", migrationPath]);
      return config;
    }
    run([
      "d1",
      "migrations",
      "apply",
      "DB",
      "--remote",
      "--config",
      migrationPath,
    ]);
    if (mode === "deploy") run(["preview", "--config", previewPath, ...args]);
    return config;
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const source = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "wrangler.jsonc"), "utf8"),
    );
    const mode = process.argv[2] || "check";
    const config = executePreview(mode, source, {
      args: process.argv.slice(3),
    });
    if (mode === "check")
      console.log(
        `Preview設定OK: DB=${config.previews.d1_databases.find((item) => item.binding === "DB").database_id}, R2=${config.previews.r2_buckets.find((item) => item.binding === "BUCKET").bucket_name}`,
      );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
