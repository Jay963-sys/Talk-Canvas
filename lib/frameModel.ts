import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

export interface FrameModelOptions {
  imageUrl: string;
  frameColor: string; // hex
  artWidth: number; // meters
  artHeight: number; // meters
  frameThickness?: number;
  frameDepth?: number;
}

async function loadTexture(url: string): Promise<THREE.Texture> {
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

async function buildScene(opts: FrameModelOptions): Promise<THREE.Scene> {
  const {
    imageUrl,
    frameColor,
    artWidth,
    artHeight,
    frameThickness = 0.04,
    frameDepth = 0.025,
  } = opts;

  const scene = new THREE.Scene();
  const texture = await loadTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(frameColor),
    roughness: 0.6,
    metalness: 0.05,
  });

  const t = frameThickness;
  const d = frameDepth;
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

  // Art plane (faces +Z)
  const artMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0,
  });
  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(artWidth, artHeight),
    artMat,
  );
  art.position.z = d / 2 + 0.001;
  scene.add(art);

  // Dark backing (faces -Z)
  const backMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a2620"),
    roughness: 0.8,
  });
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(artWidth, artHeight),
    backMat,
  );
  back.position.z = -d / 2 - 0.001;
  back.rotation.y = Math.PI;
  scene.add(back);

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
