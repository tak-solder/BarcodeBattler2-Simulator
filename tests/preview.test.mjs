import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  resolvePreviewConfig,
  migrationConfig,
  executePreview,
  validatePreviewArguments,
} from "../scripts/preview.mjs";
const productionId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const previewId = "11111111-2222-4333-8444-555555555555";
const source = () => ({
  name: "game",
  main: "src/server/worker.ts",
  assets: { directory: "dist", binding: "ASSETS" },
  d1_databases: [{ binding: "DB", database_id: productionId }],
  r2_buckets: [{ binding: "BUCKET", bucket_name: "game-production" }],
  previews: {
    d1_databases: [
      {
        binding: "DB",
        database_id: "<REPLACE_ME>",
        migrations_dir: "migrations",
      },
    ],
    r2_buckets: [{ binding: "BUCKET", bucket_name: "game-preview" }],
  },
});
const environment = { PREVIEW_D1_DATABASE_ID: previewId };
test("unconfigured Preview resources fail with actionable setup guidance", () => {
  assert.throws(
    () => resolvePreviewConfig(source(), {}),
    /PREVIEW_D1_DATABASE_ID/,
  );
});
test("Preview resources do not fall back to production", () => {
  assert.throws(
    () =>
      resolvePreviewConfig(source(), { PREVIEW_D1_DATABASE_ID: productionId }),
    /本番と同じdatabase_id/,
  );
  assert.throws(
    () =>
      resolvePreviewConfig(source(), {
        ...environment,
        PREVIEW_R2_BUCKET_NAME: "game-production",
      }),
    /本番と同じbucket_name/,
  );
});
test("resource overrides and paths are confined to the Preview config", () => {
  const original = source();
  const c = resolvePreviewConfig(
    original,
    { ...environment, PREVIEW_R2_BUCKET_NAME: "branch-preview" },
    "/workspace/test-game",
  );
  assert.equal(c.d1_databases[0].database_id, productionId);
  assert.equal(c.previews.d1_databases[0].database_id, previewId);
  assert.equal(c.previews.r2_buckets[0].bucket_name, "branch-preview");
  assert.equal(c.main, "/workspace/test-game/src/server/worker.ts");
  assert.equal(c.assets.directory, "/workspace/test-game/dist");
  assert.equal(
    c.previews.d1_databases[0].migrations_dir,
    "/workspace/test-game/migrations",
  );
  assert.equal(original.previews.d1_databases[0].database_id, "<REPLACE_ME>");
});
test("D1 migrations use the Preview database and never an inherited environment", () => {
  const c = resolvePreviewConfig(
    {
      ...source(),
      env: { danger: { d1_databases: [{ database_id: productionId }] } },
    },
    environment,
  );
  const projected = migrationConfig(c);
  assert.equal(projected.d1_databases[0].database_id, previewId);
  assert.equal(projected.r2_buckets[0].bucket_name, "game-preview");
  assert.equal(projected.env, undefined);
  assert.equal(projected.previews, undefined);
});
test("configuration and environment overrides cannot bypass the wrapper", () => {
  assert.throws(
    () => validatePreviewArguments(["--config", "production.json"]),
    /上書き/,
  );
  assert.throws(
    () => validatePreviewArguments(["--env", "production"]),
    /上書き/,
  );
  assert.throws(() => validatePreviewArguments(["--name"]));
  assert.doesNotThrow(() =>
    validatePreviewArguments(["--name", "pr-2", "--json"]),
  );
});
test("deployment migrates first, uses the Preview block, and cleans generated files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bb2-preview-test-"));
  const calls = [];
  let files = [];
  try {
    executePreview("deploy", source(), {
      env: environment,
      root,
      args: ["--name", "pr-2"],
      run(args) {
        calls.push(args);
        const file = args[args.indexOf("--config") + 1];
        files.push(file);
        const c = JSON.parse(fs.readFileSync(file));
        if (calls.length === 1) {
          assert.deepEqual(args.slice(0, 5), [
            "d1",
            "migrations",
            "apply",
            "DB",
            "--remote",
          ]);
          assert.equal(c.d1_databases[0].database_id, previewId);
        } else {
          assert.equal(args[0], "preview");
          assert.equal(c.previews.d1_databases[0].database_id, previewId);
          assert.deepEqual(args.slice(-2), ["--name", "pr-2"]);
        }
      },
    });
    assert.equal(calls.length, 2);
    assert.ok(files.every((file) => !fs.existsSync(file)));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("failed migration prevents a Preview deployment", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bb2-preview-test-"));
  let calls = 0;
  try {
    assert.throws(
      () =>
        executePreview("deploy", source(), {
          env: environment,
          root,
          run() {
            calls++;
            throw new Error("migration failed");
          },
        }),
      /migration failed/,
    );
    assert.equal(calls, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("Preview dry-run makes no remote write and uses isolated resource bindings", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bb2-preview-test-"));
  try {
    executePreview("dry-run", source(), {
      env: environment,
      root,
      run(args) {
        assert.deepEqual(args.slice(0, 2), ["deploy", "--dry-run"]);
        assert.ok(!args.includes("--remote"));
        const c = JSON.parse(
          fs.readFileSync(args[args.indexOf("--config") + 1]),
        );
        assert.equal(c.d1_databases[0].database_id, previewId);
      },
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
