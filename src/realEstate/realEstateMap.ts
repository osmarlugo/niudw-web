import * as BABYLON from "@babylonjs/core";
import { createProjectRoads } from "./roads";
import { createVegetation } from "./vegetation";
import { createHouses } from "./houses";
import { createLuxuryPool } from "./pool";
import { createClubHouse } from "./clubhouse";
import { createLuxuryEntrance } from "./entrance";
import {
  createRecreationArea
} from "./recreation";
import type { CreateRealEstateProjectOptions, ProjectContext, RealEstateProjectResult } from "./types";

export function createRealEstateProject(options: CreateRealEstateProjectOptions): RealEstateProjectResult {
  const { scene, addRoadSegment, registerChunkMesh, registerCullable } = options;
  const root = BABYLON.MeshBuilder.CreateBox(
    "realEstateProjectRoot",
    { width: 0.1, height: 0.1, depth: 0.1 },
    scene
  );
  root.isVisible = false;
  root.isPickable = false;

  const material = (name: string, color: BABYLON.Color3, emissive = BABYLON.Color3.Black()) => {
    const m = new BABYLON.StandardMaterial(name, scene);
    m.diffuseColor = color;
    m.emissiveColor = emissive;
    m.specularColor = new BABYLON.Color3(0.07, 0.07, 0.07);
    m.maxSimultaneousLights = 4;
    return m;
  };

  const glass = material("projectGlass", new BABYLON.Color3(0.07, 0.26, 0.42));
  glass.alpha = 0.78;
  glass.needDepthPrePass = true;

  const materials: Record<string, BABYLON.StandardMaterial> = {
    ground: material("projectGround", new BABYLON.Color3(0.48, 0.45, 0.38)),
    grass: material("projectGrass", new BABYLON.Color3(0.07, 0.44, 0.12), new BABYLON.Color3(0.008, 0.04, 0.01)),
    road: material("projectRoad", new BABYLON.Color3(0.055, 0.06, 0.07)),
    sidewalk: material("projectSidewalk", new BABYLON.Color3(0.72, 0.70, 0.65)),
    curb: material("projectCurb", new BABYLON.Color3(0.94, 0.93, 0.88)),
    line: material("projectLine", new BABYLON.Color3(1, 0.84, 0.16), new BABYLON.Color3(0.13, 0.08, 0.01)),
    white: material("projectWhite", new BABYLON.Color3(0.94, 0.93, 0.89)),
    dark: material("projectDark", new BABYLON.Color3(0.075, 0.085, 0.10)),
    wood: material("projectWood", new BABYLON.Color3(0.38, 0.20, 0.09)),
    trunk: material("projectTrunk", new BABYLON.Color3(0.31, 0.16, 0.065)),
    leaf: material("projectLeaf", new BABYLON.Color3(0.035, 0.31, 0.075)),
    hedge: material("projectHedge", new BABYLON.Color3(0.035, 0.35, 0.065)),
    stone: material("projectStone", new BABYLON.Color3(0.52, 0.52, 0.50)),
    garage: material("projectGarage", new BABYLON.Color3(0.22, 0.23, 0.25)),
    accent: material("projectAccent", new BABYLON.Color3(0.90, 0.57, 0.12), new BABYLON.Color3(0.15, 0.06, 0.01)),
    warm: material("projectWarm", new BABYLON.Color3(1, 0.72, 0.32), new BABYLON.Color3(1, 0.45, 0.08)),
    poolDepth: material("projectPoolDepth", new BABYLON.Color3(0.015, 0.13, 0.24)),
    glass,
  };

  const createBox: ProjectContext["createBox"] = (name, width, height, depth, position, mat, parent = root) => {
    const mesh = BABYLON.MeshBuilder.CreateBox(name, { width, height, depth }, scene);
    mesh.position.copyFrom(position);
    mesh.material = mat;
    mesh.parent = parent;
    mesh.isPickable = false;
    return mesh;
  };

  const ctx: ProjectContext = { scene, root, addRoadSegment, materials, createBox };

  // Una sola raíz controla todo el residencial para chunks y culling.
  registerChunkMesh?.(root);
  registerCullable?.(root);

  const base = BABYLON.MeshBuilder.CreateGround(
  "projectBase",
  {
    width: 430,
    height: 420
  },
  scene
);
  base.position.y = -0.02;
  base.material = materials.ground;
  base.parent = root;

  const lawn = BABYLON.MeshBuilder.CreateGround(
  "projectLawn",
  {
    width: 410,
    height: 400
  },
  scene
);
  lawn.position.y = 0.02;
  lawn.material = materials.grass;
  lawn.parent = root;

  createProjectRoads(ctx);
createLuxuryEntrance(ctx);
createHouses(ctx);
createClubHouse(ctx);
createLuxuryPool(ctx);
createVegetation(ctx);
createRecreationArea(ctx);

  const sun = new BABYLON.DirectionalLight("projectSun", new BABYLON.Vector3(-0.45, -1, 0.32), scene);
  sun.position.set(100, 180, -110);
  sun.intensity = 1.05;
  sun.diffuse = new BABYLON.Color3(1, 0.94, 0.83);

  return {
    root,
    spawnPosition: new BABYLON.Vector3(-5, 0.85, -150),
    carSpawnPosition: new BABYLON.Vector3(5, 0.22, -150),
    exitPosition: new BABYLON.Vector3(0, 0.85, -180),
  };
}
