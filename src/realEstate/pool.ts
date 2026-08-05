import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createLuxuryPool(
  ctx: ProjectContext
) {
  const {
    scene,
    root,
    createBox,
    materials,
  } = ctx;

  // =========================
  // POSICIÓN GENERAL
  // =========================
  // El área infantil está aproximadamente
  // entre X 15 y 75, y alrededor de Z 220.
  //
  // La piscina se coloca a la derecha,
  // dejando separación entre ambas zonas.

  const poolRoot =
    new BABYLON.TransformNode(
      "olivarLuxuryPoolRoot",
      scene
    );

  poolRoot.position.set(
    135, // derecha del parque infantil
    0,
    220 // misma profundidad que la recreación
  );

  poolRoot.parent = root;

  // =========================
  // PLATAFORMA
  // =========================

  createBox(
    "poolDeck",
    82,
    0.30,
    48,
    new BABYLON.Vector3(
      0,
      0.18,
      0
    ),
    materials.white,
    poolRoot
  );

  // Parte profunda visible bajo el agua
  createBox(
    "poolDepth",
    69,
    2.2,
    35,
    new BABYLON.Vector3(
      0,
      -0.75,
      0
    ),
    materials.poolDepth,
    poolRoot
  );

  // =========================
  // MATERIAL DEL AGUA
  // =========================

  const water =
    new BABYLON.PBRMaterial(
      "olivarLuxuryWater",
      scene
    );

  water.albedoColor =
    new BABYLON.Color3(
      0.015,
      0.25,
      0.46
    );

  water.metallic = 0.05;
  water.roughness = 0.045;
  water.alpha = 0.84;
  water.indexOfRefraction = 1.33;

  water.subSurface.isRefractionEnabled =
    true;

  water.subSurface.refractionIntensity =
    0.58;

  water.subSurface.tintColor =
    new BABYLON.Color3(
      0.02,
      0.45,
      0.68
    );

  water.subSurface.tintColorAtDistance =
    2.5;

  // Brillo adicional, especialmente visible
  // durante la noche.
  water.emissiveColor =
    new BABYLON.Color3(
      0.015,
      0.12,
      0.19
    );

  const waterMesh =
    createBox(
      "poolWater",
      68,
      0.14,
      34,
      new BABYLON.Vector3(
        0,
        0.42,
        0
      ),
      water,
      poolRoot
    );

  waterMesh.isPickable = false;

  // =========================
  // RESPLANDOR DEL AGUA
  // =========================

  const glow =
    new BABYLON.GlowLayer(
      "olivarPoolGlow",
      scene,
      {
        blurKernelSize: 28,
      }
    );

  glow.intensity = 0.42;

  glow.addIncludedOnlyMesh(
    waterMesh
  );

  // =========================
  // TUMBONAS
  // =========================

  for (
    const x of [
      -29,
      -15,
      -1,
      13,
      27,
    ]
  ) {
    for (
      const z of [
        -22,
        22,
      ]
    ) {
      const chair =
        createBox(
          "poolChair",
          4.6,
          0.34,
          1.8,
          new BABYLON.Vector3(
            x,
            0.62,
            z
          ),
          materials.white,
          poolRoot
        );

      chair.rotation.x =
        -0.12;
    }
  }

  // =========================
  // SOMBRILLAS
  // =========================

  for (
    const x of [
      -22,
      0,
      22,
    ]
  ) {
    createBox(
      "umbrellaPole",
      0.18,
      3.4,
      0.18,
      new BABYLON.Vector3(
        x,
        1.7,
        26
      ),
      materials.dark,
      poolRoot
    );

    const umbrella =
      BABYLON.MeshBuilder.CreateCylinder(
        "poolUmbrella",
        {
          diameterTop: 0.2,
          diameterBottom: 5.8,
          height: 1.15,
          tessellation: 24,
        },
        scene
      );

    umbrella.position.set(
      x,
      3.55,
      26
    );

    umbrella.material =
      materials.accent;

    umbrella.parent =
      poolRoot;

    umbrella.isPickable =
      false;
  }

  // =========================
  // LUCES VISIBLES DENTRO
  // DE LA PISCINA
  // =========================

  const underwaterLampMat =
    new BABYLON.StandardMaterial(
      "underwaterLampMat",
      scene
    );

  underwaterLampMat.diffuseColor =
    new BABYLON.Color3(
      0.18,
      0.72,
      1
    );

  underwaterLampMat.emissiveColor =
    new BABYLON.Color3(
      0.12,
      0.65,
      1
    );

  underwaterLampMat.specularColor =
    BABYLON.Color3.Black();

  for (
    const x of [
      -25,
      -8,
      8,
      25,
    ]
  ) {
    for (
      const z of [
        -14,
        14,
      ]
    ) {
      const underwaterLamp =
        BABYLON.MeshBuilder.CreateSphere(
          "underwaterPoolLamp",
          {
            diameter: 0.48,
            segments: 10,
          },
          scene
        );

      underwaterLamp.position.set(
        x,
        0.05,
        z
      );

      underwaterLamp.material =
        underwaterLampMat;

      underwaterLamp.parent =
        poolRoot;

      underwaterLamp.isPickable =
        false;
    }
  }

  // =========================
  // ILUMINACIÓN PRINCIPAL
  // =========================

  const poolLight =
    new BABYLON.PointLight(
      "olivarPoolLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  poolLight.position.set(
    0,
    3,
    0
  );

  poolLight.parent =
    poolRoot;

  poolLight.diffuse =
    new BABYLON.Color3(
      0.10,
      0.62,
      1
    );

  poolLight.specular =
    new BABYLON.Color3(
      0.15,
      0.55,
      0.9
    );

  poolLight.intensity =
    2.4;

  poolLight.range =
    68;

  // =========================
  // LUCES LATERALES
  // =========================

  const leftPoolLight =
    new BABYLON.PointLight(
      "olivarPoolLeftLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  leftPoolLight.position.set(
    -27,
    1.4,
    0
  );

  leftPoolLight.parent =
    poolRoot;

  leftPoolLight.diffuse =
    new BABYLON.Color3(
      0.08,
      0.50,
      1
    );

  leftPoolLight.specular =
    BABYLON.Color3.Black();

  leftPoolLight.intensity =
    1.35;

  leftPoolLight.range =
    32;

  const rightPoolLight =
    new BABYLON.PointLight(
      "olivarPoolRightLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  rightPoolLight.position.set(
    27,
    1.4,
    0
  );

  rightPoolLight.parent =
    poolRoot;

  rightPoolLight.diffuse =
    new BABYLON.Color3(
      0.08,
      0.50,
      1
    );

  rightPoolLight.specular =
    BABYLON.Color3.Black();

  rightPoolLight.intensity =
    1.35;

  rightPoolLight.range =
    32;
}