import fs from "node:fs";
const config = JSON.parse(
  fs.readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
);
const id = config.d1_databases?.find((x) => x.binding === "DB")?.database_id;
if (!id || id === "00000000-0000-0000-0000-000000000001") {
  console.error(
    "D1のdatabase_idが未設定です。README.mdの手順でD1とR2を作成し、wrangler.jsoncに実際のdatabase_idを設定してください。",
  );
  process.exit(1);
}
