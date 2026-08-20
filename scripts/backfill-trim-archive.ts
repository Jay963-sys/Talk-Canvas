/**
 * scripts/backfill-trim-archive.ts
 *
 * One-time clean-up for archive prints uploaded before the upload path started
 * trimming. Designers export some artworks onto a white canvas, so the stored
 * file carries white margins (the "white border on the mockup" reports). This
 * fetches each image, trims the border with the SAME tolerant algorithm as
 * lib/image.ts, re-uploads a clean asset, and writes the new
 * imageUrl / imagePublicId / width / height / orientation back to the row.
 *
 * Notes:
 *  - Set members (setId not null) are SKIPPED — split-artwork panels must stay
 *    the same size to hang in register.
 *  - Old Cloudinary assets are NOT deleted — past order_items point at them.
 *  - Idempotent: a re-run finds no border on an already-trimmed image.
 *  - A per-edge guard (--max-trim, default 0.30) holds back rows that trim more
 *    than that share of any side, so a commit only applies the safe, even
 *    margins and lists the aggressive ones for manual review.
 *
 * Requires: npm i -D sharp cloudinary
 *
 *   # dry run, all rows
 *   npx tsx --env-file=.env.local scripts/backfill-trim-archive.ts
 *   # inspect one row's corner colour + per-edge fractions
 *   npx tsx --env-file=.env.local scripts/backfill-trim-archive.ts --id=792
 *   # apply (safe rows only; flagged rows skipped + listed)
 *   npx tsx --env-file=.env.local scripts/backfill-trim-archive.ts --commit
 *   # tune the guard, or force a known-good aggressive row through
 *   npx tsx ... --commit --max-trim=0.4
 */

import { db } from "../lib/db/index";
import { archivePrints } from "../lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

// Match whatever your /api/cloudinary/sign route reads from .env.local. If you
// use CLOUDINARY_URL it's picked up automatically; otherwise we try the common
// name variants. If none resolve, main() aborts before touching anything.
const env = process.env;
if (env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name:
      env.CLOUDINARY_CLOUD_NAME ??
      env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      env.CLOUDINARY_CLOUD ??
      env.CLD_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY ?? env.CLD_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET ?? env.CLD_API_SECRET,
    secure: true,
  });
}

function assertCloudinary() {
  if (!cloudinary.config().cloud_name) {
    console.error(
      "Cloudinary not configured — no cloud_name found.\n" +
        "Set CLOUDINARY_URL, or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /\n" +
        "CLOUDINARY_API_SECRET in .env.local, matching the names your\n" +
        "/api/cloudinary/sign route uses. Aborting before any writes.",
    );
    process.exit(1);
  }
}

// ── Trim tuning — identical to lib/image.ts ──────────────────────────
const TRIM_TOL = 35;
const TRIM_FRAC = 0.7;
const TRIM_MAX_SIDE = 0.45;
const TRIM_CORNER_MIN = 235;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Border colour = average of the four 8×8 corner blocks. */
function cornerColour(data: Uint8Array, W: number, H: number, ch: number) {
  let br = 0,
    bg = 0,
    bb = 0,
    n = 0;
  const corners: [number, number][] = [
    [0, 0],
    [W - 8, 0],
    [0, H - 8],
    [W - 8, H - 8],
  ];
  for (const [cx, cy] of corners)
    for (let y = cy; y < cy + 8; y++)
      for (let x = cx; x < cx + 8; x++) {
        const i = (y * W + x) * ch;
        br += data[i];
        bg += data[i + 1];
        bb += data[i + 2];
        n++;
      }
  return { br: br / n, bg: bg / n, bb: bb / n };
}

/** Per-row / per-col fraction of pixels within tolerance of the border colour. */
function nearFractions(
  data: Uint8Array,
  W: number,
  H: number,
  ch: number,
  bg: { br: number; bg: number; bb: number },
) {
  const tol2 = TRIM_TOL * TRIM_TOL;
  const rowCount = new Int32Array(H);
  const colCount = new Int32Array(W);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch;
      const dr = data[i] - bg.br;
      const dg = data[i + 1] - bg.bg;
      const db = data[i + 2] - bg.bb;
      if (dr * dr + dg * dg + db * db <= tol2) {
        rowCount[y]++;
        colCount[x]++;
      }
    }
  return { rowFrac: rowCount, colFrac: colCount };
}

