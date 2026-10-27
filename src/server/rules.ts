import { fighterFrom, validCode } from "../engine/game";
import type { Loadout } from "../engine/game";
export interface Rules {
  version: 1;
  prefixes: string[];
  lengths: number[];
  support: boolean;
  shift: boolean;
}
export function parseLoadout(input: unknown, rules: Rules): Loadout {
  if (!input || typeof input !== "object")
    throw new Error("バーコードを指定してください。");
  const x = input as Record<string, unknown>;
  const barcode = x.barcode,
    support = x.support;
  if (!validCode(barcode))
    throw new Error("有効な8桁・13桁コードを入力してください。");
  if (support !== undefined && support !== "" && !validCode(support))
    throw new Error("2枚目のコードが正しくありません。");
  const codes = [
    barcode,
    ...(typeof support === "string" && support ? [support] : []),
  ];
  for (const code of codes) {
    if (!rules.lengths.includes(code.length))
      throw new Error("この部屋で使用できるコードの桁数に合いません。");
    if (
      rules.prefixes.length &&
      !rules.prefixes.some((p) => code.startsWith(p))
    )
      throw new Error(
        `この部屋では${rules.prefixes.join(" / ")}から始まるコードのみ使用できます。2枚目も同じ条件です。`,
      );
  }
  if (support && !rules.support)
    throw new Error("この部屋では2枚目を使用できません。");
  if (
    x.shift !== undefined &&
    x.shift !== 0 &&
    (!rules.shift || ![1, 2, -1].includes(Number(x.shift)))
  )
    throw new Error("この部屋ではシフト読みを使用できません。");
  const loadout: Loadout = {
    barcode,
    ...(support ? { support: String(support) } : {}),
    shift: Number(x.shift ?? 0),
  };
  fighterFrom(loadout, { random: () => 0.5 });
  return loadout;
}
