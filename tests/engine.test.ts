import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  validCode,
  readCard,
  fighterFrom,
  autoBattle,
  createBattle,
  act,
  FightingCalculator,
  C1World,
  C2Password,
  seeded,
} from "../src/engine/game.ts";
import { NES } from "../src/engine/NES.js";
import { BarcodeWorld } from "../src/engine/BarcodeWorld.js";
import {
  newCampaign,
  beginEncounter,
  switchHero,
  collectReward,
  applyC1Password,
} from "../src/engine/campaign.ts";
import { parseLoadout } from "../src/server/rules.ts";
const W = "0401207336501",
  M = "0320813183500",
  E = "0340912373503",
  JAN = "4901234567894";
const stats = (c: any) => [
  c.hp,
  c.st,
  c.df,
  c.speed,
  c.race,
  c.job,
  c.pp,
  c.mp,
  c.special,
];
test("validates EAN8/EAN13 check digits and rejects non-digit and UPC raw input", () => {
  for (const c of [W, M, JAN, "96385074"]) assert.ok(validCode(c));
  for (const c of [
    "96385075",
    "4901234567890",
    "４９０１２３４５６７８９４",
    "0".repeat(14),
    "1234abcd",
    null,
  ])
    assert.equal(validCode(c), false);
});
test("front-read official card vector", () =>
  assert.deepEqual(stats(readCard(W)), [40, 12, 7, 0, 3, 3, 5, 0, 50]));
test("rear-read EAN13 vector", () =>
  assert.deepEqual(stats(readCard(JAN)), [487, 52, 43, 8, 4, 3, 5, 0, 18]));
test("rear-read EAN8 vector", () =>
  assert.deepEqual(
    stats(readCard("96385074")),
    [305, 70, 25, 0, 4, 4, 5, 0, 20],
  ));
