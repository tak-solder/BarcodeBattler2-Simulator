import "./hardware.css";
import type { Fighter } from "../engine/game";

export interface HardwareView {
  powered: boolean;
  resources: boolean;
  fighters: [Fighter | undefined, Fighter | undefined];
  activePlayer: number | null;
  winner: number | null;
  mode: string;
  turn: number;
  message: string;
  canAttack: [boolean, boolean];
  canPower: [boolean, boolean];
  busy: boolean;
}

const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

// Each digit is drawn as seven LCD segments, so the display needs no web font.
const segments = [
  "3,1 13,1 11,3 5,3", // a
  "13,2 13,11 11,10 11,4", // b
  "13,13 13,22 11,20 11,14", // c
  "3,23 13,23 11,21 5,21", // d
  "2,13 4,14 4,20 2,22", // e
  "2,2 4,4 4,10 2,11", // f
  "3,12 5,11 11,11 13,12 11,13 5,13", // g
];
const digitSegments: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
};
function numberDisplay(value: number | undefined, label: string) {
  const text =
    value === undefined
      ? "-----"
      : String(Math.max(0, Math.trunc(value))).padStart(5, "0");
  return `<span class="lcd-number" aria-label="${escape(label)} ${value ?? "未読取"}"><svg viewBox="0 0 80 25" aria-hidden="true" class="segment-digits">${text
    .split("")
    .map(
      (digit, x) =>
        `<g transform="translate(${x * 16},0)">${segments.map((points, i) => `<polygon class="segment ${(digitSegments[digit] ?? "").includes("abcdefg"[i]) ? "lit" : ""}" points="${points}"/>`).join("")}</g>`,
    )
    .join("")}</svg></span>`;
}

export function hardwareLCD(view: HardwareView) {
  const rows = view.resources
    ? [
        { key: "mp", title: "MP", label: "魔法力", scale: 1 },
        { key: "pp", title: "PP", label: "薬草", scale: 1 },
        { key: "speed", title: "SP", label: "速さ", scale: 1 },
      ]
    : [
        { key: "hp", title: "HP", label: "生命力", scale: 100 },
        { key: "st", title: "ST", label: "攻撃力", scale: 100 },
        { key: "df", title: "DF", label: "守備力", scale: 100 },
      ];
  return `<div class="hardware-lcd ${view.powered ? "" : "is-off"}" role="group" aria-label="${view.powered ? "バーコードバトラーII 液晶" : "液晶表示オフ"}"><div class="lcd-content" ${!view.powered ? 'aria-hidden="true"' : ""}>
    <div class="lcd-mode-strip"><span>${escape(view.mode)}</span><span class="lcd-battle-word">BATTLE</span><span>${view.resources ? "MP / PP" : "HP / ST / DF"}</span></div>
    <div class="lcd-players">${view.fighters.map((fighter, i) => `<span class="${view.activePlayer === i ? "current" : ""}"><i aria-hidden="true">${view.activePlayer === i ? "▶" : ""}</i>${i + 1}P <small>${fighter ? (fighter.job > 6 ? "魔法使い" : "戦士") : ""}</small></span>`).join("")}</div>
    <div class="lcd-data">${rows.map(({ key, title, label, scale }) => `<div class="lcd-data-row"><span class="lcd-metric">${title}</span>${view.fighters.map((fighter, i) => `<div class="lcd-data-cell">${numberDisplay(fighter ? Number(fighter[key]) * scale : undefined, `${i + 1}P ${title}`)}<span class="lcd-japanese">${label}</span></div>`).join("")}</div>`).join("")}</div>
    <div class="lcd-event">${view.winner !== null ? (view.winner === -1 ? "DRAW" : `${view.winner + 1}P WIN`) : view.activePlayer !== null ? `${view.activePlayer + 1}P TURN` : "CARD IN"}<span class="lcd-bars" aria-hidden="true">▰ ▰ ▰ ▰ ▰</span></div>
  </div></div>`;
}

