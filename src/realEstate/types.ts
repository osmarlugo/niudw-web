import * as BABYLON from "@babylonjs/core";

export type RealEstateRoadSegment = {
  a: BABYLON.Vector3;
  b: BABYLON.Vector3;
  radius: number;
  name?: string;
  oneway?: boolean;
};

export type ProjectContext = {
  scene: BABYLON.Scene;
  root: BABYLON.TransformNode;
  addRoadSegment?: (segment: RealEstateRoadSegment) => void;
  materials: Record<string, BABYLON.StandardMaterial>;
  createBox: (
    name: string,
    width: number,
    height: number,
    depth: number,
    position: BABYLON.Vector3,
    material: BABYLON.Material,
    parent?: BABYLON.Node
  ) => BABYLON.Mesh;
};

export type CreateRealEstateProjectOptions = {
  scene: BABYLON.Scene;
  addRoadSegment?: (segment: RealEstateRoadSegment) => void;
  registerChunkMesh?: (mesh: BABYLON.AbstractMesh) => void;
  registerCullable?: (mesh: BABYLON.AbstractMesh) => void;
};

export type RealEstateProjectResult = {
  root: BABYLON.TransformNode;
  spawnPosition: BABYLON.Vector3;
  carSpawnPosition: BABYLON.Vector3;
  exitPosition: BABYLON.Vector3;
};
