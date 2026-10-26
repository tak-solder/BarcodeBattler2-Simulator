import { test, expect } from "@playwright/test";
const JAN = "4901234567894",
  W = "0401207336501";
test("C0 turns, magic, responsive navigation and C1 D1 save/load", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("接続済み", { exact: true })).toBeVisible();
  await page.locator('[data-mode="C0"]').click();
  await page.locator('[data-action="sample"]').click();
  await page.locator('[data-action="start"]').click();
  await expect(page.locator(".controls-panel .tag").first()).toHaveText(
    "TURN 0",
  );
  await page.locator('.controls-panel [data-action="attack"]').click();
  await expect(page.locator(".controls-panel .tag").first()).toHaveText(
    "TURN 1",
  );
  await page.locator('[data-mode="C1"]').click();
  await page.locator('[data-action="sample"]').click();
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-action="encounter"]').click();
  await expect(page.locator(".controls-panel")).toBeVisible();
  await page.locator('[data-action="save"]').click();
  await expect(page.locator(".toast")).toHaveText(
    "冒険をクラウドにセーブしました。",
  );
  const saved = await page.request.get("/api/saves/C1");
  expect(saved.ok()).toBeTruthy();
  expect((await saved.json()).save.campaign.mode).toBe("C1");
  await page.reload();
  await page.locator('[data-mode="C1"]').click();
  await page.locator('.mode-info [data-action="load"]').click();
  await expect(page.locator(".controls-panel")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});
test("C2 enemy scanning input starts a real fight and supports magician switching", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-mode="C2"]').click();
  await page.locator('[data-action="sample"]').click();
  await page.locator('[data-action="start"]').click();
  await page.locator("#enemy").fill("0340912373503");
  await page.locator('[data-action="encounter"]').click();
  await expect(page.locator(".controls-panel")).toBeVisible();
  if (
    await page
      .locator(".controls-panel .section-heading")
      .innerText()
      .then((t) => t.includes("ターン"))
  ) {
    await page.locator('.controls-panel [data-action="switch"]').click();
    await expect(page.locator(".hero-chip.active")).toContainText("魔法使い");
  }
});
test("JAN prefix, CSRF, compare-and-swap concurrency and R2 replay", async ({
  playwright,
}) => {
  const a = await playwright.request.newContext({
      baseURL: "http://localhost:8787",
      extraHTTPHeaders: { Origin: "http://localhost:8787" },
    }),
    b = await playwright.request.newContext({
      baseURL: "http://localhost:8787",
      extraHTTPHeaders: { Origin: "http://localhost:8787" },
    });
  expect((await a.post("/api/session")).ok()).toBeTruthy();
  expect((await b.post("/api/session")).ok()).toBeTruthy();
  const rooms = (await (await a.get("/api/rooms")).json()).rooms;
  expect(rooms).toHaveLength(2);
  const r = rooms.find((x: any) => x.id === "jan49");
  const bad = await a.post("/api/rooms/jan49/challenge", {
    data: { version: r.version, loadout: { barcode: W } },
  });
  expect(bad.status()).toBe(400);
  const cross = await a.patch("/api/profile", {
    headers: { Origin: "https://example.invalid" },
    data: { name: "blocked" },
  });
  expect(cross.status()).toBe(403);
  const results = await Promise.all([
    a.post("/api/rooms/jan49/challenge", {
      data: { version: r.version, loadout: { barcode: JAN } },
    }),
    b.post("/api/rooms/jan49/challenge", {
      data: { version: r.version, loadout: { barcode: JAN } },
    }),
  ]);
  expect(results.map((x) => x.status()).sort()).toEqual([200, 409]);
  const result = await results.find((x) => x.status() === 200)!.json();
  const updated = (await (await a.get("/api/rooms")).json()).rooms.find(
    (x: any) => x.id === "jan49",
  );
  expect(updated.version).toBe(r.version + 1);
  expect(updated.champion.loadout.barcode).toBe(JAN);
  const replay = await a.get("/api/replays/" + result.id);
  expect(replay.ok()).toBeTruthy();
  expect((await replay.json()).challenger.loadout.barcode).toBe(JAN);
  const room2 = (await (await a.get("/api/rooms")).json()).rooms.find(
    (x: any) => x.id === "open",
  );
  const accepted = await b.post("/api/rooms/open/challenge", {
    data: { version: room2.version, loadout: { barcode: W } },
  });
  expect(accepted.ok()).toBeTruthy();
  const unsupported = await a.post("/api/rooms", {
    data: { name: "not-enabled" },
  });
  expect(unsupported.status()).toBe(404);
  await a.dispose();
  await b.dispose();
});
test("camera denial retains photo input and barcode image decodes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".camera-button").click();
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator(".camera-message")).toContainText(
    "カメラを利用できません",
    { timeout: 10000 },
  );
  const left = [
    "0001101",
    "0011001",
    "0010011",
    "0111101",
    "0100011",
    "0110001",
    "0101111",
    "0111011",
    "0110111",
    "0001011",
  ];
  const g = [
    "0100111",
    "0110011",
    "0011011",
    "0100001",
    "0011101",
    "0111001",
    "0000101",
    "0010001",
    "0001001",
    "0010111",
  ];
  const right = left.map((x) =>
    x.replace(/[01]/g, (c) => (c === "0" ? "1" : "0")),
  );
  const parity = [
    "LLLLLL",
    "LLGLGG",
    "LLGGLG",
    "LLGGGL",
    "LGLLGG",
    "LGGLLG",
    "LGGGLL",
    "LGLGLG",
    "LGLGGL",
    "LGGLGL",
  ][Number(JAN[0])];
  let bits = "101";
  for (let i = 1; i <= 6; i++)
    bits += (parity[i - 1] === "L" ? left : g)[Number(JAN[i])];
  bits += "01010";
  for (let i = 7; i < 13; i++) bits += right[Number(JAN[i])];
  bits += "101";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 125 54"><rect width="125" height="54" fill="white"/>${bits
    .split("")
    .map((v, i) =>
      v === "1"
        ? `<rect x="${i + 15}" y="5" width="1" height="40" fill="black"/>`
        : "",
    )
    .join("")}</svg>`;
  await page
    .locator("dialog input[type=file]")
    .setInputFiles({
      name: "barcode.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(svg),
    });
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(page.locator("#barcode")).toHaveValue(JAN);
});