function caseSkin() {
  return `<svg class="case-skin" viewBox="0 0 1040 720" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="case-plastic" x1="185" y1="32" x2="900" y2="620" gradientUnits="userSpaceOnUse"><stop stop-color="#44474b"/><stop offset=".12" stop-color="#202329"/><stop offset=".49" stop-color="#13171d"/><stop offset=".74" stop-color="#292d34"/><stop offset="1" stop-color="#12151b"/></linearGradient>
      <linearGradient id="case-wing" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#181b20"/><stop offset=".34" stop-color="#373b42"/><stop offset=".61" stop-color="#1d2027"/><stop offset=".85" stop-color="#4b4e54"/><stop offset="1" stop-color="#20232a"/></linearGradient>
      <linearGradient id="case-bevel" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#5e6167"/><stop offset=".18" stop-color="#242830"/><stop offset=".62" stop-color="#11151c"/><stop offset=".83" stop-color="#41464f"/><stop offset="1" stop-color="#0c1017"/></linearGradient>
      <linearGradient id="case-front" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4c5056"/><stop offset=".15" stop-color="#272b31"/><stop offset=".4" stop-color="#14181e"/><stop offset=".69" stop-color="#30343a"/><stop offset="1" stop-color="#171a20"/></linearGradient>
      <linearGradient id="case-reader" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#44474b"/><stop offset=".22" stop-color="#24282d"/><stop offset=".8" stop-color="#171b20"/><stop offset="1" stop-color="#363a3d"/></linearGradient>
    </defs>
    <path d="M12 141Q12 93 64 73Q139 38 309 29L322 44H704L718 27Q890 28 987 77Q1028 98 1028 143V534Q1027 573 980 580L800 592H240L57 579Q12 574 12 535Z" fill="url(#case-plastic)" stroke="#080c12" stroke-width="5"/>
    <path d="M21 137Q20 96 72 79Q168 42 308 36L315 45Q252 64 239 94L231 484L190 524L22 526Z" fill="url(#case-wing)" stroke="#55595f" stroke-opacity=".4" stroke-width="2"/>
    <path d="M1019 137Q1020 97 967 79Q873 41 720 35L711 47Q785 67 799 95L810 484L851 524L1019 526Z" fill="url(#case-wing)" stroke="#6e7278" stroke-opacity=".4" stroke-width="2"/>
    <path d="M31 145Q59 125 143 116L150 153L147 491L24 501Z" fill="#090d13" stroke="#4d5159" stroke-width="2"/>
    <path d="M1009 145Q981 125 897 116L890 153L893 491L1016 501Z" fill="#0b0e14" stroke="#555961" stroke-width="2"/>
    <path d="M244 101Q251 68 341 61H697Q784 69 796 102L815 443Q815 474 767 497L710 520H332L274 497Q225 474 225 443Z" fill="url(#case-bevel)" stroke="#151a22" stroke-width="6"/>
    <path d="M267 111Q276 88 344 81H694Q762 87 773 111L788 440Q786 462 753 477L705 499H335L287 477Q255 463 253 440Z" fill="#20242b" stroke="#666c76" stroke-opacity=".35" stroke-width="2"/>
    <path d="M297 128Q308 113 349 107H691Q732 113 743 128L756 389Q758 414 731 419H309Q282 413 284 390Z" fill="url(#case-bevel)" stroke="#10151d" stroke-width="5"/>
    <path d="M347 154Q347 146 357 146H684Q694 146 694 156V365Q694 375 684 375H357Q347 375 347 365Z" fill="#080e12" stroke="#6d7273" stroke-width="3"/>
    <path d="M303 188L330 197V229L303 222Z M303 237L330 245V249L303 241Z M303 249L330 257V261L303 253Z M303 261L330 269V273L303 265Z M303 273L330 281V285L303 277Z M303 285L330 293V297L303 289Z M303 297L330 305V309L303 301Z M303 315L330 322V352L303 345Z" fill="#d9dad7"/>
    <path d="M738 188L711 197V229L738 222Z M738 237L711 245V249L738 241Z M738 249L711 257V261L738 253Z M738 261L711 269V273L738 265Z M738 273L711 281V285L738 277Z M738 285L711 293V297L738 289Z M738 297L711 305V309L738 301Z M738 315L711 322V352L738 345Z" fill="#d9dad7"/>
    <path d="M301 430H740L747 499H293Z" fill="#282c32" stroke="#11161c" stroke-width="2"/>
    <path d="M18 514L237 524H801L1020 514V541L797 551H242L19 540Z" fill="url(#case-front)"/>
    <path d="M19 534L241 544H799L1020 534M19 545L241 555H799L1020 545M21 554L239 565H799L1019 554" stroke="#090d13" stroke-width="4"/>
    <path d="M290 516H751L801 546V579H239V546Z" fill="url(#case-front)" stroke="#434850" stroke-width="2"/>
    <path d="M253 574H789V605H253Z" fill="#11161c" stroke="#4e535b" stroke-width="3"/>
    <path d="M286 605H755V636H286Z" fill="#080c11"/>
    <path d="M262 635L775 621Q797 621 798 640L797 679Q795 698 777 700H266Q244 699 243 678V653Q243 639 262 635Z" fill="url(#case-reader)" stroke="#10151a" stroke-width="4"/>
    <path d="M271 635L772 624" stroke="#71777c" stroke-opacity=".5" stroke-width="2"/>
    <path d="M261 676H782" stroke="#080c10" stroke-width="3"/>
  </svg>`;
}

