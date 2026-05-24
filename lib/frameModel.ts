import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export interface FrameModelOptions {
  imageUrl: string;
  frameColor: string;
  artWidth: number; // meters
  artHeight: number; // meters
  style: "regular" | "antique";
  shape: "floating" | "box" | null;
  glass: boolean;
}

interface FrameProfile {
  thickness: number; // border width (frame strip cross-section, visible from front)
  depth: number; // front-to-back dimension (visible from side)
  artInset: number; // how far the art sits behind the front face
}

// Three distinct profiles — chunkier = more visual weight
function getProfile(
  style: "regular" | "antique",
  shape: "floating" | "box" | null,
): FrameProfile {
  if (style === "antique") {
    // Widest, deepest — ornate weight (geometry is simplified, real frames are carved)
    return { thickness: 0.07, depth: 0.055, artInset: 0.02 };
  }
  if (shape === "box") {
    // Medium thickness, clear box depth
    return { thickness: 0.045, depth: 0.045, artInset: 0.015 };
  }
  // floating: thinnest border, shallowest
  return { thickness: 0.025, depth: 0.018, artInset: 0 };
}

async function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export async function buildScene(
  opts: FrameModelOptions,
): Promise<THREE.Scene> {
  const { imageUrl, frameColor, artWidth, artHeight, style, shape, glass } =
    opts;
  const profile = getProfile(style, shape);

  const scene = new THREE.Scene();
  const texture = await loadTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Antique gets a hint of metallic sheen for gold/black ornate feel
  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(frameColor),
    roughness: style === "antique" ? 0.4 : 0.6,
    metalness: style === "antique" ? 0.25 : 0.05,
  });

  const t = profile.thickness;
  const d = profile.depth;
  const outerW = artWidth + t * 2;
  const outerH = artHeight + t * 2;

  // Four frame strips
  const top = new THREE.Mesh(new THREE.BoxGeometry(outerW, t, d), frameMat);
  top.position.y = artHeight / 2 + t / 2;
  scene.add(top);

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(outerW, t, d), frameMat);
  bottom.position.y = -artHeight / 2 - t / 2;
  scene.add(bottom);

  const left = new THREE.Mesh(new THREE.BoxGeometry(t, artHeight, d), frameMat);
  left.position.x = -artWidth / 2 - t / 2;
  scene.add(left);

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(t, artHeight, d),
    frameMat,
  );
  right.position.x = artWidth / 2 + t / 2;
  scene.add(right);

  // Art plane — position depends on profile inset
  const artZ = d / 2 - profile.artInset;
  const artMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0,
  });
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(artWidth, artHeight),
    artMat,
  );
  art.position.z = artZ;
  scene.add(art);

  // Glass — included for box-with-glass and all antique frames
  const hasGlass =
    (style === "regular" && shape === "box" && glass) || style === "antique";
  if (hasGlass) {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      roughness: 0.05,
      metalness: 0.3, // subtle reflectivity hint
    });
    const glassPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(artWidth, artHeight),
      glassMat,
    );
    // Just in front of the art, still inside the frame box
    glassPlane.position.z = artZ + 0.003;
    scene.add(glassPlane);
  }

  // Dark backing (back of frame)
  // Canvas wrap — Talk Canvas paints onto stretched canvas, never board.
  // The back shows white canvas + visible wooden stretcher bars,
  // the way you'd see a real gallery-wrap canvas from behind.

  const canvasWrapDepth = 0.038; // 1.5" gallery wrap standard
  const barWidth = 0.02; // ~0.75" stretcher bars
  const canvasBackZ = artZ - canvasWrapDepth;
  const stretcherZ = canvasBackZ + barWidth / 2;

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd0ac78, // light natural pine
    roughness: 0.85,
    metalness: 0.05,
  });

  const canvasBackMat = new THREE.MeshStandardMaterial({
    color: 0xf2eee5, // warm off-white (raw canvas back)
    roughness: 0.95,
    metalness: 0,
  });

  // Back canvas plane — flipped to face backward
  const canvasBack = new THREE.Mesh(
    new THREE.PlaneGeometry(artWidth, artHeight),
    canvasBackMat,
  );
  canvasBack.position.z = canvasBackZ;
  canvasBack.rotation.y = Math.PI;
  scene.add(canvasBack);

  // Outer stretcher bars
  const stretcherTop = new THREE.Mesh(
    new THREE.BoxGeometry(artWidth, barWidth, barWidth),
    woodMat,
  );
  stretcherTop.position.set(0, artHeight / 2 - barWidth / 2, stretcherZ);
  scene.add(stretcherTop);

  const stretcherBottom = new THREE.Mesh(
    new THREE.BoxGeometry(artWidth, barWidth, barWidth),
    woodMat,
  );
  stretcherBottom.position.set(0, -artHeight / 2 + barWidth / 2, stretcherZ);
  scene.add(stretcherBottom);

  const stretcherLeft = new THREE.Mesh(
    new THREE.BoxGeometry(barWidth, artHeight, barWidth),
    woodMat,
  );
  stretcherLeft.position.set(-artWidth / 2 + barWidth / 2, 0, stretcherZ);
  scene.add(stretcherLeft);

  const stretcherRight = new THREE.Mesh(
    new THREE.BoxGeometry(barWidth, artHeight, barWidth),
    woodMat,
  );
  stretcherRight.position.set(artWidth / 2 - barWidth / 2, 0, stretcherZ);
  scene.add(stretcherRight);

  // Horizontal cross brace across the middle
  const crossBrace = new THREE.Mesh(
    new THREE.BoxGeometry(artWidth - 2 * barWidth, barWidth, barWidth),
    woodMat,
  );
  crossBrace.position.set(0, 0, stretcherZ);
  scene.add(crossBrace);

  // Four corner diagonal braces — the distinctive 45° cuts at each corner
  const diagLength = Math.min(artWidth, artHeight) * 0.14;
  const diagSide = barWidth * 0.7;
  const diagInset = barWidth + (diagLength / 2) * 0.7;

  const corners: Array<{ x: number; y: number; rot: number }> = [
    {
      x: -artWidth / 2 + diagInset,
      y: artHeight / 2 - diagInset,
      rot: -Math.PI / 4,
    },
    {
      x: artWidth / 2 - diagInset,
      y: artHeight / 2 - diagInset,
      rot: Math.PI / 4,
    },
    {
      x: -artWidth / 2 + diagInset,
      y: -artHeight / 2 + diagInset,
      rot: Math.PI / 4,
    },
    {
      x: artWidth / 2 - diagInset,
      y: -artHeight / 2 + diagInset,
      rot: -Math.PI / 4,
    },
  ];

  for (const c of corners) {
    const diag = new THREE.Mesh(
      new THREE.BoxGeometry(diagLength, diagSide, diagSide),
      woodMat,
    );
    diag.position.set(c.x, c.y, stretcherZ);
    diag.rotation.z = c.rot;
    scene.add(diag);
  }
  return scene;
}

export async function generateFrameGLB(opts: FrameModelOptions): Promise<Blob> {
  const scene = await buildScene(opts);
  const exporter = new GLTFExporter();

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(new Blob([result], { type: "model/gltf-binary" }));
        } else {
          reject(new Error("Expected binary GLTF output"));
        }
      },
      (error) => reject(error),
      { binary: true },
    );
  });
}
