import { autoBattle, ENGINE_VERSION, validCode } from "../engine/game";
import type { Loadout } from "../engine/game";
import { parseLoadout } from "./rules";
import type { Rules } from "./rules";
import { resolveProduct } from "./products";
import type { Product } from "./products";
interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ASSETS: Fetcher;
  YAHOO_APP_ID?: string;
}
interface Player {
  id: string;
  name: string;
}
interface Champion {
  playerId: string;
  name: string;
  loadout: Loadout;
  product: Product;
  supportProduct?: Product;
}
interface Room {
  id: string;
  name: string;
  description: string;
  rules_json: string;
  champion_json: string | null;
  streak: number;
  version: number;
  system: number;
  updated_at: number;
}
const now = () => Math.floor(Date.now() / 1000);
const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function body(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "入力がありません。");
  let total = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > 24000) {
      await reader.cancel();
      throw new HttpError(413, "入力が大きすぎます。");
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    bytes.set(p, at);
    at += p.length;
  }
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("object required");
    return parsed;
  } catch {
    throw new HttpError(400, "JSON形式が正しくありません。");
  }
}
async function hash(s: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
async function limit(env: Env, key: string, count: number, seconds: number) {
  const bucket = Math.floor(now() / seconds);
  const row = await env.DB.prepare(
    "INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
  )
    .bind(`${key}:${bucket}`, now() + seconds)
    .first<{ count: number }>();
  if (row && row.count > count)
    throw new HttpError(
      429,
      "操作が多すぎます。少し待ってから再度お試しください。",
    );
}
async function player(req: Request, env: Env) {
  const token = req.headers
    .get("Cookie")
    ?.match(/(?:^|;\s*)bb2_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) throw new HttpError(401, "セッションを開始してください。");
  const p = await env.DB.prepare(
    "SELECT id,name FROM players WHERE token_hash=?",
  )
    .bind(await hash(token))
    .first<Player>();
  if (!p) throw new HttpError(401, "セッションが見つかりません。");
  return p;
}
function roomView(r: Room) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    rules: JSON.parse(r.rules_json),
    champion: r.champion_json ? JSON.parse(r.champion_json) : null,
    streak: r.streak,
    version: r.version,
    system: !!r.system,
    updatedAt: r.updated_at,
  };
}
async function api(req: Request, env: Env, ctx: ExecutionContext) {
  const u = new URL(req.url),
    path = u.pathname,
    method = req.method;
  if (
    !["GET", "HEAD"].includes(method) &&
    req.headers.get("Origin") !== u.origin
  )
    throw new HttpError(403, "同じサイトから操作してください。");
  if (path === "/api/session" && method === "POST") {
    try {
      return json({ player: await player(req, env) });
    } catch (e) {
      if (!(e instanceof HttpError) || e.status !== 401) throw e;
    }
    const ip = req.headers.get("CF-Connecting-IP") ?? "local";
    await limit(env, "session:" + (await hash(ip)), 30, 3600);
    const id = crypto.randomUUID(),
      token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join(""),
      name = "バトラー" + id.slice(0, 4).toUpperCase();
    await env.DB.prepare("INSERT INTO players VALUES (?,?,?,?)")
      .bind(id, await hash(token), name, now())
      .run();
    return new Response(JSON.stringify({ player: { id, name } }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Set-Cookie": `bb2_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${u.protocol === "https:" ? "; Secure" : ""}`,
      },
    });
  }
  if (path === "/api/rooms" && method === "GET") {
    const rooms = await env.DB.prepare(
      "SELECT * FROM rooms ORDER BY system DESC,id",
    ).all<Room>();
    return json({
      rooms: rooms.results.map(roomView),
      userRoomsEnabled: false,
    });
  }
  const image = path.match(/^\/api\/images\/(\d{8}|\d{13})$/);
  if (image && method === "GET") {
    const file = await env.BUCKET.get(`thumbnails/${image[1]}`);
    if (!file) throw new HttpError(404, "画像がありません。");
    return new Response(file.body, {
      headers: {
        "Content-Type": file.httpMetadata?.contentType ?? "image/jpeg",
        "Cache-Control": "public,max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  const replay = path.match(/^\/api\/replays\/([\da-f-]{36})$/);
  if (replay && method === "GET") {
    const row = await env.DB.prepare(
      "SELECT replay_key FROM matches WHERE id=?",
    )
      .bind(replay[1])
      .first<{ replay_key: string }>();
    if (!row) throw new HttpError(404, "対戦記録がありません。");
    const data = await env.BUCKET.get(row.replay_key);
    if (!data) throw new HttpError(404, "再生データがありません。");
    return new Response(data.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public,max-age=31536000,immutable",
      },
    });
  }
  const history = path.match(/^\/api\/rooms\/([\w-]+)\/matches$/);
  if (history && method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id,winner_name,challenger_name,defender_name,outcome,streak,turns,engine,created_at FROM matches WHERE room_id=? ORDER BY created_at DESC,rowid DESC LIMIT 30",
    )
      .bind(history[1])
      .all();
    return json({ matches: rows.results });
  }
  const p = await player(req, env);
  if (path === "/api/profile" && method === "PATCH") {
    const b = await body(req);
    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (name.length < 1 || name.length > 24)
      throw new HttpError(400, "名前は1〜24文字で入力してください。");
    await env.DB.prepare("UPDATE players SET name=? WHERE id=?")
      .bind(name, p.id)
      .run();
    return json({ player: { ...p, name } });
  }
  const product = path.match(/^\/api\/products\/(\d{8}|\d{13})$/);
  if (product && method === "GET") {
    if (!validCode(product[1]))
      throw new HttpError(400, "コードが正しくありません。");
    await limit(env, "lookup:" + p.id, 60, 3600);
    return json({ product: await resolveProduct(env, product[1]) });
  }
  const save = path.match(/^\/api\/saves\/(C0|C1|C2)$/);
  if (save) {
    if (method === "GET") {
      const data = await env.DB.prepare(
        "SELECT data_json,updated_at FROM saves WHERE player_id=? AND mode=?",
      )
        .bind(p.id, save[1])
        .first<{ data_json: string; updated_at: number }>();
      return json({
        save: data ? JSON.parse(data.data_json) : null,
        updatedAt: data?.updated_at,
      });
    }
    if (method === "PUT") {
      await limit(env, "save:" + p.id, 60, 60);
      const data = await body(req);
      await env.DB.prepare(
        "INSERT INTO saves VALUES (?,?,?,?) ON CONFLICT(player_id,mode) DO UPDATE SET data_json=excluded.data_json,updated_at=excluded.updated_at",
      )
        .bind(p.id, save[1], JSON.stringify(data), now())
        .run();
      return json({ saved: true });
    }
  }
  const challenge = path.match(/^\/api\/rooms\/([\w-]+)\/challenge$/);
  if (challenge && method === "POST") {
    await limit(env, "battle:" + p.id, 12, 60);
    const input = await body(req);
    const room = await env.DB.prepare("SELECT * FROM rooms WHERE id=?")
      .bind(challenge[1])
      .first<Room>();
    if (!room) throw new HttpError(404, "部屋が見つかりません。");
    if (input.version !== room.version)
      throw new HttpError(
        409,
        "王者が交代しました。部屋を更新して再度挑戦してください。",
      );
    const loadout = parseLoadout(
      input.loadout,
      JSON.parse(room.rules_json) as Rules,
    );
    const defender: Champion | null = room.champion_json
      ? JSON.parse(room.champion_json)
      : null;
    if (defender?.playerId === p.id)
      throw new HttpError(
        409,
        "現在あなたが王者です。ほかの挑戦者を待つか別の部屋に挑戦してください。",
      );
    const product = await resolveProduct(env, loadout.barcode);
    const supportProduct = loadout.support
      ? await resolveProduct(env, loadout.support)
      : undefined;
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const battle = defender
      ? autoBattle(loadout, defender.loadout, seed)
      : null;
    const outcome = !defender
      ? "crown"
      : battle!.winner === 0
        ? "win"
        : battle!.winner === 1
          ? "loss"
          : "draw";
    const challengerWon = outcome === "crown" || outcome === "win";
    const champion: Champion = challengerWon
      ? {
          playerId: p.id,
          name: p.name,
          loadout,
          product,
          ...(supportProduct ? { supportProduct } : {}),
        }
      : defender!;
    const streak = challengerWon
      ? 1
      : room.streak + (outcome === "loss" ? 1 : 0);
    const id = crypto.randomUUID(),
      key = `replays/${id}.json`,
      createdAt = now();
    await env.BUCKET.put(
      key,
      JSON.stringify({
        id,
        roomId: room.id,
        engine: ENGINE_VERSION,
        createdAt,
        outcome,
        challenger: { name: p.name, loadout, product, supportProduct },
        defender: defender
          ? {
              name: defender.name,
              loadout: defender.loadout,
              product: defender.product,
              supportProduct: defender.supportProduct,
            }
          : null,
        battle,
      }),
      { httpMetadata: { contentType: "application/json" } },
    );
    try {
      const result = await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO matches SELECT ?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE id=? AND version=?)",
        ).bind(
          id,
          room.id,
          p.id,
          champion.name,
          p.name,
          defender?.name ?? null,
          outcome,
          streak,
          battle?.turn ?? 0,
          key,
          ENGINE_VERSION,
          createdAt,
          room.id,
          room.version,
        ),
        env.DB.prepare(
          "UPDATE rooms SET champion_json=?,streak=?,version=version+1,updated_at=? WHERE id=? AND version=?",
        ).bind(
          JSON.stringify(champion),
          streak,
          createdAt,
          room.id,
          room.version,
        ),
      ]);
      if (!result[1].meta.changes) {
        await env.BUCKET.delete(key);
        throw new HttpError(
          409,
          "別の挑戦で部屋が更新されました。再度挑戦してください。",
        );
      }
    } catch (e) {
      ctx.waitUntil(env.BUCKET.delete(key));
      throw e;
    }
    ctx.waitUntil(
      env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<?")
        .bind(now())
        .run(),
    );
    return json({
      id,
      outcome,
      streak,
      champion,
      battle,
      product,
      supportProduct,
      challenger: { name: p.name, loadout, product, supportProduct },
      defender: defender
        ? {
            name: defender.name,
            loadout: defender.loadout,
            product: defender.product,
            supportProduct: defender.supportProduct,
          }
        : null,
    });
  }
  // User-owned rooms are a future feature. No public mutation is exposed in v1.
  throw new HttpError(404, "APIが見つかりません。");
}
export default {
  async fetch(
    req: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      const url = new URL(req.url);
      let res = url.pathname.startsWith("/api/")
        ? await api(req, env, ctx)
        : await env.ASSETS.fetch(req);
      res = new Response(res.body, res);
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "camera=(self), microphone=()");
      res.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      );
      return res;
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      if (e instanceof Error && /コード|合体|装備|シフト|部屋/.test(e.message))
        return json({ error: e.message }, 400);
      console.error(
        "Request failed",
        e instanceof Error ? e.message : "unknown",
      );
      return json(
        { error: "処理できませんでした。時間をおいて再度お試しください。" },
        500,
      );
    }
  },
};