export function hardware(view: HardwareView) {
  const led =
    view.winner !== null && view.winner >= 0
      ? view.winner === 0
        ? 0
        : 4
      : view.activePlayer === null
        ? 2
        : view.activePlayer === 0
          ? 1
          : 3;
  return `<section class="hardware-device" aria-label="バーコードバトラーII 本体"><div class="device ${view.powered ? "" : "device-off"}">
    ${caseSkin()}
    <div class="epoch-mark" aria-hidden="true"><strong>EPOCH</strong><span>CARD BATTLE SYSTEM</span></div>
    <div class="screen-opening">${hardwareLCD(view)}</div>
    ${[0, 1].map((side) => `<div class="wing-controls ${side === 0 ? "left-wing" : "right-wing"}">${["power", "attack"].map((action, row) => `<button class="wing-button ${row ? "wing-battle" : "wing-power"}" data-action="${action}" data-side="${side}" aria-label="${side + 1}P ${row ? "BATTLE 攻撃" : "POWER 回復"}" ${!(row ? view.canAttack[side] : view.canPower[side]) ? "disabled" : ""}><span class="wing-keycap" aria-hidden="true"></span><span class="wing-print" aria-hidden="true">${side === 0 ? "L" : "R"}·${row ? "BATTLE" : "POWER"}</span></button>`).join("")}</div>`).join("")}
    <div class="led-panel"><div class="led-lights" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<i class="battle-led ${view.powered && i === led ? "on" : ""}"></i>`).join("")}</div><div class="led-legends" aria-hidden="true"><span>L</span><span>⟵</span><strong>BATTLE SIDE</strong><span>⟶</span><span>R</span></div></div>
    <div class="case-keys"><button class="case-key" data-device="power" aria-label="液晶表示の電源" aria-pressed="${view.powered}"><span class="case-key-label">ON/OFF</span><span class="case-keycap" aria-hidden="true"></span></button><button class="case-key" data-device="select" aria-pressed="${view.resources}" aria-label="液晶の能力値とMP・薬草・速さを切り替える" ${!view.powered ? "disabled" : ""}><span class="case-key-label">SELECT</span><span class="case-keycap" aria-hidden="true"></span></button><button class="case-key" data-device="set" aria-label="SET バーコードを確定" ${!view.powered || view.busy ? "disabled" : ""}><span class="case-key-label">SET</span><span class="case-keycap" aria-hidden="true"></span></button></div>
    <button class="reader-slot" data-scan="barcode" aria-label="CARD IN カメラでバーコードを読み取る"><span class="card-in">CARD IN <i>⟶</i></span><span class="reader-logo"><small>CONVENI WARS</small><strong>BARCODE BATTLER <b>II</b></strong></span></button>
  </div><div class="device-hud"><p role="status">${view.powered ? escape(view.message) : "液晶表示 OFF · バトルの進行状況は保持されます"}</p><button class="text-button" data-device="enlarge" ${!view.powered ? "disabled" : ""}>液晶を拡大 <span aria-hidden="true">⤢</span></button></div></section>`;
}
