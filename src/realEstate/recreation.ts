import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createRecreationArea(
  ctx: ProjectContext
) {
  const {
    scene,
    root,
    createBox,
    materials,
  } = ctx;

  // La zona se ubica detrás del Club House
  // y de la piscina.
  const recreationRoot =
    new BABYLON.TransformNode(
      "olivarRecreationArea",
      scene
    );

  // =========================
// POSICIÓN GENERAL DEL PARQUE
// =========================
// El tercer valor mueve todo el parque
// hacia el fondo del proyecto.
//
// Antes estaba en Z = 0.
// Ahora se desplaza 75 metros hacia atrás.

recreationRoot.position.set(
  0,
  0,
  75
);

  recreationRoot.parent = root;

  // =========================
  // MATERIALES
  // =========================

  const playgroundFloorMat =
    new BABYLON.StandardMaterial(
      "playgroundFloorMat",
      scene
    );

  playgroundFloorMat.diffuseColor =
    new BABYLON.Color3(
      0.19,
      0.30,
      0.36
    );

  playgroundFloorMat.specularColor =
    BABYLON.Color3.Black();

  const redMat =
    new BABYLON.StandardMaterial(
      "playgroundRedMat",
      scene
    );

  redMat.diffuseColor =
    new BABYLON.Color3(
      0.85,
      0.12,
      0.10
    );

  const yellowMat =
    new BABYLON.StandardMaterial(
      "playgroundYellowMat",
      scene
    );

  yellowMat.diffuseColor =
    new BABYLON.Color3(
      1,
      0.68,
      0.08
    );

  const blueMat =
    new BABYLON.StandardMaterial(
      "playgroundBlueMat",
      scene
    );

  blueMat.diffuseColor =
    new BABYLON.Color3(
      0.05,
      0.38,
      0.92
    );

  const greenMat =
    new BABYLON.StandardMaterial(
      "playgroundGreenMat",
      scene
    );

  greenMat.diffuseColor =
    new BABYLON.Color3(
      0.08,
      0.62,
      0.24
    );

  const sandMat =
    new BABYLON.StandardMaterial(
      "playgroundSandMat",
      scene
    );

  sandMat.diffuseColor =
    new BABYLON.Color3(
      0.84,
      0.68,
      0.38
    );

  const pathMat =
    new BABYLON.StandardMaterial(
      "parkPathMat",
      scene
    );

  pathMat.diffuseColor =
    new BABYLON.Color3(
      0.55,
      0.47,
      0.36
    );

  pathMat.specularColor =
    BABYLON.Color3.Black();

  // =========================
  // PARQUE FRONDOSO
  // =========================

  const parkGround =
    BABYLON.MeshBuilder.CreateGround(
      "recreationParkGround",
      {
        width: 185,
        height: 72,
      },
      scene
    );

  parkGround.position.set(
    0,
    0.09,
    152
  );

  parkGround.material =
    materials.grass;

  parkGround.parent =
    recreationRoot;

  parkGround.isPickable =
    false;

  // =========================
  // ÁREA INFANTIL
  // =========================

  const playgroundBase =
    BABYLON.MeshBuilder.CreateGround(
      "playgroundBase",
      {
        width: 58,
        height: 48,
      },
      scene
    );

  playgroundBase.position.set(
    45,
    0.15,
    145
  );

  playgroundBase.material =
    playgroundFloorMat;

  playgroundBase.parent =
    recreationRoot;

  playgroundBase.isPickable =
    false;

  // Borde del área infantil
  createBox(
    "playgroundBorderNorth",
    60,
    0.45,
    0.7,
    new BABYLON.Vector3(
      45,
      0.28,
      169
    ),
    materials.white,
    recreationRoot
  );

  createBox(
    "playgroundBorderSouth",
    60,
    0.45,
    0.7,
    new BABYLON.Vector3(
      45,
      0.28,
      121
    ),
    materials.white,
    recreationRoot
  );

  createBox(
    "playgroundBorderLeft",
    0.7,
    0.45,
    48,
    new BABYLON.Vector3(
      15,
      0.28,
      145
    ),
    materials.white,
    recreationRoot
  );

  createBox(
    "playgroundBorderRight",
    0.7,
    0.45,
    48,
    new BABYLON.Vector3(
      75,
      0.28,
      145
    ),
    materials.white,
    recreationRoot
  );

  // =========================
  // TORRE DE JUEGOS
  // =========================

  const playgroundTower =
    new BABYLON.TransformNode(
      "playgroundTowerRoot",
      scene
    );

  playgroundTower.position.set(
    45,
    0,
    145
  );

  playgroundTower.parent =
    recreationRoot;

  createBox(
    "towerPlatform",
    8,
    0.5,
    8,
    new BABYLON.Vector3(
      0,
      3.2,
      0
    ),
    yellowMat,
    playgroundTower
  );

  for (
    const [
      x,
      z,
    ] of [
      [
        -3.4,
        -3.4,
      ],
      [
        3.4,
        -3.4,
      ],
      [
        -3.4,
        3.4,
      ],
      [
        3.4,
        3.4,
      ],
    ]
  ) {
    createBox(
      "towerSupport",
      0.55,
      6.4,
      0.55,
      new BABYLON.Vector3(
        x,
        3.2,
        z
      ),
      blueMat,
      playgroundTower
    );
  }

  // Techo piramidal
  const towerRoof =
    BABYLON.MeshBuilder.CreateCylinder(
      "playgroundTowerRoof",
      {
        diameterTop: 0.3,
        diameterBottom: 11,
        height: 3.5,
        tessellation: 4,
      },
      scene
    );

  towerRoof.position.set(
    0,
    7,
    0
  );

  towerRoof.rotation.y =
    Math.PI / 4;

  towerRoof.material =
    redMat;

  towerRoof.parent =
    playgroundTower;

  // Barandas
  createBox(
    "towerRailFront",
    7.8,
    1.2,
    0.25,
    new BABYLON.Vector3(
      0,
      4.05,
      -3.8
    ),
    greenMat,
    playgroundTower
  );

  createBox(
    "towerRailBack",
    7.8,
    1.2,
    0.25,
    new BABYLON.Vector3(
      0,
      4.05,
      3.8
    ),
    greenMat,
    playgroundTower
  );

  // =========================
  // TOBOGÁN
  // =========================

  const slideRoot =
    new BABYLON.TransformNode(
      "playgroundSlideRoot",
      scene
    );

  slideRoot.position.set(
    0,
    2.2,
    -8
  );

  slideRoot.rotation.x =
    -0.42;

  slideRoot.parent =
    playgroundTower;

  createBox(
    "slideSurface",
    3.2,
    0.32,
    11,
    BABYLON.Vector3.Zero(),
    blueMat,
    slideRoot
  );

  createBox(
    "slideLeftBorder",
    0.32,
    1,
    11,
    new BABYLON.Vector3(
      -1.6,
      0.55,
      0
    ),
    yellowMat,
    slideRoot
  );

  createBox(
    "slideRightBorder",
    0.32,
    1,
    11,
    new BABYLON.Vector3(
      1.6,
      0.55,
      0
    ),
    yellowMat,
    slideRoot
  );

  // =========================
  // ESCALERA
  // =========================

  for (
    let index = 0;
    index < 6;
    index++
  ) {
    createBox(
      "playgroundStep",
      4,
      0.28,
      1.1,
      new BABYLON.Vector3(
        0,
        0.45 + index * 0.55,
        5.2 + index * 0.72
      ),
      yellowMat,
      playgroundTower
    );
  }

  // =========================
  // COLUMPIOS
  // =========================

  const swingRoot =
    new BABYLON.TransformNode(
      "playgroundSwingRoot",
      scene
    );

  swingRoot.position.set(
    24,
    0,
    145
  );

  swingRoot.parent =
    recreationRoot;

  for (
    const x of [
      -5,
      5,
    ]
  ) {
    const swingSupport =
      BABYLON.MeshBuilder.CreateCylinder(
        "swingSupport",
        {
          height: 7,
          diameter: 0.45,
          tessellation: 10,
        },
        scene
      );

    swingSupport.position.set(
      x,
      3.5,
      0
    );

    swingSupport.rotation.z =
      x < 0
        ? -0.18
        : 0.18;

    swingSupport.material =
      redMat;

    swingSupport.parent =
      swingRoot;
  }

  createBox(
    "swingTopBar",
    11.5,
    0.5,
    0.5,
    new BABYLON.Vector3(
      0,
      6.7,
      0
    ),
    redMat,
    swingRoot
  );

  for (
    const seatX of [
      -2.7,
      2.7,
    ]
  ) {
    for (
      const ropeX of [
        -0.65,
        0.65,
      ]
    ) {
      const rope =
        BABYLON.MeshBuilder.CreateCylinder(
          "swingRope",
          {
            height: 3.5,
            diameter: 0.08,
            tessellation: 8,
          },
          scene
        );

      rope.position.set(
        seatX + ropeX,
        4.8,
        0
      );

      rope.material =
        materials.dark;

      rope.parent =
        swingRoot;
    }

    createBox(
      "swingSeat",
      2,
      0.25,
      0.8,
      new BABYLON.Vector3(
        seatX,
        3,
        0
      ),
      blueMat,
      swingRoot
    );
  }

  // =========================
  // SUBE Y BAJA
  // =========================

  const seesawRoot =
    new BABYLON.TransformNode(
      "playgroundSeesawRoot",
      scene
    );

  seesawRoot.position.set(
    66,
    0,
    145
  );

  seesawRoot.parent =
    recreationRoot;

  const seesawBase =
    BABYLON.MeshBuilder.CreateCylinder(
      "seesawBase",
      {
        height: 1.5,
        diameterTop: 0.6,
        diameterBottom: 2.4,
        tessellation: 16,
      },
      scene
    );

  seesawBase.position.y = 0.75;
  seesawBase.material =
    yellowMat;

  seesawBase.parent =
    seesawRoot;

  const seesawBoard =
    createBox(
      "seesawBoard",
      12,
      0.4,
      1.1,
      new BABYLON.Vector3(
        0,
        1.75,
        0
      ),
      redMat,
      seesawRoot
    );

  seesawBoard.rotation.z =
    0.10;

  for (
    const x of [
      -5,
      5,
    ]
  ) {
    createBox(
      "seesawSeat",
      2,
      0.25,
      2,
      new BABYLON.Vector3(
        x,
        2.25 +
          (
            x > 0
              ? 0.45
              : -0.45
          ),
        0
      ),
      blueMat,
      seesawRoot
    );

    createBox(
      "seesawHandle",
      0.25,
      1.2,
      2,
      new BABYLON.Vector3(
        x * 0.78,
        2.75 +
          (
            x > 0
              ? 0.35
              : -0.35
          ),
        0
      ),
      materials.dark,
      seesawRoot
    );
  }

  // =========================
  // ARENERO
  // =========================

  const sandbox =
    BABYLON.MeshBuilder.CreateCylinder(
      "playgroundSandbox",
      {
        diameter: 10,
        height: 0.35,
        tessellation: 32,
      },
      scene
    );

  sandbox.position.set(
    64,
    0.3,
    128
  );

  sandbox.material =
    sandMat;

  sandbox.parent =
    recreationRoot;

  sandbox.isPickable =
    false;

  const sandboxBorder =
    BABYLON.MeshBuilder.CreateTorus(
      "sandboxBorder",
      {
        diameter: 10.5,
        thickness: 0.7,
        tessellation: 32,
      },
      scene
    );

  sandboxBorder.position.set(
    64,
    0.48,
    128
  );

  sandboxBorder.rotation.x =
    Math.PI / 2;

  sandboxBorder.material =
    materials.wood;

  sandboxBorder.parent =
    recreationRoot;

  // =========================
  // SENDEROS DEL PARQUE
  // =========================

  createBox(
    "parkMainPath",
    165,
    0.12,
    5,
    new BABYLON.Vector3(
      -8,
      0.18,
      147
    ),
    pathMat,
    recreationRoot
  );

  createBox(
    "parkCrossPath",
    5,
    0.12,
    58,
    new BABYLON.Vector3(
      -30,
      0.18,
      147
    ),
    pathMat,
    recreationRoot
  );

  createBox(
    "playgroundPath",
    5,
    0.12,
    45,
    new BABYLON.Vector3(
      5,
      0.18,
      145
    ),
    pathMat,
    recreationRoot
  );

  // =========================
  // ÁRBOLES DEL PARQUE
  // =========================

  function createParkTree(
    x: number,
    z: number,
    scale: number = 1
  ) {
    const treeRoot =
      new BABYLON.TransformNode(
        "recreationParkTree",
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

    treeRoot.rotation.y =
      Math.random() * Math.PI;

    treeRoot.parent =
      recreationRoot;

    const trunk =
      BABYLON.MeshBuilder.CreateCylinder(
        "parkTreeTrunk",
        {
          height: 5.6,
          diameterTop: 0.65,
          diameterBottom: 1.1,
          tessellation: 9,
        },
        scene
      );

    trunk.position.y = 2.8;
    trunk.material =
      materials.trunk;

    trunk.parent =
      treeRoot;

    trunk.isPickable =
      false;

    for (
      const crownData of [
        {
          x: 0,
          y: 6.1,
          z: 0,
          size: 5.8,
        },
        {
          x: -1.9,
          y: 5.7,
          z: 0,
          size: 4.2,
        },
        {
          x: 1.8,
          y: 5.8,
          z: 0.5,
          size: 4.4,
        },
        {
          x: 0.2,
          y: 5.6,
          z: -1.8,
          size: 4.1,
        },
      ]
    ) {
      const crown =
        BABYLON.MeshBuilder.CreateSphere(
          "parkTreeCrown",
          {
            diameter:
              crownData.size,
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
        0.84;

      crown.material =
        materials.leaf;

      crown.parent =
        treeRoot;

      crown.isPickable =
        false;
    }
  }

  const treePositions = [
    [
      -82,
      127,
      1.1,
    ],
    [
      -64,
      137,
      0.95,
    ],
    [
      -48,
      124,
      1.05,
    ],
    [
      -30,
      132,
      1.1,
    ],
    [
      -12,
      126,
      0.95,
    ],
    [
      -92,
      151,
      1.15,
    ],
    [
      -72,
      158,
      1,
    ],
    [
      -54,
      151,
      1.1,
    ],
    [
      -35,
      163,
      0.95,
    ],
    [
      -15,
      158,
      1.05,
    ],
    [
      0,
      167,
      0.95,
    ],
    [
      85,
      132,
      0.9,
    ],
    [
      93,
      153,
      1.05,
    ],
    [
      83,
      168,
      0.95,
    ],
  ] as Array<
    [
      number,
      number,
      number
    ]
  >;

  for (
    const [
      x,
      z,
      scale,
    ] of treePositions
  ) {
    createParkTree(
      x,
      z,
      scale
    );
  }

  // =========================
  // ARBUSTOS DEL PARQUE
  // =========================

  function createParkBush(
    x: number,
    z: number,
    scale: number = 1
  ) {
    const bushRoot =
      new BABYLON.TransformNode(
        "recreationBushRoot",
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

    bushRoot.parent =
      recreationRoot;

    for (
      const position of [
        new BABYLON.Vector3(
          -0.7,
          0.75,
          0
        ),
        new BABYLON.Vector3(
          0.65,
          0.75,
          0
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
          "recreationBush",
          {
            diameter: 2,
            segments: 8,
          },
          scene
        );

      bush.position.copyFrom(
        position
      );

      bush.scaling.y =
        0.72;

      bush.material =
        materials.hedge;

      bush.parent =
        bushRoot;

      bush.isPickable =
        false;
    }
  }

  for (
    let x = -95;
    x <= 95;
    x += 12
  ) {
    createParkBush(
      x,
      118,
      0.75
    );

    createParkBush(
      x + 5,
      174,
      0.72
    );
  }

  for (
    const [
      x,
      z,
    ] of [
      [
        -78,
        143,
      ],
      [
        -60,
        146,
      ],
      [
        -43,
        140,
      ],
      [
        -24,
        153,
      ],
      [
        -4,
        139,
      ],
      [
        6,
        158,
      ],
      [
        87,
        143,
      ],
      [
        88,
        160,
      ],
    ]
  ) {
    createParkBush(
      x,
      z,
      0.8
    );
  }

  // =========================
  // BANCAS DEL PARQUE
  // =========================

  function createParkBench(
    x: number,
    z: number,
    rotationY: number
  ) {
    const benchRoot =
      new BABYLON.TransformNode(
        "recreationParkBench",
        scene
      );

    benchRoot.position.set(
      x,
      0,
      z
    );

    benchRoot.rotation.y =
      rotationY;

    benchRoot.parent =
      recreationRoot;

    createBox(
      "parkBenchSeat",
      3.8,
      0.28,
      0.8,
      new BABYLON.Vector3(
        0,
        0.82,
        0
      ),
      materials.wood,
      benchRoot
    );

    createBox(
      "parkBenchBack",
      3.8,
      1.3,
      0.2,
      new BABYLON.Vector3(
        0,
        1.45,
        0.4
      ),
      materials.wood,
      benchRoot
    );

    for (
      const xPosition of [
        -1.35,
        1.35,
      ]
    ) {
      createBox(
        "parkBenchLeg",
        0.22,
        0.9,
        0.22,
        new BABYLON.Vector3(
          xPosition,
          0.45,
          0
        ),
        materials.dark,
        benchRoot
      );
    }
  }

  createParkBench(
    -77,
    146,
    Math.PI / 2
  );

  createParkBench(
    -55,
    160,
    Math.PI
  );

  createParkBench(
    -27,
    141,
    0
  );

  createParkBench(
    -7,
    160,
    Math.PI
  );

  createParkBench(
    7,
    134,
    0
  );

  createParkBench(
    84,
    145,
    -Math.PI / 2
  );

  // =========================
  // FAROLES DEL PARQUE
  // =========================

  function createParkLamp(
    x: number,
    z: number
  ) {
    createBox(
      "parkLampPole",
      0.22,
      4.8,
      0.22,
      new BABYLON.Vector3(
        x,
        2.4,
        z
      ),
      materials.dark,
      recreationRoot
    );

    const lamp =
      BABYLON.MeshBuilder.CreateSphere(
        "parkLamp",
        {
          diameter: 0.62,
          segments: 10,
        },
        scene
      );

    lamp.position.set(
      x,
      4.8,
      z
    );

    lamp.material =
      materials.warm;

    lamp.parent =
      recreationRoot;

    lamp.isPickable =
      false;
  }

  for (
    const [
      x,
      z,
    ] of [
      [
        -78,
        147,
      ],
      [
        -58,
        147,
      ],
      [
        -38,
        147,
      ],
      [
        -18,
        147,
      ],
      [
        2,
        147,
      ],
      [
        12,
        147,
      ],
      [
        80,
        147,
      ],
    ]
  ) {
    createParkLamp(
      x,
      z
    );
  }

}