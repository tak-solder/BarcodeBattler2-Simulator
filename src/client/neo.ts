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
export function neoHardware(view: HardwareView) {
  return `<section class="hardware-device neo-device ${view.powered ? "" : "neo-off"}" aria-label="REIWA NEXT バーコードバトラーII"><div class="neo-surface"><div class="neo-topline"><div><span class="neo-kicker">REIWA / NEXT GENERATION</span><h2>BARCODE<span> //</span> NEXT</h2></div><span class="neo-version">II<span>WEB CORE</span></span></div><div class="neo-match-state"><span><i></i>${escape(view.mode)} MODE</span><span>${view.winner !== null ? (view.winner === -1 ? "DRAW" : "BATTLE COMPLETE") : view.activePlayer !== null ? `TURN ${String(view.turn).padStart(2, "0")}` : "AWAITING YOUR CODE"}</span></div>
    <div class="neo-players" ${view.powered ? "" : 'aria-hidden="true"'}>${view.fighters
      .map(
        (f, side) =>
          `<article class="neo-player ${side ? "challenger" : "contender"} ${view.activePlayer === side ? "is-active" : ""}"><div class="neo-player-head"><span>PLAYER ${String(side + 1).padStart(2, "0")}</span><span>${view.activePlayer === side ? "YOUR TURN" : f ? "CODE LOADED" : "STANDBY"}</span></div><div class="neo-avatar">${emblem(side, f?.race1 ?? side)}<span>${f ? escape(RACES[f.race1]) : "UNKNOWN"}</span></div><div class="neo-identity"><h3>${f ? (f.job > 6 ? "MAGICIAN" : "WARRIOR") : "SCAN TO AWAKEN"}</h3><span>${f ? `SPECIAL ${String(f.special1).padStart(2, "0")}` : "NO CODE REGISTERED"}</span></div><div class="neo-health"><span>HP <b aria-label="${side + 1}P HP ${f ? f.hp * 100 : "未読取"}">${number(f ? f.hp * 100 : undefined)}</b></span><span>${f ? `${Math.round((f.hp / Math.max(1, f.max_hp)) * 100)}%` : "—"}</span><div class="neo-health-track"><i style="width:${f ? Math.min(100, Math.max(0, (f.hp / Math.max(1, f.max_hp)) * 100)) : 0}%"></i></div></div><div class="neo-metrics">${(view.resources
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
            .join(
              "",
            )}</div><div class="neo-player-actions"><button class="neo-attack" data-action="attack" data-side="${side}" aria-label="${side + 1}P BATTLE 攻撃" ${view.canAttack[side] ? "" : "disabled"}><span>↗</span> BATTLE</button><button class="neo-power" data-action="power" data-side="${side}" aria-label="${side + 1}P POWER 回復" ${view.canPower[side] ? "" : "disabled"}><span>＋</span> POWER</button></div></article>`,
      )
      .join("")}<div class="neo-vs" aria-hidden="true">VS</div></div>
    ${!view.powered ? '<div class="neo-display-off"><span>DISPLAY OFF</span><p>バトルの進行状況は保持されます。</p></div>' : ""}
    <div class="neo-command-bar"><button data-device="power" aria-label="液晶表示の電源" aria-pressed="${view.powered}">⏻<span>DISPLAY</span></button><button data-device="select" aria-pressed="${view.resources}" ${view.powered ? "" : "disabled"} aria-label="液晶の能力値とMP・薬草・速さを切り替える">⇄<span>${view.resources ? "MP / 薬草" : "ST / DF"}</span></button><button data-device="set" aria-label="SET バーコードを確定" ${view.powered && !view.busy ? "" : "disabled"}>✓<span>SET CODE</span></button><button data-scan="barcode" aria-label="CARD IN カメラでバーコードを読み取る">▥<span>SCAN</span></button></div>
    <div class="neo-bottomline"><span>BARCODE BATTLE SYSTEM</span><span>POWERED BY EVERYDAY.</span></div></div><div class="device-hud"><p role="status">${view.powered ? escape(view.message) : "表示 OFF · バトルの進行状況は保持されます"}</p><button class="text-button" data-device="enlarge" ${view.powered ? "" : "disabled"}>能力値を拡大 <span aria-hidden="true">⤢</span></button></div></section>`;
}