/** Same border trim as the browser upload path. Returns full frame if none. */
function computeTrim(
  data: Uint8Array,
  W: number,
  H: number,
  ch: number,
): { rect: Rect; edges: Edges } {
  const full = {
    rect: { x: 0, y: 0, w: W, h: H },
    edges: { left: 0, top: 0, right: 0, bottom: 0 },
  };
  if (W < 8 || H < 8) return full;

  const bg = cornerColour(data, W, H, ch);
  if (Math.min(bg.br, bg.bg, bg.bb) < TRIM_CORNER_MIN) return full;

  const { rowFrac, colFrac } = nearFractions(data, W, H, ch, bg);
  const rowThresh = TRIM_FRAC * W;
  const colThresh = TRIM_FRAC * H;
  const first = (c: Int32Array, len: number, t: number) => {
    let i = 0;
    while (i < len && c[i] >= t) i++;
    return i;
  };
  const last = (c: Int32Array, len: number, t: number) => {
    let i = len - 1;
    while (i >= 0 && c[i] >= t) i--;
    return i;
  };

  let top = first(rowFrac, H, rowThresh);
  let bottom = H - 1 - last(rowFrac, H, rowThresh);
  let left = first(colFrac, W, colThresh);
  let right = W - 1 - last(colFrac, W, colThresh);

  const maxV = Math.floor(H * TRIM_MAX_SIDE);
  const maxH = Math.floor(W * TRIM_MAX_SIDE);
  top = Math.min(top, maxV);
  bottom = Math.min(bottom, maxV);
  left = Math.min(left, maxH);
  right = Math.min(right, maxH);

  const w = W - left - right;
  const h = H - top - bottom;
  if (w <= 0 || h <= 0) return full;
  if (!left && !right && !top && !bottom) return full;
  return {
    rect: { x: left, y: top, w, h },
    edges: { left, top, right, bottom },
  };
}

/** Any single edge trimming more than `maxTrim` of its dimension is suspicious. */
function overGuard(
  edges: Edges,
  W: number,
  H: number,
  maxTrim: number,
): boolean {
  return (
    edges.left / W > maxTrim ||
    edges.right / W > maxTrim ||
    edges.top / H > maxTrim ||
    edges.bottom / H > maxTrim
  );
}

function folderOf(publicId: string): string | undefined {
  const i = publicId.lastIndexOf("/");
  return i > 0 ? publicId.slice(0, i) : undefined;
}

async function loadRaw(url: string) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${resp.status}`);
  const input = Buffer.from(await resp.arrayBuffer());
  const { data, info } = await sharp(input)
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { input, data: new Uint8Array(data), info };
}

function uploadBuffer(buf: Buffer, folder: string | undefined) {
  return new Promise<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image", format: "jpg" },
        (err, res) => {
          if (err || !res) return reject(err ?? new Error("No upload result"));
          resolve({
            secure_url: res.secure_url,
            public_id: res.public_id,
            width: res.width,
            height: res.height,
          });
        },
      )
      .end(buf);
  });
}

/** --id mode: explain one row's trim decision. */
async function diagnose(id: number) {
  const [row] = await db
    .select()
    .from(archivePrints)
    .where(eq(archivePrints.id, id));
  if (!row) return console.log(`No archive row #${id}.`);
  console.log(`Diagnosing #${id}  ${row.imageUrl}\n`);

  const { data, info } = await loadRaw(row.imageUrl);
  const { width: W, height: H, channels: ch } = info;
  const bg = cornerColour(data, W, H, ch);
  console.log(`size ${W}×${H}, channels ${ch}`);
  console.log(
    `corner colour rgb(${bg.br.toFixed(0)}, ${bg.bg.toFixed(0)}, ${bg.bb.toFixed(0)}) ` +
      `— guard needs each ≥ ${TRIM_CORNER_MIN} → ${Math.min(bg.br, bg.bg, bg.bb) >= TRIM_CORNER_MIN ? "PASS (will trim)" : "FAIL (left alone)"}`,
  );

  const { rowFrac, colFrac } = nearFractions(data, W, H, ch, bg);
  const show = (
    name: string,
    frac: Int32Array,
    len: number,
    total: number,
    reverse: boolean,
  ) => {
    const idx = (k: number) => (reverse ? len - 1 - k : k);
    const line = [];
    for (let k = 0; k < 6; k++) line.push((frac[idx(k)] / total).toFixed(2));
    console.log(
      `  ${name.padEnd(6)} first 6 near-fracs from edge: ${line.join(" ")}  (trims while ≥ ${TRIM_FRAC})`,
    );
  };
  console.log(`per-edge near-white fractions (1.00 = whole line is border):`);
  show("top", rowFrac, H, W, false);
  show("bottom", rowFrac, H, W, true);
  show("left", colFrac, W, H, false);
  show("right", colFrac, W, H, true);

  const { rect, edges } = computeTrim(data, W, H, ch);
  console.log(
    `\nresult: ${W}×${H} → ${rect.w}×${rect.h}  (L${edges.left} T${edges.top} R${edges.right} B${edges.bottom})`,
  );
  console.log(
    `even? L/R ${edges.left} vs ${edges.right}, T/B ${edges.top} vs ${edges.bottom}` +
      ` — a real margin is roughly even; lopsided means it ate into art.`,
  );
  process.exit(0);
}

