import "./neo.css";
import type { HardwareView } from "./hardware";
import { RACES } from "../engine/game";
const escape = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const number = (value: number | undefined) =>
  value === undefined ? "—" : value.toLocaleString("ja-JP");
function emblem(side: number, race: number) {
  return `<svg class="neo-emblem" viewBox="0 0 180 180" fill="none" aria-hidden="true"><circle class="emblem-orbit" cx="90" cy="90" r="76" stroke="currentColor" stroke-dasharray="2 9"/><path d="M90 19 151 54V125L90 161 29 125V54Z" fill="currentColor" fill-opacity=".025" stroke="currentColor" stroke-opacity=".25"/><path d="m90 35 47 27v55l-47 28-47-28V62Z" stroke="currentColor" stroke-opacity=".5"/><circle cx="90" cy="90" r="35" stroke="currentColor" stroke-opacity=".35"/><path d="M${side ? "72 59 108 59 100 89 117 89 78 126 85 98 67 98Z" : "91 54 118 81 99 101 99 125 81 125 81 102 62 82Z"}" fill="currentColor" fill-opacity=".8"/><path d="M15 90h30m90 0h30M90 15v18m0 114v18" stroke="currentColor"/><circle cx="90" cy="90" r="64" stroke="currentColor" stroke-width="2" stroke-dasharray="${25 + race * 10} 30 4 100"/></svg>`;
}
function toyCase() {
  return `<svg class="neo-toy-skin" viewBox="0 0 1000 690" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="toy-shell" x1="210" y1="40" x2="840" y2="620" gradientUnits="userSpaceOnUse"><stop stop-color="#f4fcf5"/><stop offset=".25" stop-color="#e4f6e9"/><stop offset=".6" stop-color="#c9e3d9"/><stop offset=".84" stop-color="#c1dad5"/><stop offset="1" stop-color="#95b8b2"/></linearGradient>
      <linearGradient id="toy-edge" x1="100" y1="20" x2="900" y2="650" gradientUnits="userSpaceOnUse"><stop stop-color="#a9dbcc"/><stop offset=".33" stop-color="#7eb7a9"/><stop offset=".66" stop-color="#88c1af"/><stop offset="1" stop-color="#507f7d"/></linearGradient>
      <linearGradient id="toy-glass" x1="166" y1="108" x2="650" y2="443" gradientUnits="userSpaceOnUse"><stop stop-color="#3b5858"/><stop offset=".2" stop-color="#1e3239"/><stop offset=".85" stop-color="#0c1b23"/><stop offset="1" stop-color="#577673"/></linearGradient>
      <linearGradient id="toy-grip" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#476d67"/><stop offset=".5" stop-color="#274d4a"/><stop offset="1" stop-color="#163b3d"/></linearGradient>
      <linearGradient id="toy-pad" x1="650" y1="170" x2="956" y2="504" gradientUnits="userSpaceOnUse"><stop stop-color="#f7f1f8"/><stop offset=".5" stop-color="#ddd6eb"/><stop offset="1" stop-color="#afacc6"/></linearGradient>
      <linearGradient id="toy-reader" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#34464b"/><stop offset=".5" stop-color="#0b1720"/><stop offset="1" stop-color="#5b7675"/></linearGradient>
    </defs>
    <path d="M870 41Q902 6 935 29L959 48Q975 66 955 89L925 116L895 96L922 67L909 56L888 79Z" fill="#91b6a9" stroke="#3e6868" stroke-width="4"/>
    <path d="M105 107Q149 46 250 43L690 43Q781 41 852 80Q938 126 969 221Q997 303 960 385L916 534Q900 611 815 637Q770 653 698 637L253 635Q165 653 103 618Q44 587 47 519L26 303Q14 206 63 156Z" fill="url(#toy-edge)" stroke="#5d8f85" stroke-width="5"/>
    <path d="M107 120Q151 59 252 58H689Q771 55 844 94Q924 135 955 224Q982 299 946 381L902 530Q885 597 810 621Q773 636 700 621H252Q174 638 112 604Q58 575 62 516L42 304Q29 217 76 166Z" fill="url(#toy-shell)" stroke="#e8fff1" stroke-opacity=".75" stroke-width="3"/>
    <path d="M103 146Q144 100 182 104L195 523Q156 552 113 540L88 285Q78 203 103 146Z" fill="#d0f3df" fill-opacity=".44"/>
    <path d="M93 440Q144 421 205 460L224 615Q166 634 113 605Q68 582 65 525Z" fill="url(#toy-grip)" stroke="#38615a" stroke-width="3"/>
    <path d="M812 440Q872 418 933 430L903 534Q889 598 814 621Q786 632 747 623Z" fill="url(#toy-grip)" stroke="#38615a" stroke-width="3"/>
    <path d="m87 488 104 29m-102-3 105 29m-102-2 106 28m-99-3 101 27m607-108 91-26m-101 52 92-26m-102 52 91-25m-101 50 88-24m-95 49 75-22" stroke="#527e73" stroke-width="5" stroke-linecap="round"/>
    <path d="M220 111H637Q683 111 683 158V430Q683 472 641 475H219Q171 474 168 427V160Q169 112 220 111Z" fill="url(#toy-glass)" stroke="#9ebfb0" stroke-width="5"/>
    <rect x="187" y="130" width="477" height="326" rx="29" fill="#070f1c" stroke="#567875" stroke-width="2"/>
    <path d="M692 208Q706 159 766 160Q841 157 902 198Q951 232 936 295L907 399Q889 456 840 464Q800 470 752 438L709 392Q671 347 675 290Z" fill="url(#toy-pad)" stroke="#f4f5f7" stroke-width="4"/>
    <path d="M700 226Q721 178 773 178Q850 177 896 221" stroke="#fff" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/>
    <path d="M238 554H679Q697 556 692 578L681 617Q680 631 663 634H255Q233 633 227 614L217 577Q213 554 238 554Z" fill="#9dc2b7" stroke="#b7ded0" stroke-width="3"/>
    <rect x="268" y="578" width="373" height="35" rx="15" fill="url(#toy-reader)" stroke="#648f86" stroke-width="3"/>
    <path d="M286 594H622" stroke="#dcff8d" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    <path d="M259 63H687Q756 61 809 90" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 297Q41 205 103 144" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    <g stroke="#739e91" stroke-width="2"><circle cx="136" cy="167" r="7"/><path d="m133 164 6 6m0-6-6 6"/><circle cx="847" cy="546" r="7"/><path d="m844 543 6 6m0-6-6 6"/></g>
    <path d="M106 209v115m12-105v115m12-105v115" stroke="#9fc7b7" stroke-width="4" stroke-linecap="round" opacity=".65"/>
  </svg>`;
}

