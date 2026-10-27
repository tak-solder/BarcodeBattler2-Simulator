export interface Product {
  barcode: string;
  name: string | null;
  thumbnail: string | null;
  source: string | null;
  sourceUrl: string | null;
  checkedAt: number;
}
export interface ProductEnv {
  DB: D1Database;
  BUCKET: R2Bucket;
  YAHOO_APP_ID?: string;
}
const now = () => Math.floor(Date.now() / 1000);
async function externalJson(url: string) {
  const r = await fetch(url, {
    signal: AbortSignal.timeout(3500),
    headers: {
      "User-Agent": "BarcodeBattlerIIWeb/1.0 (barcode game; product lookup)",
    },
    redirect: "error",
  });
  if (!r.ok) throw new Error("lookup");
  return r.json() as Promise<any>;
}
async function thumbnail(env: ProductEnv, code: string, url: unknown) {
  if (typeof url !== "string") return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (
    u.protocol !== "https:" ||
    ![
      "images.openfoodfacts.org",
      "shopping.c.yimg.jp",
      "item-shopping.c.yimg.jp",
    ].includes(u.hostname)
  )
    return null;
  try {
    const res = await fetch(u, {
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    });
    const type = res.headers.get("content-type")?.split(";")[0];
    if (
      !res.ok ||
      !["image/jpeg", "image/png", "image/webp"].includes(type ?? "")
    )
      return null;
    const reader = res.body?.getReader();
    if (!reader) return null;
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2 * 1024 * 1024) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const c of chunks) {
      bytes.set(c, offset);
      offset += c.length;
    }
    const key = `thumbnails/${code}`;
    await env.BUCKET.put(key, bytes, { httpMetadata: { contentType: type } });
    return `/api/images/${code}`;
  } catch {
    return null;
  }
}
export async function resolveProduct(
  env: ProductEnv,
  barcode: string,
): Promise<Product> {
  const cached = await env.DB.prepare(
    "SELECT data_json FROM products WHERE barcode=? AND expires_at>?",
  )
    .bind(barcode, now())
    .first<{ data_json: string }>();
  if (cached) return JSON.parse(cached.data_json);
  const result: Product = {
    barcode,
    name: null,
    thumbnail: null,
    source: null,
    sourceUrl: null,
    checkedAt: now(),
  };
  let image: unknown;
  if (env.YAHOO_APP_ID) {
    try {
      const data = await externalJson(
        `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${encodeURIComponent(env.YAHOO_APP_ID)}&jan_code=${barcode}&results=1`,
      );
      const hit = data.hits?.[0];
      if (hit?.name) {
        result.name = String(hit.name).slice(0, 200);
        image = hit.image?.medium;
        result.source = "Yahoo!ショッピング";
        result.sourceUrl = "https://shopping.yahoo.co.jp/";
      }
    } catch {
      /* Try the public food catalogue. */
    }
  }
  if (!result.name) {
    try {
      const data = await externalJson(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name_ja,product_name,image_front_small_url`,
      );
      const p = data.product;
      if (data.status === 1 && (p.product_name_ja || p.product_name)) {
        result.name = String(p.product_name_ja || p.product_name).slice(0, 200);
        image = p.image_front_small_url;
        result.source = "Open Food Facts";
        result.sourceUrl = `https://world.openfoodfacts.org/product/${barcode}`;
      }
    } catch {
      /* Barcode identity remains usable without catalogue metadata. */
    }
  }
  if (image) result.thumbnail = await thumbnail(env, barcode, image);
  await env.DB.prepare(
    "INSERT INTO products VALUES (?,?,?) ON CONFLICT(barcode) DO UPDATE SET data_json=excluded.data_json,expires_at=excluded.expires_at",
  )
    .bind(
      barcode,
      JSON.stringify(result),
      now() + (result.name ? 604800 : 86400),
    )
    .run();
  return result;
}
