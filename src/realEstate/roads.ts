import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createProjectRoads(
  ctx: ProjectContext
) {
  const {
    createBox,
    materials,
    addRoadSegment,
  } = ctx;

  // =========================
  // FUNCIÓN GENERAL DE CALLES
  // =========================

  const createRoad = (
    name: string,
    a: BABYLON.Vector3,
    b: BABYLON.Vector3,
    width: number,
    createCenterLine: boolean = true
  ) => {
    const direction =
      b.subtract(a);

    const length =
      direction.length();

    const midpoint =
      BABYLON.Vector3.Center(
        a,
        b
      );

    const rotationY =
      Math.atan2(
        direction.x,
        direction.z
      );

    // =========================
    // ACERA GENERAL
    // =========================

    const sidewalk =
      createBox(
        `${name}_sidewalk`,
        width + 6,
        0.14,
        length,
        new BABYLON.Vector3(
          midpoint.x,
          0.07,
          midpoint.z
        ),
        materials.sidewalk
      );

    sidewalk.rotation.y =
      rotationY;

    sidewalk.isPickable =
      false;

    // =========================
    // BORDILLO
    // =========================

    const curb =
      createBox(
        `${name}_curb`,
        width + 1.6,
        0.10,
        length,
        new BABYLON.Vector3(
          midpoint.x,
          0.15,
          midpoint.z
        ),
        materials.curb
      );

    curb.rotation.y =
      rotationY;

    curb.isPickable =
      false;

    // =========================
    // PAVIMENTO
    // =========================

    const road =
      createBox(
        name,
        width,
        0.12,
        length,
        new BABYLON.Vector3(
          midpoint.x,
          0.22,
          midpoint.z
        ),
        materials.road
      );

    road.rotation.y =
      rotationY;

    road.isPickable =
      false;

    // =========================
    // LÍNEAS CENTRALES
    // =========================

    if (createCenterLine) {
      const normalized =
        direction.normalize();

      for (
        let distance = 7;
        distance < length - 5;
        distance += 17
      ) {
        const dashLength =
          Math.min(
            7,
            length - distance - 3
          );

        if (dashLength <= 0) {
          continue;
        }

        const dashMid =
          a.add(
            normalized.scale(
              distance +
              dashLength / 2
            )
          );

        const dash =
          createBox(
            `${name}_line`,
            0.22,
            0.035,
            dashLength,
            new BABYLON.Vector3(
              dashMid.x,
              0.295,
              dashMid.z
            ),
            materials.line
          );

        dash.rotation.y =
          rotationY;

        dash.isPickable =
          false;
      }
    }

    // =========================
    // REGISTRO PARA EL VEHÍCULO
    // =========================

    addRoadSegment?.({
      a: a.clone(),
      b: b.clone(),
      radius:
        width / 2 + 3.2,
      name,
      oneway: false,
    });
  };

  // =========================
  // AVENIDA PRINCIPAL
  // =========================
  // Antes terminaba en Z = 155.
  // Ahora llega hasta la calle posterior.

  createRoad(
    "Avenida Principal",
    new BABYLON.Vector3(
      0,
      0,
      -180
    ),
    new BABYLON.Vector3(
      0,
      0,
      188
    ),
    18
  );

  // =========================
  // CALLES HORIZONTALES
  // =========================

  createRoad(
    "Boulevard Principal",
    new BABYLON.Vector3(
      -175,
      0,
      -85
    ),
    new BABYLON.Vector3(
      175,
      0,
      -85
    ),
    10
  );

  createRoad(
    "Calle Jardines",
    new BABYLON.Vector3(
      -175,
      0,
      -20
    ),
    new BABYLON.Vector3(
      175,
      0,
      -20
    ),
    10
  );

  createRoad(
    "Calle del Parque",
    new BABYLON.Vector3(
      -175,
      0,
      48
    ),
    new BABYLON.Vector3(
      175,
      0,
      48
    ),
    10
  );

  createRoad(
    "Calle Club House",
    new BABYLON.Vector3(
      -175,
      0,
      118
    ),
    new BABYLON.Vector3(
      175,
      0,
      118
    ),
    10
  );

  // =========================
  // NUEVA CALLE POSTERIOR
  // =========================
  // Queda frente al Club House,
  // parque infantil y piscina.
  //
  // Los servicios están alrededor
  // de Z = 220.
  // Esta calle queda en Z = 185,
  // dejando jardín y separación.

  createRoad(
    "Paseo Recreacional",
    new BABYLON.Vector3(
      -175,
      0,
      185
    ),
    new BABYLON.Vector3(
      175,
      0,
      185
    ),
    12
  );

  // =========================
  // CALLE LATERAL IZQUIERDA
  // =========================
  // Conecta todas las calles por
  // el extremo izquierdo.

  createRoad(
    "Avenida Lateral Oeste",
    new BABYLON.Vector3(
      -175,
      0,
      -85
    ),
    new BABYLON.Vector3(
      -175,
      0,
      185
    ),
    10
  );

  // =========================
  // CALLE LATERAL DERECHA
  // =========================
  // Conecta todas las calles por
  // el extremo derecho.

  createRoad(
    "Avenida Lateral Este",
    new BABYLON.Vector3(
      175,
      0,
      -85
    ),
    new BABYLON.Vector3(
      175,
      0,
      185
    ),
    10
  );

  // =========================
  // ACCESO AL CLUB HOUSE
  // =========================
  // El Club House está ubicado en:
  // X = -135
  // Z = 220
  //
  // Este acceso sale desde la calle
  // posterior y termina antes de
  // llegar a su plataforma.

  createRoad(
    "Acceso Club House",
    new BABYLON.Vector3(
      -135,
      0,
      185
    ),
    new BABYLON.Vector3(
      -135,
      0,
      195
    ),
    8,
    false
  );

  // =========================
  // ACCESO A LA PISCINA
  // =========================
  // La piscina está ubicada en:
  // X = 125
  // Z = 220

  createRoad(
    "Acceso Piscina",
    new BABYLON.Vector3(
      125,
      0,
      185
    ),
    new BABYLON.Vector3(
      125,
      0,
      195
    ),
    8,
    false
  );

  // =========================
  // ACCESO AL PARQUE INFANTIL
  // =========================
  // Sendero vehicular corto hacia
  // una pequeña zona de descenso.
  //
  // No entra dentro de los juegos.

  createRoad(
    "Acceso Parque Infantil",
    new BABYLON.Vector3(
      45,
      0,
      185
    ),
    new BABYLON.Vector3(
      45,
      0,
      195
    ),
    8,
    false
  );

  // =========================
  // ZONAS DE RETORNO
  // =========================
  // Pequeños espacios rectangulares
  // al final de los accesos para que
  // el vehículo pueda maniobrar.

  const clubDropOff =
    createBox(
      "clubHouseDropOff",
      25,
      0.12,
      10,
      new BABYLON.Vector3(
        -135,
        0.22,
        199
      ),
      materials.road
    );

  clubDropOff.isPickable =
    false;

  const poolDropOff =
    createBox(
      "poolDropOff",
      25,
      0.12,
      10,
      new BABYLON.Vector3(
        125,
        0.22,
        199
      ),
      materials.road
    );

  poolDropOff.isPickable =
    false;

  const playgroundDropOff =
    createBox(
      "playgroundDropOff",
      24,
      0.12,
      10,
      new BABYLON.Vector3(
        45,
        0.22,
        199
      ),
      materials.road
    );

  playgroundDropOff.isPickable =
    false;

  // Registrar las zonas de retorno
  // para que el auto pueda utilizarlas.

  addRoadSegment?.({
    a: new BABYLON.Vector3(
      -146,
      0,
      199
    ),
    b: new BABYLON.Vector3(
      -124,
      0,
      199
    ),
    radius: 7,
    name:
      "Estacionamiento Club House",
    oneway: false,
  });

  addRoadSegment?.({
    a: new BABYLON.Vector3(
      114,
      0,
      199
    ),
    b: new BABYLON.Vector3(
      136,
      0,
      199
    ),
    radius: 7,
    name:
      "Estacionamiento Piscina",
    oneway: false,
  });

  addRoadSegment?.({
    a: new BABYLON.Vector3(
      35,
      0,
      199
    ),
    b: new BABYLON.Vector3(
      55,
      0,
      199
    ),
    radius: 7,
    name:
      "Estacionamiento Parque Infantil",
    oneway: false,
  });
}