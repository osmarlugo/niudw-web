import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createClubHouse(
  ctx: ProjectContext
) {
  const {
    scene,
    root,
    createBox,
    materials,
  } = ctx;

  // =========================
  // RAÍZ GENERAL DEL CLUB HOUSE
  // =========================

  const clubRoot =
    new BABYLON.TransformNode(
      "olivarClubHouse",
      scene
    );

  // Ubicación:
  // lado izquierdo del parque infantil.
  // La piscina se encuentra al lado derecho.
  clubRoot.position.set(
    -135,
    0,
    220
  );

  clubRoot.parent = root;

  // =========================
  // VIDRIO
  // =========================

  const glass =
    new BABYLON.StandardMaterial(
      "clubGlass",
      scene
    );

  glass.diffuseColor =
    new BABYLON.Color3(
      0.05,
      0.26,
      0.42
    );

  glass.emissiveColor =
    new BABYLON.Color3(
      0.015,
      0.055,
      0.09
    );

  glass.specularColor =
    new BABYLON.Color3(
      0.7,
      0.8,
      0.9
    );

  glass.alpha = 0.78;
  glass.needDepthPrePass = true;

  // =========================
  // PLATAFORMA
  // =========================

  createBox(
    "clubPlatform",
    76,
    0.35,
    50,
    new BABYLON.Vector3(
      0,
      0.18,
      0
    ),
    materials.stone,
    clubRoot
  );

  // =========================
  // EDIFICIO
  // =========================

  createBox(
    "clubBody",
    58,
    7.5,
    28,
    new BABYLON.Vector3(
      0,
      3.75,
      4
    ),
    materials.white,
    clubRoot
  );

  createBox(
    "clubGlassFront",
    48,
    5.2,
    0.22,
    new BABYLON.Vector3(
      0,
      3.6,
      -10.15
    ),
    glass,
    clubRoot
  );

  createBox(
    "clubRoof",
    64,
    0.65,
    34,
    new BABYLON.Vector3(
      0,
      7.85,
      4
    ),
    materials.dark,
    clubRoot
  );

  // =========================
  // TERRAZA
  // =========================

  createBox(
    "clubTerrace",
    58,
    0.25,
    15,
    new BABYLON.Vector3(
      0,
      0.42,
      -17
    ),
    materials.wood,
    clubRoot
  );

  // =========================
  // MESAS DE LA TERRAZA
  // =========================

  for (
    const x of [
      -20,
      -10,
      0,
      10,
      20,
    ]
  ) {
    createBox(
      "clubTable",
      3.2,
      0.22,
      3.2,
      new BABYLON.Vector3(
        x,
        1.15,
        -17
      ),
      materials.white,
      clubRoot
    );

    createBox(
      "clubTableLeg",
      0.25,
      1,
      0.25,
      new BABYLON.Vector3(
        x,
        0.62,
        -17
      ),
      materials.dark,
      clubRoot
    );
  }

  // =========================
  // LETRERO
  // =========================

  const signTexture =
    new BABYLON.DynamicTexture(
      "clubSignTexture",
      {
        width: 1024,
        height: 256,
      },
      scene,
      true
    );

  const c = signTexture.getContext() as CanvasRenderingContext2D;
  
  c.fillStyle = "#11151b";

  c.fillRect(
    0,
    0,
    1024,
    256
  );

  c.strokeStyle = "#d7b86c";
  c.lineWidth = 12;

  c.strokeRect(
    10,
    10,
    1004,
    236
  );

  c.fillStyle = "white";
  c.font = "bold 100px Arial";
  c.textAlign = "center";
  c.textBaseline = "middle";

  c.fillText(
    "CLUB HOUSE",
    512,
    128
  );

  signTexture.update();

  const signMat =
    new BABYLON.StandardMaterial(
      "clubSignMat",
      scene
    );

  signMat.diffuseTexture =
    signTexture;

  signMat.emissiveTexture =
    signTexture;

  signMat.emissiveColor =
    new BABYLON.Color3(
      0.45,
      0.45,
      0.45
    );

  signMat.backFaceCulling =
    false;

  const sign =
    BABYLON.MeshBuilder.CreatePlane(
      "clubSign",
      {
        width: 22,
        height: 5.5,
      },
      scene
    );

  sign.position.set(
    0,
    9.8,
    -10.5
  );

  sign.material = signMat;
  sign.parent = clubRoot;
  sign.isPickable = false;

  // =========================
  // ILUMINACIÓN
  // =========================

  const light =
    new BABYLON.PointLight(
      "clubHouseLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  light.position.set(
    0,
    5,
    -12
  );

  light.parent = clubRoot;

  light.diffuse =
    new BABYLON.Color3(
      1,
      0.74,
      0.42
    );

  light.specular =
    BABYLON.Color3.Black();

  light.intensity = 1.6;
  light.range = 48;
}