async function main() {
  assertCloudinary();

  const idArg = process.argv.find((a) => a.startsWith("--id="));
  if (idArg) return diagnose(parseInt(idArg.split("=")[1], 10));

  const commit = process.argv.includes("--commit");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;
  const maxArg = process.argv.find((a) => a.startsWith("--max-trim="));
  const maxTrim = maxArg ? parseFloat(maxArg.split("=")[1]) : 0.3;

  console.log(
    `Archive white-margin trim — ${commit ? "COMMIT" : "DRY RUN (no writes)"}` +
      `  ·  guard: skip any edge > ${(maxTrim * 100).toFixed(0)}%\n`,
  );

  const rows = await db
    .select()
    .from(archivePrints)
    .where(isNull(archivePrints.setId));

  let trimmed = 0,
    unchanged = 0,
    failed = 0,
    processed = 0;
  const flagged: string[] = [];

  for (const row of rows) {
    if (processed >= limit) break;
    processed++;
    try {
      const { input, data, info } = await loadRaw(row.imageUrl);
      const { width: W, height: H, channels: ch } = info;
      const { rect, edges } = computeTrim(data, W, H, ch);

      if (rect.w === W && rect.h === H) {
        unchanged++;
        console.log(`· #${row.id} clean (${W}×${H})`);
        continue;
      }

      const line = `#${row.id} ${W}×${H} → ${rect.w}×${rect.h} (trim L${edges.left} T${edges.top} R${edges.right} B${edges.bottom})`;

      if (overGuard(edges, W, H, maxTrim)) {
        flagged.push(line);
        console.log(
          `⚑ ${line}  — over ${(maxTrim * 100).toFixed(0)}%, HELD for review`,
        );
        continue;
      }

      console.log(`✂ ${line}`);
      if (!commit) {
        trimmed++;
        continue;
      }

      const out = await sharp(input)
        .flatten({ background: "#ffffff" })
        .extract({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
        .jpeg({ quality: 85 })
        .toBuffer();
      const up = await uploadBuffer(out, folderOf(row.imagePublicId));

      await db
        .update(archivePrints)
        .set({
          imageUrl: up.secure_url,
          imagePublicId: up.public_id,
          width: up.width,
          height: up.height,
          orientation: up.width > up.height ? "landscape" : "portrait",
          updatedAt: new Date(),
        })
        .where(eq(archivePrints.id, row.id));
      trimmed++;
    } catch (err) {
      failed++;
      console.error(
        `✗ #${row.id} ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  console.log(
    `\nProcessed ${processed} · ${commit ? "trimmed" : "would trim"} ${trimmed} · clean ${unchanged} · held ${flagged.length} · failed ${failed}`,
  );
  if (flagged.length) {
    console.log(
      `\nHeld for review (trim > ${(maxTrim * 100).toFixed(0)}% of a side — inspect with --id=<n>):`,
    );
    for (const f of flagged) console.log(`  ⚑ ${f}`);
  }
  if (!commit && trimmed > 0)
    console.log("\nDry run — re-run with --commit to apply the safe rows.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
