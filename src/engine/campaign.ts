import {
  C1World,
  C2Password,
  FightingFactory,
  readCard,
  createBattle,
} from "./game";
import type { Card, Fighter, Battle, Loadout } from "./game";
export interface Campaign {
  mode: "C1" | "C2";
  base: [Card, Card];
  heroes: [Card, Card];
  maxHp: [number, number];
  active: number;
  world: any;
  enemy: Card | null;
  battle: Battle | null;
  password: string | null;
  completed: boolean;
  rewarded: boolean;
  equipment: Card | null;
}
export function newCampaign(
  mode: "C1" | "C2",
  loadouts: [Loadout, Loadout],
  password = "",
): Campaign {
  const base = loadouts.map((l, i) =>
    readCard(l.barcode, { hero: true, job: i === 0 ? "warrior" : "magician" }),
  ) as [Card, Card];
  const world = new C1World();
  world.init(Number(base[0].barcode.at(-1)), Number(base[1].barcode.at(-1)));
  world.reset_world();
  const heroes = structuredClone(base);
  if (mode === "C2" && password) {
    if (!/^\d{5}$/.test(password)) throw new Error("パスコードは5桁です。");
    const pass = new C2Password();
    pass.init(base[0], base[1], password);
    const number = pass.generate_passcode_number();
    if (number < 0)
      throw new Error("この主人公の組み合わせでは使えないパスコードです。");
    for (let i = 0; i < 2; i++)
      pass.generate_passcode_barcode_data(heroes[i], number);
  }
  return {
    mode,
    base,
    heroes,
    maxHp: [heroes[0].hp, heroes[1].hp],
    active: 0,
    world,
    enemy: null,
    battle: null,
    password: null,
    completed: false,
    rewarded: false,
    equipment: null,
  };
}
export function worldOf(c: Campaign) {
  return Object.assign(new C1World(), c.world);
}
export function beginEncounter(
  c: Campaign,
  enemyCode?: string,
  supportCode?: string,
) {
  if (c.heroes[c.active].hp <= 0)
    throw new Error("もう一人の主人公に交代してください。");
  if (c.mode === "C1") {
    const w = worldOf(c);
    if (!w.is_world()) throw new Error("このワールドはクリア済みです。");
    w.select_enemy = w.select_enemy_number();
    c.enemy = w.generate_enemy_paramater();
    c.world = w;
  } else {
    if (!enemyCode) throw new Error("敵カードを読み込んでください。");
    c.enemy = readCard(enemyCode);
  }
  c.equipment = supportCode
    ? readCard(supportCode, {
        first: false,
        base: c.heroes[c.active],
        item: true,
        c1: c.mode === "C1",
      })
    : null;
  c.battle = battleFor(c, c.enemy!);
  c.rewarded = false;
}
function battleFor(c: Campaign, enemy: Card) {
  const a = new FightingFactory().init(
    c.heroes[c.active],
    c.equipment,
  ) as Fighter;
  return createBattle(a, new FightingFactory().init(enemy));
}
export function syncHero(c: Campaign) {
  if (!c.battle) return;
  const f = c.battle.fighters[0],
    a = c.heroes[c.active];
  a.hp = f.hp;
  a.mp = f.mp;
  a.pp = f.pp;
  a.live = f.hp > 0;
}
export function switchHero(c: Campaign) {
  if (c.battle?.winner === 0) throw new Error("先に報酬を受け取ってください。");
  if (c.battle && c.battle.winner === null) {
    if (c.battle.player !== 0)
      throw new Error("自分のターンに交代してください。");
    syncHero(c);
  }
  const other = 1 - c.active;
  if (c.heroes[other].hp <= 0) throw new Error("交代できる主人公がいません。");
  c.active = other;
  c.equipment = null;
  if (c.battle && (c.battle.winner === null || c.battle.winner === 1)) {
    const enemy = {
      ...c.enemy!,
      hp: c.battle.fighters[1].hp,
      mp: c.battle.fighters[1].mp,
      pp: c.battle.fighters[1].pp,
    };
    c.battle = battleFor(c, enemy);
  }
}
export function collectReward(
  c: Campaign,
  choice: "status" | "supplies" = "supplies",
) {
  if (!c.battle || c.battle.winner !== 0 || c.rewarded)
    throw new Error("受け取れる報酬がありません。");
  syncHero(c);
  const a = c.heroes[c.active],
    enemy = c.enemy!;
  if (c.mode === "C1") {
    const w = worldOf(c),
      boss = w.generate_boss_energy(),
      gain = w.generate_st_df();
    if (boss !== -1) {
      a.hp += boss;
      a.st += gain;
      a.df += gain;
    } else if (enemy.job <= 6) {
      a.st += gain;
      a.pp += 5;
    } else {
      a.df += gain;
      if (a.job > 6) a.mp += 5;
    }
    if (w.is_key()) {
      w.delete_key();
      if (w.key_number() === 3 && !w.world.includes("L-H")) w.world.push("L-H");
    }
    const finalBoss = w.get_world_number() === 5 && w.get_enemy_number() === 4;
    w.delete_enemy();
    if (finalBoss) {
      const pass = new C2Password();
      pass.init(c.base[0], c.base[1]);
      c.password = pass.generate_passcode_from_passcode_number(
        w.get_passcode_number(),
      );
      if (w.select_stage === 5) c.completed = true;
      else {
        const number = w.get_passcode_number();
        w.select_stage++;
        w.reset_world();
        w.select_world = 0;
        for (let i = 0; i < 2; i++)
          c.heroes[i] = pass.generate_passcode_barcode_data(
            structuredClone(c.base[i]),
            number,
          );
      }
    }
    c.world = w;
  } else {
    const s = enemy.special;
    if (s >= 80 && s <= 99) {
      const pass = new C2Password();
      pass.init(c.base[0], c.base[1]);
      c.password = pass.generate_passcode(s);
    }
    a.hp += s >= 65 && s <= 69 ? [1, 3, 4, 5, 10][s - 65] : 0;
    a.st += s >= 70 && s <= 74 ? (s - 69) * 2 : 0;
    a.df +=
      s >= 75 && s <= 79 ? (s === 79 && c.active === 1 ? 1 : (s - 74) * 2) : 0;
    if (s < 75 || s > 79) a.pp += 5;
    if (a.job > 6 && (s < 70 || s > 74)) a.mp += 5;
  }
  a.hp = Math.min(999, a.hp);
  a.st = Math.min(199, a.st);
  a.df = Math.min(199, a.df);
  a.pp = Math.min(99, a.pp);
  a.mp = Math.min(99, a.mp);
  c.maxHp[c.active] = Math.max(c.maxHp[c.active], a.hp);
  c.rewarded = true;
  c.battle = null;
}

export function applyC1Password(c: Campaign, password: string) {
  if (c.mode !== "C1" || c.battle || !/^\d{3}$/.test(password))
    throw new Error("戦闘前に3桁のパスコードを入力してください。");
  const w = worldOf(c);
  if (w.select_stage !== 0)
    throw new Error("このパスコードはE-1で使用します。");
  if (w.c1_powerup_passcode(password)) {
    c.heroes = c.base.map((a) =>
      w.generate_passcode_barcode_data(structuredClone(a), password),
    ) as [Card, Card];
  } else if (w.jump_stage_passcode(password)) {
    w.select_stage = password.startsWith("31") ? 4 : 5;
    w.reset_world();
    w.select_world = 0;
    const pass = new C2Password();
    const n = w.get_passcode_number(w.select_stage - 1);
    c.heroes = c.base.map((a) =>
      pass.generate_passcode_barcode_data(structuredClone(a), n),
    ) as [Card, Card];
  } else throw new Error("パスコードが正しくありません。");
  c.world = w;
  c.maxHp = [c.heroes[0].hp, c.heroes[1].hp];
}