function physicalAction(view: HardwareView, action: "attack" | "power") {
  const side = view.activePlayer ?? 0;
  const available =
    action === "attack" ? view.canAttack[side] : view.canPower[side];
  return `<button class="neo-toy-action ${action === "attack" ? "toy-battle" : "toy-power"}" data-action="${action}" data-side="${side}" aria-label="${side + 1}P ${action === "attack" ? "BATTLE 攻撃" : "POWER 回復"}" ${available ? "" : "disabled"}><span class="toy-button-face"><i aria-hidden="true">${action === "attack" ? "↗" : "＋"}</i><b>${action === "attack" ? "BATTLE" : "POWER"}</b></span></button>`;
}

export function neoHardware(view: HardwareView) {
  const active = view.activePlayer;
  const status =
    view.winner !== null
      ? view.winner === -1
        ? "DRAW"
        : `${view.winner + 1}P WIN`
      : active !== null
        ? `TURN ${String(view.turn).padStart(2, "0")}`
        : "READY TO SCAN";
  return `<section class="hardware-device neo-device ${view.powered ? "" : "neo-off"}" aria-label="REIWA NEXT バーコードバトラーII"><div class="neo-toy">
    ${toyCase()}
    <div class="neo-toy-brand" aria-hidden="true"><span>BARCODE BATTLER II</span><strong>next<span>◦</span></strong></div><div class="neo-toy-edition" aria-hidden="true">REIWA<br><b>CONCEPT EDITION</b></div>
    <div class="neo-display-bezel"><div class="neo-display"><div class="neo-match-state"><span><i></i>${escape(view.mode)}</span><span>${status}</span></div><div class="neo-players" ${view.powered ? "" : 'aria-hidden="true"'}>${view.fighters
      .map(
        (f, side) =>
          `<article class="neo-player ${side ? "challenger" : "contender"} ${active === side ? "is-active" : ""}"><div class="neo-player-head"><span>PLAYER ${String(side + 1).padStart(2, "0")}</span><span>${active === side ? "▶" : "—"}</span></div><div class="neo-avatar">${emblem(side, f?.race1 ?? side)}<div><span>${f ? escape(RACES[f.race1]) : "UNKNOWN"}</span><strong>${f ? (f.job > 6 ? "MAGICIAN" : "WARRIOR") : "SCAN ME"}</strong></div></div><div class="neo-health"><span>HP <b aria-label="${side + 1}P HP ${f ? f.hp * 100 : "未読取"}">${number(f ? f.hp * 100 : undefined)}</b></span><span>${f ? `${Math.round((f.hp / Math.max(1, f.max_hp)) * 100)}%` : "—"}</span><div class="neo-health-track"><i style="width:${f ? Math.min(100, Math.max(0, (f.hp / Math.max(1, f.max_hp)) * 100)) : 0}%"></i></div></div><div class="neo-metrics">${(view.resources
            ? [
                { key: "mp", title: "MP", scale: 1 },
                { key: "pp", title: "薬草", scale: 1 },
                { key: "speed", title: "SPEED", scale: 1 },
              ]
            : [
                { key: "st", title: "ST", scale: 100 },
                { key: "df", title: "DF", scale: 100 },
                { key: "speed", title: "SPEED", scale: 1 },
              ]
          )
            .map(
              ({ key, title, scale }) =>
                `<div><span>${title}</span><strong aria-label="${side + 1}P ${key === "pp" ? "PP" : title} ${f ? Number(f[key]) * scale : "未読取"}">${number(f ? Number(f[key]) * scale : undefined)}</strong></div>`,
            )
            .join("")}</div></article>`,
      )
      .join(
        "",
      )}</div><div class="neo-display-footer"><span>${view.resources ? "MP / HERB" : "DUAL CODE SYSTEM"}</span><span>${view.powered ? "● ● ●" : "○ ○ ○"}</span></div>${!view.powered ? '<div class="neo-display-off"><span>DISPLAY OFF</span></div>' : ""}</div></div>
    <div class="neo-thumb-label" aria-hidden="true">${active === null ? "PLAY!" : `PLAYER ${active + 1}`}<i class="${view.powered ? "on" : ""}"></i></div>
    ${physicalAction(view, "attack")}${physicalAction(view, "power")}
    <div class="neo-physical-keys"><button data-device="power" aria-label="液晶表示の電源" aria-pressed="${view.powered}"><span class="neo-function-face">⏻</span><small>DISPLAY</small></button><button data-device="select" aria-pressed="${view.resources}" aria-label="液晶の能力値とMP・薬草・速さを切り替える" ${view.powered ? "" : "disabled"}><span class="neo-function-face">⇄</span><small>STATS</small></button><button data-device="set" aria-label="SET バーコードを確定" ${view.powered && !view.busy ? "" : "disabled"}><span class="neo-function-face">✓</span><small>SET</small></button></div>
    <button class="neo-optical-reader" data-scan="barcode" aria-label="CARD IN カメラでバーコードを読み取る"><span>SCAN YOUR WORLD</span><i aria-hidden="true"></i><small>CARD IN / OPTICAL READER <b>↗</b></small></button>
    <span class="neo-case-detail" aria-hidden="true">BB–II<br>DUAL CODE BATTLE</span>
  </div><div class="device-hud"><p role="status">${view.powered ? escape(view.message) : "表示 OFF · バトルの進行状況は保持されます"}</p><button class="text-button" data-device="enlarge" ${view.powered ? "" : "disabled"}>能力値を拡大 <span aria-hidden="true">⤢</span></button></div></section>`;
}
