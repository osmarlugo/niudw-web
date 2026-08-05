import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createLuxuryEntrance(ctx: ProjectContext) {
  const { scene, root, createBox, materials } = ctx;

  createBox("entranceLeftTower", 10, 11, 10, new BABYLON.Vector3(-24, 5.5, -176), materials.stone);
  createBox("entranceRightTower", 10, 11, 10, new BABYLON.Vector3(24, 5.5, -176), materials.stone);
  createBox("entranceBeam", 58, 1.5, 5, new BABYLON.Vector3(0, 10.0, -176), materials.white);
  createBox("gateLeft", 19, 4.2, 0.35, new BABYLON.Vector3(-10, 2.2, -172.8), materials.dark);
  createBox("gateRight", 19, 4.2, 0.35, new BABYLON.Vector3(10, 2.2, -172.8), materials.dark);

  // Caseta de vigilancia con cristales.
  createBox("guardBooth", 10, 5.2, 8, new BABYLON.Vector3(34, 2.6, -157), materials.white);
  createBox("guardFrontGlass", 6, 2.6, 0.18, new BABYLON.Vector3(34, 3.0, -161.1), materials.glass);
  createBox("guardSideGlass", 0.18, 2.6, 4.2, new BABYLON.Vector3(29, 3.0, -157), materials.glass);

  // Plumas de entrada y salida.
  for (const x of [-8, 8]) {
    createBox("barrierBase", 0.7, 1.2, 0.7, new BABYLON.Vector3(x, 0.6, -153), materials.dark);
    const arm = createBox("barrierArm", 8, 0.22, 0.22, new BABYLON.Vector3(x + (x < 0 ? -4 : 4), 1.2, -153), materials.accent);
    arm.rotation.z = x < 0 ? 0.05 : -0.05;
  }

  const texture = new BABYLON.DynamicTexture("entranceSignTexture", { width: 1400, height: 420 }, scene, true);
  const c = texture.getContext() as CanvasRenderingContext2D;
  c.fillStyle = "#10151b";
  c.fillRect(0, 0, 1400, 420);
  c.strokeStyle = "#d9b85f";
  c.lineWidth = 18;
  c.strokeRect(14, 14, 1372, 392);
  c.fillStyle = "white";
  c.font = "bold 112px Arial";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText("NIU RESIDENCIAL", 700, 145);
  c.fillStyle = "#e5c873";
  c.font = "bold 94px Arial";
  c.fillText("EL OLIVAR", 700, 285);
  texture.update();
  // Corrige las letras reflejadas horizontalmente.
texture.uScale = -1;
texture.uOffset = 1;

  // =========================
// MATERIAL DEL LETRERO
// =========================

const signMat =
  new BABYLON.StandardMaterial(
    "entranceSignMat",
    scene
  );

signMat.diffuseTexture =
  texture;

signMat.emissiveTexture =
  texture;

signMat.emissiveColor =
  new BABYLON.Color3(
    0.48,
    0.48,
    0.48
  );

// Evita que Babylon oculte el plano
// cuando se observe desde el lado contrario.
signMat.backFaceCulling =
  false;

// Hace que el texto mantenga su iluminación.
signMat.disableLighting =
  true;


// =========================
// LETRERO HACIA EL EXTERIOR
// =========================
// Visible desde donde aparecen
// el avatar y el automóvil.

const exteriorSign =
  BABYLON.MeshBuilder.CreatePlane(
    "entranceMainSignExterior",
    {
      width: 42,
      height: 12.6,
      sideOrientation:
        BABYLON.Mesh.DOUBLESIDE,
    },
    scene
  );

exteriorSign.position.set(
  0,
  15.5,
  -178.6
);

// Mira hacia la parte exterior,
// donde Z es más negativo.
exteriorSign.rotation.y =
  Math.PI;

exteriorSign.material =
  signMat;

exteriorSign.parent =
  root;

exteriorSign.isPickable =
  false;


// =========================
// LETRERO HACIA EL INTERIOR
// =========================
// Visible desde dentro del residencial.

const interiorSign =
  BABYLON.MeshBuilder.CreatePlane(
    "entranceMainSignInterior",
    {
      width: 42,
      height: 12.6,
      sideOrientation:
        BABYLON.Mesh.DOUBLESIDE,
    },
    scene
  );

interiorSign.position.set(
  0,
  15.5,
  -173.4
);

// Mira hacia el interior,
// donde Z es más positivo.
interiorSign.rotation.y =
  0;

interiorSign.material =
  signMat;

interiorSign.parent =
  root;

interiorSign.isPickable =
  false;

  const light = new BABYLON.PointLight("entranceWarmLight", new BABYLON.Vector3(0, 10, -166), scene);
  light.diffuse = new BABYLON.Color3(1, 0.70, 0.32);
  light.specular = BABYLON.Color3.Black();
  light.intensity = 1.8;
  light.range = 45;
}
