import { BarcodeRead as Read } from "./BarcodeRead.js";
import { CreateFightingData as Create } from "./CreateFightingData.js";
import { FightingCalc as Calc } from "./FightingCalc.js";
import { C1WorldData as World } from "./C1WorldData.js";
import { C2PassCode as Pass } from "./C2PassCode.js";
export const ENGINE_VERSION = "bb2-as3-3211674-port1";
export const BarcodeReader: any = Read,
  FightingFactory: any = Create,
  FightingCalculator: any = Calc,
  C1World: any = World,
  C2Password: any = Pass;
export interface Card {
  barcode: string;
  hp: number;
  st: number;
  df: number;
  speed: number;
  race: number;
  job: number;
  pp: number;
  mp: number;
  special: number;
  live: boolean;
}
export interface Fighter {
  max_hp: number;
  hp: number;
  st: number;
  st1: number;
  st2: number;
  df: number;
  df1: number;
  df2: number;
  speed: number;
  race1: number;
  race2: number;
  job: number;
  pp: number;
  mp: number;
  special1: number;
  special2: number;
  union_flag: boolean;
  pp_ignore_flag: boolean;
  st_item_broke_flag: boolean;
  df_item_broke_flag: boolean;
  [key: string]: number | boolean;
}
export type Mode = "C0" | "C1" | "C2";
export interface Loadout {
  barcode: string;
  support?: string;
  shift?: number;
}
export const RACES = ["機械族", "動物族", "海洋族", "妖精族", "人間族"];
export const MAGIC = [
  "トルマ",
  "ガンツ",
  "デガンツ",
  "リーモ",
  "デリーモ",
  "ニャーヘ",
  "カチコム",
  "ヘヘンダ",
  "タフニ",
  "マミロージャ",
];
export const MAGIC_COST = [0, 2, 5, 2, 4, 3, 5, 4, 6, 3];
export function validCode(code: unknown): code is string {
  if (typeof code !== "string" || !/^(?:\d{8}|\d{13})$/.test(code))
    return false;
  const b = code.padStart(13, "0");
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(b[i]) * (i % 2 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === Number(b[12]);
}
export function readCard(
  barcode: string,
  options: {
    first?: boolean;
    base?: Card;
    shift?: number;
    hero?: boolean;
    job?: string;
    item?: boolean;
    c1?: boolean;
    random?: () => number;
  } = {},
): Card {
  if (!validCode(barcode))
    throw new Error("8桁または13桁の有効なJAN / EANコードを入力してください。");
  const reader = new BarcodeReader();
  if (options.random) reader.random = options.random;
  if (
    !reader.init(
      barcode,
      options.first === false ? 2 : 1,
      options.base ?? null,
      options.shift ?? 0,
      options.hero ?? false,
      options.job ?? null,
      options.item ?? false,
      options.c1 ?? false,
    )
  )
    throw new Error(
      options.first === false
        ? "この組み合わせでは合体・装備できません。"
        : "このモードのキャラクター条件に合いません。アイテムは2枚目に読み込んでください。",
    );
  return reader.barcode_data as Card;
}
export function fighterFrom(
  loadout: Loadout,
  options: {
    hero?: boolean;
    job?: string;
    item?: boolean;
    random?: () => number;
  } = {},
): Fighter {
  const a = readCard(loadout.barcode, { shift: loadout.shift, ...options });
  const b = loadout.support
    ? readCard(loadout.support, {
        first: false,
        base: a,
        item: options.item,
        random: options.random,
      })
    : null;
  return new FightingFactory().init(a, b) as Fighter;
}
export function seeded(seed: number) {
  let value = seed >>> 0;
  return {
    next() {
      value = (value + 0x6d2b79f5) >>> 0;
      let t = Math.imul(value ^ (value >>> 15), 1 | value);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return value;
    },
  };
}
export type Action =
  | { kind: "attack" }
  | { kind: "power" }
  | { kind: "herb"; count: number }
  | { kind: "magic"; spell: number };
export interface Turn {
  turn: number;
  player: number;
  action: string;
  damage: number;
  heal: number;
  hp: [number, number];
  message: string;
}
export interface Battle {
  engine: string;
  fighters: [Fighter, Fighter];
  star: number;
  player: number;
  seed: number;
  turn: number;
  winner: number | null;
  log: Turn[];
}
function calculator(b: Battle) {
  const c = new FightingCalculator();
  const rng = seeded(b.seed);
  c.random = () => rng.next();
  c.fighting_data = b.fighters;
  c.protection_star = b.star;
  c.now_player = b.player + 1;
  return { c, rng };
}
export function createBattle(
  a: Fighter,
  b: Fighter,
  seed = crypto.getRandomValues(new Uint32Array(1))[0],
): Battle {
  const battle: Battle = {
    engine: ENGINE_VERSION,
    fighters: structuredClone([a, b]),
    star: 0,
    player: 0,
    seed,
    turn: 0,
    winner: null,
    log: [],
  };
  const { c, rng } = calculator(battle);
  c.decide_star();
  battle.star = c.protection_star;
  const [x, y] = battle.fighters;
  const cancelX = [y.special1, y.special2].includes(45),
    cancelY = [x.special1, x.special2].includes(45);
  if (cancelX) x.special1 = x.special2 = 0;
  if (cancelY) y.special1 = y.special2 = 0;
  c.calc_special_down(y, x);
  c.calc_special_down(x, y);
  c.decide_first_player();
  battle.player = c.now_player - 1;
  battle.seed = rng.state;
  if (x.hp <= 0 || y.hp <= 0)
    battle.winner = x.hp <= 0 ? (y.hp <= 0 ? -1 : 1) : 0;
  return battle;
}
export function act(b: Battle, action: Action): Turn {
  if (b.winner !== null) throw new Error("対戦は終了しています。");
  if (b.turn >= 1000) throw new Error("ターン上限です。");
  const { c, rng } = calculator(b);
  const p = b.player;
  const a = b.fighters[p],
    d = b.fighters[1 - p];
  let damage = 0,
    heal = 0,
    label = "BATTLE",
    message = "";
  const hit = (rate = 0) => {
    if (c.calc_hit(a, d, rate)) {
      damage = c.special_multi(a, d, c.basic_damage(a, d), rate || 1);
      d.hp = Math.max(0, d.hp - damage);
      c.display_damage = damage;
      message = c.critical_hit(a) ? "会心の一撃！" : "攻撃が命中";
      if (c.check_item_broken(a, d)) {
        if (a.race2 === 5 && !a.st_item_broke_flag) {
          a.st -= a.st2;
          a.st_item_broke_flag = true;
          message += "・武器が壊れた";
        }
        if (d.race2 === 7 && !d.df_item_broke_flag) {
          d.df -= d.df2;
          d.df_item_broke_flag = true;
          message += "・防具が壊れた";
        }
      }
    } else message = "MISS";
  };
  switch (action.kind) {
    case "attack":
      hit();
      break;
    case "power":
    case "herb": {
      const count = action.kind === "herb" ? action.count : 1;
      if (
        !Number.isInteger(count) ||
        count < 1 ||
        count > 3 ||
        count > a.pp ||
        a.pp_ignore_flag
      )
        throw new Error("薬草を使用できません。");
      heal =
        action.kind === "power"
          ? c.basic_power(a, d)
          : c.use_pp_power(a, d, count);
      a.hp += heal;
      a.pp -= count;
      label = "POWER";
      message = `薬草${count}個で回復`;
      break;
    }
    case "magic": {
      const s = action.spell;
      if (
        !Number.isInteger(s) ||
        s < 0 ||
        s > 9 ||
        a.job <= 6 ||
        a.mp < MAGIC_COST[s]
      )
        throw new Error("この魔法は使用できません。");
      label = `F${s} ${MAGIC[s]}`;
      a.mp -= MAGIC_COST[s];
      if (s === 0) {
        const n = c.calc_f0(d);
        a.mp = Math.min(99, a.mp + n);
        d.mp -= n;
        message = `MPを${n}吸収`;
      } else if (s === 1 || s === 2) hit(s === 1 ? 15 : 20);
      else if (s === 3 || s === 4) {
        heal = s === 3 ? c.calc_f3(a) : c.calc_f4(a);
        a.hp += heal;
        message = "回復魔法";
      } else if (s === 5) {
        d.df1 -= c.calc_f5(d);
        d.df = Math.min(199, d.df1 + d.df2);
        message = "相手の防御力ダウン";
      } else if (s === 6) {
        a.df1 = Math.min(199, a.df1 + c.calc_f6(a));
        a.df = Math.min(199, a.df1 + a.df2);
        message = "防御力アップ";
      } else if (s === 7) {
        d.st1 -= c.calc_f7(d);
        d.st = Math.min(199, d.st1 + d.st2);
        message = "相手の攻撃力ダウン";
      } else if (s === 8) {
        a.st1 = Math.min(199, a.st1 + c.calc_f8(a));
        a.st = Math.min(199, a.st1 + a.st2);
        message = "攻撃力アップ";
      } else {
        d.pp_ignore_flag = true;
        message = "相手の薬草を封印";
      }
      break;
    }
  }
  a.hp = Math.min(a.max_hp, a.hp);
  b.turn++;
  b.seed = rng.state;
  if (d.hp <= 0) b.winner = p;
  else if (a.hp <= 0) b.winner = 1 - p;
  else if (b.turn >= 1000) b.winner = -1;
  const turn: Turn = {
    turn: b.turn,
    player: p,
    action: label,
    damage,
    heal,
    hp: [b.fighters[0].hp, b.fighters[1].hp],
    message,
  };
  b.log.push(turn);
  b.player = 1 - p;
  return turn;
}
export function cpuAction(b: Battle): Action {
  const { c, rng } = calculator(b);
  let action: Action = { kind: "attack" };
  if (b.player === 1) {
    const n = c.calc_action();
    if (n === 11 && !b.fighters[1].pp_ignore_flag) action = { kind: "power" };
    else if (
      n < 10 &&
      b.fighters[1].job > 6 &&
      b.fighters[1].mp >= MAGIC_COST[n]
    )
      action = { kind: "magic", spell: n };
  }
  b.seed = rng.state;
  return action;
}
export function autoBattle(a: Loadout, b: Loadout, seed: number) {
  const rng = seeded(seed);
  const battle = createBattle(
    fighterFrom(a, { random: () => rng.next() }),
    fighterFrom(b, { random: () => rng.next() }),
    rng.state,
  );
  while (battle.winner === null) act(battle, { kind: "attack" });
  return battle;
}
