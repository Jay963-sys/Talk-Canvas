// lib/frameUSDZ.ts
//
// Generates the iOS (AR Quick Look) USDZ from the same scene frameModel.ts
// builds for the GLB. Three USDZExporter / Quick Look quirks are handled:
//
// 1. Wall anchoring + 64-byte zip alignment — via the exporter's own `ar` /
//    `includeAnchoringProperties` options (no fflate re-zip).
//
// 2. Stale matrices — buildScene positions meshes with `.position`, which only
//    updates `mesh.matrix` after `updateMatrixWorld()`. GLTFExporter does this
//    internally; USDZExporter reads `object.matrix` directly, so without the
//    flush every mesh sits at the origin and the frame collapses into a cross.
//
// 3. Wall orientation — Quick Look's vertical anchoring tips the model so its
//    +Y (up) becomes the wall's outward normal. Our painting faces +Z and
//    stands up in +Y, so it would tip "bottom-to-wall, face skyward" (a flap).
//    We re-parent everything under a group rotated -90 degrees about X so the
//    face ends up pointing out of the wall and the top stays up.
//
// Requires three r150+.

import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { Group } from "three";
import { buildScene, type FrameModelOptions } from "./frameModel";

export async function generateFrameUSDZ(
  opts: FrameModelOptions,
): Promise<Blob> {
  const scene = await buildScene(opts);

  // Orient for wall hanging. If it ever shows up upside-down on a device,
  // flip this single value to +Math.PI / 2.
  const wrapper = new Group();
  wrapper.rotation.x = -Math.PI / 2;
  for (const child of [...scene.children]) wrapper.add(child);
  scene.add(wrapper);

  // USDZExporter reads object.matrix but never updates it — flush positions
  // and the wrapper rotation into the matrices before exporting.
  scene.updateMatrixWorld(true);

  const exporter = new USDZExporter();
  const out = await exporter.parseAsync(scene, {
    ar: {
      anchoring: { type: "plane" },
      planeAnchoring: { alignment: "vertical" },
    },
    includeAnchoringProperties: true,
    quickLookCompatible: true,
  });

  return new Blob([out as unknown as BlobPart], {
    type: "model/vnd.usdz+zip",
  });
}