test("hero scaling and job restrictions", () => {
  assert.deepEqual(
    stats(readCard(JAN, { hero: true })).slice(0, 3),
    [48, 6, 7],
  );
  assert.throws(() => readCard(W, { hero: true, job: "magician" }));
  assert.equal(readCard(M, { hero: true, job: "magician" }).job, 8);
});
test("support card cannot be used as first card; same tail cannot merge", () => {
  assert.throws(() => readCard("0000500602155"));
  assert.equal(readCard("0000500602155", { first: false }).st, 5);
  assert.throws(() => fighterFrom({ barcode: W, support: W }));
  assert.equal(fighterFrom({ barcode: W, support: "0000500602155" }).st, 17);
});
test("merge caps and character union flag", () => {
  const f = fighterFrom({ barcode: JAN, support: "4901234567801" });
  assert.ok(f.union_flag);
  assert.equal(f.hp, 574);
  assert.equal(f.pp, 5);
});
test("6502-style upstream carry quirks retained", () => {
  const n = new NES();
  n.clc();
  assert.equal(n.adc(255, 1), 1);
  assert.equal(n.CarryFlag, 1);
  n.sec();
  assert.equal(n.sbc(0, 1), 254);
  assert.equal(n.CarryFlag, 0);
});
test("byte multiply and long division preserve results", () => {
  const w = new BarcodeWorld();
  const m: any = { m0018: 17, m001C: 13 };
  w.dadf(m);
  assert.equal(m.m0024 + 256 * m.m0025, 221);
  const d: any = { m0018: 232, m0019: 3, m001C: 10, m001D: 0 };
  w.dbcd(d);
  assert.equal(d.m0024 + 256 * d.m0025, 100);
});
test("deterministic attack regression fixture", () => {
  const b = autoBattle({ barcode: W }, { barcode: E }, 123);
  assert.equal(b.star, 2);
  assert.equal(b.turn, 9);
  assert.equal(b.winner, 1);
  assert.deepEqual(
    b.log.map((t) => t.damage),
    [10, 0, 0, 0, 14, 10, 12, 14, 5],
  );
  assert.deepEqual(b, autoBattle({ barcode: W }, { barcode: E }, 123));
});
test("parallel deterministic simulations do not share global random state", () => {
  const a = autoBattle({ barcode: W }, { barcode: E }, 876);
  autoBattle({ barcode: JAN }, { barcode: M }, 555);
  assert.deepEqual(a, autoBattle({ barcode: W }, { barcode: E }, 876));
});
test("zero-HP fighters end before acting", () => {
  const b = createBattle(
    fighterFrom({ barcode: "4901234500013" }),
    fighterFrom({ barcode: W }),
    1,
  );
  assert.equal(b.winner, 1);
  assert.equal(b.turn, 0);
  assert.throws(() => act(b, { kind: "attack" }));
});
test("all ten spells apply valid effects and charge the specified MP", () => {
  for (let spell = 0; spell < 10; spell++) {
    const a = fighterFrom({ barcode: M });
    a.mp = 50;
    a.hp = 10;
    const b = createBattle(a, fighterFrom({ barcode: W }), 42);
    b.player = 0;
    act(b, { kind: "magic", spell });
    assert.ok(b.fighters[0].hp <= b.fighters[0].max_hp);
    assert.ok(b.fighters[0].mp >= 0);
    assert.ok(b.log[0].action.startsWith("F" + spell));
    if (spell === 9) assert.equal(b.fighters[1].pp_ignore_flag, true);
  }
});
test("recovery limits, sealed herbs, warrior magic restriction", () => {
  const b = createBattle(
    fighterFrom({ barcode: W }),
    fighterFrom({ barcode: E }),
    1,
  );
  b.player = 0;
  assert.throws(() => act(b, { kind: "magic", spell: 1 }));
  assert.throws(() => act(b, { kind: "herb", count: 4 }));
  b.fighters[0].pp_ignore_flag = true;
  assert.throws(() => act(b, { kind: "power" }));
});
test("49 room applies prefix to both cards and prohibits shift", () => {
  const rule: any = {
    version: 1,
    prefixes: ["49"],
    lengths: [8, 13],
    support: true,
    shift: false,
  };
  assert.equal(parseLoadout({ barcode: JAN }, rule).barcode, JAN);
  assert.throws(() => parseLoadout({ barcode: W }, rule));
  assert.throws(() =>
    parseLoadout({ barcode: JAN, support: "0000500602155" }, rule),
  );
  assert.throws(() => parseLoadout({ barcode: JAN, shift: 2 }, rule));
  assert.ok(parseLoadout({ barcode: JAN, support: "4901234567825" }, rule));
});
test("all reference cards have valid check digits and stable integer stats", () => {
  const cards = JSON.parse(
    fs.readFileSync(
      new URL("../src/client/catalog.json", import.meta.url),
      "utf8",
    ),
  );
  for (const c of cards) {
    assert.ok(validCode(c.barcode), c.name);
    const parsed = readCard(c.barcode, { first: false, random: () => 0.75 });
    for (const k of ["hp", "st", "df", "speed", "job", "race"])
      assert.ok(Number.isInteger(parsed[k]), c.name + " " + k);
  }
});
test("C1 enemy matrix supports all stages, worlds and checkdigit sums", () => {
  for (let s = 0; s < 6; s++)
    for (let w = 0; w < 6; w++)
      for (let e = 0; e < 5; e++)
        for (let d = 0; d < 10; d++) {
          const c = new C1World();
          c.world.push("L-H");
          c.select_stage = s;
          c.select_world = w;
          c.select_enemy = e;
          c.init(d, 0);
          const x = c.generate_enemy_paramater();
          assert.ok(x.hp > 0 && x.st > 0 && x.df > 0);
          assert.ok(x.race >= 0 && x.race <= 4);
        }
});
test("C1 keys unlock L-H and stage clear recalculates heroes", () => {
  const c = newCampaign("C1", [{ barcode: W }, { barcode: M }]);
  const w = worldOfLocal(c);
  w.key = ["L1-1"];
  w.select_enemy = 0;
  c.world = w;
  c.enemy = w.generate_enemy_paramater();
  c.battle = createBattle(
    fighterFrom({ barcode: W }),
    fighterFrom({ barcode: E }),
    1,
  );
  c.battle.winner = 0;
  collectReward(c);
  assert.ok(c.world.world.includes("L-H"));
});
function worldOfLocal(c: any) {
  return Object.assign(new C1World(), c.world);
}
test("campaign selection, invalid switch after victory, support restrictions", () => {
  const c = newCampaign("C2", [{ barcode: W }, { barcode: M }]);
  beginEncounter(c, E, "0000500602155");
  assert.equal(c.battle!.fighters[0].st, 17);
  c.battle!.winner = 0;
  assert.throws(() => switchHero(c));
  collectReward(c);
  assert.equal(c.battle, null);
  switchHero(c);
  assert.equal(c.active, 1);
});
test("C1 password transforms and jump validation", () => {
  const c = newCampaign("C1", [{ barcode: W }, { barcode: M }]);
  applyC1Password(c, "815");
  assert.equal(c.heroes[0].hp, 60);
  assert.throws(() => applyC1Password(c, "999"));
  const d = newCampaign("C1", [{ barcode: W }, { barcode: M }]);
  applyC1Password(d, "312");
  assert.equal(d.world.select_stage, 4);
});
test("C2 passcode roundtrips and rejects different heroes", () => {
  const p = new C2Password();
  p.init(readCard(W), readCard(M));
  for (let i = 0; i < 50; i++) {
    const code = p.generate_passcode_from_passcode_number(i);
    p.passcode = code;
    assert.equal(p.generate_passcode_number(), i);
  }
  p.passcode = "11001";
  assert.deepEqual(
    stats(p.generate_passcode_barcode_data(readCard(W), 10)).slice(0, 3),
    [96, 27, 16],
  );
  p.passcode = "11002";
  assert.equal(p.generate_passcode_number(), -1);
});
test("source cancellation clears opposing specials before debuffs", () => {
  const a = fighterFrom({ barcode: W }),
    d = fighterFrom({ barcode: M });
  a.special1 = 45;
  d.special1 = 29;
  const b = createBattle(a, d, 10);
  assert.equal(b.fighters[0].hp, a.hp);
  assert.equal(b.fighters[1].special1, 0);
});

