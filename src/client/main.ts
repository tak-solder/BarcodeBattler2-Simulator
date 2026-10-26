import "./style.css";
import {
  readCard,
  fighterFrom,
  createBattle,
  act,
  cpuAction,
  RACES,
  MAGIC,
  MAGIC_COST,
  ENGINE_VERSION,
  C1World,
  C2Password,
  seeded,
} from "../engine/game";
import type {
  Battle,
  Card,
  Loadout,
  Mode,
  Action,
  Fighter,
  Turn,
} from "../engine/game";
import {
  newCampaign,
  beginEncounter,
  syncHero,
  switchHero,
  worldOf,
  collectReward,
  applyC1Password,
} from "../engine/campaign";
import type { Campaign } from "../engine/campaign";
const openScanner = async (onCode: (code: string) => void) => {
  const scanner = await import("./scanner");
  return scanner.openScanner(onCode);
};
import catalog from "./catalog.json";
const icons: Record<string, string> = {
  scan: '<path d="M4 8V4h4m8 0h4v4m0 8v4h-4M8 20H4v-4M8 8v8m4-8v8m4-8v8"/>',
  sword: '<path d="m14 4 6 0 0 6-11 11-6-6L14 4Zm-7 9 4 4M3 21l4-4"/>',
  cup: '<path d="M8 3h8v8a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 15v6m-4 0h8"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  book: '<path d="M3 4h7a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3V4Zm18 0h-5a3 3 0 0 0-3 3m0 14a4 4 0 0 1 4-3h4V4Z"/>',
  save: '<path d="M4 3h13l4 4v14H4V3Zm4 0v6h9V3M8 21v-8h9v8"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-8l1-8Z"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18Z"/>',
  refresh: '<path d="M20 8a9 9 0 1 0 1 7M20 3v6h-6"/>',
  camera:
    '<path d="M3 7h4l2-3h6l2 3h4v13H3V7Z"/><circle cx="12" cy="13" r="4"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
};
const icon = (name: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.bolt}</svg>`;
const esc = (v: unknown) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const fmt = (v: number | undefined) =>
  v === undefined ? "———" : String(v * 100).padStart(5, "0");
let mode: "ONLINE" | Mode | "CARDS" = "ONLINE",
  roomId = "jan49",
  rooms: any[] = [],
  matches: any[] = [],
  player: { id: string; name: string } | null = null,
  connected = false,
  busy = false,
  selected: Card | null = null,
  selectedLoadout: Loadout | null = null,
  selectedProduct: any = null;
let battle: Battle | null = null,
  campaign: Campaign | null = null,
  onlineResult: any = null,
  viewReplay: any = null,
  catalogQuery = "";
let fields: Record<string, string> = {
  barcode: "",
  support: "",
  barcode2: "",
  support2: "",
  enemy: "",
  password: "",
  shift: "0",
};
const localStates = new Map<string, any>();
const app = document.querySelector<HTMLDivElement>("#app")!;
async function api(path: string, method = "GET", data?: unknown) {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  let b: any;
  try {
    b = await r.json();
  } catch {
    throw new Error("サーバーに接続できません。");
  }
  if (!r.ok) throw new Error(b.error ?? "通信に失敗しました。");
  return b;
}
function toast(message: string, error = false) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast" + (error ? " error" : "");
  el.setAttribute("role", error ? "alert" : "status");
  el.textContent = message;
  document.body.append(el);
  setTimeout(() => el.remove(), 5500);
}
async function run(fn: () => unknown | Promise<unknown>) {
  if (busy) return;
  busy = true;
  render();
  try {
    await fn();
  } catch (e) {
    toast(e instanceof Error ? e.message : "処理できませんでした。", true);
  } finally {
    busy = false;
    render();
  }
}
function getRoom() {
  return rooms.find((r) => r.id === roomId);
}
function sprite(race = 4, opponent = false) {
  const shapes = [
    [
      "0011111100",
      "0110110110",
      "1111111111",
      "1011111101",
      "0011111100",
      "0110110110",
      "1100110011",
      "1100000011",
    ],
    [
      "0011001100",
      "0111111110",
      "1101001011",
      "1111111111",
      "0011111100",
      "0111111110",
      "0110000110",
      "1100000011",
    ],
    [
      "0000110000",
      "0001111000",
      "0111111110",
      "1101001011",
      "1111111111",
      "0011111100",
      "0110110110",
      "1100000011",
    ],
    [
      "0000110000",
      "1101111011",
      "1111111111",
      "0110110110",
      "0011111100",
      "1111111111",
      "0001111000",
      "0011001100",
    ],
    [
      "0001111000",
      "0011111100",
      "0010110100",
      "0001111000",
      "1111111111",
      "1011111101",
      "0011001100",
      "0110000110",
    ],
  ];
  const s = shapes[race % 5];
  return `<svg class="pixel ${opponent ? "flipped" : ""}" viewBox="0 0 12 11" shape-rendering="crispEdges" aria-hidden="true">${s.flatMap((row, y) => row.split("").map((v, x) => (v === "1" ? `<rect x="${x + 1}" y="${y + 1}" width="1" height="1"/>` : ""))).join("")}</svg>`;
}
function logo() {
  return '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
}
function currentBattle(): Battle | null {
  return mode === "ONLINE"
    ? (onlineResult?.battle ?? viewReplay?.battle)
    : battle;
}
function device() {
  const b = currentBattle();
  const a =
      b?.fighters[0] ??
      (selected
        ? selectedLoadout
          ? fighterFrom(selectedLoadout)
          : fighterFromSafe(selected)
        : undefined),
    d = b?.fighters[1];
  const latest = b?.log?.at(-1);
  const title =
    mode === "ONLINE"
      ? "ONLINE ARENA"
      : mode === "CARDS"
        ? "CARD ARCHIVE"
        : `${mode} MODE`;
  return `<section class="device" aria-label="バーコードバトラー2 シミュレータ"><div class="screw top-left"></div><div class="screw top-right"></div><div class="device-brand"><div><span class="device-eyebrow">THE ORIGINAL CODE BATTLE</span><h2>BARCODE <strong>BATTLER <em>II</em></strong></h2></div><div class="model">WEB<br><b>1991 / 2026</b></div></div><div class="lcd-frame"><div class="lcd"><div class="lcd-top"><span><i class="lcd-dot"></i> ${title}</span><span>${b ? `STAR ${["☀", "☾", "✦"][b.star]}` : "SYSTEM READY"}</span></div><div class="lcd-arena"><div class="lcd-fighter ${b?.player === 0 && b.winner === null ? "active" : ""}"><span class="lcd-side">1P ${a ? (a.job > 6 ? "MAGICIAN" : "WARRIOR") : ""}</span>${sprite(a?.race1 ?? selected?.race ?? 4)}<span class="lcd-name">${a ? esc(RACES[a.race1]) : "YOUR FIGHTER"}</span></div><div class="lcd-vs"><span>VS</span><div class="battle-lights">● ● ● ● ●</div></div><div class="lcd-fighter ${b?.player === 1 && b.winner === null ? "active" : ""}"><span class="lcd-side">2P ${d ? (d.job > 6 ? "MAGICIAN" : "WARRIOR") : ""}</span>${sprite(d?.race1 ?? 0, true)}<span class="lcd-name">${d ? esc(RACES[d.race1]) : "CHALLENGER"}</span></div></div><div class="lcd-stats"><div class="lcd-stat-label"><span>HP</span><span>ST</span><span>DF</span></div><div class="lcd-stat-values"><b>${fmt(a?.hp)}</b><span>${fmt(a?.st)}</span><span>${fmt(a?.df)}</span></div><div class="lcd-stat-values"><b>${fmt(d?.hp)}</b><span>${fmt(d?.st)}</span><span>${fmt(d?.df)}</span></div></div><div class="lcd-message">${b ? (b.winner === null ? `${b.player + 1}P TURN · ${latest ? esc(latest.action + " " + (latest.damage ? latest.damage * 100 + " DAMAGE" : latest.message)) : "バトル開始"}` : b.winner === -1 ? "DRAW — TURN LIMIT" : `${b.winner + 1}P WINS · ${b.turn} TURNS`) : selected ? "CODE ACCEPTED — READY TO BATTLE" : "SCAN A BARCODE. FIND YOUR POWER."}</div></div></div><div class="device-bottom"><div class="speaker" aria-hidden="true">${"<i></i>".repeat(7)}</div><div class="device-buttons"><button class="hardware power" data-action="power" ${!canAct() ? "disabled" : ""}>POWER<span>回復</span></button><button class="hardware battle" data-action="attack" ${!canAct() ? "disabled" : ""}>BATTLE<span>攻撃</span></button></div><div class="device-serial">BB–II<br>WEB EDITION</div></div><div class="screw bottom-left"></div><div class="screw bottom-right"></div></section>`;
}
function fighterFromSafe(c: Card) {
  try {
    return fighterFrom({ barcode: c.barcode });
  } catch {
    return undefined;
  }
}
function canAct() {
  return (
    !busy &&
    mode !== "ONLINE" &&
    mode !== "CARDS" &&
    battle?.winner === null &&
    (mode === "C0" || battle.player === 0)
  );
}
function field(
  key: string,
  label: string,
  placeholder = "8桁 / 13桁のバーコード",
  optional = false,
) {
  return `<div class="field"><label for="${key}">${label}${optional ? "<span>任意</span>" : ""}</label><div class="input-wrap"><input id="${key}" data-field="${key}" inputmode="numeric" autocomplete="off" pattern="[0-9]*" maxlength="13" value="${esc(fields[key])}" placeholder="${placeholder}"><button class="input-scan" data-scan="${key}" aria-label="${label}をカメラで読む">${icon("scan")}</button></div></div>`;
}
function scanPanel() {
  return `<section class="panel scan-panel"><div class="panel-heading"><div class="step-number">01</div><div><h3>あなたのバーコードを、戦士に。</h3><p>身近な商品のバーコードを読み込もう。</p></div></div><button class="button camera-button" data-scan="barcode">${icon("camera")} カメラで読み取る <span class="button-end">${icon("arrow")}</span></button><div class="or-line"><span>または番号を入力</span></div>${field("barcode", mode === "ONLINE" ? "キャラクターコード" : mode === "C0" ? "1P キャラクター" : "戦士の主人公")}${mode === "ONLINE" || mode === "C0" || mode === "C2" ? field("support", "2枚目 · 合体 / アイテム", "追加するバーコード", true) : ""}${mode !== "ONLINE" && mode !== "CARDS" ? field("barcode2", mode === "C0" ? "2P キャラクター" : "魔法使いの主人公") : ""}${mode === "C0" || mode === "C2" ? field("support2", "2Pの2枚目", "追加するバーコード", true) : ""}${mode === "C0" ? `<label class="inline-select">シフト読み<select data-field="shift"><option value="0" ${fields.shift === "0" ? "selected" : ""}>通常</option><option value="-1" ${fields.shift === "-1" ? "selected" : ""}>−1</option><option value="1" ${fields.shift === "1" ? "selected" : ""}>＋1</option><option value="2" ${fields.shift === "2" ? "selected" : ""}>先頭</option></select></label>` : ""}${mode === "C2" ? field("password", "開始パスコード", "5桁のパスコード（任意）", true) : ""}<button class="button secondary full" data-action="read" ${busy ? "disabled" : ""}>${icon("bolt")} 能力を確認する</button><div class="scan-note"><span>JAN / EAN 対応</span><button class="text-button" data-action="sample">お試しコードを使う ${icon("chevron")}</button></div></section>`;
}
function fighterCard() {
  if (!selected) return "";
  return `<section class="panel read-result"><div class="mini-label">CODE ACCEPTED</div><div class="result-name">${sprite(selected.race)}<div><h3>${esc(selectedProduct?.name ?? catalog.find((x) => x.barcode === selected!.barcode)?.name ?? "コードから生まれた戦士")}</h3><p>${selected.job > 6 ? "魔法使い" : "戦士"} · ${RACES[selected.race]}</p></div>${selectedProduct?.thumbnail ? `<img src="${esc(selectedProduct.thumbnail)}" alt="商品のサムネイル">` : ""}</div><div class="result-stats"><div><small>HP</small><strong>${fmt(selected.hp)}</strong></div><div><small>ST</small><strong>${fmt(selected.st)}</strong></div><div><small>DF</small><strong>${fmt(selected.df)}</strong></div><div><small>SPEED</small><strong>${selected.speed}</strong></div></div><p class="muted small">特殊能力 ${selected.special} / PP ${selected.pp} / MP ${selected.mp}${selectedProduct?.source ? ` · 商品情報：${esc(selectedProduct.source)}` : ""}</p></section>`;
}
function roomPanel() {
  return `<section class="panel rooms-panel"><div class="section-heading"><div><span class="eyebrow">CHOOSE YOUR ARENA</span><h2>対戦ルーム</h2></div><button class="icon-btn" data-action="refresh" aria-label="部屋を更新">${icon("refresh")}</button></div><p class="muted">王者に挑み、勝ち抜こう。</p><div class="rooms-list">${(rooms.length
    ? rooms
    : [
        {
          id: "jan49",
          name: "49コード限定",
          description: "49から始まる国内JANコード",
          rules: { prefixes: ["49"] },
          champion: null,
          streak: 0,
        },
        {
          id: "open",
          name: "無差別",
          description: "すべてのJAN / EANコード",
          rules: { prefixes: [] },
          champion: null,
          streak: 0,
        },
      ]
  )
    .map(
      (r) =>
        `<button class="room-card ${roomId === r.id ? "selected" : ""}" data-room="${esc(r.id)}" aria-pressed="${roomId === r.id}"><div class="room-icon">${icon(r.id === "jan49" ? "scan" : "globe")}</div><div class="room-info"><div class="room-name">${esc(r.name)} <span class="tag">SYSTEM</span></div><p>${r.rules.prefixes?.length ? "49から始まるコードのみ" : "コード制限なし"}</p><div class="room-state"><span class="status-dot ${r.champion ? "orange" : ""}"></span>${r.champion ? `${esc(r.champion.name)} · ${r.streak}連勝` : "初代王者、募集中"}</div></div><span class="radio-dot"></span></button>`,
    )
    .join(
      "",
    )}</div><div class="regulation"><span>${icon("book")} レギュレーション</span><p>${roomId === "jan49" ? "キャラクター・2枚目ともに49コード限定。" : "有効な8桁・13桁コードが参加可能。"} 通常読み / 2枚まで / 毎試合HP全回復 / 自動対戦</p></div><button class="button primary full" data-action="challenge" ${busy || !connected ? "disabled" : ""}>${busy ? "処理中…" : getRoom()?.champion?.playerId === player?.id ? "あなたが現在の王者です" : getRoom()?.champion ? "この部屋の王者に挑戦" : "初代王者としてエントリー"} ${icon("arrow")}</button><p class="fineprint">勝者はそのまま部屋の王者に。次の挑戦を待ちます。</p></section>`;
}
function championPanel() {
  const champ = getRoom()?.champion;
  return `<section class="panel champion-panel"><div class="section-heading"><span class="eyebrow">${icon("cup")} REIGNING CHAMPION</span><span class="tag">${getRoom()?.streak ?? 0} WINS</span></div>${champ ? `<div class="champion-content">${champ.product?.thumbnail ? `<img src="${esc(champ.product.thumbnail)}" alt="${esc(champ.product.name ?? "王者の商品")}">` : `<div class="champion-avatar">${sprite(4)}</div>`}<div><h3>${esc(champ.product?.name ?? "名称未解決のバーコード")}</h3><p>${esc(champ.name)}</p><code>${esc(champ.loadout.barcode)}</code>${champ.product?.source ? `<p class="small muted">商品情報：${esc(champ.product.source)}</p>` : ""}</div></div>` : `<div class="empty-champion">${icon("cup")}<div><h3>最初の王者は、あなたかも。</h3><p>バーコードを読み込んで、部屋にエントリー。</p></div></div>`}</section>`;
}
function duelProducts() {
  const result = onlineResult ?? viewReplay;
  if (!result?.challenger) return "";
  return `<section class="panel duel-products"><span class="eyebrow">THE CODES IN THIS BATTLE</span><div class="duel-product-grid">${[result.challenger, result.defender].map((entry: any, i) => (entry ? `<div class="duel-product"><span class="tag">${i + 1}P · ${esc(entry.name)}</span><div class="duel-product-info">${entry.product?.thumbnail ? `<img src="${esc(entry.product.thumbnail)}" alt="${esc(entry.product.name ?? "商品画像")}">` : `<div class="product-placeholder">${icon("scan")}</div>`}<div><strong>${esc(entry.product?.name ?? "商品名を解決できませんでした")}</strong><code>${esc(entry.loadout.barcode)}</code></div></div>${entry.supportProduct ? `<p class="small muted">2枚目：${esc(entry.supportProduct.name ?? entry.loadout.support)}</p>` : ""}${entry.product?.source ? `<p class="small muted">商品情報：${esc(entry.product.source)}</p>` : ""}</div>` : `<div class="duel-product muted">初代エントリー · 対戦相手なし</div>`)).join("")}</div></section>`;
}
function battleControls() {
  if (!battle) return "";
  const f = battle.fighters[battle.player];
  return `<section class="panel controls-panel"><div class="section-heading"><h3>${battle.winner === null ? `${battle.player + 1}P のターン` : battle.winner === -1 ? "引き分け" : `${battle.winner + 1}P の勝利`}</h3><span class="tag">TURN ${battle.turn}</span></div><div class="resource-line">${battle.fighters.map((a, i) => `<span>${i + 1}P · MP <b>${a.mp}</b> / 薬草 <b>${a.pp}</b></span>`).join("")}</div>${battle.winner === null ? `<div class="actions"><button class="button primary" data-action="attack" ${!canAct() ? "disabled" : ""}>${icon("sword")} BATTLE</button><button class="button secondary" data-action="power" ${!canAct() || f.pp === 0 || f.pp_ignore_flag ? "disabled" : ""}>${icon("bolt")} POWER</button><button class="button secondary" data-action="herb" ${!canAct() || f.pp < 1 || f.pp_ignore_flag ? "disabled" : ""}>薬草を指定</button></div><div class="magic-grid">${MAGIC.map((m, i) => `<button data-magic="${i}" ${!canAct() || f.job <= 6 || f.mp < MAGIC_COST[i] ? "disabled" : ""}><span>F${i}</span>${m}<small>MP ${MAGIC_COST[i]}</small></button>`).join("")}</div>${mode !== "C0" ? `<button class="text-button" data-action="switch">主人公を交代 ${icon("arrow")}</button> <button class="text-button" data-action="escape">逃げる</button>` : ""}` : mode !== "C0" && campaign ? (battle.winner === 0 ? `<div class="actions"><button class="button primary" data-reward="supplies">報酬を受け取る</button></div>` : `<button class="button secondary" data-action="switch">もう一人の主人公で続ける</button>`) : '<button class="button secondary" data-action="start">もう一度対戦する</button>'}</section>`;
}
function campaignPanel() {
  if (!campaign) return "";
  const w = worldOf(campaign);
  return `<section class="panel campaign-panel"><div class="section-heading"><div><span class="eyebrow">${mode} ADVENTURE</span><h2>${mode === "C1" ? "エポックの冒険" : "カードで広がる冒険"}</h2></div><span class="tag">${mode === "C1" ? w.stage[w.select_stage] : "FREE WORLD"}</span></div><div class="hero-switcher">${campaign.heroes.map((h, i) => `<div class="hero-chip ${i === campaign!.active ? "active" : ""}">${sprite(h.race)}<span>${i === 0 ? "戦士" : "魔法使い"}<b>HP ${fmt(h.hp)}</b><small>MP ${h.mp} / 薬草 ${h.pp}</small></span></div>`).join("")}</div>${!battle || campaign.rewarded ? (mode === "C1" ? `<div class="world-map">${w.world.map((n: string, i: number) => `<button data-world="${i}" class="${w.select_world === i ? "selected" : ""}" ${!w.enemy[i]?.length ? "disabled" : ""}>${esc(n)}<small>${w.enemy[i]?.length ?? 0} ENEMIES</small></button>`).join("")}</div><p class="muted small">鍵 ${w.key_number()} / 3${w.key_number() < 3 ? " · 手がかり " + esc(w.infomation_key()) : " · L-H が解放されました"}</p>${field("item", "今回のアイテム", "使用するアイテムコード", true)}<button class="button primary full" data-action="encounter" ${campaign.completed ? "disabled" : ""}>${campaign.completed ? "全ステージクリア！" : "このワールドを探索"} ${icon("arrow")}</button>` : `${field("enemy", "敵のカード")}${field("item", "今回のアイテム", "使用するアイテムコード", true)}<button class="button primary full" data-action="encounter">敵カードと対戦 ${icon("sword")}</button>`) : ""}${campaign.password ? `<div class="password-result">CLEAR PASSWORD <strong>${esc(campaign.password)}</strong></div>` : ""}<div class="campaign-footer"><button class="text-button" data-action="switch">${icon("refresh")} 主人公交代</button><button class="text-button" data-action="save">${icon("save")} セーブ</button><button class="text-button" data-action="load">ロード</button>${mode === "C1" ? '<button class="text-button" data-action="password">パスコード</button>' : ""}</div></section>`;
}
function historyPanel() {
  const b = currentBattle();
  const log = b?.log ?? [];
  return `<section class="panel history-panel"><div class="section-heading"><div><span class="eyebrow">BATTLE RECORD</span><h2>${b ? "バトルログ" : "最近の対戦"}</h2></div>${b ? `<span class="tag">${b.turn} TURNS</span>` : ""}</div>${
    b
      ? `<div class="battle-log">${
          log.length
            ? log
                .slice(-60)
                .reverse()
                .map(
                  (l) =>
                    `<div class="log-row"><code>${String(l.turn).padStart(2, "0")}</code><span class="tag">${l.player + 1}P</span><span>${esc(l.action)}<small>${esc(l.message)}</small></span><b class="${l.heal ? "heal" : ""}">${l.damage ? "−" + l.damage * 100 : l.heal ? "＋" + l.heal * 100 : "—"}</b></div>`,
                )
                .join("")
            : '<p class="muted">最初のコマンドを選んでください。</p>'
        }</div>`
      : mode === "ONLINE"
        ? matches.length
          ? `<div class="match-list">${matches.map((m) => `<button data-replay="${esc(m.id)}"><span class="match-icon">${icon("cup")}</span><span><strong>${esc(m.winner_name ?? "引き分け")}</strong><small>${esc(m.challenger_name)} ${m.defender_name ? "vs " + esc(m.defender_name) : "初代エントリー"}</small></span><span class="match-date">${new Date(m.created_at * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}${icon("chevron")}</span></button>`).join("")}</div>`
          : '<div class="empty-log"><span>まだ対戦記録はありません。</span><p>ここから、この部屋の歴史が始まります。</p></div>'
        : '<div class="empty-log">バーコードをセットして、バトルを始めましょう。</div>'
  }</section>`;
}
function catalogPanel() {
  const cards = catalog.filter((c) =>
    (c.name + c.barcode).includes(catalogQuery),
  );
  return `<section class="panel catalog-panel"><div class="section-heading"><div><span class="eyebrow">REFERENCE CARD ARCHIVE</span><h2>カードライブラリ</h2></div><span class="tag">${catalog.length} CARDS</span></div><p class="muted">参照実装に収録されたカード番号。選ぶと現在の入力欄にセットできます。49限定部屋では使用できません。</p><input id="catalog-search" aria-label="カードを検索" placeholder="名前・コードで検索" value="${esc(catalogQuery)}"><div class="catalog-grid">${cards
    .slice(0, 100)
    .map(
      (c) =>
        `<button data-card="${esc(c.barcode)}"><span class="catalog-code-mark">${logo()}</span><strong>${esc(c.name)}</strong><code>${esc(c.barcode)}</code><span>コードを使う ${icon("arrow")}</span></button>`,
    )
    .join(
      "",
    )}</div>${cards.length ? "" : "<p>該当するカードがありません。</p>"}</section>`;
}
function render() {
  const descriptions: Record<string, [string, string, string]> = {
    ONLINE: [
      "THE EVERYDAY BECOMES EPIC.",
      "いつものバーコードが、",
      "次の王者になる。",
    ],
    C0: ["TWO CODES. ONE WINNER.", "あの頃のバトルを、", "もう一度。"],
    C1: [
      "ENTER THE ORIGINAL ADVENTURE.",
      "戦士と魔法使い、",
      "ふたりで冒険へ。",
    ],
    C2: [
      "YOUR CARDS. YOUR ADVENTURE.",
      "カードを読み込んで、",
      "新たな敵に挑め。",
    ],
    CARDS: ["EVERY CODE HAS A STORY.", "そのコードには、", "物語がある。"],
  };
  const desc = descriptions[mode];
  app.innerHTML = `<header class="site-header"><a href="#" class="brand" aria-label="Barcode Battler II ホーム">${logo()}<span>BARCODE BATTLER <b>II</b><small>WEB SIMULATOR</small></span></a><div class="header-right"><span class="connection ${connected ? "on" : ""}"><i></i>${connected ? "接続済み" : "ローカルモード"}</span><button class="player-button" data-action="profile">${esc(player?.name ?? "ゲスト")}<span>↗</span></button><button class="help-button" data-action="help" aria-label="遊び方">?</button></div></header><main><nav class="mode-tabs" aria-label="ゲームモード">${[
    ["ONLINE", "cup", "オンライン対戦"],
    ["C0", "sword", "C0 対戦"],
    ["C1", "globe", "C1 冒険"],
    ["C2", "bolt", "C2 カード"],
    ["CARDS", "book", "カードライブラリ"],
  ]
    .map(
      ([key, i, label]) =>
        `<button data-mode="${key}" class="${mode === key ? "active" : ""}" aria-current="${mode === key ? "page" : "false"}">${icon(i)}${label}${key === "ONLINE" ? '<span class="live-dot"></span>' : ""}</button>`,
    )
    .join(
      "",
    )}</nav><section class="intro"><div><span class="eyebrow">${desc[0]}</span><h1>${desc[1]}<br><em>${desc[2]}</em></h1></div><p>読み込む。戦う。勝ち抜く。<br>手のひらの冒険が、ブラウザでよみがえる。</p></section>${mode === "CARDS" ? catalogPanel() : `<div class="play-layout"><div class="play-main">${device()}<div class="device-caption"><span><i></i> BARCODE BATTLER II</span><span>オリジナルロジックをブラウザへ</span></div>${fighterCard()}${mode === "ONLINE" && onlineResult ? `<div class="result-banner">${icon("cup")}<div><strong>${onlineResult.outcome === "crown" ? "初代王者になりました！" : onlineResult.outcome === "win" ? "勝利！新しい王者です。" : onlineResult.outcome === "draw" ? "引き分け。王者は防衛継続。" : "王者が防衛しました。"}</strong><p>${onlineResult.streak}連勝 · ${onlineResult.battle?.turn ?? 0}ターン</p></div></div>` : ""}${mode === "ONLINE" ? duelProducts() : ""}${mode !== "ONLINE" ? battleControls() : championPanel()}${historyPanel()}</div><aside class="play-sidebar">${mode === "ONLINE" ? roomPanel() : `<section class="panel mode-info"><span class="eyebrow">${mode} MODE</span><h2>${mode === "C0" ? "ふたりで対戦" : mode === "C1" ? "内蔵ワールドを冒険" : "自分のカードで冒険"}</h2><p>${mode === "C0" ? "2人のバーコードをセットして交互に操作。合体・装備・魔法で戦略を組み立てよう。" : mode === "C1" ? "戦士と魔法使いを登録。5つのワールドで鍵を集め、L-Hのボスに挑もう。" : "戦士と魔法使いを登録し、読み込んだ敵カードとバトル。パスコードからも始められます。"}</p>${mode === "C1" || mode === "C2" ? `<button class="text-button" data-action="load">${icon("save")} 前回の冒険をロード</button>` : ""}</section>`}${campaign && mode !== "ONLINE" ? campaignPanel() : ""}${scanPanel()}${mode !== "ONLINE" ? `<button class="button primary full start-button" data-action="start" ${busy ? "disabled" : ""}>${campaign ? "新しい冒険を始める" : mode === "C0" ? "バトルを始める" : "冒険を始める"} ${icon("arrow")}</button>` : ""}<div class="side-tip"><span>遊び方のヒント</span><p>強さは値段で決まらない。<br>気になる商品があったら、読み込んでみよう。</p><button class="text-button" data-action="help">操作ガイド ${icon("arrow")}</button></div></aside></div>`}<section class="bottom-strip"><div>${icon("scan")}<span><strong>SCAN</strong>身近なバーコードを読む</span></div><span class="strip-plus">＋</span><div>${icon("bolt")}<span><strong>DISCOVER</strong>隠れた能力を見つける</span></div><span class="strip-plus">＝</span><div>${icon("cup")}<span><strong>BATTLE</strong>あなただけの戦士で挑む</span></div></section></main><footer><span>${logo()} BARCODE BATTLER II <small>UNOFFICIAL WEB SIMULATOR</small></span><div><a href="https://github.com/finalfighter/BarcodeBattler2-Simulator" target="_blank" rel="noopener">Based on finalfighter's simulator ↗</a><button class="text-button" data-action="help">このシミュレータについて</button></div></footer><div class="sr-only" role="status" aria-live="polite">${busy ? "処理中" : currentBattle()?.winner !== null && currentBattle() ? `対戦終了 ${currentBattle()!.winner! + 1}P勝利` : ""}</div>`;
  bind();
}
async function refresh() {
  const data = await api("/rooms");
  rooms = data.rooms;
  matches = (await api(`/rooms/${roomId}/matches`)).matches;
  connected = true;
}
function setMode(next: typeof mode) {
  if (next === mode) return;
  localStates.set(mode, {
    fields: { ...fields },
    battle,
    campaign,
    selected,
    selectedLoadout,
    selectedProduct,
  });
  mode = next;
  const s = localStates.get(next);
  fields = s?.fields ?? {
    barcode: "",
    support: "",
    barcode2: "",
    support2: "",
    enemy: "",
    password: "",
    shift: "0",
  };
  battle = s?.battle ?? null;
  campaign = s?.campaign ?? null;
  selected = s?.selected ?? null;
  selectedLoadout = s?.selectedLoadout ?? null;
  selectedProduct = s?.selectedProduct ?? null;
  render();
}
function loadout(two = false): Loadout {
  return {
    barcode: fields[two ? "barcode2" : "barcode"],
    ...(fields[two ? "support2" : "support"]
      ? { support: fields[two ? "support2" : "support"] }
      : {}),
    shift: mode === "C0" ? Number(fields.shift) : 0,
  };
}
async function read() {
  const l = loadout();
  selected = readCard(l.barcode, {
    hero: mode === "C1" || mode === "C2",
    job: mode === "C1" || mode === "C2" ? "warrior" : undefined,
  });
  if (l.support) fighterFrom(l);
  selectedLoadout = l;
  selectedProduct = null;
  if (mode === "ONLINE" && connected) {
    try {
      selectedProduct = (await api(`/products/${l.barcode}`)).product;
    } catch {
      toast("能力の読み込み完了。商品情報は取得できませんでした。");
    }
  }
}
async function save() {
  const data = {
    version: 1,
    engine: ENGINE_VERSION,
    fields,
    campaign: campaign
      ? {
          ...campaign,
          battle: campaign.battle
            ? { ...campaign.battle, log: campaign.battle.log.slice(-30) }
            : null,
        }
      : null,
    battle: battle ? { ...battle, log: battle.log.slice(-30) } : null,
  };
  localStorage.setItem("bb2-save-" + mode, JSON.stringify(data));
  if (connected) {
    await api("/saves/" + mode, "PUT", data);
    toast("冒険をクラウドにセーブしました。");
  } else toast("このブラウザにセーブしました。");
}
async function load() {
  let data: any;
  if (connected) data = (await api("/saves/" + mode)).save;
  if (!data) {
    const s = localStorage.getItem("bb2-save-" + mode);
    data = s ? JSON.parse(s) : null;
  }
  if (!data) throw new Error("セーブデータがありません。");
  if (data.version !== 1 || data.engine !== ENGINE_VERSION)
    throw new Error("互換性のあるセーブデータではありません。");
  fields = data.fields;
  campaign = data.campaign;
  battle = data.battle;
  if (campaign && battle) campaign.battle = battle;
  toast("セーブデータをロードしました。");
}
function start() {
  if (mode === "C0") {
    battle = createBattle(fighterFrom(loadout()), fighterFrom(loadout(true)));
    campaign = null;
  } else if (mode === "C1" || mode === "C2") {
    campaign = newCampaign(mode, [loadout(), loadout(true)], fields.password);
    battle = null;
  }
  selected = null;
}
async function doAct(action: Action) {
  if (
    !battle ||
    battle.winner !== null ||
    mode === "ONLINE" ||
    mode === "CARDS" ||
    (mode !== "C0" && battle.player !== 0)
  )
    return;
  act(battle!, action);
  if (campaign) {
    syncHero(campaign);
    if (battle!.winner === null && battle!.player === 1) {
      act(battle!, cpuAction(battle!));
      syncHero(campaign);
    }
  }
  if (battle!.winner !== null && campaign) {
    if (battle!.winner === 1 && campaign.heroes[1 - campaign.active].hp > 0)
      toast("主人公が倒れました。もう一人に交代できます。");
    else
      toast(
        battle!.winner === 0
          ? "勝利！報酬を受け取れます。"
          : "冒険終了。ロードまたは新しい冒険を選んでください。",
      );
  }
}
function help() {
  const d = document.createElement("dialog");
  d.className = "help-dialog";
  d.innerHTML = `<div class="dialog-head"><div><span class="eyebrow">PLAYER'S GUIDE</span><h2>遊び方・実装について</h2></div><button class="icon-btn" aria-label="閉じる">×</button></div><div class="help-content"><h3>01 バーコードを読み込む</h3><p>カメラ、写真、手入力に対応。EAN-8 / EAN-13とUPC-A（先頭に0を補完）を受け付けます。キャラクターにならないコードは2枚目のアイテムにお試しください。</p><h3>02 モードを選ぶ</h3><p><b>オンライン：</b>登録された王者のコードとサーバーで自動対戦。両者は毎回全回復。勝者が王者として残る非同期の勝ち抜き戦です。通常攻撃のみを使い、乱数はサーバーが決めます。49限定では2枚目も49始まりです。</p><p><b>C0：</b>同じ端末で交互に操作する2人対戦。<b>C1：</b>戦士と魔法使いで内蔵ワールドを冒険。<b>C2：</b>読み取った敵カードと対戦。魔法、薬草、主人公交代、パスコードに対応します。</p><h3>03 コマンド</h3><p>BATTLEは通常攻撃。POWERは薬草1個でランダム回復。「薬草を指定」は1〜3個で回復。F0〜F9は魔法使い専用です。能力値は実機と同じくHP・ST・DFを100倍で表示します。</p><h3>セーブと商品名</h3><p>冒険は「セーブ」でD1に保存。同じブラウザの匿名セッションで復元します。Cookieを消すとクラウドセーブへのアクセスを失います。商品情報はOpen Food Facts、設定時はYahoo!ショッピングで解決を試みます。未掲載でもプレイできます。画像とリプレイはR2に保存します。</p><h3>再現範囲</h3><p>参照元の能力変換・6502風演算・戦闘計算・敵データ・パスコード処理を移植しています。実機ROMのエミュレータではなく、乱数とタイミング打法は参照元同様の確率処理です。実機との完全一致は未検証です。モード進行はWeb向けに再実装しています。戦闘中カード追加・一部の情報カード演出は未対応です。</p><p class="muted small">非公式・非提携のシミュレータ。BARCODE BATTLER IIの名称は権利者に帰属します。参照元：finalfighter / BarcodeBattler2-Simulator、コミット3211674。</p></div>`;
  document.body.append(d);
  d.querySelector("button")!.addEventListener("click", () => d.close());
  d.addEventListener("close", () => d.remove());
  d.showModal();
}
function askValue(
  title: string,
  value: string,
  done: (value: string) => void,
  type = "text",
) {
  const d = document.createElement("dialog");
  d.className = "value-dialog";
  d.innerHTML = `<form method="dialog"><h2>${esc(title)}</h2><input aria-label="${esc(title)}" type="${type}" value="${esc(value)}" required maxlength="24"><div class="actions"><button class="button secondary" value="cancel" formnovalidate>キャンセル</button><button class="button primary" value="ok">決定</button></div></form>`;
  document.body.append(d);
  d.addEventListener("close", () => {
    const v = d.querySelector("input")!.value;
    if (d.returnValue === "ok") done(v);
    d.remove();
  });
  d.showModal();
}
function bind() {
  app
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-field]")
    .forEach((el) =>
      el.addEventListener("input", () => {
        fields[el.dataset.field!] = el.value.replace(/[^0-9-]/g, "");
      }),
    );
  app
    .querySelectorAll<HTMLElement>("[data-mode]")
    .forEach((el) =>
      el.addEventListener("click", () =>
        setMode(el.dataset.mode as typeof mode),
      ),
    );
  app.querySelectorAll<HTMLElement>("[data-room]").forEach((el) =>
    el.addEventListener(
      "click",
      () =>
        void run(async () => {
          roomId = el.dataset.room!;
          onlineResult = null;
          viewReplay = null;
          if (connected) await refresh();
        }),
    ),
  );
  app.querySelectorAll<HTMLElement>("[data-scan]").forEach((el) =>
    el.addEventListener(
      "click",
      () =>
        void openScanner((code) => {
          fields[el.dataset.scan!] = code;
          selected = null;
          render();
          toast("バーコードを読み込みました。");
        }),
    ),
  );
  app.querySelectorAll<HTMLElement>("[data-world]").forEach((el) =>
    el.addEventListener("click", () => {
      campaign!.world.select_world = Number(el.dataset.world);
      render();
    }),
  );
  app.querySelectorAll<HTMLElement>("[data-reward]").forEach((el) =>
    el.addEventListener(
      "click",
      () =>
        void run(() => {
          collectReward(campaign!, el.dataset.reward as "status" | "supplies");
          battle = null;
          toast("報酬を受け取りました。");
        }),
    ),
  );
  app
    .querySelectorAll<HTMLElement>("[data-magic]")
    .forEach((el) =>
      el.addEventListener(
        "click",
        () =>
          void run(() =>
            doAct({ kind: "magic", spell: Number(el.dataset.magic) }),
          ),
      ),
    );
  app.querySelectorAll<HTMLElement>("[data-replay]").forEach((el) =>
    el.addEventListener(
      "click",
      () =>
        void run(async () => {
          viewReplay = await api("/replays/" + el.dataset.replay);
          onlineResult = null;
          toast("対戦記録を読み込みました。");
        }),
    ),
  );
  app.querySelectorAll<HTMLElement>("[data-card]").forEach((el) =>
    el.addEventListener("click", () => {
      const code = el.dataset.card!;
      setMode("C0");
      fields.barcode = code;
      render();
      toast("1Pのコードにセットしました。");
    }),
  );
  app
    .querySelector<HTMLInputElement>("#catalog-search")
    ?.addEventListener("input", (e) => {
      const el = e.target as HTMLInputElement;
      const pos = el.selectionStart;
      catalogQuery = el.value;
      render();
      const input = app.querySelector<HTMLInputElement>("#catalog-search")!;
      input.focus();
      input.setSelectionRange(pos, pos);
    });
  app.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    setMode("ONLINE");
  });
  app.querySelectorAll<HTMLElement>("[data-action]").forEach((el) =>
    el.addEventListener("click", () => {
      const action = el.dataset.action;
      if (action === "help") {
        help();
        return;
      }
      if (action === "profile") {
        if (!connected) {
          toast("オンライン機能はサーバー接続後に利用できます。", true);
          return;
        }
        askValue(
          "バトラー名",
          player?.name ?? "",
          (name) =>
            void run(async () => {
              player = (await api("/profile", "PATCH", { name })).player;
            }),
        );
        return;
      }
      if (action === "password") {
        askValue(
          "C1パスコード（3桁）",
          "",
          (v) =>
            void run(() => {
              applyC1Password(campaign!, v);
              toast("パスコードを適用しました。");
            }),
        );
        return;
      }
      if (action === "herb") {
        askValue(
          "使用する薬草の数（1〜3）",
          "1",
          (v) => void run(() => doAct({ kind: "herb", count: Number(v) })),
          "number",
        );
        return;
      }
      void run(async () => {
        switch (action) {
          case "refresh":
            await refresh();
            break;
          case "read":
            await read();
            break;
          case "sample":
            fields = {
              ...fields,
              barcode: mode === "ONLINE" ? "4901234567894" : "0401207336501",
              barcode2: "0340912373503",
              support: "",
              support2: "",
              shift: "0",
            };
            if (mode === "C1" || mode === "C2") {
              fields.barcode2 = "0320813183500";
            }
            await read();
            toast("お試しコードをセットしました。");
            break;
          case "start":
            start();
            break;
          case "attack":
            await doAct({ kind: "attack" });
            break;
          case "power":
            await doAct({ kind: "power" });
            break;
          case "encounter":
            beginEncounter(
              campaign!,
              fields.enemy,
              fields.item ||
                fields[campaign!.active === 0 ? "support" : "support2"],
            );
            fields.item = "";
            fields[campaign!.active === 0 ? "support" : "support2"] = "";
            battle = campaign!.battle;
            if (battle?.player === 1) {
              act(battle, cpuAction(battle));
              syncHero(campaign!);
            }
            break;
          case "escape": {
            if (!campaign || !battle || battle.player !== 0) break;
            const rng = seeded(battle.seed);
            const success = Math.floor(rng.next() * 3) >= 1;
            battle.seed = rng.state;
            syncHero(campaign);
            if (success) {
              campaign.battle = null;
              battle = null;
              toast("逃走に成功しました。");
            } else {
              battle.player = 1;
              act(battle, cpuAction(battle));
              syncHero(campaign);
              toast("逃走失敗。敵の攻撃！");
            }
            break;
          }
          case "switch":
            switchHero(campaign!);
            battle = campaign!.battle;
            if (battle?.winner === null && battle.player === 1) {
              act(battle, cpuAction(battle));
              syncHero(campaign!);
            }
            break;
          case "save":
            await save();
            break;
          case "load":
            await load();
            break;
          case "challenge": {
            if (!getRoom()) throw new Error("部屋情報を更新してください。");
            onlineResult = await api(`/rooms/${roomId}/challenge`, "POST", {
              loadout: loadout(),
              version: getRoom().version,
            });
            viewReplay = null;
            await refresh();
            break;
          }
        }
      });
    }),
  );
}
render();
void (async () => {
  try {
    player = (await api("/session", "POST")).player;
    await refresh();
  } catch {
    connected = false;
    toast("オンライン機能に接続できません。C0・C1・C2はこの端末で遊べます。");
  }
  render();
})();
