import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

const stats = async (page: Page) =>
  await page.locator(".hardware-device [aria-label]").evaluateAll((elements) =>
    elements
      .map((el) => el.getAttribute("aria-label")!)
      .filter((label) => /^[12]P (HP|ST|DF) /.test(label))
      .sort(),
  );
const progress = async (page: Page) => ({
  turn: await page.locator(".controls-panel .tag").first().innerText(),
  resources: await page.locator(".resource-line").innerText(),
  log: await page.locator(".battle-log").innerText(),
});
async function startBattle(page: Page) {
  await page.goto("/");
  await page.locator('[data-mode="C0"]').click();
  await page.locator("#barcode").fill("4901234567894");
  await page.locator("#barcode2").fill("4901234567894");
  await page.locator('[data-action="start"]').click();
  await expect(page.locator(".controls-panel .tag").first()).toHaveText(
    "TURN 0",
  );
}

test("1992 hardware controls and REIWA NEXT share battle values, turns and commands", async ({
  page,
}) => {
  await startBattle(page);
  await expect(page.locator('[data-appearance="classic"]')).toContainText(
    "1992",
  );
  await expect(page.locator(".battle-led")).toHaveCount(5);
  await expect(page.locator(".wing-button")).toHaveCount(4);
  const before = await progress(page),
    values = await stats(page);
  expect(values).toHaveLength(6);
  await page.locator('[data-appearance="neo"]').click();
  await expect(page.locator("body")).toHaveAttribute("data-ui", "neo");
  expect(await progress(page)).toEqual(before);
  expect(await stats(page)).toEqual(values);
  await page.locator('.hardware-device [data-action="attack"]:enabled').click();
  await expect(page.locator(".controls-panel .tag").first()).toHaveText(
    "TURN 1",
  );
  const after = await progress(page),
    afterValues = await stats(page);
  await page.locator('[data-appearance="classic"]').click();
  expect(await progress(page)).toEqual(after);
  expect(await stats(page)).toEqual(afterValues);
  await page.locator('.hardware-device [data-action="attack"]:enabled').click();
  await expect(page.locator(".controls-panel .tag").first()).toHaveText(
    "TURN 2",
  );
});

test("display, resource selection, zoom and reader remain usable in both designs", async ({
  page,
}) => {
  await startBattle(page);
  for (const appearance of ["classic", "neo"]) {
    await page.locator(`[data-appearance="${appearance}"]`).click();
    const before = await progress(page);
    await page.locator('[data-device="select"]').click();
    await expect(page.locator('[data-device="select"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.locator('.hardware-device [aria-label="1P MP 0"]'),
    ).toBeVisible();
    await page.locator('[data-device="enlarge"]').click();
    await expect(
      page.locator('dialog .lcd-number[aria-label="1P MP 0"]'),
    ).toBeVisible();
    await page.getByRole("button", { name: "閉じる", exact: true }).click();
    await page.locator('[data-device="power"]').click();
    await expect(page.locator('[data-device="power"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(
      page.locator('.hardware-device [data-action="attack"]:enabled'),
    ).toHaveCount(0);
    expect(await progress(page)).toEqual(before);
    await page.locator('[data-device="power"]').click();
    await page.locator('[data-device="select"]').click();
    await page
      .getByRole("button", {
        name: "CARD IN カメラでバーコードを読み取る",
        exact: true,
      })
      .click();
    await expect(page.locator(".scanner-dialog")).toBeVisible();
    await page.getByRole("button", { name: "閉じる", exact: true }).click();
    expect(await progress(page)).toEqual(before);
  }
});

test("appearance persists across reload and switching preserves partially entered codes", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#barcode").fill("4901234");
  await page.locator('[data-appearance="neo"]').click();
  await expect(page.locator("#barcode")).toHaveValue("4901234");
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-ui", "neo");
  await expect(page.locator('[data-appearance="neo"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("both designs fit narrow and tablet widths without horizontal overflow", async ({
  page,
}) => {
  await startBattle(page);
  for (const width of [320, 390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const appearance of ["classic", "neo"]) {
      await page.locator(`[data-appearance="${appearance}"]`).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${appearance} at ${width}px`,
      ).toBe(true);
      const target = await page.locator(".hardware-device").boundingBox();
      expect(target!.width).toBeLessThanOrEqual(width);
    }
  }
});

test("switching appearance does not reroll a scanned character or item", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-mode="C0"]').click();
  await page.locator('[data-action="sample"]').click();
  const before = await stats(page);
  await page.evaluate(() => {
    Math.random = () => {
      throw new Error("Appearance must not request game randomness");
    };
  });
  for (const appearance of ["neo", "classic", "neo"]) {
    await page.locator(`[data-appearance="${appearance}"]`).click();
    expect(await stats(page)).toEqual(before);
  }
  expect(errors).toEqual([]);
});

test("C1 campaign and cloud save survive switching designs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("接続済み", { exact: true })).toBeVisible();
  await page.locator('[data-mode="C1"]').click();
  await page.locator('[data-action="sample"]').click();
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-action="encounter"]').click();
  const before = await progress(page);
  const heroes = await page.locator(".hero-switcher").innerText();
  await page.locator('[data-appearance="neo"]').click();
  expect(await progress(page)).toEqual(before);
  expect(await page.locator(".hero-switcher").innerText()).toEqual(heroes);
  await page.locator('[data-action="save"]').click();
  await expect(page.locator(".toast")).toHaveText(
    "冒険をクラウドにセーブしました。",
  );
  await page.locator('[data-appearance="classic"]').click();
  await page.locator('.campaign-footer [data-action="load"]').click();
  expect(await progress(page)).toEqual(before);
  expect(await page.locator(".hero-switcher").innerText()).toEqual(heroes);
});

test("REIWA toy controls have separate touch areas on small screens", async ({
  page,
}) => {
  await startBattle(page);
  await page.locator('[data-appearance="neo"]').click();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const controls = await page
      .locator(".neo-toy button")
      .evaluateAll((elements) =>
        elements.map((el) => {
          const r = el.getBoundingClientRect();
          return {
            name: el.getAttribute("aria-label"),
            x: r.x,
            y: r.y,
            right: r.right,
            bottom: r.bottom,
          };
        }),
      );
    for (let i = 0; i < controls.length; i++)
      for (let j = i + 1; j < controls.length; j++) {
        const a = controls[i],
          b = controls[j];
        const overlaps =
          a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
        expect(overlaps, `${width}px: ${a.name} overlaps ${b.name}`).toBe(
          false,
        );
      }
  }
});
