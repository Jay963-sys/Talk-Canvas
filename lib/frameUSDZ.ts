// lib/frameUSDZ.ts
//
// Generates the iOS (AR Quick Look) version of the frame as a USDZ, reusing the
// exact same scene that frameModel.ts builds for the GLB — so scale, frame, and
// artwork match perfectly across platforms.
//
// Three's USDZExporter has no option for AR Quick Look surface anchoring, so we
// inject Apple's Preliminary_AnchoringAPI schema into the generated .usda after
// export. This makes Quick Look anchor the canvas to a WALL (vertical surface)
// instead of defaulting to the floor.
//
// Requires: `npm i fflate`  (and three r150+ for parseAsync)

import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
import { buildScene, type FrameModelOptions } from "./frameModel";

const ANCHOR_TOKENS =
  `    uniform token preliminary:anchoring:type = "plane"\n` +
  `    uniform token preliminary:planeAnchoring:alignment = "vertical"\n`;

/**
 * Rewrites the USDZ's root prim to anchor to a vertical surface.
 * On ANY problem it returns the original archive untouched, so the worst case
 * is iOS falling back to floor placement + drag-to-wall (still true scale).
 */
function injectWallAnchoring(usdz: Uint8Array): Uint8Array {
  try {
    const files = unzipSync(usdz);

    const usdaName = Object.keys(files).find((n) => n.endsWith(".usda"));
    if (!usdaName) return usdz;

    let usda = strFromU8(files[usdaName]);

    const defaultPrim = usda.match(/defaultPrim\s*=\s*"([^"]+)"/)?.[1];
    if (!defaultPrim) return usdz;

    // Match the root prim opening, optionally with an existing (...) metadata block.
    const primOpen = new RegExp(
      `def Xform "${defaultPrim}"\\s*(\\([\\s\\S]*?\\))?\\s*\\{`,
    );
    const m = usda.match(primOpen);
    if (!m) return usdz;

    let replacement: string;
    if (m[1]) {
      // Existing metadata block — add the apiSchema inside it.
      const meta = m[1].replace(
        /\)\s*$/,
        `    prepend apiSchemas = ["Preliminary_AnchoringAPI"]\n)`,
      );
      replacement = `def Xform "${defaultPrim}" ${meta}\n{\n${ANCHOR_TOKENS}`;
    } else {
      replacement =
        `def Xform "${defaultPrim}" (\n` +
        `    prepend apiSchemas = ["Preliminary_AnchoringAPI"]\n` +
        `)\n{\n${ANCHOR_TOKENS}`;
    }

    usda = usda.replace(primOpen, replacement);
    files[usdaName] = strToU8(usda);

    // USDZ entries MUST be stored uncompressed (level 0), including textures.
    return zipSync(files, { level: 0 });
  } catch {
    return usdz; // never block the AR flow on this
  }
}

export async function generateFrameUSDZ(
  opts: FrameModelOptions,
): Promise<Blob> {
  const scene = await buildScene(opts);
  const exporter = new USDZExporter();
  const out = (await exporter.parseAsync(scene)) as Uint8Array;
  const anchored = injectWallAnchoring(out);
  // Correct MIME so Quick Look opens it as AR rather than downloading it.
  return new Blob([anchored as unknown as BlobPart], {
    type: "model/vnd.usdz+zip",
  });
}
