import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createVegetation(
  ctx: ProjectContext
) {
  const {
    scene,
    root,
    createBox,
    materials,
  } = ctx;

  // =========================
  // ÁRBOL FRONDOSO PRINCIPAL
  // =========================

  function createLargeTree(
    x: number,
    z: number,
    scale: number = 1,
    rotationY: number = 0
  ) {
    const treeRoot =
      new BABYLON.TransformNode(
        "olivarLargeTreeRoot",
        scene
      );

    treeRoot.position.set(
      x,
      0,
      z
    );

    treeRoot.rotation.y =
      rotationY;

    treeRoot.scaling.setAll(
      scale
    );

    treeRoot.parent = root;

    // Tronco principal
    const trunk =
      BABYLON.MeshBuilder.CreateCylinder(
        "olivarLargeTreeTrunk",
        {
          height: 5.5,
          diameterTop: 0.7,
          diameterBottom: 1.15,
          tessellation: 10,
        },
        scene
      );

    trunk.position.y = 2.75;
    trunk.material = materials.trunk;
    trunk.parent = treeRoot;
    trunk.isPickable = false;

    // Ramas principales
    for (
      const branchData of [
        {
          x: -0.8,
          y: 4.4,
          z: 0,
          rotationZ: -0.65,
        },
        {
          x: 0.8,
          y: 4.2,
          z: 0.2,
          rotationZ: 0.68,
        },
        {
          x: 0,
          y: 4.8,
          z: 0.65,
          rotationX: 0.65,
        },
      ]
    ) {
      const branch =
        BABYLON.MeshBuilder.CreateCylinder(
          "olivarTreeBranch",
          {
            height: 3.1,
            diameterTop: 0.25,
            diameterBottom: 0.5,
            tessellation: 8,
          },
          scene
        );

      branch.position.set(
        branchData.x,
        branchData.y,
        branchData.z
      );

      branch.rotation.z =
        branchData.rotationZ ?? 0;

      branch.rotation.x =
        branchData.rotationX ?? 0;

      branch.material =
        materials.trunk;

      branch.parent =
        treeRoot;

      branch.isPickable =
        false;
    }

    // Copas separadas para evitar forma de esfera simple
    const crownPositions = [
      {
        x: 0,
        y: 6.3,
        z: 0,
        diameter: 5.6,
      },
      {
        x: -2,
        y: 5.8,
        z: 0.2,
        diameter: 4.6,
      },
      {
        x: 2,
        y: 5.9,
        z: -0.2,
        diameter: 4.7,
      },
      {
        x: 0.3,
        y: 5.7,
        z: 1.9,
        diameter: 4.2,
      },
      {
        x: -0.4,
        y: 6,
        z: -1.8,
        diameter: 4.1,
      },
    ];

    for (
      const crownData of crownPositions
    ) {
      const crown =
        BABYLON.MeshBuilder.CreateSphere(
          "olivarTreeCrown",
          {
            diameter:
              crownData.diameter,
            segments: 8,
          },
          scene
        );

      crown.position.set(
        crownData.x,
        crownData.y,
        crownData.z
      );

      crown.scaling.y =
        0.85;

      crown.material =
        materials.leaf;

      crown.parent =
        treeRoot;

      crown.isPickable =
        false;
    }

    return treeRoot;
  }

  // =========================
  // ÁRBOL ORNAMENTAL MEDIANO
  // =========================

  function createOrnamentalTree(
    x: number,
    z: number,
    scale: number = 1
  ) {
    const treeRoot =
      new BABYLON.TransformNode(
        "olivarOrnamentalTree",
        scene
      );

    treeRoot.position.set(
      x,
      0,
      z
    );

    treeRoot.scaling.setAll(
      scale
    );

    treeRoot.parent = root;

    const trunk =
      BABYLON.MeshBuilder.CreateCylinder(
        "ornamentalTreeTrunk",
        {
          height: 4.4,
          diameterTop: 0.42,
          diameterBottom: 0.72,
          tessellation: 10,
        },
        scene
      );

    trunk.position.y = 2.2;
    trunk.material =
      materials.trunk;

    trunk.parent =
      treeRoot;

    trunk.isPickable =
      false;

    const lowerCrown =
      BABYLON.MeshBuilder.CreateSphere(
        "ornamentalLowerCrown",
        {
          diameter: 4.4,
          segments: 10,
        },
        scene
      );

    lowerCrown.position.y = 4.7;
    lowerCrown.scaling.y = 0.82;
    lowerCrown.material =
      materials.leaf;

    lowerCrown.parent =
      treeRoot;

    lowerCrown.isPickable =
      false;

    const upperCrown =
      BABYLON.MeshBuilder.CreateSphere(
        "ornamentalUpperCrown",
        {
          diameter: 3.3,
          segments: 10,
        },
        scene
      );

    upperCrown.position.set(
      0.35,
      6,
      0
    );

    upperCrown.scaling.y = 0.8;
    upperCrown.material =
      materials.leaf;

    upperCrown.parent =
      treeRoot;

    upperCrown.isPickable =
      false;
  }

  // =========================
  // ARBUSTO
  // =========================

  function createBush(
    x: number,
    z: number,
    scale: number = 1
  ) {
    const bushRoot =
      new BABYLON.TransformNode(
        "olivarBushRoot",
        scene
      );

    bushRoot.position.set(
      x,
      0,
      z
    );

    bushRoot.scaling.setAll(
      scale
    );

    bushRoot.parent = root;

    for (
      const position of [
        new BABYLON.Vector3(
          -0.7,
          0.75,
          0
        ),
        new BABYLON.Vector3(
          0.65,
          0.7,
          0.1
        ),
        new BABYLON.Vector3(
          0,
          1,
          0.45
        ),
      ]
    ) {
      const bush =
        BABYLON.MeshBuilder.CreateSphere(
          "olivarBush",
          {
            diameter: 1.8,
            segments: 8,
          },
          scene
        );

      bush.position.copyFrom(
        position
      );

      bush.scaling.y = 0.72;
      bush.material =
        materials.hedge;

      bush.parent =
        bushRoot;

      bush.isPickable =
        false;
    }
  }

  // =========================
  // FAROL
  // =========================

  function createLamp(
    x: number,
    z: number
  ) {
    createBox(
      "lampPole",
      0.22,
      5.2,
      0.22,
      new BABYLON.Vector3(
        x,
        2.6,
        z
      ),
      materials.dark
    );

    const lampTop =
      createBox(
        "lampTop",
        0.75,
        0.2,
        0.75,
        new BABYLON.Vector3(
          x,
          5.25,
          z
        ),
        materials.dark
      );

    lampTop.isPickable =
      false;

    const bulb =
      BABYLON.MeshBuilder.CreateSphere(
        "lampBulb",
        {
          diameter: 0.62,
          segments: 10,
        },
        scene
      );

    bulb.position.set(
      x,
      5.05,
      z
    );

    bulb.material =
      materials.warm;

    bulb.parent = root;
    bulb.isPickable = false;
  }

  // =========================
  // BANCA
  // =========================

  function createBench(
    x: number,
    z: number,
    rotationY: number = 0
  ) {
    const benchRoot =
      new BABYLON.TransformNode(
        "olivarBench",
        scene
      );

    benchRoot.position.set(
      x,
      0,
      z
    );

    benchRoot.rotation.y =
      rotationY;

    benchRoot.parent = root;

    createBox(
      "benchSeat",
      3.6,
      0.25,
      0.75,
      new BABYLON.Vector3(
        0,
        0.8,
        0
      ),
      materials.wood,
      benchRoot
    );

    createBox(
      "benchBack",
      3.6,
      1.2,
      0.18,
      new BABYLON.Vector3(
        0,
        1.35,
        0.35
      ),
      materials.wood,
      benchRoot
    );

    createBox(
      "benchLegL",
      0.18,
      0.8,
      0.18,
      new BABYLON.Vector3(
        -1.35,
        0.4,
        0
      ),
      materials.dark,
      benchRoot
    );

    createBox(
      "benchLegR",
      0.18,
      0.8,
      0.18,
      new BABYLON.Vector3(
        1.35,
        0.4,
        0
      ),
      materials.dark,
      benchRoot
    );
  }

  for (
  let z = -145;
  z <= 65;
  z += 28
) {
  createOrnamentalTree(
    -16,
    z,
    0.82
  );

  createOrnamentalTree(
    16,
    z + 8,
    0.82
  );

  createBush(
    -12,
    z + 8,
    0.75
  );

  createBush(
    12,
    z + 15,
    0.75
  );

  createLamp(
    -22,
    z
  );

  createLamp(
    22,
    z
  );
}

  // =========================
  // LÍMITES DEL PROYECTO
  // =========================

  for (
    let x = -180;
    x <= 180;
    x += 28
  ) {
    createLargeTree(
      x,
      -157,
      0.9,
      Math.random() * Math.PI
    );

    createLargeTree(
      x,
      157,
      0.9,
      Math.random() * Math.PI
    );
  }

  // =========================
  // BANCAS EXISTENTES
  // =========================

  for (
    const [
      x,
      z,
      rotation,
    ] of [
      [
        -55,
        82,
        0,
      ],
      [
        -35,
        82,
        Math.PI,
      ],
      [
        -55,
        103,
        0,
      ],
      [
        -35,
        103,
        Math.PI,
      ],
      [
        35,
        82,
        0,
      ],
      [
        55,
        82,
        Math.PI,
      ],
      [
        35,
        103,
        0,
      ],
      [
        55,
        103,
        Math.PI,
      ],
    ] as Array<
      [
        number,
        number,
        number
      ]
    >
  ) {
    createBench(
      x,
      z,
      rotation
    );
  }
}