test("product resolver falls back from Yahoo, caches the Japanese name and stores a bounded R2 image", async () => {
  const { resolveProduct } = await import("../src/server/products.ts");
  const original = globalThis.fetch;
  const urls: string[] = [];
  const stored: any[] = [];
  const sql: any[] = [];
  const env: any = {
    YAHOO_APP_ID: "test-id",
    DB: {
      prepare: (q: string) => ({
        bind: (...args: any[]) => ({
          first: async () => null,
          run: async () => {
            sql.push([q, args]);
          },
        }),
      }),
    },
    BUCKET: {
      put: async (...args: any[]) => {
        stored.push(args);
      },
    },
  };
  globalThis.fetch = async (input: any) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("yahooapis")) return new Response("", { status: 503 });
    if (url.includes("/api/v2/"))
      return Response.json({
        status: 1,
        product: {
          product_name_ja: "検証用の商品",
          image_front_small_url:
            "https://images.openfoodfacts.org/images/test.jpg",
        },
      });
    return new Response(new Uint8Array([255, 216, 255, 217]), {
      headers: { "Content-Type": "image/jpeg" },
    });
  };
  try {
    const p = await resolveProduct(env, JAN);
    assert.equal(p.name, "検証用の商品");
    assert.equal(p.source, "Open Food Facts");
    assert.equal(p.thumbnail, "/api/images/" + JAN);
    assert.equal(stored[0][0], "thumbnails/" + JAN);
    assert.equal(urls.length, 3);
    assert.ok(sql.length === 1);
  } finally {
    globalThis.fetch = original;
  }
});
test("resolved product cache avoids external requests", async () => {
  const { resolveProduct } = await import("../src/server/products.ts");
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("should not fetch");
  };
  const cached = {
    barcode: JAN,
    name: "cached",
    thumbnail: null,
    source: null,
    sourceUrl: null,
    checkedAt: 1,
  };
  const env: any = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ data_json: JSON.stringify(cached) }),
        }),
      }),
    },
  };
  try {
    assert.deepEqual(await resolveProduct(env, JAN), cached);
  } finally {
    globalThis.fetch = original;
  }
});
test("untrusted thumbnail destinations are not requested", async () => {
  const { resolveProduct } = await import("../src/server/products.ts");
  const original = globalThis.fetch;
  const urls: string[] = [];
  globalThis.fetch = async (input: any) => {
    urls.push(String(input));
    return Response.json({
      status: 1,
      product: {
        product_name: "test",
        image_front_small_url: "https://internal.example.invalid/private",
      },
    });
  };
  const env: any = {
    DB: {
      prepare: () => ({
        bind: () => ({ first: async () => null, run: async () => ({}) }),
      }),
    },
    BUCKET: { put: async () => assert.fail("unexpected image write") },
  };
  try {
    const p = await resolveProduct(env, JAN);
    assert.equal(p.name, "test");
    assert.equal(p.thumbnail, null);
    assert.equal(urls.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});
