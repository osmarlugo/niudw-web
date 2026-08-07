import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import earcut from "earcut";

import { createRealEstateProject } from "./realEstate";

import { supabase } from "./supabaseClient";

supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase error:", error.message);
  } else {
    console.log("Supabase OK. Sesión:", data.session ? "activa" : "ninguna");
  }
});

// Canvas
const canvas = document.createElement("canvas");
canvas.id = "renderCanvas";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.display = "block";
canvas.tabIndex = 0;
canvas.style.outline = "none";

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(canvas);
canvas.focus();

window.addEventListener("click", (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;

  // Si se hace clic en inputs, botones o en la pantalla de auth, NO quitar el foco
  if (
    target.closest(
      "input, textarea, select, button, label, a, [contenteditable='true']"
    ) ||
    target.closest("#niuAuthScreen") ||
    target.closest("#socialWindow")
  ) {
    return;
  }

  canvas.focus();
});

// Engine + Scene
const engine = new BABYLON.Engine(canvas, false);
engine.setHardwareScalingLevel(0.7);
const scene = new BABYLON.Scene(engine);
scene.skipPointerMovePicking = true;
scene.useRightHandedSystem = false;

// Grupo 0: calles y edificios.
// Grupo 1: auras transparentes.
// Grupo 2: carteles y billboards.
scene.setRenderingAutoClearDepthStencil(
  1,
  false
);

scene.setRenderingAutoClearDepthStencil(
  2,
  false
);
scene.clearColor = new BABYLON.Color4(0.72, 0.86, 1, 1);
// =========================
// NEBLINA SUAVE ESTILO MIRAFLORES
// =========================

scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;

// Color gris azulado suave
scene.fogColor = new BABYLON.Color3(0.72, 0.78, 0.82);

// Intensidad de la neblina
scene.fogDensity = 0.007;

// Luz
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 1;

// =========================
// SISTEMA DIA / NOCHE REAL LIMA
// =========================

function getCurrentCityTimeZone() {
  if (currentMapName === "manhattan") {
    return "America/New_York";
  }

  if (currentMapName === "beverly-hills") {
    return "America/Los_Angeles";
  }

  return "America/Lima";
}

function getCurrentCityHour() {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      hour12: false,
      timeZone: getCurrentCityTimeZone(),
    }
  );

  return Number(
    formatter.format(new Date())
  );
}
function updateDayNightCycle() {
  const hour = getCurrentCityHour();

  const isBeverly = currentMapName === "beverly-hills";

  const isRealEstate =
  currentMapName === "real-estate";

if (isRealEstate) {
  scene.fogMode =
    BABYLON.Scene.FOGMODE_EXP2;

  if (hour >= 7 && hour < 17) {
    scene.clearColor =
      new BABYLON.Color4(
        0.60,
        0.82,
        1,
        1
      );

    scene.fogColor =
      new BABYLON.Color3(
        0.60,
        0.78,
        0.90
      );

    scene.fogDensity = 0.0018;
    light.intensity = 1.08;
  } else if (
    hour >= 17 &&
    hour < 19
  ) {
    scene.clearColor =
      new BABYLON.Color4(
        0.76,
        0.42,
        0.22,
        1
      );

    scene.fogColor =
      new BABYLON.Color3(
        0.64,
        0.37,
        0.26
      );

    scene.fogDensity = 0.0025;
    light.intensity = 0.65;
  } else {
    scene.clearColor =
      new BABYLON.Color4(
        0.018,
        0.025,
        0.070,
        1
      );

    scene.fogColor =
      new BABYLON.Color3(
        0.018,
        0.025,
        0.070
      );

    scene.fogDensity = 0.003;
    light.intensity = 0.36;
  }

  return;
}

  console.log("Ciudad:", currentMapName, "Hora:", hour);

  if (isBeverly) {
    scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    scene.fogDensity = 0;

    if (hour >= 7 && hour < 17) {
      scene.clearColor = new BABYLON.Color4(0.72, 0.86, 1, 1);
      light.intensity = 1;
    } else if (hour >= 17 && hour < 19) {
      scene.clearColor = new BABYLON.Color4(0.70, 0.38, 0.20, 1);
      light.intensity = 0.62;
    } else {
      scene.clearColor = new BABYLON.Color4(0.055, 0.055, 0.095, 1);
      light.intensity = 0.42;
    }

    return;
  }

  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;

  if (hour >= 0 && hour < 5) {
    scene.clearColor = new BABYLON.Color4(0.015, 0.015, 0.035, 1);
    scene.fogColor = new BABYLON.Color3(0.015, 0.015, 0.035);
    scene.fogDensity = 0.030;
    light.intensity = 0.16;
  } else if (hour >= 5 && hour < 7) {
    scene.clearColor = new BABYLON.Color4(0.45, 0.35, 0.28, 1);
    scene.fogColor = new BABYLON.Color3(0.45, 0.35, 0.28);
    scene.fogDensity = 0.012;
    light.intensity = 0.4;
  } else if (hour >= 7 && hour < 17) {
    scene.clearColor = new BABYLON.Color4(0.72, 0.86, 1, 1);
    scene.fogColor = new BABYLON.Color3(0.72, 0.78, 0.82);
    scene.fogDensity = 0.007;
    light.intensity = 1;
  } else if (hour >= 17 && hour < 19) {
    scene.clearColor = new BABYLON.Color4(0.75, 0.45, 0.2, 1);
    scene.fogColor = new BABYLON.Color3(0.75, 0.45, 0.2);
    scene.fogDensity = 0.008;
    light.intensity = 0.55;
  } else {
    scene.clearColor = new BABYLON.Color4(0.025, 0.025, 0.055, 1);
    scene.fogColor = new BABYLON.Color3(0.025, 0.025, 0.055);
    scene.fogDensity = 0.011;
    light.intensity = 0.30;
  }
    // =========================
  // MANHATTAN - más neblina
  // =========================
  if (currentMapName === "manhattan") {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;

    if (hour >= 0 && hour < 5) {
      scene.clearColor = new BABYLON.Color4(0.015, 0.015, 0.035, 1);
      scene.fogColor = new BABYLON.Color3(0.015, 0.015, 0.035);
      scene.fogDensity = 0.040;   // noche: más densa
      light.intensity = 0.16;
    } else if (hour >= 5 && hour < 7) {
      scene.clearColor = new BABYLON.Color4(0.45, 0.35, 0.28, 1);
      scene.fogColor = new BABYLON.Color3(0.45, 0.35, 0.28);
      scene.fogDensity = 0.018;   // amanecer
      light.intensity = 0.4;
    } else if (hour >= 7 && hour < 17) {
      scene.clearColor = new BABYLON.Color4(0.72, 0.86, 1, 1);
      scene.fogColor = new BABYLON.Color3(0.70, 0.76, 0.82);
      scene.fogDensity = 0.013;   // día: más neblina que antes
      light.intensity = 1;
    } else if (hour >= 17 && hour < 19) {
      scene.clearColor = new BABYLON.Color4(0.75, 0.45, 0.2, 1);
      scene.fogColor = new BABYLON.Color3(0.75, 0.45, 0.2);
      scene.fogDensity = 0.017;   // atardecer
      light.intensity = 0.55;
    } else {
      scene.clearColor = new BABYLON.Color4(0.025, 0.025, 0.055, 1);
      scene.fogColor = new BABYLON.Color3(0.025, 0.025, 0.055);
      scene.fogDensity = 0.025;   // noche
      light.intensity = 0.30;
    }

    return;
  }

  // =========================
  // MIRAFLORES - menos neblina
  // =========================
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;

  if (hour >= 0 && hour < 5) {
    scene.clearColor = new BABYLON.Color4(0.015, 0.015, 0.035, 1);
    scene.fogColor = new BABYLON.Color3(0.015, 0.015, 0.035);
    scene.fogDensity = 0.0099;   // antes 0.030
    light.intensity = 0.16;
  } else if (hour >= 5 && hour < 7) {
    scene.clearColor = new BABYLON.Color4(0.45, 0.35, 0.28, 1);
    scene.fogColor = new BABYLON.Color3(0.45, 0.35, 0.28);
    scene.fogDensity = 0.0055;   // antes 0.012
    light.intensity = 0.4;
  } else if (hour >= 7 && hour < 17) {
    scene.clearColor = new BABYLON.Color4(0.72, 0.86, 1, 1);
    scene.fogColor = new BABYLON.Color3(0.72, 0.78, 0.82);
    scene.fogDensity = 0.0025;  // antes 0.007  → más clara
    light.intensity = 1;
  } else if (hour >= 17 && hour < 19) {
    scene.clearColor = new BABYLON.Color4(0.75, 0.45, 0.2, 1);
    scene.fogColor = new BABYLON.Color3(0.75, 0.45, 0.2);
    scene.fogDensity = 0.0040;  // antes 0.008
    light.intensity = 0.55;
  } else {
    scene.clearColor = new BABYLON.Color4(0.025, 0.025, 0.055, 1);
    scene.fogColor = new BABYLON.Color3(0.025, 0.025, 0.055);
    scene.fogDensity = 0.0060;   // antes ~0.011
    light.intensity = 0.30;
  }
}

// Cámara
const camera = new BABYLON.ArcRotateCamera(
  "camera",
  Math.PI / 2,
  Math.PI / 3,
  28,
  new BABYLON.Vector3(0, 0, 0),
  scene
);

camera.attachControl(canvas, true);
camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

// Limitar zoom
camera.lowerRadiusLimit = 10; // máximo acercamiento
camera.upperRadiusLimit = 50; // máximo alejamiento

// Suavizar zoom
camera.wheelDeltaPercentage = 0.015;

// Mouse vertical casi libre para mirar edificios y cielo
camera.lowerBetaLimit = 0.02; // mirar casi directo al cielo
camera.upperBetaLimit = Math.PI - 1.52; // mirar bastante hacia abajo

// Hace que el mouse vertical responda mejor
camera.angularSensibilityY = 700;
camera.angularSensibilityX = 700;

// Materiales
function mat(
  name: string,
  color: BABYLON.Color3
) {
  const m = new BABYLON.StandardMaterial(
    name,
    scene
  );

  m.diffuseColor = color;

  // Evita que demasiadas luces modifiquen el mismo
  // material y provoquen recompilaciones o destellos.
  m.maxSimultaneousLights = 4;

  // Elimina reflejos exagerados provocados por
  // faros y luces de establecimientos.
  m.specularColor = new BABYLON.Color3(
    0.06,
    0.06,
    0.06
  );

  return m;
}
function configureTransparentMaterial(
  material: BABYLON.StandardMaterial,
  alpha: number
) {
  material.alpha = alpha;

  // Evita que se vean simultáneamente las caras
  // internas y externas de una caja transparente.
  material.backFaceCulling = true;

  // Renderiza primero la profundidad del objeto.
  material.needDepthPrePass = true;

  // Evita que Babylon cambie entre distintos
  // modos de transparencia durante el render.
  material.transparencyMode =
    BABYLON.Material.MATERIAL_ALPHABLEND;

  // Reduce los reflejos de faros sobre cristales.
  material.specularColor =
    new BABYLON.Color3(
      0.12,
      0.12,
      0.12
    );

  material.maxSimultaneousLights = 2;
}

const baseMat = mat("baseMat", new BABYLON.Color3(0.68, 0.68, 0.64));
const streetMat = mat("streetMat", new BABYLON.Color3(0.07, 0.07, 0.07));
const curbMat = mat("curbMat", new BABYLON.Color3(0.82, 0.82, 0.78));
const lineMat = mat("lineMat", new BABYLON.Color3(1, 1, 1));
const parkMat = mat(
  "parkMat",
  new BABYLON.Color3(0.055, 0.42, 0.10)
);

parkMat.specularColor = new BABYLON.Color3(
  0.02,
  0.02,
  0.02
);

parkMat.emissiveColor = new BABYLON.Color3(
  0.008,
  0.055,
  0.012
);

parkMat.backFaceCulling = false;


const grassMat = mat(
  "grassMat",
  new BABYLON.Color3(0.10, 0.52, 0.14)
);

grassMat.specularColor = new BABYLON.Color3(
  0.02,
  0.02,
  0.02
);

grassMat.emissiveColor = new BABYLON.Color3(
  0.01,
  0.065,
  0.015
);

grassMat.backFaceCulling = false;
const avatarMat = mat("avatarMat", new BABYLON.Color3(0.1, 0.45, 1));
const skinMat = mat("skinMat", new BABYLON.Color3(0.9, 0.72, 0.55));
const treeMat = mat("treeMat", new BABYLON.Color3(0.04, 0.32, 0.08));
const trunkMat = mat("trunkMat", new BABYLON.Color3(0.35, 0.18, 0.08));

// Base
const base = BABYLON.MeshBuilder.CreateGround(
  "base",
  {
    width: 12000,
    height: 12000,
  },
  scene
);

base.position.y = -0.03;
base.material = baseMat;
base.isPickable = false;
base.receiveShadows = false;
base.freezeWorldMatrix();

// Centro aproximado Parque Kennedy
let centerLon = -77.0301;
let centerLat = -12.1219;
let currentMapName = "miraflores";
let unlockedCities: string[] = ["miraflores"];
let salesBoothAura: BABYLON.Mesh;
let centrixAura: BABYLON.Mesh;
let gasStationAura: BABYLON.Mesh | null = null;
// =========================
// UBICACIÓN FIJA GASOLINERA KENNEDY
// =========================

const KENNEDY_GAS_STATION = {
  lon: -77.02830097627451,
  lat: -12.122606741315908,
  rotationY: 0,
};

type GasStationTrigger = {
  root: BABYLON.Mesh;
  aura: BABYLON.Mesh;
  worldPosition: BABYLON.Vector3;
};

const gasStationTriggers: GasStationTrigger[] = [];
const gasStationLights: BABYLON.PointLight[] = [];
let niuTravelAura: BABYLON.Mesh;
let niuTravelWindowOpen = false;
let niuTravelCooldown = false;
let niuTravelInProgress = false;

// Luces creadas por las terminales Niu Travel
const niuTravelLights: BABYLON.Light[] = [];
let centrixWebOpened = false;
let insideOlivarMap = false;

// =========================
// VENTANA PROYECTO INMOBILIARIO
// =========================

let realEstateEntryWindowOpen = false;
let realEstateEntryCooldown = false;
let realEstateTravelInProgress = false;

// Evita que la ventana se abra repetidamente
// mientras el avatar o el auto continúan dentro del aro.
let salesBoothAuraWasTouched = false;
// Indica que la página se recargó para regresar
// automáticamente desde El Olivar a Parque Kennedy.
const RETURN_TO_LIMA_KEY =
  "niuwd_return_to_lima";
const activeMapMeshes: BABYLON.AbstractMesh[] = [];

// =========================
// NIU MARKET
// =========================

let niuMarketAura: BABYLON.Mesh | null = null;
let niuMarketWindowOpen = false;
let niuMarketCooldown = false;

// Luces creadas por Niu Market
const niuMarketLights: BABYLON.Light[] = [];
type NiuStoreLightEntry = {
  root: BABYLON.Mesh;
  light: BABYLON.Light;
};

const niuStoreLightEntries: NiuStoreLightEntry[] = [];

function lonLatToWorld(lon: number, lat: number) {
  const metersPerDegreeLat = 110540;
  const metersPerDegreeLon = 111320 * Math.cos((centerLat * Math.PI) / 180);

  const x = (lon - centerLon) * metersPerDegreeLon;
  const z = (lat - centerLat) * metersPerDegreeLat;

  return new BABYLON.Vector3(x, 0, z);
}

function roadWidth(type: string) {
  if (type === "primary") return 13;
  if (type === "primary_link") return 12;
  if (type === "secondary") return 12;
  if (type === "secondary_link") return 11;
  if (type === "tertiary") return 10;
  if (type === "tertiary_link") return 9;
  if (type === "residential") return 8;
  if (type === "service") return 7;
  if (type === "unclassified") return 8;
  if (type === "living_street") return 7;

  if (type === "footway") return 0;
  if (type === "path") return 0;
  if (type === "cycleway") return 0;
  if (type === "steps") return 0;
  if (type === "pedestrian") return 0;

  return 7;
}

type RoadSegment = {
  a: BABYLON.Vector3;
  b: BABYLON.Vector3;
  radius: number;
  name?: string;
  oneway?: boolean;
};

const roadSegments: RoadSegment[] = [];
const gpsRoadSegments: RoadSegment[] = [];

let gpsGraphLoaded = false;
let gpsLoadedMapName = "";

// Devuelve los archivos GPS correspondientes
// a la ciudad que está cargada actualmente.
function getGpsMapFiles(): string[] {
  if (currentMapName === "manhattan") {
    return [
      "manhattan.geojson",
    ];
  }

  if (currentMapName === "beverly-hills") {
    return [
      "beverly-hills.geojson",
    ];
  }

  if (currentMapName === "miraflores") {
    return [
      "miraflores-zona-kennedy.geojson",
      "miraflores-zona-oeste.geojson",
      "miraflores-zona-sur.geojson",
      "miraflores-zona-este.geojson",
    ];
  }

  return [];
}

async function loadGpsGraph(
  forceReload: boolean = false
) {
  /*
   * No reutilizar el grafo de otra ciudad.
   *
   * Las posiciones GPS se calculan con centerLon
   * y centerLat. Cuando cambiamos de ciudad,
   * esas coordenadas cambian completamente.
   */
  const mapChanged =
    gpsLoadedMapName !== currentMapName;

  if (
    gpsGraphLoaded &&
    !forceReload &&
    !mapChanged
  ) {
    return;
  }

  gpsRoadSegments.length = 0;
  gpsGraphLoaded = false;
  gpsLoadedMapName = "";

  const gpsFiles =
    getGpsMapFiles();

  if (gpsFiles.length === 0) {
    console.warn(
      "No existen archivos GPS configurados para:",
      currentMapName
    );

    return;
  }

  console.log(
    "Cargando GPS para:",
    currentMapName,
    gpsFiles
  );

  for (const fileName of gpsFiles) {
    try {
      const response =
        await fetch(
          `/data/${fileName}`
        );

      if (!response.ok) {
        console.warn(
          `No se pudo cargar el archivo GPS: ${fileName}`
        );

        continue;
      }

      const geojson =
        await response.json();

      for (
        const feature of
        geojson.features || []
      ) {
        const props =
          feature.properties || {};

        const geometry =
          feature.geometry;

        if (
          !props.highway ||
          geometry?.type !== "LineString"
        ) {
          continue;
        }

        const width =
          roadWidth(
            props.highway
          );

        if (width === 0) {
          continue;
        }

        const coords =
          geometry.coordinates;

        if (
          !Array.isArray(coords) ||
          coords.length < 2
        ) {
          continue;
        }

        for (
          let i = 0;
          i < coords.length - 1;
          i++
        ) {
          const coordinateA =
            coords[i];

          const coordinateB =
            coords[i + 1];

          if (
            !Array.isArray(coordinateA) ||
            !Array.isArray(coordinateB)
          ) {
            continue;
          }

          const a =
            lonLatToWorld(
              coordinateA[0],
              coordinateA[1]
            );

          const b =
            lonLatToWorld(
              coordinateB[0],
              coordinateB[1]
            );

          if (
            BABYLON.Vector3.Distance(
              a,
              b
            ) < 0.2
          ) {
            continue;
          }

          gpsRoadSegments.push({
            a,
            b,
            radius:
              width / 2 + 7,
            name:
              props.name,
            oneway:
              props.oneway === "yes" ||
              props.oneway === "1" ||
              props.oneway === true,
          });
        }
      }
    } catch (error) {
      console.error(
        `Error cargando GPS ${fileName}:`,
        error
      );
    }
  }

  gpsGraphLoaded =
    gpsRoadSegments.length > 0;

  gpsLoadedMapName =
    gpsGraphLoaded
      ? currentMapName
      : "";

  console.log(
    "GPS cargado:",
    {
      ciudad: currentMapName,
      segmentos:
        gpsRoadSegments.length,
    }
  );
}
type SidewalkPath = {
  a: BABYLON.Vector3;
  b: BABYLON.Vector3;
};

const sidewalkPaths: SidewalkPath[] = [];

function closestPointOnSegment(
  p: BABYLON.Vector3,
  a: BABYLON.Vector3,
  b: BABYLON.Vector3
) {
  const ab = b.subtract(a);
  const ap = p.subtract(a);
  const t = Math.max(0, Math.min(1, BABYLON.Vector3.Dot(ap, ab) / BABYLON.Vector3.Dot(ab, ab)));
  return a.add(ab.scale(t));
}

function getNearestSidewalkPoint(pos: BABYLON.Vector3) {
  let bestPoint = pos.clone();
  let bestDist = Infinity;

  for (const path of sidewalkPaths) {
    const point = closestPointOnSegment(pos, path.a, path.b);
    const dist = BABYLON.Vector3.Distance(pos, point);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = point;
    }
  }

  bestPoint.y = 1;
  return bestPoint;
}

function getRandomSidewalkTarget() {
  if (sidewalkPaths.length === 0) {
    return new BABYLON.Vector3(0, 1, 0);
  }

  const path = sidewalkPaths[Math.floor(Math.random() * sidewalkPaths.length)];
  const t = Math.random();

  const target = BABYLON.Vector3.Lerp(path.a, path.b, t);
  target.y = 1;

  return target;
}
function getNearestSidewalkPath(pos: BABYLON.Vector3): SidewalkPath {
  if (sidewalkPaths.length === 0) {
    return {
      a: new BABYLON.Vector3(0, 1, 0),
      b: new BABYLON.Vector3(5, 1, 0),
    };
  }

  let bestPath = sidewalkPaths[0];
  let bestDist = Infinity;

  for (const path of sidewalkPaths) {
    const point = closestPointOnSegment(pos, path.a, path.b);
    const dist = BABYLON.Vector3.Distance(pos, point);

    if (dist < bestDist) {
      bestDist = dist;
      bestPath = path;
    }
  }

  return bestPath;
}
// =========================
// SISTEMA DE CHUNKS POR SECTOR
// =========================

const CHUNK_SIZE = 180;
const ACTIVE_CHUNK_RADIUS = 1;

const chunks = new Map<string, BABYLON.AbstractMesh[]>();

function getChunkKeyFromPosition(pos: BABYLON.Vector3) {
  const chunkX = Math.floor(pos.x / CHUNK_SIZE);
  const chunkZ = Math.floor(pos.z / CHUNK_SIZE);

  return `${chunkX},${chunkZ}`;
}

function registerChunkMesh(mesh: BABYLON.AbstractMesh | null) {
  if (!mesh) return;

  const key = getChunkKeyFromPosition(mesh.position);

  if (!chunks.has(key)) {
    chunks.set(key, []);
  }

  chunks.get(key)!.push(mesh);
}

function updateChunks() {
  if (!player || !car) return;

  const reference = inCar ? car.position : player.position;

  const currentX = Math.floor(reference.x / CHUNK_SIZE);
  const currentZ = Math.floor(reference.z / CHUNK_SIZE);

  for (const [key, meshes] of chunks.entries()) {
    const [chunkX, chunkZ] = key.split(",").map(Number);

    const dx = Math.abs(chunkX - currentX);
    const dz = Math.abs(chunkZ - currentZ);

    const shouldShow =
      dx <= ACTIVE_CHUNK_RADIUS &&
      dz <= ACTIVE_CHUNK_RADIUS;

    for (const mesh of meshes) {
      mesh.setEnabled(shouldShow);
    }
  }
}
// =========================
// OPTIMIZACIÓN POR DISTANCIA
// =========================

const cullableMeshes: BABYLON.AbstractMesh[] = [];
const mapMeshes: BABYLON.AbstractMesh[] = [];
const mapVisibleDistance = 140;

function registerMapMesh(mesh: BABYLON.AbstractMesh | null) {
  if (!mesh) return;
  mapMeshes.push(mesh);
}

function updateMapVisibility() {
  if (!player || !car) return;

  const reference = inCar ? car.position : player.position;

  for (const mesh of mapMeshes) {
    const dist = BABYLON.Vector3.Distance(reference, mesh.position);
    mesh.setEnabled(dist < mapVisibleDistance);
  }
}
const visibleDistance = 200;
let cullingFrame = 0;

function registerCullable(mesh: BABYLON.AbstractMesh | null) {
  if (!mesh) return;
  cullableMeshes.push(mesh);
}

function updateCulling() {
  if (!player || !car) return;

  const reference =
    inCar
      ? car.position
      : player.position;

  const currentVisibleDistance =
    currentMapName === "real-estate"
      ? 330
      : visibleDistance;

  for (
    const mesh of cullableMeshes
  ) {
    const dist =
      BABYLON.Vector3.Distance(
        reference,
        mesh.position
      );

    mesh.setEnabled(
      dist < currentVisibleDistance
    );
  }
}

function createBoxAtSegment(
  name: string,
  a: BABYLON.Vector3,
  b: BABYLON.Vector3,
  width: number,
  height: number,
  y: number,
  material: BABYLON.Material
) {
  const length = BABYLON.Vector3.Distance(a, b);
  if (length < 0.2) return null;

  const mid = BABYLON.Vector3.Center(a, b);

  const box = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, depth: length, height },
    scene
  );

  box.position = new BABYLON.Vector3(mid.x, y, mid.z);

  const dx = b.x - a.x;
  const dz = b.z - a.z;
  box.rotation.y = Math.atan2(dx, dz);

  box.material = material;
  activeMapMeshes.push(box);
  registerChunkMesh(box);
  registerMapMesh(box);
  registerCullable(box);
  return box;
}

function createRoadDesign(a: BABYLON.Vector3, b: BABYLON.Vector3, roadW: number) {
  const length = BABYLON.Vector3.Distance(a, b);
  if (length < 8) return;

  const dir = b.subtract(a).normalize();

  const dashLength = 14;
  const gap = 28;
  let traveled = 2;

  while (traveled < length - 2) {
    const start = a.add(dir.scale(traveled));
    const end = a.add(dir.scale(Math.min(traveled + dashLength, length - 2)));

    createBoxAtSegment("center_line", start, end, 0.35, 0.035, 0.16, lineMat);

    traveled += dashLength + gap;
  }
  
}

function createRoad(
  a: BABYLON.Vector3,
  b: BABYLON.Vector3,
  width: number,
  streetName?: string,
  oneway?: boolean
) {
  const length = BABYLON.Vector3.Distance(a, b);
  if (length < 0.2) return;

  // Acera visual alrededor de la calle
  createBoxAtSegment("sidewalk", a, b, width + 7, 0.06, 0.04, baseMat);

  // Bordillo
  createBoxAtSegment("curb", a, b, width + 2.5, 0.04, 0.09, curbMat);

  // Calle
  createBoxAtSegment("road", a, b, width, 0.08, 0.08, streetMat);

  // Líneas blancas
  createRoadDesign(a, b, width);

  roadSegments.push({
  a,
  b,
  radius: width / 2 + 7,
  name: streetName,
  oneway,
});
// Rutas invisibles para NPCs sobre aceras
const roadDir = b.subtract(a).normalize();
const sideDir = new BABYLON.Vector3(-roadDir.z, 0, roadDir.x);

// Distancia desde el centro de la calle hacia la acera
const sidewalkOffset = width / 2 + 3.2;

const leftA = a.add(sideDir.scale(sidewalkOffset));
const leftB = b.add(sideDir.scale(sidewalkOffset));

const rightA = a.add(sideDir.scale(-sidewalkOffset));
const rightB = b.add(sideDir.scale(-sidewalkOffset));

sidewalkPaths.push({ a: leftA, b: leftB });
sidewalkPaths.push({ a: rightA, b: rightB });
}

function distancePointToSegment2D(p: BABYLON.Vector3, a: BABYLON.Vector3, b: BABYLON.Vector3) {
  const px = p.x;
  const pz = p.z;
  const ax = a.x;
  const az = a.z;
  const bx = b.x;
  const bz = b.z;

  const abx = bx - ax;
  const abz = bz - az;
  const apx = px - ax;
  const apz = pz - az;

  const abLenSq = abx * abx + abz * abz;

  if (abLenSq === 0) {
    const dx = px - ax;
    const dz = pz - az;
    return Math.sqrt(dx * dx + dz * dz);
  }

  let t = (apx * abx + apz * abz) / abLenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = ax + t * abx;
  const closestZ = az + t * abz;

  const dx = px - closestX;
  const dz = pz - closestZ;

  return Math.sqrt(dx * dx + dz * dz);
}

function isOnRoad(pos: BABYLON.Vector3) {
  return roadSegments.some((seg) => {
    const dist = distancePointToSegment2D(pos, seg.a, seg.b);
    return dist <= seg.radius;
  });
}

function createPolygon(
  name: string,
  points: BABYLON.Vector3[],
  material: BABYLON.Material,
  y: number
) {
  if (points.length < 3) return null;

  // Evitar que el primer y último punto estén duplicados
  const cleanPoints = [...points];

  if (
    cleanPoints.length > 3 &&
    BABYLON.Vector3.Distance(
      cleanPoints[0],
      cleanPoints[cleanPoints.length - 1]
    ) < 0.01
  ) {
    cleanPoints.pop();
  }

  if (cleanPoints.length < 3) return null;

  // Centro real del área para que chunks y culling funcionen
  let centerX = 0;
  let centerZ = 0;

  for (const point of cleanPoints) {
    centerX += point.x;
    centerZ += point.z;
  }

  centerX /= cleanPoints.length;
  centerZ /= cleanPoints.length;

  // Contorno local del polígono
  const contour = cleanPoints.map(
    (point) =>
      new BABYLON.Vector2(
        point.x - centerX,
        point.z - centerZ
      )
  );

  try {
    const polygonBuilder =
      new BABYLON.PolygonMeshBuilder(
        name,
        contour,
        scene,
        earcut
      );

    const mesh = polygonBuilder.build(
      false,
      0.04
    );

    mesh.position = new BABYLON.Vector3(
      centerX,
      y,
      centerZ
    );

    mesh.material = material;
    mesh.isPickable = false;
    mesh.receiveShadows = false;

    activeMapMeshes.push(mesh);
    registerChunkMesh(mesh);
    registerMapMesh(mesh);
    registerCullable(mesh);

    return mesh;
  } catch (error) {
    console.warn(
      "No se pudo crear el área verde:",
      name,
      error
    );

    return null;
  }
}

function getGroups(geometry: any): any[] {
  if (!geometry) return [];

  // Un polígono: [ anilloExterior, hueco1, hueco2... ]
  // Solo usamos el anillo exterior (índice 0)
  if (geometry.type === "Polygon") {
    const outer = geometry.coordinates?.[0];
    return outer ? [outer] : [];
  }

  // MultiPolygon: [ polígono1, polígono2... ]
  // Cada polígono = [ anilloExterior, huecos... ]
  if (geometry.type === "MultiPolygon") {
    const outers: any[] = [];
    for (const polygon of geometry.coordinates || []) {
      if (Array.isArray(polygon) && polygon[0]) {
        outers.push(polygon[0]);
      }
    }
    return outers;
  }

  if (geometry.type === "LineString") {
    return [geometry.coordinates];
  }

  return [];
}

function createTree(x: number, z: number) {
  const trunk = BABYLON.MeshBuilder.CreateCylinder(
    "treeTrunk",
    { height: 1.8, diameter: 0.22, tessellation: 8 },
    scene
  );
  trunk.position = new BABYLON.Vector3(x, 0.9, z);
  trunk.material = trunkMat;

  const top = BABYLON.MeshBuilder.CreateSphere(
    "treeTop",
    { diameter: 2.2, segments: 8 },
    scene
  );
  top.position = new BABYLON.Vector3(x, 2.2, z);
  top.material = treeMat;

  activeMapMeshes.push(trunk, top);
  registerChunkMesh(trunk);
  registerChunkMesh(top);
  registerCullable(trunk);
  registerCullable(top);
}

let player: BABYLON.Mesh;
let car: BABYLON.Mesh;
let inCar = false;
// =========================
// MANEJO DEL AUTO
// =========================

// =========================
// SISTEMA DE MISIONES
// =========================

type MissionStage = "inactive" | "pickup" | "delivery";

let missionStage: MissionStage = "inactive";
let raceMissionActive = false;
let raceGoingToStart = false;
let raceStarted = false;
let raceCountdownDone = false;
function cancelCurrentMission() {
    // ===== Multijugador =====
  // Solo al cancelar de verdad (tecla 3), NO al iniciar la carrera
  if (multiplayerRaceActive) {
    void cancelMultiplayerRaceSession();
  }

  // Carrera
  raceMissionActive = false;
  raceGoingToStart = false;
  raceStarted = false;
  raceCountdownDone = false;
  countdownActive = false;
  raceCountdownToken++; 
  clearMpReadyRetry();
  stopWaitingForRaceStart();
  mpLocalReadySent = false;

  // Misión Mansiones Beverly Hills
stopBeverlyMansionMission();

  // Misiones de entrega
  missionStage = "inactive";
  routeMissionActive = false;
currentRouteMission = null;
currentRouteIndex = 0;
deliveryMissionActive = false;
deliveryMissionStage = "inactive";
// Misión Entrega Medicina
medicineDeliveryMissionActive =
  false;

medicineDeliveryStage =
  "inactive";

medicineHospitalAuraTouched =
  false;

medicineHouseAuraTouched =
  false;

medicineMissionDefeatProcessing =
  false;

disableMedicineHospitalAura();
disableMedicineHouseAura();

clearMedicineMissionGhosts();

hideMedicineMissionPanel();

if (deliveryOfficeAura) {
  deliveryOfficeAura.setEnabled(false);
}

if (deliveryStoreAura) {
  deliveryStoreAura.setEnabled(false);
}

for (const mesh of currentRouteCheckpoints) {
  mesh.dispose();
}

currentRouteCheckpoints.length = 0;

  // GPS
  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;

  if (gpsArrow) {
    gpsArrow.setEnabled(false);
  }

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  // Líneas de carrera
  if (raceStartLine) {
    raceStartLine.dispose();
    raceStartLine = null;
  }

  if (raceFinishLine) {
    raceFinishLine.dispose();
    raceFinishLine = null;
  }

  // Auras de entrega
  pickupAura?.setEnabled(false);
  deliveryAura?.setEnabled(false);

  clearRaceBots();

  showMissionMessage("Misión cancelada");
  hideMissionCard();
}

let raceStartLine: BABYLON.Mesh | null = null;
let raceFinishLine: BABYLON.Mesh | null = null;

let countdownActive = false;
let raceLap = 1;
const totalRaceLaps = 2;
let raceTarget: "finish" | "start" = "finish";
type RaceConfig = {
  id: string;
  name: string;
  start: { lat: number; lon: number };
  finish: { lat: number; lon: number };
  laps: number;
  reward: number;
  preloadZones?: string[];
};
type RouteMissionConfig = {
  id: string;
  name: string;
  reward: number;
  points: [number, number][];
};

const raceConfigs: Record<string, RaceConfig> = {
  josePardo: {
    id: "josePardo",
    name: "Circuito Av. José Pardo",
    start: {
      lat: -12.119064326052182,
      lon: -77.02948886637125,
    },
    finish: {
      lat: -12.122911693158288,
      lon: -77.03178044553597,
    },
    laps: 2,
    reward: 25,
  },

  diagonal: {
  id: "diagonal",
  name: "Circuito Av. Andrés Avellino Cáceres",
  start: {
    lat: -12.119841066818928,
    lon: -77.02365985639076,
  },
  finish: {
    lat: -12.13234927890626,
    lon: -77.01156171373724,
  },
  laps: 2,
  reward: 25,
  preloadZones: [],
},
plazaBolognesi: {
  id: "plazaBolognesi",
  name: "Circuito Plaza Bolognesi",
  start: {
    lat: -12.12334138197771,
    lon: -77.03539361685014,
  },
  finish: {
    lat: -12.120878557586394,
    lon: -77.02721915582435,
  },
  laps: 2,
  reward: 25,
  preloadZones: ["kennedy"],
},
urbLosJazmines: {
  id: "urbLosJazmines",
  name: "Circuito Urb. Los Jazmines",
  start: {
    lat: -12.118413028661271,
    lon: -77.01241696088145,
  },
  finish: {
    lat: -12.131684530654939,
    lon: -77.01647051089301,
  },
  laps: 2,
  reward: 25,
  preloadZones: [],
},
};
// =========================
// CIRCUITO MULTIJUGADOR
// =========================

type MultiplayerLobbyPlayer = {
  id: number | string;
  name: string;
  isHost: boolean;
  accepted: boolean;
  isLocal: boolean;
};

type MultiplayerInvite = {
  id: string;
  fromName: string;
  circuitId: string;
  circuitName: string;
  maxPlayers: number;
  createdAt: number;
  status: "pending" | "accepted" | "rejected";
};

let multiplayerRaceActive = false;
let multiplayerIsHost = false;
let multiplayerMaxPlayers = 2;
let multiplayerSelectedCircuit: RaceConfig | null = null;
let multiplayerLobbyPlayers: MultiplayerLobbyPlayer[] = [];
let multiplayerPendingInvites: MultiplayerInvite[] = [];

const MULTIPLAYER_INVITES_KEY = "niuwd_mp_race_invites";
const LOCAL_PLAYER_NAME = "Tú";

const multiplayerPlayerColors = [
  new BABYLON.Color3(0.2, 0.6, 1),
  new BABYLON.Color3(1, 0.3, 0.3),
  new BABYLON.Color3(0.3, 0.9, 0.4),
  new BABYLON.Color3(1, 0.8, 0.2),
  new BABYLON.Color3(0.8, 0.3, 1),
  new BABYLON.Color3(1, 0.5, 0.1),
];

function loadMultiplayerInvites(): MultiplayerInvite[] {
  try {
    return JSON.parse(
      localStorage.getItem(MULTIPLAYER_INVITES_KEY) || "[]"
    );
  } catch {
    return [];
  }
}

function saveMultiplayerInvites(list: MultiplayerInvite[]) {
  localStorage.setItem(MULTIPLAYER_INVITES_KEY, JSON.stringify(list));
}
function showMultiplayerRaceMissionCard() {
  const circuitName =
    multiplayerSelectedCircuit?.name || "Circuito";

  const accepted = multiplayerLobbyPlayers.filter((p) => p.accepted);
  const names = accepted.map((p) => p.name).join(", ");

  missionCard.style.display = "block";
  missionCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <div style="
        width:28px;height:28px;border-radius:8px;background:#2faa3f;
        display:flex;align-items:center;justify-content:center;font-size:16px;
      ">🏁</div>
      <div style="font-size:16px;font-weight:bold;">MISIÓN ACTIVA</div>
    </div>

    <div style="color:#7CFF9A;font-weight:bold;margin-bottom:8px;">
      Circuito Multijugador
    </div>

    <div style="font-size:13px;line-height:1.4;margin-bottom:8px;">
      <strong>${circuitName}</strong><br>
      Jugadores: ${accepted.length} / ${multiplayerMaxPlayers}<br>
      <span style="color:#ccc;">${names}</span>
    </div>

    <div style="font-size:12px;color:#d8d8d8;">
      Ve al aro de inicio. Para salir de la misión presiona 3.
    </div>
  `;
}

function openMultiplayerCircuitMenu() {
  openSocialWindow(
    "Circuito Multijugador",
    `
      <p style="font-size:13px;color:#ccc;margin-top:0;">
        Elige un circuito (2 a 6 jugadores reales).
      </p>

      <button id="mpRace_josePardo" style="width:100%;padding:8px;margin-bottom:8px;border:0;border-radius:8px;cursor:pointer;font-weight:bold;">
        Av. José Pardo
      </button>
      <button id="mpRace_diagonal" style="width:100%;padding:8px;margin-bottom:8px;border:0;border-radius:8px;cursor:pointer;font-weight:bold;">
        Av. Andrés Avellino Cáceres
      </button>
      <button id="mpRace_plazaBolognesi" style="width:100%;padding:8px;margin-bottom:8px;border:0;border-radius:8px;cursor:pointer;font-weight:bold;">
        Plaza Bolognesi
      </button>
      <button id="mpRace_urbLosJazmines" style="width:100%;padding:8px;margin-bottom:8px;border:0;border-radius:8px;cursor:pointer;font-weight:bold;">
        Urb. Los Jazmines
      </button>
    `
  );

  setTimeout(() => {
    const map: Record<string, RaceConfig> = {
      mpRace_josePardo: raceConfigs.josePardo,
      mpRace_diagonal: raceConfigs.diagonal,
      mpRace_plazaBolognesi: raceConfigs.plazaBolognesi,
      mpRace_urbLosJazmines: raceConfigs.urbLosJazmines,
    };

    for (const [id, config] of Object.entries(map)) {
      const btn = document.getElementById(id) as HTMLButtonElement | null;
      if (!btn) continue;
      btn.onclick = () => openMultiplayerLobbySetup(config);
    }
  }, 50);
}

function openMultiplayerLobbySetup(config: RaceConfig) {
  multiplayerSelectedCircuit = config;
  multiplayerIsHost = true;
  multiplayerMaxPlayers = 2;
  multiplayerLobbyPlayers = [
    {
      id: "local",
      name: LOCAL_PLAYER_NAME,
      isHost: true,
      accepted: true,
      isLocal: true,
    },
  ];

  renderMultiplayerLobbyWindow();
}

function renderMultiplayerLobbyWindow() {
  if (!multiplayerSelectedCircuit) return;
    // Invitado: no mostrar controles de host
  if (!multiplayerIsHost) {
    openSocialWindow(
      "Esperando partida",
      `
        <p style="font-size:14px;">
          Circuito: <strong style="color:#7CFF9A;">${multiplayerSelectedCircuit.name}</strong>
        </p>
        <p style="font-size:13px;color:#ccc;margin-top:10px;">
          Esperando a que el anfitrión inicie la partida...
        </p>
      `
    );
    return;
  }

  const acceptedCount = multiplayerLobbyPlayers.filter((p) => p.accepted).length;

  let playersHtml = "";
  for (const p of multiplayerLobbyPlayers) {
    const tag = p.isHost ? " (Anfitrión)" : "";
    const state = p.accepted ? "✅ Listo" : "⏳ Esperando...";
    playersHtml += `
      <div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:13px;">
        <strong>${p.name}${tag}</strong>
        <span style="float:right;color:#ccc;">${state}</span>
      </div>
    `;
  }

  let friendsOptions = "";
  for (const friend of friends) {
    const already = multiplayerLobbyPlayers.some(
      (p) => String(p.id) === String(friend.id)
    );
    if (already) continue;

    friendsOptions += `
      <button id="mpInvite_${friend.id}" style="
        width:100%;padding:7px;margin-bottom:6px;border:0;border-radius:8px;
        cursor:pointer;font-size:13px;
      ">
        Invitar a ${friend.name}
      </button>
    `;
  }

  if (!friendsOptions) {
    friendsOptions = `<p style="font-size:12px;color:#aaa;">No hay más amigos para invitar.</p>`;
  }

    openSocialWindow(
    "Lobby Multijugador",
    `
      <div style="font-size:13px;margin-bottom:8px;">
        <strong style="color:#7CFF9A;">${multiplayerSelectedCircuit.name}</strong><br>
        <span id="mpPlayersCountLabel">
          Jugadores: ${acceptedCount} / ${multiplayerMaxPlayers}
        </span>
      </div>

            <div style="margin-bottom:10px;">
        <label style="font-size:12px;color:#ccc;">Máximo de jugadores</label>
        <div id="mpMaxPlayersRow" style="
          display:flex;
          gap:6px;
          margin-top:6px;
          flex-wrap:wrap;
        ">
          ${[2, 3, 4, 5, 6]
            .map(
              (n) => `
            <button
              type="button"
              class="mpMaxBtn"
              data-max="${n}"
              style="
                flex:1;
                min-width:36px;
                padding:8px 0;
                border:0;
                border-radius:8px;
                cursor:pointer;
                font-weight:bold;
                background:${n === multiplayerMaxPlayers ? "#2faa3f" : "#444"};
                color:white;
              "
            >${n}</button>
          `
            )
            .join("")}
        </div>
      </div>

      <div style="max-height:120px;overflow-y:auto;margin-bottom:10px;">
        ${playersHtml}
      </div>

      <div style="font-size:12px;color:#7ec8ff;font-weight:bold;margin-bottom:6px;">
        Invitar amigos
      </div>
      <div style="max-height:140px;overflow-y:auto;margin-bottom:12px;">
        ${friendsOptions}
      </div>

      <button id="mpStartRaceBtn" style="
        width:100%;padding:10px;border:0;border-radius:8px;
        cursor:pointer;font-weight:bold;background:#2faa3f;color:white;
      ">
        Iniciar circuito
      </button>

      <p id="mpMaxHint" style="font-size:11px;color:#aaa;margin-top:8px;">
        Mínimo 2 jugadores listos. Máximo ${multiplayerMaxPlayers}.
      </p>
    `
  );

      setTimeout(() => {
    // Botones 2-6 (sin <select>)
    const maxButtons = socialWindow.querySelectorAll(
      ".mpMaxBtn"
    ) as NodeListOf<HTMLButtonElement>;

    maxButtons.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        multiplayerMaxPlayers = Number(btn.dataset.max || "2");

        // Actualizar estilos de botones
        maxButtons.forEach((b) => {
          const val = Number(b.dataset.max || "0");
          b.style.background =
            val === multiplayerMaxPlayers ? "#2faa3f" : "#444";
        });

        // Actualizar textos
        const countLabel = document.getElementById("mpPlayersCountLabel");
        if (countLabel) {
          const acceptedCount = multiplayerLobbyPlayers.filter(
            (p) => p.accepted
          ).length;
          countLabel.innerHTML = `Jugadores: ${acceptedCount} / ${multiplayerMaxPlayers}`;
        }

        const maxHint = document.getElementById("mpMaxHint");
        if (maxHint) {
          maxHint.innerText = `Mínimo 2 jugadores listos. Máximo ${multiplayerMaxPlayers}.`;
        }
      };
    });

    for (const friend of friends) {
      const btn = document.getElementById(
        `mpInvite_${friend.id}`
      ) as HTMLButtonElement | null;
      if (!btn) continue;

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        inviteFriendToMultiplayerRace(friend);
      };
    }

    const startBtn = document.getElementById(
      "mpStartRaceBtn"
    ) as HTMLButtonElement | null;

    if (startBtn) {
      startBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        tryStartMultiplayerRace();
      };
    }
  }, 50);
  }
async function inviteFriendToMultiplayerRace(friend: any) {
  if (!multiplayerSelectedCircuit) return;

  if (multiplayerLobbyPlayers.length >= multiplayerMaxPlayers) {
    showMissionMessage("El lobby ya está lleno.", 3000);
    return;
  }

  const already = multiplayerLobbyPlayers.some(
    (p) => String(p.id) === String(friend.id)
  );
  if (already) {
    showMissionMessage("Ese amigo ya está en el lobby.", 3000);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !friend.cloudId) {
    alert("No se puede invitar (falta sesión o cloudId del amigo).");
    return;
  }

  const myName =
    localStorage.getItem("niuwd_session_user") ||
    localStorage.getItem("niuwd_username") ||
    "Jugador";

  const { data, error } = await supabase
    .from("race_invites")
    .insert({
      from_id: user.id,
      to_id: friend.cloudId,
      from_name: myName,
      circuit_id: multiplayerSelectedCircuit.id,
      circuit_name: multiplayerSelectedCircuit.name,
      max_players: multiplayerMaxPlayers,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    alert("No se pudo enviar la invitación: " + error.message);
    return;
  }

  multiplayerLobbyPlayers.push({
    id: friend.id,
    name: friend.name,
    isHost: false,
    accepted: false,
    isLocal: false,
    inviteId: data?.id, // opcional
  } as any);

  showMissionMessage(`Invitación enviada a ${friend.name}`, 3000);
  renderMultiplayerLobbyWindow();
}
async function loadRaceInvitesFromCloud() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("race_invites")
    .select("*")
    .eq("to_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(error.message);
    return [];
  }
  return data || [];
}
let mpWaitForStartTimer: ReturnType<typeof setInterval> | null = null;

function stopWaitingForRaceStart() {
  if (mpWaitForStartTimer) {
    clearInterval(mpWaitForStartTimer);
    mpWaitForStartTimer = null;
  }
}

function startWaitingForRaceStart() {
  stopWaitingForRaceStart();

  mpWaitForStartTimer = setInterval(async () => {
    if (multiplayerRaceActive) {
      stopWaitingForRaceStart();
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rows, error } = await supabase
      .from("race_invites")
      .select("*")
      .eq("to_id", user.id)
      .eq("status", "started")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.warn("poll race start:", error.message);
      return;
    }

    if (!rows || rows.length === 0) return;

    const row = rows[0];
    stopWaitingForRaceStart();
    await beginRaceAsGuest(row);
  }, 2000); // cada 2 segundos
}

async function beginRaceAsGuest(row: any) {
  // Si ya estábamos en una carrera vieja, la cerramos y seguimos
  if (multiplayerRaceActive) {
    multiplayerRaceActive = false;
    mpLocalReadySent = false;
    if (raceStartLine) {
      raceStartLine.dispose();
      raceStartLine = null;
    }
    if (raceFinishLine) {
      raceFinishLine.dispose();
      raceFinishLine = null;
    }
  }
  if (multiplayerRaceActive) return;

    // Resolver circuito por id exacto, luego por nombre
  let config: RaceConfig | null =
    (row.circuit_id && raceConfigs[row.circuit_id as keyof typeof raceConfigs]) ||
    Object.values(raceConfigs).find(
      (c) => c.id === row.circuit_id || c.name === row.circuit_name
    ) ||
    null;

  if (!config) {
    console.warn("Circuito no encontrado:", row.circuit_id, row.circuit_name);
    showMissionMessage(
      "No se encontró el circuito: " + (row.circuit_name || row.circuit_id),
      4000
    );
    return;
  }

  console.log("Invitado entra al circuito:", config.id, config.name);

  multiplayerSelectedCircuit = config;
  multiplayerIsHost = false;
  multiplayerMaxPlayers = row.max_players || 2;
  multiplayerLobbyPlayers = [
    {
      id: "host",
      name: row.from_name,
      isHost: true,
      accepted: true,
      isLocal: false,
    },
    {
      id: "local",
      name: "Tú",
      isHost: false,
      accepted: true,
      isLocal: true,
    },
  ];

  if (typeof socialWindow !== "undefined" && socialWindow) {
    socialWindow.style.display = "none";
  }

  await startMultiplayerRace(config, multiplayerLobbyPlayers, false);
  showMissionMessage(
    "¡Partida iniciada! Ve al punto rosa. Empieza cuando todos lo toquen.",
    6000
  );
}
let raceCountdownToken = 0;
let mpReadyRetryTimer: ReturnType<typeof setTimeout> | null = null;

function clearMpReadyRetry() {
  if (mpReadyRetryTimer) {
    clearTimeout(mpReadyRetryTimer);
    mpReadyRetryTimer = null;
  }
}
async function respondRaceInvite(inviteId: string, accept: boolean) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: inv, error } = await supabase
    .from("race_invites")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", inviteId)
    .eq("to_id", user.id)
    .select("*")
    .single();

  if (error || !inv) {
    alert("No se pudo responder la invitación.");
    return;
  }

  if (!accept) {
    showMissionMessage("Invitación rechazada.", 3000);
    // El host se enterará por realtime (abajo)
    return;
  }

  // Aceptó → buscar el circuito y preparar lobby local como invitado
  const config =
    Object.values(raceConfigs).find(
      (c: any) => c.id === inv.circuit_id || c.name === inv.circuit_name
    ) || null;

  if (!config) {
    showMissionMessage("Circuito no encontrado.", 3000);
    return;
  }

    multiplayerSelectedCircuit = config;
  multiplayerIsHost = false;
  multiplayerMaxPlayers = inv.max_players || 2;
  multiplayerLobbyPlayers = [
    {
      id: "host",
      name: inv.from_name,
      isHost: true,
      accepted: true,
      isLocal: false,
    },
    {
      id: "local",
      name: "Tú",
      isHost: false,
      accepted: true,
      isLocal: true,
    },
  ];
      multiplayerRaceActive = false;
  mpLocalReadySent = false;
  startWaitingForRaceStart();
    showMissionMessage("Invitación aceptada. Esperando al anfitrión.", 4000);

  openSocialWindow(
    "Esperando partida",
    `
      <p style="font-size:14px;line-height:1.5;">
        Aceptaste <strong style="color:#7CFF9A;">${config.name}</strong>.
      </p>
      <p style="font-size:13px;color:#ccc;">
        Anfitrión: <strong>${inv.from_name}</strong>
      </p>
      <p style="font-size:13px;color:#aaa;margin-top:12px;">
        Espera a que el anfitrión pulse <strong>Iniciar circuito</strong>.
      </p>
    `
  );

  // NUEVO: revisar cada 2s si el host ya inició
  startWaitingForRaceStart();
}

function openMultiplayerInvitesPanel() {
  const invites = loadMultiplayerInvites().filter(
    (i) => i.status === "pending"
  );

  let html = "";

  if (invites.length === 0) {
    html = "<p>No tienes invitaciones pendientes.</p>";
  } else {
    for (const inv of invites) {
      html += `
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.12);">
          <strong>🏁 ${inv.circuitName}</strong><br>
          <span style="font-size:12px;color:#ccc;">De: ${inv.fromName} · Máx ${inv.maxPlayers}</span><br><br>
          <button id="mpAccept_${inv.id}" style="padding:6px 10px;border:0;border-radius:8px;cursor:pointer;margin-right:6px;">
            Aceptar
          </button>
          <button id="mpReject_${inv.id}" style="padding:6px 10px;border:0;border-radius:8px;cursor:pointer;">
            Rechazar
          </button>
        </div>
      `;
    }
  }

  openSocialWindow("Invitaciones Multijugador", html);

  setTimeout(() => {
    const all = loadMultiplayerInvites();

    for (const inv of invites) {
      const acceptBtn = document.getElementById(
        `mpAccept_${inv.id}`
      ) as HTMLButtonElement | null;
      const rejectBtn = document.getElementById(
        `mpReject_${inv.id}`
      ) as HTMLButtonElement | null;

      if (acceptBtn) {
        acceptBtn.onclick = () => {
          inv.status = "accepted";
          const idx = all.findIndex((x) => x.id === inv.id);
          if (idx >= 0) all[idx].status = "accepted";
          saveMultiplayerInvites(all);

          // Si eres anfitrión local en otro cliente no aplica;
          // aquí marcamos al jugador en el lobby del host si coincide.
          const lobbyPlayer = multiplayerLobbyPlayers.find(
            (p) => p.name === inv.fromName || !p.isLocal
          );

          // Marcar el primer no-aceptado como aceptado (simulación local)
          const pending = multiplayerLobbyPlayers.find(
            (p) => !p.accepted && !p.isLocal
          );
          if (pending) pending.accepted = true;

          showMissionMessage("Invitación aceptada. Esperando inicio.", 4000);
          openSocialWindow(
            "Invitación aceptada",
            `<p>Aceptaste <strong>${inv.circuitName}</strong>. El anfitrión iniciará la carrera.</p>`
          );
        };
      }

      if (rejectBtn) {
        rejectBtn.onclick = () => {
          inv.status = "rejected";
          const idx = all.findIndex((x) => x.id === inv.id);
          if (idx >= 0) all[idx].status = "rejected";
          saveMultiplayerInvites(all);

          multiplayerLobbyPlayers = multiplayerLobbyPlayers.filter(
            (p) => p.name !== inv.fromName
          );

          showMissionMessage("Invitación rechazada.", 3000);
          openMultiplayerInvitesPanel();
        };
      }
    }
  }, 50);
}
async function tryStartMultiplayerRace() {
  if (!multiplayerIsHost) {
    showMissionMessage("Solo el anfitrión puede iniciar la partida.", 3000);
    return;
  }
  if (!multiplayerSelectedCircuit) return;

  const accepted = multiplayerLobbyPlayers.filter((p) => p.accepted);

  if (accepted.length < 2) {
    showMissionMessage("Se necesitan mínimo 2 jugadores listos.", 4000);
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

    mpLocalReadySent = false;
  multiplayerRaceActive = false;

  const circuitId = multiplayerSelectedCircuit.id;

  const { data: updated, error } = await supabase
    .from("race_invites")
    .update({
      status: "started",
      ready_ids: [],
    })
    .eq("from_id", user.id)
    .eq("circuit_id", circuitId) // ← solo este circuito
    .in("status", ["pending", "accepted"])
    .select("id, to_id, circuit_id, status");

  if (error) {
    console.error("Error al iniciar partida:", error.message);
    alert("No se pudo avisar a los invitados: " + error.message);
    return;
  }

  console.log("Invitaciones started:", updated, "circuito:", circuitId);

  socialWindow.style.display = "none";

  await startMultiplayerRace(multiplayerSelectedCircuit, accepted, true);
}
let mpLocalReadySent = false;

async function markMyselfReadyAtStart() {
  if (!multiplayerRaceActive) return;
  if (countdownActive || raceStarted) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const needed = Math.max(
    2,
    multiplayerLobbyPlayers.filter((p) => p.accepted).length || 2
  );

  if (mpLocalReadySent) {
    // Releer por si el otro ya llegó
    await checkReadyAndMaybeStart(user.id, needed);
    return;
  }

  mpLocalReadySent = true;

  const { data: rows, error } = await supabase
    .from("race_invites")
    .select("id, ready_ids, from_id, to_id")
    .eq("status", "started")
    .or(`from_id.eq.${user.id},to_id.eq.${user.id}`);

  if (error) {
    console.warn("ready_ids:", error.message);
    showMissionMessage("Error al marcar listo. Revisa la conexión.", 3000);
    mpLocalReadySent = false;
    return;
  }

  if (!rows || rows.length === 0) {
    showMissionMessage(
      "Estás en el punto rosa. Esperando al otro jugador...",
      4000
    );
    // Reintentar en 1.5s por si el status aún no está en started
    setTimeout(() => {
      mpLocalReadySent = false;
      void markMyselfReadyAtStart();
    }, 1500);
    return;
  }

  for (const row of rows) {
    // Leer de nuevo justo antes de escribir (evita pisar al otro)
    const { data: fresh } = await supabase
      .from("race_invites")
      .select("ready_ids")
      .eq("id", row.id)
      .single();

    const ready: string[] = Array.isArray(fresh?.ready_ids)
      ? fresh.ready_ids.map(String)
      : Array.isArray(row.ready_ids)
        ? row.ready_ids.map(String)
        : [];

    if (!ready.includes(String(user.id))) {
      ready.push(String(user.id));
    }

    const { error: upErr } = await supabase
      .from("race_invites")
      .update({ ready_ids: ready })
      .eq("id", row.id);

    if (upErr) {
      console.warn("update ready_ids:", upErr.message);
      showMissionMessage("No se pudo registrar que llegaste al rosa.", 3000);
      mpLocalReadySent = false;
      return;
    }

    const uniqueReady = [...new Set(ready.map(String))];
    showMissionMessage(
      `En el punto rosa: ${uniqueReady.length} / ${needed}. Esperando a todos...`,
      4000
    );

    if (uniqueReady.length >= needed) {
      startRaceCountdown();
      return;
    }
  }

  // Si aún falta alguien, revisar otra vez en 2s (por si realtime falla)
  setTimeout(() => {
    void checkReadyAndMaybeStart(user.id, needed);
  }, 2000);
}

async function checkReadyAndMaybeStart(myId: string, needed: number) {
  if (!multiplayerRaceActive || countdownActive || raceStarted) return;

  const { data: rows } = await supabase
    .from("race_invites")
    .select("id, ready_ids")
    .eq("status", "started")
    .or(`from_id.eq.${myId},to_id.eq.${myId}`);

  if (!rows || rows.length === 0) return;

  for (const row of rows) {
    const ready = Array.isArray(row.ready_ids)
      ? [...new Set(row.ready_ids.map(String))]
      : [];

    showMissionMessage(
      `En el punto rosa: ${ready.length} / ${needed}. Esperando a todos...`,
      2500
    );

    if (ready.length >= needed) {
      startRaceCountdown();
      return;
    }
  }
}
async function startMultiplayerRace(
  config: RaceConfig,
  players: MultiplayerLobbyPlayer[],
  asHost: boolean = true
) {
  await loadGpsGraph();

  // Limpia otras misiones SIN cancelar invitaciones multijugador
  raceMissionActive = false;
  raceGoingToStart = false;
  raceStarted = false;
  raceCountdownDone = false;
  countdownActive = false;
  clearRaceBots();

  if (raceStartLine !== null) {
    raceStartLine.dispose();
    raceStartLine = null;
  }
  if (raceFinishLine !== null) {
    raceFinishLine.dispose();
    raceFinishLine = null;
  }

  mpLocalReadySent = false;

  multiplayerRaceActive = true;
  multiplayerIsHost = asHost;
  multiplayerSelectedCircuit = config;
  multiplayerLobbyPlayers = players;

  activeRaceConfig = config;
  raceMissionActive = true;
  raceGoingToStart = true;
  raceStarted = false;
  raceCountdownDone = false;
  raceLap = 1;
  raceTarget = "finish";

  raceStartLine = createRaceLine(
    config.start.lon,
    config.start.lat,
    new BABYLON.Color3(1, 0.2, 0.75) // rosa
  );

  raceFinishLine = createRaceLine(
    config.finish.lon,
    config.finish.lat,
    new BABYLON.Color3(1, 0, 0)
  );
  raceFinishLine.setEnabled(false);

  setGpsDestination(config.start.lon, config.start.lat);
  showMultiplayerRaceMissionCard();
  showMissionMessage(
    "Ve al punto rosa. La carrera inicia cuando TODOS los jugadores lo toquen.",
    6000
  );
}
async function cancelMultiplayerRaceSession() {
  raceCountdownToken++;
  clearMpReadyRetry();
  stopWaitingForRaceStart();
  mpLocalReadySent = false;
  
  multiplayerRaceActive = false;
  multiplayerIsHost = false;
  multiplayerSelectedCircuit = null;
  multiplayerLobbyPlayers = [];

  // Cerrar invitaciones abiertas en la nube para poder reiniciar
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("race_invites")
        .update({ status: "cancelled", ready_ids: [] })
        .or(`from_id.eq.${user.id},to_id.eq.${user.id}`)
        .in("status", ["pending", "accepted", "started"]);
    }
  } catch (e) {
    console.warn("cancel race invites:", e);
  }

  clearRaceBots();
}
function stopMultiplayerRace() {
  void cancelMultiplayerRaceSession();
}
const routeMissionConfigs: Record<string, RouteMissionConfig> = {

  barrioMedico: {
    id: "barrioMedico",
    name: "Recorrido Barrio Médico",

    reward: 25,

    points: [

      [-12.115999320888086, -77.01270667263046],
      [-12.11984231875287, -77.01781924096875],
      [-12.127777987995419, -77.00443998883192],
      [-12.12244141880719, -77.01782541866162],
      [-12.11788755345388, -77.01157619686187],
      
    ]
  },
  petitThouars: {
    id: "petitThouars",

    name: "Recorrido Petit Thouars",

    reward: 25,

    points: [

      [-12.10441616388143, -77.0302842349884],
      [-12.111440549189942, -77.05188923994342],
      [-12.106468014330245, -77.04189917639016],
      [-12.106268413511392, -77.04021501377673],
      [-12.10441616388143, -77.0302842349884]

    ]
},
maleconReserva: {
    id: "maleconReserva",

    name: "Recorrido Circuito de Playas",

    reward: 25,

    points: [

      [-12.13004270433098, -77.03317841393725],
      [-12.137387709001395, -77.02714803446544],
      [-12.134769754847783, -77.0294182533375],
      [-12.120661382427455, -77.04506207382805],
      [-12.131140387342109, -77.033816515871],
      [-12.127588384002541, -77.03588433470952],
      [-12.13004270433098, -77.03317841393725]

    ]
},
puenteAmistad: {
    id: "puenteAmistad",

    name: "Puente de la Amistad",

    reward: 25,

    points: [

        [-12.109634679105167, -77.05351699790452],
        [-12.112407510081594, -77.04426700593916],
        [-12.108941739469875, -77.03753510454953],
        [-12.111690247850742, -77.03334127944753],
        [-12.106255857088431, -77.03906196683252],
        [-12.109041712397161, -77.04273968150365],
        [-12.109634679105167, -77.05351699790452]

    ]
},
  
};
let currentRouteMission: RouteMissionConfig | null = null;

let currentRouteIndex = 0;

const currentRouteCheckpoints: BABYLON.Mesh[] = [];

let routeMissionActive = false;

let activeRaceConfig: RaceConfig = raceConfigs.josePardo;

// =========================
// MISIÓN ENTREGA MEDICINA
// MANHATTAN
// =========================

type MedicineDeliveryStage =
  | "inactive"
  | "goToHospital"
  | "goToHouse";

let medicineDeliveryMissionActive = false;

let medicineDeliveryStage:
  MedicineDeliveryStage = "inactive";

let medicineDeliveryCount = 0;

// Casa actual de la misión
let currentMedicineHouseIndex = 0;

const medicineDeliveryReward = 25;

// Evita que el mismo aro se active varias veces
// mientras el jugador continúa sobre él.
let medicineHospitalAuraTouched = false;
let medicineHouseAuraTouched = false;

// =========================
// FANTASMAS DE LA MISIÓN
// =========================

type MedicineGhost = {
  root: BABYLON.Mesh;

  // Punto central del recorrido.
  centerPosition: BABYLON.Vector3;

  // Dos extremos del movimiento.
  movementStart: BABYLON.Vector3;
  movementEnd: BABYLON.Vector3;

  // Progreso entre ambos extremos.
  movementT: number;

  // 1 avanza hacia movementEnd.
  // -1 regresa hacia movementStart.
  movementDirection: number;

  movementSpeed: number;

  baseY: number;
  floatOffset: number;
  floatSpeed: number;

  collisionRadius: number;
};

const medicineGhosts: MedicineGhost[] = [];

const medicineMissionPenalty = 5;

// Evita que una misma colisión procese
// la derrota varias veces.
let medicineMissionDefeatProcessing = false;

const MANHATTAN_MEDICINE_GHOST_1 = {
  lat: 40.73322437088671,
  lon: -73.98286361274262,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_2 = {
  lat: 40.7337969850652,
  lon: -73.98237586685823,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_3 = {
  lat: 40.73254980382814,
  lon: -73.98327536281698,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_4 = {
  lat: 40.73376214147153,
  lon: -73.98057443190777,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_5 = {
  lat: 40.73583824485802,
  lon: -73.98363213403096,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_6 = {
  lat: 40.73542363798854,
  lon: -73.98084263671063,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_7 = {
  lat: 40.73587636363502,
  lon: -73.9792806794939,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_8 = {
  lat: 40.73755489319174,
  lon: -73.97808613616559,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_9 = {
  lat: 40.741663818551466,
  lon: -73.97617621760111,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_10 = {
  lat: 40.74359883154586,
  lon: -73.97972318812597,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_11 = {
  lat: 40.73528411112883,
  lon: -73.9841179963424,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_12 = {
  lat: 40.73253265558135,
  lon: -73.9812899591543,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_13 = {
  lat: 40.73187270148009,
  lon: -73.98383345906805,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_14 = {
  lat: 40.736510947462435,
  lon: -73.98341860872011,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_15 = {
  lat: 40.735664632399704,
  lon: -73.97958497809621,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_16 = {
  lat: 40.735518840186316,
  lon: -73.97953181306674,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_17 = {
  lat: 40.73671629534908,
  lon: -73.98020271181825,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_18 = {
  lat: 40.73861130091893,
  lon: -73.97821432199842,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_19 = {
  lat: 40.7385817129753,
  lon: -73.9804694319694,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_20 = {
  lat: 40.73819370817772,
  lon: -73.98068564529798,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_21 = {
  lat: 40.73781719765507,
  lon: -73.98102703476417,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_22 = {
  lat: 40.740475082999325,
  lon: -73.98202767250665,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_23 = {
  lat: 40.74051369552197,
  lon: -73.98187210438687,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_24 = {
  lat: 40.74281686061995,
  lon: -73.97895536941627,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_25 = {
  lat: 40.74395152203595,
  lon: -73.9778547049846,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_26 = {
  lat: 40.74509285697,
  lon: -73.97660348338204,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_27 = {
  lat: 40.74337659272209,
  lon: -73.97518119120433,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_28 = {
  lat: 40.7432545044116,
  lon: -73.97532606465678,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_29 = {
  lat: 40.74337189702197,
  lon: -73.97532064158638,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_30 = {
  lat: 40.7409558517658,
  lon: -73.97630703456794,
  rotationY: 0,
};
const MANHATTAN_MEDICINE_GHOST_31 = {
  lat: 40.73464205728003,
  lon: -73.98018488147558,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_32 = {
  lat: 40.73502715412265,
  lon: -73.97989668401934,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_33 = {
  lat: 40.73474537616389,
  lon: -73.98004852999091,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_34 = {
  lat: 40.73519856846372,
  lon: -73.97978202481632,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_35 = {
  lat: 40.73688216259107,
  lon: -73.978607542695,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_36 = {
  lat: 40.737187412204044,
  lon: -73.97833483971158,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_37 = {
  lat: 40.73819707397953,
  lon: -73.97760349992313,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_38 = {
  lat: 40.73780729939293,
  lon: -73.97782662053442,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_39 = {
  lat: 40.738629110631024,
  lon: -73.97737418149411,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_40 = {
  lat: 40.7384365729133,
  lon: -73.97749193959453,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_41 = {
  lat: 40.737576154123104,
  lon: -73.9780231592881,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_42 = {
  lat: 40.738429120053404,
  lon: -73.97746029530813,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_43 = {
  lat: 40.73511986709157,
  lon: -73.98306808821994,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_44 = {
  lat: 40.73527783039966,
  lon: -73.98278665623663,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_45 = {
  lat: 40.73563324647158,
  lon: -73.98261988172801,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_46 = {
  lat: 40.736241398457175,
  lon: -73.98220294545646,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_47 = {
  lat: 40.73648623729735,
  lon: -73.98202574754106,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_48 = {
  lat: 40.73677846312059,
  lon: -73.98180685599849,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_49 = {
  lat: 40.73698381022841,
  lon: -73.98166092830344,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_50 = {
  lat: 40.73721285048554,
  lon: -73.98149415379481,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_51 = {
  lat: 40.73740240044684,
  lon: -73.98133780269298,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_52 = {
  lat: 40.73773411157949,
  lon: -73.98112933455721,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_53 = {
  lat: 40.73782888588501,
  lon: -73.98097298345537,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_54 = {
  lat: 40.73790786436981,
  lon: -73.98088959620107,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_55 = {
  lat: 40.7381211058104,
  lon: -73.98078536213318,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_56 = {
  lat: 40.73851599557617,
  lon: -73.98051435354697,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_57 = {
  lat: 40.73886349661857,
  lon: -73.98033715563156,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_58 = {
  lat: 40.739898091275066,
  lon: -73.98239056680917,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_59 = {
  lat: 40.739519005034786,
  lon: -73.98266157538568,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_60 = {
  lat: 40.73927417735645,
  lon: -73.9821716752666,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_61 = {
  lat: 40.7392030981843,
  lon: -73.98292216055539,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_62 = {
  lat: 40.73921889356244,
  lon: -73.9819944773512,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_63 = {
  lat: 40.738910883011876,
  lon: -73.98324528616585,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_64 = {
  lat: 40.738555484450586,
  lon: -73.98245310724991,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_65 = {
  lat: 40.738563382217,
  lon: -73.98329740319981,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_66 = {
  lat: 40.738460711180224,
  lon: -73.98228633274128,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_67 = {
  lat: 40.7385396889149,
  lon: -73.98347460111522,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_68 = {
  lat: 40.73815269711904,
  lon: -73.98369349265778,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_69 = {
  lat: 40.737868375181364,
  lon: -73.98290131374182,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_70 = {
  lat: 40.7377736009321,
  lon: -73.98405831189538,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_71 = {
  lat: 40.737370808866366,
  lon: -73.98436059069226,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_72 = {
  lat: 40.73726023806873,
  lon: -73.98337036704733,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_73 = {
  lat: 40.736391461108305,
  lon: -73.98501726533276,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_74 = {
  lat: 40.73620190826657,
  lon: -73.98452736521368,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_75 = {
  lat: 40.736115029700294,
  lon: -73.98515276962102,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_76 = {
  lat: 40.73564904272666,
  lon: -73.98501726533276,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_77 = {
  lat: 40.734258546230144,
  lon: -73.98458276582252,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_78 = {
  lat: 40.73403312135439,
  lon: -73.98483067761285,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_79 = {
  lat: 40.73360575126421,
  lon: -73.9851033805822,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_80 = {
  lat: 40.73464364529165,
  lon: -73.98619419248782,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_81 = {
  lat: 40.733311883592364,
  lon: -73.9812224855859,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_82 = {
  lat: 40.73310257594368,
  lon: -73.98134756646739,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_83 = {
  lat: 40.732869572314996,
  lon: -73.9814205303149,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_84 = {
  lat: 40.73293275982034,
  lon: -73.98149349416244,
  rotationY: 0,
};

const MANHATTAN_MEDICINE_GHOST_85 = {
  lat: 40.73320992583766,
  lon: -73.98283539243029,
  rotationY: 0,
};

// =========================
// MISIÓN MANSIONES - BEVERLY HILLS
// =========================

const BEVERLY_MANSION_MISSION_KEY = "niuwd_beverly_mansions";
const BEVERLY_MANSION_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
const beverlyMansionReward = 50;

type BeverlyMansionConfig = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

const BEVERLY_MANSIONS: BeverlyMansionConfig[] = [
  {
    id: "mansion1",
    name: "Mansión 1",
    lat: 34.089267216351374,
    lon: -118.4142241603902,
  },
  {
    id: "mansion2",
    name: "Mansión 2",
    lat: 34.093809225075375,
    lon: -118.41551170899015,
  },
  {
    id: "mansion3",
    name: "Mansión 3",
    lat: 34.09365987353719,
    lon: -118.40125466513506,
  },
];

type BeverlyMansionRuntime = {
  config: BeverlyMansionConfig;
  aura: BABYLON.Mesh;
  touched: boolean;
};

const beverlyMansionRuntimes: BeverlyMansionRuntime[] = [];

let beverlyMansionMissionActive = false;

type BeverlyMansionSaveData = {
  claims: Record<string, number>; // id -> timestamp último cobro
  missionCompletedAt: number | null;
};

function loadBeverlyMansionSave(): BeverlyMansionSaveData {
  try {
    const raw = localStorage.getItem(BEVERLY_MANSION_MISSION_KEY);
    if (!raw) {
      return { claims: {}, missionCompletedAt: null };
    }
    const parsed = JSON.parse(raw);
    return {
      claims: parsed.claims || {},
      missionCompletedAt: parsed.missionCompletedAt ?? null,
    };
  } catch {
    return { claims: {}, missionCompletedAt: null };
  }
}

function saveBeverlyMansionSave(data: BeverlyMansionSaveData) {
  localStorage.setItem(
    BEVERLY_MANSION_MISSION_KEY,
    JSON.stringify(data)
  );
}

function isBeverlyMansionClaimed(id: string): boolean {
  const data = loadBeverlyMansionSave();
  const last = data.claims[id];
  if (!last) return false;
  return Date.now() - last < BEVERLY_MANSION_COOLDOWN_MS;
}

function isBeverlyMansionMissionOnCooldown(): boolean {
  const data = loadBeverlyMansionSave();
  if (!data.missionCompletedAt) return false;
  return Date.now() - data.missionCompletedAt < BEVERLY_MANSION_COOLDOWN_MS;
}

function getBeverlyMansionCooldownRemainingHours(): number {
  const data = loadBeverlyMansionSave();
  if (!data.missionCompletedAt) return 0;
  const remaining =
    BEVERLY_MANSION_COOLDOWN_MS - (Date.now() - data.missionCompletedAt);
  return Math.max(0, remaining / (60 * 60 * 1000));
}
function clearBeverlyMansionAuras() {
  for (const entry of beverlyMansionRuntimes) {
    if (entry.aura && !entry.aura.isDisposed()) {
      entry.aura.dispose();
    }
  }
  beverlyMansionRuntimes.length = 0;
}

function createBeverlyMansionAuras() {
  clearBeverlyMansionAuras();

  if (currentMapName !== "beverly-hills") return;

  for (const config of BEVERLY_MANSIONS) {
    const pos = lonLatToWorld(config.lon, config.lat);

    const auraMat = new BABYLON.StandardMaterial(
      `beverlyMansionAuraMat_${config.id}`,
      scene
    );
    auraMat.diffuseColor = new BABYLON.Color3(1, 0.15, 0.75);
    auraMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0.75);
    auraMat.alpha = 0.58;

    const aura = BABYLON.MeshBuilder.CreateCylinder(
      `beverlyMansionAura_${config.id}`,
      {
        diameter: 10,
        height: 0.3,
        tessellation: 48,
      },
      scene
    );

    aura.position = new BABYLON.Vector3(pos.x, 0.25, pos.z);
    aura.material = auraMat;
    aura.isPickable = false;
    aura.alwaysSelectAsActiveMesh = true;
    aura.renderingGroupId = 1;
    aura.setEnabled(false);

    beverlyMansionRuntimes.push({
      config,
      aura,
      touched: false,
    });
  }
}

function showBeverlyMansionMissionCard() {
  const claimedCount = BEVERLY_MANSIONS.filter((m) =>
    isBeverlyMansionClaimed(m.id)
  ).length;

  missionCard.style.display = "block";
  missionCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#e83e8c;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      ">
        🏡
      </div>
      <div style="font-size:16px;font-weight:bold;">
        MISIÓN ACTIVA
      </div>
    </div>

    <div style="color:#ff8bc0;font-weight:bold;margin-bottom:10px;">
      Encuentra las mansiones
    </div>

    <div style="font-size:14px;line-height:1.4;margin-bottom:8px;">
      Busca los aros rosa en Beverly Hills.<br>
      Cada mansión paga <strong style="color:#ffd23c;">50 monedas</strong>.
    </div>

    <div style="font-size:13px;color:#ccc;margin-bottom:10px;">
      Encontradas: <strong style="color:#ffd23c;">${claimedCount} / 3</strong>
    </div>

    <div style="
      font-size:12px;
      color:#d8d8d8;
      margin-bottom:4px;
    ">
      Para salir de la misión presiona 3.
    </div>
  `;
}

function startBeverlyMansionMission() {
  if (currentMapName !== "beverly-hills") {
    showMissionMessage(
      "Esta misión solo está disponible en Beverly Hills.",
      5000
    );
    return;
  }

  if (isBeverlyMansionMissionOnCooldown()) {
    const hours = getBeverlyMansionCooldownRemainingHours().toFixed(1);
    showMissionMessage(
      `Ya completaste las 3 mansiones. Vuelve en ${hours} h.`,
      5000
    );
    return;
  }

  // Si las 3 están en cooldown individual, no tiene sentido iniciar
  const available = BEVERLY_MANSIONS.filter(
    (m) => !isBeverlyMansionClaimed(m.id)
  );

  if (available.length === 0) {
    showMissionMessage(
      "Todas las mansiones ya fueron cobradas. Vuelve mañana.",
      5000
    );
    return;
  }

  cancelCurrentMission();

  if (beverlyMansionRuntimes.length === 0) {
    createBeverlyMansionAuras();
  }

  beverlyMansionMissionActive = true;

  for (const entry of beverlyMansionRuntimes) {
    entry.touched = false;
    const claimed = isBeverlyMansionClaimed(entry.config.id);
    entry.aura.setEnabled(!claimed);
  }

  showBeverlyMansionMissionCard();
  showMissionMessage("Encuentra las mansiones", 5000);
}

function claimBeverlyMansion(entry: BeverlyMansionRuntime) {
  if (!beverlyMansionMissionActive) return;
  if (isBeverlyMansionClaimed(entry.config.id)) return;

  const data = loadBeverlyMansionSave();
  data.claims[entry.config.id] = Date.now();
  saveBeverlyMansionSave(data);

  addDigitalCoins(beverlyMansionReward);

  entry.aura.setEnabled(false);
  entry.touched = true;

  const claimedCount = BEVERLY_MANSIONS.filter((m) =>
    isBeverlyMansionClaimed(m.id)
  ).length;

  showMissionMessage(
    `${entry.config.name}: +${beverlyMansionReward} monedas (${claimedCount}/3)`,
    4000
  );

  showBeverlyMansionMissionCard();

  // Si ya están las 3 cobradas → completar misión + cooldown 24h
  if (claimedCount >= 3) {
    data.missionCompletedAt = Date.now();
    saveBeverlyMansionSave(data);

    beverlyMansionMissionActive = false;

    for (const runtime of beverlyMansionRuntimes) {
      runtime.aura.setEnabled(false);
    }

    hideMissionCard();
    showMissionMessage(
      "¡Encontraste las 3 mansiones! +150 monedas en total. Vuelve en 24 h.",
      6000
    );
  }
}

function updateBeverlyMansionMission() {
  if (!beverlyMansionMissionActive) return;
  if (!car && !player) return;
  if (currentMapName !== "beverly-hills") return;

  const reference = inCar ? car.position : player.position;

  for (const entry of beverlyMansionRuntimes) {
    if (!entry.aura || entry.aura.isDisposed()) continue;
    if (!entry.aura.isEnabled()) continue;
    if (isBeverlyMansionClaimed(entry.config.id)) {
      entry.aura.setEnabled(false);
      continue;
    }

    // Animación del aro
    entry.aura.rotation.y += 0.04;
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
    entry.aura.scaling.x = pulse;
    entry.aura.scaling.z = pulse;

    const dx = reference.x - entry.aura.position.x;
    const dz = reference.z - entry.aura.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Entrar al aro
    if (dist < 6) {
      if (!entry.touched) {
        entry.touched = true;
        claimBeverlyMansion(entry);
      }
    } else if (dist > 9) {
      // Liberar para no re-disparar si no cobró (por seguridad)
      entry.touched = false;
    }
  }
}

function stopBeverlyMansionMission() {
  beverlyMansionMissionActive = false;

  for (const entry of beverlyMansionRuntimes) {
    if (entry.aura && !entry.aura.isDisposed()) {
      entry.aura.setEnabled(false);
    }
    entry.touched = false;
  }
}
// =========================
// MISIÓN ENTREGA Y RECOJO
// =========================

type DeliveryMissionStage = "inactive" | "goToOffice" | "goToStore" | "returnToOffice";

let deliveryMissionActive = false;
let deliveryMissionStage: DeliveryMissionStage = "inactive";
let deliveryStoreIndex = 0;

let deliveryOfficeAura: BABYLON.Mesh | null = null;
let deliveryStoreAura: BABYLON.Mesh | null = null;

const deliveryReward = 25;

const deliveryOfficePoint = {
  lat: -12.120712547159264,
  lon: -77.02887372477591,
};

const deliveryStores = [
  // Parque Kennedy
    { name: "NIU Cafe en Calle Bolívar", lat: -12.126018298226239, lon: -77.02756894510748 },
    
  // Lima Este
  { name: "NIU Farma en Calle Los pinos", lat: -12.124711939408133, lon: -77.02120147871032 },
  { name: "NIU Pizza en Av. Rivardo Palma", lat: -12.120073615411778, lon: -77.0239904470602 },
  { name: "NIU Cafe en Av. Andrés Avelino Cáceres", lat: -12.119691768429654, lon: -77.02053746229242 },
  { name: "NIU Farma en Calle Manuel Almenara", lat: -12.121875592026024, lon: -77.01717756785459 },
  { name: "NIU Pizza en Calle Pedro Venturo", lat: -12.121837051555845, lon: -77.01469301984807 },
  { name: "NIU Cafe en Calle José Gabriel Chariarse", lat: -12.12771454308114, lon: -77.01963532474198 },
  { name: "NIU Farma en Jiron Honduras", lat: -12.130103706735301, lon: -77.01616652157495 },

  // Lima Sur
  { name: "NIU Pizza en Calle Diego Ferré", lat: -12.129386944890697, lon: -77.03219001443057 },
  { name: "NIU Cafe en Malecon Cisneros", lat: -12.123876815130611, lon: -77.03788979893213 },
  { name: "NIU Farma en Gonzalez Vigil", lat: -12.121787643618777, lon: -77.04072735872383 },
  { name: "NIU Pizza en Malecon Cisneros", lat: -12.119800059412757, lon: -77.04462955621659 },

  // Lima Oeste
  { name: "NIU Cafe en Av. General Córdova", lat: -12.111636552006043, lon: -77.04544128497375 },
  { name: "NIU Farma en Av. Los conquistadores", lat: -12.107450799916593, lon: -77.03697168623347 },
  { name: "NIU Pizza en Calle San Alejandro", lat: -12.105419655719947, lon: -77.0340590870312 },
  { name: "NIU Cafe en Calle Carlos Tenaud", lat: -12.10884061432611, lon: -77.03039415212709 },
  { name: "NIU Farma en Calle Scipión Llona", lat: -12.10743249567055, lon: -77.02811722846685 },
];
// =========================
// SISTEMA DE BILLETERA NIU
// =========================

let digitalCoins = Number(
  localStorage.getItem("niuwd_digital_coins") || "0"
);

function coinsToNiu(coins: number) {
  return coins / 1000;
}
// =========================
// SINCRONIZAR PERFIL CON SUPABASE
// =========================

async function syncProfileToCloud() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        fuel_liters: fuelLiters,
        digital_coins: digitalCoins,
        unlocked_cities: unlockedCities.slice(),
        last_city: currentMapName || "miraflores",
      })
      .eq("id", user.id);

    if (error) {
      console.warn("No se pudo guardar perfil en la nube:", error.message);
    }
  } catch (e) {
    console.warn("Error syncProfileToCloud", e);
  }
}

async function loadProfileFromCloud(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      console.warn("No se pudo cargar perfil:", error?.message);
      return false;
    }

    if (typeof profile.fuel_liters === "number") {
      fuelLiters = profile.fuel_liters;
      localStorage.setItem("niuwd_fuel_liters", String(fuelLiters));
    }

    if (typeof profile.digital_coins === "number") {
      digitalCoins = profile.digital_coins;
      localStorage.setItem("niuwd_digital_coins", String(digitalCoins));
    }

    if (Array.isArray(profile.unlocked_cities) && profile.unlocked_cities.length) {
      unlockedCities = profile.unlocked_cities.slice();
      localStorage.setItem(
        "niuwd_unlocked_cities",
        JSON.stringify(unlockedCities)
      );
    }

    if (profile.username) {
      localStorage.setItem("niuwd_session_user", profile.username);
      localStorage.setItem("niuwd_username", profile.username);
      if (typeof worldChatUsername !== "undefined") {
        worldChatUsername = profile.username;
      }
    }

    if (typeof updateWalletButton === "function") {
      updateWalletButton();
    }

    return true;
  } catch (e) {
    console.warn("Error loadProfileFromCloud", e);
    return false;
  }
}
function saveWallet() {
  localStorage.setItem(
    "niuwd_digital_coins",
    digitalCoins.toString()
  );
  // Nube (no bloquea el juego)
  void syncProfileToCloud();
}

function addDigitalCoins(amount: number) {
  digitalCoins += amount;
  saveWallet();
  updateWalletButton();
}

const pickupPoint = lonLatToWorld(
  -77.030255,
  -12.120780
);

const deliveryPoint = lonLatToWorld(
  -77.028950,
  -12.120720
);

let currentMissionTarget = pickupPoint;
let pickupAura: BABYLON.Mesh;
let deliveryAura: BABYLON.Mesh;
let gpsArrow: BABYLON.TransformNode;

let carVelocity = 0;
let wheelSpin = 0;
let licensePlateMat: BABYLON.StandardMaterial | null = null;
// =========================
// CAJA MANUAL / VELOCIDADES
// =========================

let currentGear = 1; // -1 reversa, 0 neutro, 1-5 velocidades
let transmissionMode: "auto" | "manual" = "auto";
let rpm = 900;
let speedKmh = 0;
let odometerKm = 0;
// =========================
// COMBUSTIBLE (guardado simple)
// =========================

const maxFuelLiters = 700;
const FUEL_SAVE_KEY = "niuwd_fuel_liters";

function loadFuelLiters(): number {
  try {
    const raw = localStorage.getItem(FUEL_SAVE_KEY);
    if (raw === null) return maxFuelLiters;

    const value = Number(raw);
    if (!Number.isFinite(value)) return maxFuelLiters;

    return Math.max(0, Math.min(maxFuelLiters, value));
  } catch {
    return maxFuelLiters;
  }
}

function saveFuelLiters() {
  try {
    localStorage.setItem(FUEL_SAVE_KEY, String(fuelLiters));
  } catch {
    // ignore
  }
}

let fuelLiters = loadFuelLiters();
// =========================
// VENTANA NIU GASOLINE
// =========================

let niuFuelWindowOpen = false;
let niuFuelCooldown = false;

// Evita que la ventana se active varias veces
// mientras el auto continúa dentro del aro.
let gasAuraWasTouched = false;

const fullFuelPrice = 50;
// =========================
// ASISTENCIA NIU POR COMBUSTIBLE
// =========================

let fuelWarning20Shown = false;
let fuelWarning10Shown = false;
let fuelWarning5Shown = false;
let niuAssistanceOpen = false;
let niuAssistanceInProgress = false;
let walkingFuelMissionActive = false;
let walkingFuelMissionDistance = 0;
let lastWalkingMissionPosition: BABYLON.Vector3 | null = null;
const walkingFuelHud = document.createElement("div");

walkingFuelHud.style.position = "fixed";
walkingFuelHud.style.left = "50%";
walkingFuelHud.style.bottom = "90px";
walkingFuelHud.style.transform = "translateX(-50%)";
walkingFuelHud.style.background = "rgba(0,0,0,0.78)";
walkingFuelHud.style.color = "white";
walkingFuelHud.style.padding = "12px 18px";
walkingFuelHud.style.borderRadius = "14px";
walkingFuelHud.style.zIndex = "99999";
walkingFuelHud.style.fontFamily = "Arial";
walkingFuelHud.style.fontSize = "16px";
walkingFuelHud.style.fontWeight = "bold";
walkingFuelHud.style.textAlign = "center";
walkingFuelHud.style.display = "none";
walkingFuelHud.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";

document.body.appendChild(walkingFuelHud);

function updateWalkingFuelHud() {
  if (!walkingFuelMissionActive) {
    walkingFuelHud.style.display = "none";
    return;
  }

  const walkedMeters = Math.min(walkingFuelMissionDistance, 1000);
  const remainingMeters = Math.max(1000 - walkedMeters, 0);

  walkingFuelHud.style.display = "block";

  walkingFuelHud.innerHTML = `
    🚶 Caminata por combustible<br>
    Caminado: ${walkedMeters.toFixed(0)} m / 1000 m<br>
    Falta: ${remainingMeters.toFixed(0)} m
  `;
}

const walkingFuelGoalKm = 1;
const walkingFuelReward = 100;

function startWalkingFuelMission() {
  if (!player) return;

  // Cerrar ventana de Asistencia Niu
  socialWindow.style.display = "none";
  socialWindow.innerHTML = "";

  // Liberar estado de la ventana
  niuAssistanceOpen = false;
  niuAssistanceInProgress = false;

  walkingFuelMissionActive = true;
  walkingFuelMissionDistance = 0;
  lastWalkingMissionPosition = player.position.clone();

  showMissionMessage(
    "Camina 1 km con tu avatar para ganar 100 monedas.",
    5000
  );
}

function updateWalkingFuelMission() {
  if (!walkingFuelMissionActive) return;
  if (!player) return;
  if (inCar) {
    lastWalkingMissionPosition = player.position.clone();
    return;
  }

  if (!lastWalkingMissionPosition) {
    lastWalkingMissionPosition = player.position.clone();
    return;
  }

  const moved = BABYLON.Vector3.Distance(
    lastWalkingMissionPosition,
    player.position
  );

  if (moved > 0.01 && moved < 2) {
    walkingFuelMissionDistance += moved;
  }

  lastWalkingMissionPosition = player.position.clone();
  updateWalkingFuelHud();

  const walkedKm = walkingFuelMissionDistance / 1000;

  if (walkedKm >= walkingFuelGoalKm) {
    walkingFuelMissionActive = false;
    updateWalkingFuelHud();
    lastWalkingMissionPosition = null;

    addDigitalCoins(walkingFuelReward);

    showMissionMessage(
      "Completaste la caminata. Ganaste 100 monedas para combustible.",
      6000
    );
    updateWalkingFuelHud();
    openNiuRoadAssistanceWindow();
  }
}

function getFuelPercent() {
  return (fuelLiters / maxFuelLiters) * 100;
}
function getFuelPurchaseCost() {

  const missingLiters =
    maxFuelLiters - fuelLiters;

  const cost =
    Math.ceil(
      (missingLiters / maxFuelLiters) *
      fullFuelPrice
    );

  return Math.max(cost, 0);

}

function playFuelBeep() {
  audioCtx = audioCtx || new AudioContext();

  audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = 900;

  gain.gain.value = 0.18;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.18);
}

function getNearestGasStationDistanceKm() {
  if (!car || gasStationTriggers.length === 0) {
    return 2.8;
  }

  let nearestDistance = Infinity;

  for (const station of gasStationTriggers) {
    if (
      !station.aura ||
      station.aura.isDisposed() ||
      !station.aura.isEnabled()
    ) {
      continue;
    }

    // El aro tiene padre, hay que usar posición mundial
    station.aura.computeWorldMatrix(true);
    const auraWorldPosition = station.aura.getAbsolutePosition();

    const distance = BABYLON.Vector3.Distance(
      car.position,
      auraWorldPosition
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
    }
  }

  if (!Number.isFinite(nearestDistance)) {
    return 2.8;
  }

  return nearestDistance / 1000;
}

function resetFuelWarnings() {
  fuelWarning20Shown = false;
  fuelWarning10Shown = false;
  fuelWarning5Shown = false;
}

// consumo aproximado:
// tanque completo ≈ 2 km
const fuelConsumptionPerKm = 20;

const gearMaxSpeed: Record<number, number> = {
  [-1]: 0.10,
  0: 0,

  1: 0.11, // 20 km/h
  2: 0.22, // 40 km/h
  3: 0.33, // 60 km/h
  4: 0.44, // 80 km/h
  5: 0.55, // 100 km/h
  6: 0.66, // 120 km/h
};

const gearAcceleration: Record<number, number> = {
  [-1]: 0.0010,
  0: 0,

  // aprox 2 segundos por cada 20 km/h
  1: 0.00092,
  2: 0.00092,
  3: 0.00092,
  4: 0.00092,
  5: 0.00092,
  6: 0.00092,
};
// =========================
// LUCES DEL AUTO
// =========================

let headlightMode = 0; // 0 apagado, 1 baja, 2 alta

let flashlightOn = false;
let avatarFlashlight: BABYLON.SpotLight | null = null;
let avatarLookDirection = new BABYLON.Vector3(0, 0, 1);

let leftHeadlight: BABYLON.SpotLight | null = null;
let rightHeadlight: BABYLON.SpotLight | null = null;

let leftRearLight: BABYLON.PointLight | null = null;
let rightRearLight: BABYLON.PointLight | null = null;

let brakeLeftLight: BABYLON.PointLight | null = null;
let brakeRightLight: BABYLON.PointLight | null = null;

let carEngineOn = false;
let audioCtx: AudioContext | null = null;
let idleOsc: OscillatorNode | null = null;
let idleGain: GainNode | null = null;
let accelSoundPlaying = false;

function setupCarSounds() {
  console.log("Sistema de sonido listo");
}

function playStartSound() {
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc1.type = "sawtooth";
  osc2.type = "triangle";

  osc1.frequency.setValueAtTime(35, now);
  osc1.frequency.linearRampToValueAtTime(95, now + 0.35);
  osc1.frequency.linearRampToValueAtTime(70, now + 1.1);

  osc2.frequency.setValueAtTime(55, now);
  osc2.frequency.linearRampToValueAtTime(120, now + 0.3);
  osc2.frequency.linearRampToValueAtTime(80, now + 1.1);

  filter.type = "lowpass";
  filter.frequency.value = 420;

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.5);
  gain.gain.linearRampToValueAtTime(0.001, now + 2.0);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 2.0);
  osc2.stop(now + 2.0);
}

function startIdleSound() {
  if (!audioCtx || idleOsc) return;

  const now = audioCtx.currentTime;

  idleOsc = audioCtx.createOscillator();
  idleGain = audioCtx.createGain();

  const filter = audioCtx.createBiquadFilter();

  idleOsc.type = "triangle";
  idleOsc.frequency.value = 35;

  filter.type = "lowpass";
  filter.frequency.value = 260;

  idleGain.gain.value = 0.30;

  idleOsc.connect(filter);
  filter.connect(idleGain);
  idleGain.connect(audioCtx.destination);

  idleOsc.start(now);
}

function stopIdleSound() {
  if (idleOsc) {
    idleOsc.stop();
    idleOsc.disconnect();
    idleOsc = null;
  }

  if (idleGain) {
    idleGain.disconnect();
    idleGain = null;
  }
}

async function toggleCarEngine() {
  if (!inCar) {
    console.log("Debes entrar al auto con F primero");
    return;
  }

 if (fuelLiters <= 0) {
  console.log("Sin combustible");
  carEngineOn = false;
  carVelocity = 0;
  stopIdleSound();
  return;
}

  audioCtx = audioCtx || new AudioContext();
  await audioCtx.resume();

  carEngineOn = !carEngineOn;

  if (carEngineOn) {
    console.log("Motor encendido");
    playStartSound();

    setTimeout(() => {
      if (carEngineOn) {
        startIdleSound();
      }
    }, 900);
  } else {
    console.log("Motor apagado");
    carVelocity = 0;
    stopIdleSound();
  }
}
const carWheels: BABYLON.TransformNode[] = [];
const frontWheels: BABYLON.TransformNode[] = [];
let carCameraMode = 0;
const maxForwardSpeed = 0.50;
const maxReverseSpeed = -0.14;
const acceleration = 0.006;
const braking = 0.0065;

// baja lentamente la velocidad cuando no aceleras ni frenas
const friction = 1;

// giro más suave
const turnSoftness = 0.03;

let leftLeg: BABYLON.Mesh | null = null;
let rightLeg: BABYLON.Mesh | null = null;
let leftArm: BABYLON.Mesh | null = null;
let rightArm: BABYLON.Mesh | null = null;
let walkTime = 0;

const keys: Record<string, boolean> = {};

function toggleCar() {
  if (!player || !car) return;

  if (!inCar) {
    const dist = BABYLON.Vector3.Distance(player.position, car.position);

    if (dist < 5) {
      inCar = true;
      player.visibility = 0;
      camera.target = car.position;
    }
  } else {
    inCar = false;
    player.visibility = 1;
    player.position = car.position.add(new BABYLON.Vector3(3, 0.3, 0));
    camera.target = player.position;
  }
}
window.addEventListener(
  "keydown",
  (e) => {
    const key = e.key.toLowerCase();
    const activeElement = document.activeElement;

    const isTyping =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement;

    if (isTyping) {
      keys[key] = false;
      return;
    }

    // Evitar que las flechas muevan la página
    if (
      [
        "w", "a", "s", "d",
        "arrowup", "arrowdown", "arrowleft", "arrowright",
        "x", "f", " ", "m", "1", "2", "3", "g", "t", "c", "r", "l", "q", "e",
      ].includes(key)
    ) {
      e.preventDefault();
    }

    keys[key] = true;

    // Flechas = mismo movimiento que WASD
    if (key === "arrowup") keys["w"] = true;
    if (key === "arrowdown") keys["s"] = true;
    if (key === "arrowleft") keys["a"] = true;
    if (key === "arrowright") keys["d"] = true;

    // Cambios manuales
if (key === "e" && !e.repeat && inCar && transmissionMode === "manual") {
  currentGear++;
  if (currentGear > 6) currentGear = 6;
}

if (key === "q" && !e.repeat && inCar && transmissionMode === "manual") {
  currentGear--;
  if (currentGear < -1) currentGear = -1;
}

    if (key === "r" && !e.repeat) {
  console.log("Presionaste R");
  toggleCarEngine();
}

if (key === "l" && !e.repeat) {
  if (!inCar) {
    flashlightOn = !flashlightOn;
    return;
  }

  headlightMode++;

  if (headlightMode > 2) {
    headlightMode = 0;
  }

  console.log("Modo luces:", headlightMode);
}
    if (key === "c" && !e.repeat && inCar) {
  carCameraMode = (carCameraMode + 1) % 3;
}
    if (key === "t" && !e.repeat && insideOlivarMap) {
  location.reload();
}
    if (key === "1" && !e.repeat) {

  // Si ya hay misión activa → desactivar
  if (missionStage !== "inactive") {

    missionStage = "inactive";

    pickupAura.setEnabled(false);
    deliveryAura.setEnabled(false);
    gpsArrow.setEnabled(false);

    console.log("Misión cancelada");

  } else {

    // Activar misión
    missionStage = "pickup";

    pickupAura.setEnabled(true);
    deliveryAura.setEnabled(false);
    gpsArrow.setEnabled(true);

    console.log("Misión iniciada");
  }
}
// Reservado para desarrollo
/*
if (key === "2" && !e.repeat) {
  setGpsDestination(
    -77.028950,
    -12.120720
  );
}
*/

if (key === "3" && !e.repeat) {
  // =========================
  // REGRESAR DESDE EL OLIVAR
  // =========================

  if (
    insideOlivarMap &&
    currentMapName === "real-estate"
  ) {
    keys["3"] = false;
    hideMissionCard();
    travelToLimaKennedy();
    return;
  }

  // =========================
  // CANCELAR MISIONES
  // =========================

  if (
    raceMissionActive ||
    multiplayerRaceActive ||
    missionStage !== "inactive" ||
    gpsNavigationActive ||
    routeMissionActive ||
    deliveryMissionActive ||
    medicineDeliveryMissionActive ||
    beverlyMansionMissionActive
  ) {
    cancelCurrentMission();
  }
}
    if (key === "m" && !e.repeat) {
  minimapExpanded = !minimapExpanded;

  if (minimapExpanded) {
    mapOffsetX = 0;
    mapOffsetZ = 0;
    mapZoom = 0.45;

    minimap.width = 520;
    minimap.height = 520;

    minimap.style.width = "520px";
    minimap.style.height = "520px";
    minimap.style.left = "50%";
    minimap.style.bottom = "50%";
    minimap.style.transform = "translate(-50%, 50%)";
    minimap.style.zIndex = "999";
  } else {
    mapZoom = 0.35;

    minimap.width = 180;
    minimap.height = 180;

    minimap.style.width = "180px";
    minimap.style.height = "180px";
    minimap.style.left = "12px";
    minimap.style.bottom = "12px";
    minimap.style.transform = "none";
    minimap.style.zIndex = "100";
  }
}

    if (key === "f" && !e.repeat && player && car) {
      if (!inCar) {
        const dist = BABYLON.Vector3.Distance(player.position, car.position);

        if (dist < 5) {
          inCar = true;
          player.setEnabled(false);
          camera.target = car.position;
        }
      } else {
        inCar = false;
        player.setEnabled(true);
player.position = car.position.add(new BABYLON.Vector3(2, 0, 0));
player.position.y = 0.85;

camera.target = player.position;
      }
    }
  },
  { passive: false }
);

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys[key] = false;

  // Soltar también el equivalente WASD
  if (key === "arrowup") keys["w"] = false;
  if (key === "arrowdown") keys["s"] = false;
  if (key === "arrowleft") keys["a"] = false;
  if (key === "arrowright") keys["d"] = false;
});

function createAvatar(position: BABYLON.Vector3) {
  player = BABYLON.MeshBuilder.CreateBox(
    "playerCollider",
    { width: 1, height: 2, depth: 1 },
    scene
  );

  player.position = position;
  player.position.y = 0.85;
  player.isVisible = false;

  const avatarRoot = new BABYLON.TransformNode("avatarRoot", scene);
  avatarRoot.parent = player;
  avatarRoot.position = new BABYLON.Vector3(0, 0, 0);

  const head = BABYLON.MeshBuilder.CreateSphere(
    "avatarHead",
    { diameter: 0.55 },
    scene
  );
  head.position = new BABYLON.Vector3(0, 1.05, 0);
  head.material = skinMat;
  head.parent = avatarRoot;

  const body = BABYLON.MeshBuilder.CreateBox(
    "avatarBody",
    { width: 0.7, height: 0.8, depth: 0.35 },
    scene
  );
  body.position = new BABYLON.Vector3(0, 0.45, 0);
  body.material = avatarMat;
  body.parent = avatarRoot;

  leftArm = BABYLON.MeshBuilder.CreateBox(
    "avatarLeftArm",
    { width: 0.22, height: 0.65, depth: 0.22 },
    scene
  );
  leftArm.position = new BABYLON.Vector3(-0.55, 0.45, 0);
  leftArm.material = avatarMat;
  leftArm.parent = avatarRoot;

  rightArm = BABYLON.MeshBuilder.CreateBox(
    "avatarRightArm",
    { width: 0.22, height: 0.65, depth: 0.22 },
    scene
  );
  rightArm.position = new BABYLON.Vector3(0.55, 0.45, 0);
  rightArm.material = avatarMat;
  rightArm.parent = avatarRoot;

  leftLeg = BABYLON.MeshBuilder.CreateBox(
    "avatarLeftLeg",
    { width: 0.25, height: 0.75, depth: 0.25 },
    scene
  );
  leftLeg.position = new BABYLON.Vector3(-0.22, -0.35, 0);
  leftLeg.material = avatarMat;
  leftLeg.parent = avatarRoot;

  rightLeg = BABYLON.MeshBuilder.CreateBox(
    "avatarRightLeg",
    { width: 0.25, height: 0.75, depth: 0.25 },
    scene
  );
  rightLeg.position = new BABYLON.Vector3(0.22, -0.35, 0);
  rightLeg.material = avatarMat;
  rightLeg.parent = avatarRoot;
  avatarFlashlight = new BABYLON.SpotLight(
  "avatarFlashlight",
  new BABYLON.Vector3(0.45, 0.8, 0.55),
  new BABYLON.Vector3(0, -0.25, 1),
  Math.PI / 3,
  2,
  scene
);

avatarFlashlight.parent = player;
avatarFlashlight.intensity = 0;
avatarFlashlight.range = 80;
avatarFlashlight.angle = Math.PI / 2.8;
avatarFlashlight.exponent = 1.2;
avatarFlashlight.diffuse = new BABYLON.Color3(1, 1, 0.85);
}

function createMiniCooper(position: BABYLON.Vector3) {
  const carBodyMat = mat("carBodyMat", new BABYLON.Color3(0.78, 0.68, 0.52));
  const carRoofMat = mat("carRoofMat", new BABYLON.Color3(0.95, 0.92, 0.84));
  const glassMat = mat("glassMat", new BABYLON.Color3(0.25, 0.45, 0.65));
  const wheelMat = mat("wheelMat", new BABYLON.Color3(0.03, 0.03, 0.03));
  const lightMat = mat("lightMat", new BABYLON.Color3(1, 0.95, 0.65));

  car = BABYLON.MeshBuilder.CreateBox(
    "carCollider",
    { width: 2.8, height: 1.4, depth: 4.4 },
    scene
  );
  car.position = position;
  car.position.y = 0.18;
  car.isVisible = false;

  const carRoot = new BABYLON.TransformNode("miniCooper", scene);
  carRoot.parent = car;

  const body = BABYLON.MeshBuilder.CreateBox(
    "carBody",
    { width: 2.8, height: 0.9, depth: 4.2 },
    scene
  );
  body.position.y = 0.38;
  body.material = carBodyMat;
  body.parent = carRoot;

  const roof = BABYLON.MeshBuilder.CreateBox(
    "carRoof",
    { width: 2.1, height: 0.7, depth: 2.1 },
    scene
  );
  roof.position.y = 1.02;
  roof.position.z = -0.15;
  roof.material = carRoofMat;
  roof.parent = carRoot;

  const windshield = BABYLON.MeshBuilder.CreateBox(
    "windshield",
    { width: 1.8, height: 0.45, depth: 0.08 },
    scene
  );
  windshield.position = new BABYLON.Vector3(0, 1.02, 1.05);
  windshield.material = glassMat;
  windshield.parent = carRoot;

  const rearGlass = BABYLON.MeshBuilder.CreateBox(
    "rearGlass",
    { width: 1.8, height: 0.45, depth: 0.08 },
    scene
  );
  rearGlass.position = new BABYLON.Vector3(0, 1.02, -1.25);
  rearGlass.material = glassMat;
  rearGlass.parent = carRoot;

  for (const x of [-0.8, 0.8]) {
    const lamp = BABYLON.MeshBuilder.CreateSphere(
      "frontLight",
      { diameter: 0.35 },
      scene
    );
    lamp.position = new BABYLON.Vector3(x, 0.45, 2.15);
    lamp.scaling.z = 0.25;
    lamp.material = lightMat;
    lamp.parent = carRoot;
  }

  for (const x of [-1.45, 1.45]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(
        "wheel",
        { diameter: 0.55, height: 0.3 },
        scene
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position = new BABYLON.Vector3(x, 0.22, z);
      wheel.material = wheelMat;
      wheel.parent = carRoot;
    }
  }
}

function createNiuSportCar(position: BABYLON.Vector3) {
  const bodyMat = mat("niuPurpleBody", new BABYLON.Color3(0.36, 0.05, 0.75));
  const darkMat = mat("niuDarkParts", new BABYLON.Color3(0.02, 0.02, 0.025));
  const glassMat = mat("niuGlass", new BABYLON.Color3(0.08, 0.16, 0.25));
  const tireMat = mat("niuTires", new BABYLON.Color3(0.01, 0.01, 0.01));
  const rimMat = mat("niuRims", new BABYLON.Color3(0.12, 0.12, 0.13));
  const chromeMat = mat("chromeRimMat", new BABYLON.Color3(0.85, 0.85, 0.9));
const darkChromeMat = mat("darkChromeMat", new BABYLON.Color3(0.08, 0.08, 0.09));
  const redMat = mat("niuRearLights", new BABYLON.Color3(1, 0.03, 0.02));

(redMat as BABYLON.StandardMaterial).emissiveColor =
  new BABYLON.Color3(0.6, 0, 0);
  const whiteMat = mat(
  "niuPlate",
  new BABYLON.Color3(0.35, 0.35, 0.35)
);
  
  car = BABYLON.MeshBuilder.CreateBox(
    "carCollider",
    { width: 2.05, height: 0.85, depth: 3.45 },
    scene
  );

  car.position = position.clone();
  car.position.y = 0.22;
  car.isVisible = false;

  const root = new BABYLON.TransformNode(
  "niuSportCar",
  scene
);

root.parent = car;

// REDUCIR AUTO AL 80%
root.scaling = new BABYLON.Vector3(
  0.8,
  0.8,
  0.8
);

// =========================
// LUCES DEL AUTO
// =========================

// Delanteras
leftHeadlight = new BABYLON.SpotLight(
  "leftHeadlight",
  new BABYLON.Vector3(-0.65, 0.45, 2.45),
  new BABYLON.Vector3(0, -0.45, 1),
  Math.PI / 2.2,
  1.5,
  scene
);
leftHeadlight.parent = root;
leftHeadlight.intensity = 0;
leftHeadlight.range = 90;

rightHeadlight = new BABYLON.SpotLight(
  "rightHeadlight",
  new BABYLON.Vector3(0.65, 0.45, 2.45),
  new BABYLON.Vector3(0, -0.45, 1),
  Math.PI / 2.2,
  1.5,
  scene
);
rightHeadlight.parent = root;
rightHeadlight.intensity = 0;
rightHeadlight.range = 90;

const headlightGlassMat = mat(
  "headlightGlassMat",
  new BABYLON.Color3(1, 1, 0.92)
);

(headlightGlassMat as BABYLON.StandardMaterial).emissiveColor =
  new BABYLON.Color3(1, 1, 0.8);

for (const x of [-0.85, 0.85]) {

  const headlight = BABYLON.MeshBuilder.CreateSphere(
    "frontHeadlight",
    {
      diameter: 0.38
    },
    scene
  );

  headlight.position = new BABYLON.Vector3(
    x,
    0.65,
    2.58
  );

  headlight.scaling.z = 0.4;

  headlight.material = headlightGlassMat;

  headlight.parent = root;
}

  const base = BABYLON.MeshBuilder.CreateBox(
    "carBase",
    { width: 3.1, height: 0.75, depth: 5.2 },
    scene
  );
  base.position.y = 0.45;
  base.material = bodyMat;
  base.parent = root;

  const hood = BABYLON.MeshBuilder.CreateBox(
    "carHood",
    { width: 2.8, height: 0.35, depth: 1.5 },
    scene
  );
  hood.position = new BABYLON.Vector3(0, 0.85, 1.35);
  hood.material = bodyMat;
  hood.parent = root;

  const cabin = BABYLON.MeshBuilder.CreateBox(
    "carCabin",
    { width: 2.35, height: 0.9, depth: 2.05 },
    scene
  );
  cabin.position = new BABYLON.Vector3(0, 1.15, -0.35);
  cabin.material = glassMat;
  cabin.parent = root;

  const roof = BABYLON.MeshBuilder.CreateBox(
    "carRoof",
    { width: 2.15, height: 0.18, depth: 1.65 },
    scene
  );
  roof.position = new BABYLON.Vector3(0, 1.68, -0.35);
  roof.material = darkMat;
  roof.parent = root;

  const spoiler = BABYLON.MeshBuilder.CreateBox(
    "rearSpoiler",
    { width: 2.6, height: 0.12, depth: 0.45 },
    scene
  );
  spoiler.position = new BABYLON.Vector3(0, 1.15, -2.45);
  spoiler.material = darkMat;
  spoiler.parent = root;

  carWheels.length = 0;
frontWheels.length = 0;

for (const x of [-1.62, 1.62]) {
  for (const z of [-1.65, 1.55]) {
    const side = x > 0 ? 1 : -1;

    // Este root solo gira cuando doblas
    const wheelRoot = new BABYLON.TransformNode("wheelRoot", scene);
    wheelRoot.position = new BABYLON.Vector3(x, 0.35, z);
    wheelRoot.parent = root;

    // Este root es el que rueda
    const spinRoot = new BABYLON.TransformNode("wheelSpinRoot", scene);
    spinRoot.parent = wheelRoot;

    const tire = BABYLON.MeshBuilder.CreateCylinder(
      "sportWheel",
      { diameter: 0.78, height: 0.38, tessellation: 32 },
      scene
    );
    tire.rotation.z = Math.PI / 2;
    tire.material = tireMat;
    tire.parent = spinRoot;

    // Rin cromado interior
    const rim = BABYLON.MeshBuilder.CreateCylinder(
      "chromeRim",
      { diameter: 0.50, height: 0.08, tessellation: 32 },
      scene
    );
    rim.rotation.z = Math.PI / 2;
    rim.position.x = side * 0.22;
    rim.material = chromeMat;
    rim.parent = spinRoot;

    // Centro del rin
    const hub = BABYLON.MeshBuilder.CreateCylinder(
      "wheelHub",
      { diameter: 0.18, height: 0.09, tessellation: 24 },
      scene
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.x = side * 0.27;
    hub.material = whiteMat;
    hub.parent = spinRoot;

    // Rayos DENTRO del rin, no en la llanta
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;

      const spoke = BABYLON.MeshBuilder.CreateBox(
        "rimInnerSpoke",
        { width: 0.035, height: 0.055, depth: 0.34 },
        scene
      );

      spoke.position = new BABYLON.Vector3(
        side * 0.285,
        Math.sin(angle) * 0.13,
        Math.cos(angle) * 0.13
      );

      spoke.rotation.x = angle;
      spoke.material = i % 2 === 0 ? chromeMat : darkChromeMat;
      spoke.parent = spinRoot;
    }

    carWheels.push(spinRoot);

    if (z > 0) {
      frontWheels.push(wheelRoot);
    }
  }
}

  for (const x of [-0.75, 0.75]) {
    const rearLight = BABYLON.MeshBuilder.CreateBox(
      "rearLight",
      { width: 0.65, height: 0.18, depth: 0.08 },
      scene
    );
    rearLight.position = new BABYLON.Vector3(x, 0.62, -2.65);
    rearLight.material = redMat;
    rearLight.parent = root;
  }

  const plate = BABYLON.MeshBuilder.CreateBox(
    "niuPlate",
    { width: 1.1, height: 0.35, depth: 0.08 },
    scene
  );
  plate.position = new BABYLON.Vector3(0, 0.48, -2.72);
  plate.material = whiteMat;
  plate.parent = root;

  const textTexture = new BABYLON.DynamicTexture(
    "plateTexture",
    { width: 512, height: 128 },
    scene,
    true
  );

  const ctx = textTexture.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "black";
  ctx.font = "bold 54px Arial";
  ctx.textAlign = "center";
  ctx.fillText("NIU-2026", 256, 82);
  textTexture.update();

  licensePlateMat = new BABYLON.StandardMaterial(
  "plateMat",
  scene
);

licensePlateMat.diffuseTexture = textTexture;
licensePlateMat.emissiveTexture = textTexture;
licensePlateMat.emissiveColor = new BABYLON.Color3(0, 0, 0);

plate.material = licensePlateMat;
}
// =========================
// HOSPITAL DE MANHATTAN
// Base para la misión de fantasmas
// =========================

let manhattanHospitalRoot: BABYLON.Mesh | null = null;
let manhattanHospitalEntranceAura: BABYLON.Mesh | null = null;

// =========================
// CASA 1 - MISIÓN DE MEDICINAS
// =========================

let manhattanMedicineHouse1Root: BABYLON.Mesh | null = null;
let manhattanMedicineHouse1Aura: BABYLON.Mesh | null = null;

// =========================
// CASAS DE ENTREGA DE MEDICINA
// MANHATTAN
// =========================

const MANHATTAN_MEDICINE_HOUSES = [
  {
    id: "medicineHouse1",
    lat: 40.73288355547422,
    lon: -73.98373024360717,
    rotationY: 0,
    addressLine1: "15th St",
    addressLine2: "New York, NY 10003",
  },

  {
    id: "medicineHouse2",
    lat: 40.73613892564706,
    lon: -73.98386449147382,
    rotationY: 0,
    addressLine1: "20th St",
    addressLine2: "New York, NY 10003",
  },

  {
    id: "medicineHouse3",
    lat: 40.73595653659415,
    lon: -73.98120442855769,
    rotationY: Math.PI,
    addressLine1: "E 20th St",
    addressLine2: "New York, NY 10003",
  },

  {
    id: "medicineHouse4",
    lat: 40.738826354157254,
    lon: -73.97810516825969,
    rotationY: Math.PI / 6,
    addressLine1: "E 23rd St",
    addressLine2: "New York, NY 10010",
  },

  {
    id: "medicineHouse5",
    lat: 40.742875554598264,
    lon: -73.98073671202164,
    rotationY: -Math.PI / 0.5,
    addressLine1: "E 27th St",
    addressLine2: "New York, NY 10016",
  },

  {
    id: "medicineHouse6",
    lat: 40.74441684135538,
    lon: -73.98048442170112,
    rotationY: Math.PI / 4,
    addressLine1: "E 29th St",
    addressLine2: "New York, NY 10016",
  },

  {
    id: "medicineHouse7",
    lat: 40.743116303768915,
    lon: -73.97511690086802,
    rotationY: Math.PI / 1,
    addressLine1: "E 28th St",
    addressLine2: "New York, NY 10016",
  },

  {
    id: "medicineHouse8",
    lat: 40.741134952392535,
    lon: -73.97623373012364,
    rotationY: Math.PI / 7.5,
    addressLine1: "E 26th St",
    addressLine2: "New York, NY 10010",
  },
];
type MedicineDeliveryHouse = {
  id: string;
  root: BABYLON.Mesh;
  aura: BABYLON.Mesh;
  lat: number;
  lon: number;
  addressLine1: string;
  addressLine2: string;
};

const manhattanMedicineHouses:
  MedicineDeliveryHouse[] = [];

const MANHATTAN_HOSPITAL = {
  lat: 40.732502302764665,
  lon: -73.97952673513743,

  // Puedes cambiar esta rotación si el frente
  // no queda orientado hacia la calle.
  rotationY: 2,
};

function createManhattanHospitalAtLonLat(
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // =========================
  // OCULTAR EDIFICIOS OSM CERCANOS
  // =========================
  // Evita que un edificio generado por Manhattan
  // atraviese visualmente el nuevo hospital.

  for (const mesh of scene.meshes) {
    if (
      mesh.name !== "osmBuilding" ||
      mesh.isDisposed()
    ) {
      continue;
    }

    const dx = mesh.position.x - pos.x;
    const dz = mesh.position.z - pos.z;

    const distance = Math.sqrt(
      dx * dx +
      dz * dz
    );

    if (distance < 35) {
      mesh.setEnabled(false);
    }
  }

  // =========================
  // MATERIALES
  // =========================

  const hospitalWallMat = mat(
    "manhattanHospitalWallMat",
    new BABYLON.Color3(
      0.64,
      0.68,
      0.72
    )
  );

  hospitalWallMat.specularColor =
    new BABYLON.Color3(
      0.06,
      0.06,
      0.06
    );

  const hospitalLightWallMat = mat(
    "manhattanHospitalLightWallMat",
    new BABYLON.Color3(
      0.78,
      0.81,
      0.83
    )
  );

  const hospitalDarkMat = mat(
    "manhattanHospitalDarkMat",
    new BABYLON.Color3(
      0.075,
      0.095,
      0.13
    )
  );

  const hospitalBlueMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalBlueMat",
      scene
    );

  hospitalBlueMat.diffuseColor =
    new BABYLON.Color3(
      0.03,
      0.30,
      0.80
    );

  hospitalBlueMat.emissiveColor =
    new BABYLON.Color3(
      0.015,
      0.08,
      0.24
    );

  hospitalBlueMat.specularColor =
    BABYLON.Color3.Black();

  const hospitalWhiteMat = mat(
    "manhattanHospitalWhiteMat",
    new BABYLON.Color3(
      0.94,
      0.95,
      0.96
    )
  );

  const hospitalConcreteMat = mat(
    "manhattanHospitalConcreteMat",
    new BABYLON.Color3(
      0.34,
      0.36,
      0.39
    )
  );

  const hospitalGlassMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalGlassMat",
      scene
    );

  hospitalGlassMat.diffuseColor =
    new BABYLON.Color3(
      0.08,
      0.24,
      0.34
    );

  hospitalGlassMat.emissiveColor =
    new BABYLON.Color3(
      0.025,
      0.08,
      0.11
    );

  hospitalGlassMat.alpha = 0.82;

  hospitalGlassMat.specularColor =
    new BABYLON.Color3(
      0.22,
      0.28,
      0.32
    );

  hospitalGlassMat.needDepthPrePass = true;
  hospitalGlassMat.backFaceCulling = true;

  const hospitalWindowLightMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalWindowLightMat",
      scene
    );

  hospitalWindowLightMat.diffuseColor =
    new BABYLON.Color3(
      0.62,
      0.80,
      0.90
    );

  hospitalWindowLightMat.emissiveColor =
    new BABYLON.Color3(
      0.12,
      0.28,
      0.34
    );

  hospitalWindowLightMat.specularColor =
    BABYLON.Color3.Black();

  const hospitalEntranceLightMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalEntranceLightMat",
      scene
    );

  hospitalEntranceLightMat.diffuseColor =
    new BABYLON.Color3(
      1,
      0.88,
      0.64
    );

  hospitalEntranceLightMat.emissiveColor =
    new BABYLON.Color3(
      0.65,
      0.44,
      0.18
    );

  hospitalEntranceLightMat.specularColor =
    BABYLON.Color3.Black();

  // =========================
  // RAÍZ PRINCIPAL
  // =========================

  const hospitalRoot =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalRoot",
      {
        width: 0.1,
        height: 0.1,
        depth: 0.1,
      },
      scene
    );

  hospitalRoot.position =
    new BABYLON.Vector3(
      pos.x,
      0,
      pos.z
    );

  hospitalRoot.rotation.y = rotationY;
  hospitalRoot.isVisible = false;
  hospitalRoot.isPickable = false;

  manhattanHospitalRoot = hospitalRoot;

  // =========================
  // PLATAFORMA
  // =========================

  const platform =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalPlatform",
      {
        width: 39,
        height: 0.26,
        depth: 28,
      },
      scene
    );

  platform.position =
    new BABYLON.Vector3(
      0,
      0.13,
      0
    );

  platform.material =
    hospitalConcreteMat;

  platform.parent =
    hospitalRoot;

  platform.isPickable = false;

  // Acera frontal privada
  const hospitalSidewalk =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalSidewalk",
      {
        width: 31,
        height: 0.18,
        depth: 5,
      },
      scene
    );

  hospitalSidewalk.position =
    new BABYLON.Vector3(
      0,
      0.22,
      -15
    );

  hospitalSidewalk.material =
    hospitalLightWallMat;

  hospitalSidewalk.parent =
    hospitalRoot;

  hospitalSidewalk.isPickable = false;

  // =========================
  // CUERPO CENTRAL
  // =========================

  const centralBuilding =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalCentralBuilding",
      {
        width: 23,
        height: 19,
        depth: 17,
      },
      scene
    );

  centralBuilding.position =
    new BABYLON.Vector3(
      0,
      9.65,
      1
    );

  centralBuilding.material =
    hospitalWallMat;

  centralBuilding.parent =
    hospitalRoot;

  centralBuilding.isPickable = false;

  // =========================
  // ALA IZQUIERDA
  // =========================

  const leftWing =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalLeftWing",
      {
        width: 8,
        height: 14,
        depth: 14,
      },
      scene
    );

  leftWing.position =
    new BABYLON.Vector3(
      -15,
      7.15,
      2
    );

  leftWing.material =
    hospitalLightWallMat;

  leftWing.parent =
    hospitalRoot;

  leftWing.isPickable = false;

  // Conector izquierdo
  const leftConnector =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalLeftConnector",
      {
        width: 5,
        height: 10,
        depth: 10,
      },
      scene
    );

  leftConnector.position =
    new BABYLON.Vector3(
      -10.5,
      5.15,
      1
    );

  leftConnector.material =
    hospitalWallMat;

  leftConnector.parent =
    hospitalRoot;

  leftConnector.isPickable = false;

  // =========================
  // ALA DERECHA
  // =========================

  const rightWing =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalRightWing",
      {
        width: 8,
        height: 14,
        depth: 14,
      },
      scene
    );

  rightWing.position =
    new BABYLON.Vector3(
      15,
      7.15,
      2
    );

  rightWing.material =
    hospitalLightWallMat;

  rightWing.parent =
    hospitalRoot;

  rightWing.isPickable = false;

  // Conector derecho
  const rightConnector =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalRightConnector",
      {
        width: 5,
        height: 10,
        depth: 10,
      },
      scene
    );

  rightConnector.position =
    new BABYLON.Vector3(
      10.5,
      5.15,
      1
    );

  rightConnector.material =
    hospitalWallMat;

  rightConnector.parent =
    hospitalRoot;

  rightConnector.isPickable = false;

  // =========================
  // CORONACIÓN DEL EDIFICIO
  // =========================

  const roofTop =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalRoofTop",
      {
        width: 24,
        height: 0.8,
        depth: 18,
      },
      scene
    );

  roofTop.position =
    new BABYLON.Vector3(
      0,
      19.5,
      1
    );

  roofTop.material =
    hospitalDarkMat;

  roofTop.parent =
    hospitalRoot;

  roofTop.isPickable = false;

  // Unidad técnica del techo
  const roofTechnicalUnit =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalRoofTechnicalUnit",
      {
        width: 8,
        height: 2.2,
        depth: 5,
      },
      scene
    );

  roofTechnicalUnit.position =
    new BABYLON.Vector3(
      3,
      21,
      2
    );

  roofTechnicalUnit.material =
    hospitalConcreteMat;

  roofTechnicalUnit.parent =
    hospitalRoot;

  roofTechnicalUnit.isPickable = false;

  // =========================
  // FACHADA FRONTAL CENTRAL
  // =========================

  const frontFacade =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalFrontFacade",
      {
        width: 23.4,
        height: 17.2,
        depth: 0.32,
      },
      scene
    );

  frontFacade.position =
    new BABYLON.Vector3(
      0,
      9.4,
      -7.68
    );

  frontFacade.material =
    hospitalLightWallMat;

  frontFacade.parent =
    hospitalRoot;

  frontFacade.isPickable = false;

  // Franja azul superior
  const upperBlueBand =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalUpperBlueBand",
      {
        width: 23.8,
        height: 1.15,
        depth: 0.40,
      },
      scene
    );

  upperBlueBand.position =
    new BABYLON.Vector3(
      0,
      16.4,
      -7.91
    );

  upperBlueBand.material =
    hospitalBlueMat;

  upperBlueBand.parent =
    hospitalRoot;

  upperBlueBand.isPickable = false;

  // =========================
  // VENTANAS DEL EDIFICIO
  // =========================

  const floors = [
    6.7,
    10.3,
    13.9,
  ];

  const centralWindowXs = [
    -8,
    -4,
    0,
    4,
    8,
  ];

  for (const floorY of floors) {
    for (const windowX of centralWindowXs) {
      const window =
        BABYLON.MeshBuilder.CreateBox(
          "manhattanHospitalWindow",
          {
            width: 2.6,
            height: 1.65,
            depth: 0.18,
          },
          scene
        );

      window.position =
        new BABYLON.Vector3(
          windowX,
          floorY,
          -7.91
        );

      window.material =
        hospitalWindowLightMat;

      window.parent =
        hospitalRoot;

      window.isPickable = false;
    }
  }

  // Ventanas de las alas
  for (const wingX of [-15, 15]) {
    for (const floorY of [4.7, 8.1, 11.5]) {
      for (const localX of [-2.1, 2.1]) {
        const window =
          BABYLON.MeshBuilder.CreateBox(
            "manhattanHospitalWingWindow",
            {
              width: 1.8,
              height: 1.45,
              depth: 0.18,
            },
            scene
          );

        window.position =
          new BABYLON.Vector3(
            wingX + localX,
            floorY,
            -5.15
          );

        window.material =
          hospitalWindowLightMat;

        window.parent =
          hospitalRoot;

        window.isPickable = false;
      }
    }
  }

  // =========================
  // ENTRADA PRINCIPAL
  // =========================

  const entranceStructure =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalEntranceStructure",
      {
        width: 12,
        height: 5,
        depth: 3.6,
      },
      scene
    );

  entranceStructure.position =
    new BABYLON.Vector3(
      0,
      2.8,
      -9.2
    );

  entranceStructure.material =
    hospitalDarkMat;

  entranceStructure.parent =
    hospitalRoot;

  entranceStructure.isPickable = false;

  // Vestíbulo de vidrio
  const entranceGlass =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalEntranceGlass",
      {
        width: 10.7,
        height: 4.1,
        depth: 0.22,
      },
      scene
    );

  entranceGlass.position =
    new BABYLON.Vector3(
      0,
      2.35,
      -11.08
    );

  entranceGlass.material =
    hospitalGlassMat;

  entranceGlass.parent =
    hospitalRoot;

  entranceGlass.isPickable = false;

  // Puertas dobles
  for (const x of [-1.45, 1.45]) {
    const door =
      BABYLON.MeshBuilder.CreateBox(
        "manhattanHospitalDoor",
        {
          width: 2.55,
          height: 3.55,
          depth: 0.12,
        },
        scene
      );

    door.position =
      new BABYLON.Vector3(
        x,
        2.05,
        -11.23
      );

    door.material =
      hospitalGlassMat;

    door.parent =
      hospitalRoot;

    door.isPickable = false;
  }

  // División de las puertas
  const doorDivider =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalDoorDivider",
      {
        width: 0.16,
        height: 3.65,
        depth: 0.16,
      },
      scene
    );

  doorDivider.position =
    new BABYLON.Vector3(
      0,
      2.05,
      -11.36
    );

  doorDivider.material =
    hospitalWhiteMat;

  doorDivider.parent =
    hospitalRoot;

  doorDivider.isPickable = false;

  // Marcos verticales
  for (const x of [-5.2, -2.85, 2.85, 5.2]) {
    const frame =
      BABYLON.MeshBuilder.CreateBox(
        "manhattanHospitalEntranceFrame",
        {
          width: 0.15,
          height: 4.1,
          depth: 0.16,
        },
        scene
      );

    frame.position =
      new BABYLON.Vector3(
        x,
        2.35,
        -11.34
      );

    frame.material =
      hospitalWhiteMat;

    frame.parent =
      hospitalRoot;

    frame.isPickable = false;
  }

  // =========================
  // MARQUESINA
  // =========================

  const canopy =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalCanopy",
      {
        width: 15,
        height: 0.48,
        depth: 4.8,
      },
      scene
    );

  canopy.position =
    new BABYLON.Vector3(
      0,
      5.45,
      -10.3
    );

  canopy.material =
    hospitalLightWallMat;

  canopy.parent =
    hospitalRoot;

  canopy.isPickable = false;

  // Franja azul en la marquesina
  const canopyBlueBand =
    BABYLON.MeshBuilder.CreateBox(
      "manhattanHospitalCanopyBlueBand",
      {
        width: 15.2,
        height: 0.55,
        depth: 0.26,
      },
      scene
    );

  canopyBlueBand.position =
    new BABYLON.Vector3(
      0,
      5.28,
      -12.75
    );

  canopyBlueBand.material =
    hospitalBlueMat;

  canopyBlueBand.parent =
    hospitalRoot;

  canopyBlueBand.isPickable = false;

  // Luces visibles bajo la marquesina
  for (const x of [-4.5, -1.5, 1.5, 4.5]) {
    const canopyLamp =
      BABYLON.MeshBuilder.CreateBox(
        "manhattanHospitalCanopyLamp",
        {
          width: 1.4,
          height: 0.08,
          depth: 0.65,
        },
        scene
      );

    canopyLamp.position =
      new BABYLON.Vector3(
        x,
        5.16,
        -10.3
      );

    canopyLamp.material =
      hospitalEntranceLightMat;

    canopyLamp.parent =
      hospitalRoot;

    canopyLamp.isPickable = false;
  }

  // =========================
  // COLUMNAS DE LA ENTRADA
  // =========================

  for (const x of [-6.3, 6.3]) {
    const column =
      BABYLON.MeshBuilder.CreateBox(
        "manhattanHospitalEntranceColumn",
        {
          width: 0.5,
          height: 5.1,
          depth: 0.5,
        },
        scene
      );

    column.position =
      new BABYLON.Vector3(
        x,
        2.7,
        -11.1
      );

    column.material =
      hospitalConcreteMat;

    column.parent =
      hospitalRoot;

    column.isPickable = false;
  }

  // =========================
  // CARTEL DE ENTRANCE
  // =========================

  const entranceTexture =
    new BABYLON.DynamicTexture(
      "manhattanHospitalEntranceTexture",
      {
        width: 1024,
        height: 220,
      },
      scene,
      true
    );

  const entranceCtx =
    entranceTexture.getContext() as CanvasRenderingContext2D;

  entranceCtx.fillStyle = "#1260B8";
  entranceCtx.fillRect(
    0,
    0,
    1024,
    220
  );

  entranceCtx.strokeStyle = "white";
  entranceCtx.lineWidth = 10;
  entranceCtx.strokeRect(
    8,
    8,
    1008,
    204
  );

  entranceCtx.fillStyle = "white";
  entranceCtx.font = "bold 105px Arial";
  entranceCtx.textAlign = "center";
  entranceCtx.textBaseline = "middle";

  entranceCtx.fillText(
    "ENTRANCE",
    512,
    112
  );

  entranceTexture.update();

  const entranceSignMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalEntranceSignMat",
      scene
    );

  entranceSignMat.diffuseTexture =
    entranceTexture;

  entranceSignMat.emissiveTexture =
    entranceTexture;

  entranceSignMat.emissiveColor =
    new BABYLON.Color3(
      0.55,
      0.55,
      0.55
    );

  entranceSignMat.disableLighting = true;
  entranceSignMat.backFaceCulling = false;

  const entranceSign =
    BABYLON.MeshBuilder.CreatePlane(
      "manhattanHospitalEntranceSign",
      {
        width: 5.4,
        height: 1.15,
      },
      scene
    );

  entranceSign.position =
    new BABYLON.Vector3(
      0,
      4.45,
      -12.82
    );

  // Evita que ENTRANCE aparezca invertido.
entranceSign.rotation.y = 0;

  entranceSign.material =
    entranceSignMat;

  entranceSign.parent =
    hospitalRoot;

  entranceSign.isPickable = false;

  // =========================
  // CARTEL PRINCIPAL
  // =========================

  const hospitalSignTexture =
    new BABYLON.DynamicTexture(
      "manhattanHospitalMainSignTexture",
      {
        width: 1400,
        height: 300,
      },
      scene,
      true
    );

  const signCtx =
    hospitalSignTexture.getContext() as CanvasRenderingContext2D;

  signCtx.fillStyle = "#DDE3E8";
  signCtx.fillRect(
    0,
    0,
    1400,
    300
  );

  signCtx.strokeStyle = "#1260B8";
  signCtx.lineWidth = 14;
  signCtx.strokeRect(
    8,
    8,
    1384,
    284
  );

  // Cuadro azul con H
  signCtx.fillStyle = "#1260B8";
  signCtx.fillRect(
    28,
    42,
    190,
    216
  );

  signCtx.fillStyle = "white";
  signCtx.font = "bold 165px Arial";
  signCtx.textAlign = "center";
  signCtx.textBaseline = "middle";

  signCtx.fillText(
    "H",
    123,
    155
  );

  signCtx.fillStyle = "#164E83";
  signCtx.font = "bold 93px Arial";
  signCtx.textAlign = "left";

  signCtx.fillText(
    "MANHATTAN HOSPITAL",
    255,
    157
  );

  hospitalSignTexture.update();

  const hospitalSignMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalMainSignMat",
      scene
    );

  hospitalSignMat.diffuseTexture =
    hospitalSignTexture;

  hospitalSignMat.emissiveTexture =
    hospitalSignTexture;

  hospitalSignMat.emissiveColor =
    new BABYLON.Color3(
      0.50,
      0.50,
      0.50
    );

  hospitalSignMat.disableLighting = true;
  hospitalSignMat.backFaceCulling = false;

  const hospitalSign =
    BABYLON.MeshBuilder.CreatePlane(
      "manhattanHospitalMainSign",
      {
        width: 17,
        height: 3.65,
      },
      scene
    );

  hospitalSign.position =
    new BABYLON.Vector3(
      0,
      17.5,
      -8.03
    );
  
  // La cara frontal del plano debe mirar hacia la entrada.
  hospitalSign.rotation.y = 0;

  hospitalSign.material =
    hospitalSignMat;

  hospitalSign.parent =
    hospitalRoot;

  hospitalSign.isPickable = false;

  // =========================
  // LETRERO VERTICAL H
  // =========================

  const verticalHTexture =
    new BABYLON.DynamicTexture(
      "manhattanHospitalVerticalHTexture",
      {
        width: 512,
        height: 512,
      },
      scene,
      true
    );

  const verticalCtx =
    verticalHTexture.getContext() as CanvasRenderingContext2D;

  verticalCtx.fillStyle = "#1260B8";
  verticalCtx.fillRect(
    0,
    0,
    512,
    512
  );

  verticalCtx.strokeStyle = "white";
  verticalCtx.lineWidth = 24;
  verticalCtx.strokeRect(
    18,
    18,
    476,
    476
  );

  verticalCtx.fillStyle = "white";
  verticalCtx.font = "bold 350px Arial";
  verticalCtx.textAlign = "center";
  verticalCtx.textBaseline = "middle";

  verticalCtx.fillText(
    "H",
    256,
    275
  );

  verticalHTexture.update();

  const verticalHMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalVerticalHMat",
      scene
    );

  verticalHMat.diffuseTexture =
    verticalHTexture;

  verticalHMat.emissiveTexture =
    verticalHTexture;

  verticalHMat.emissiveColor =
    new BABYLON.Color3(
      0.6,
      0.6,
      0.6
    );

  verticalHMat.disableLighting = true;
  verticalHMat.backFaceCulling = false;

  const verticalHSign =
    BABYLON.MeshBuilder.CreatePlane(
      "manhattanHospitalVerticalHSign",
      {
        width: 3.5,
        height: 3.5,
      },
      scene
    );

  verticalHSign.position =
    new BABYLON.Vector3(
      -9,
      17.5,
      -8.08
    );

  // CORRECCIÓN
verticalHSign.rotation.y = 0;

  verticalHSign.material =
    verticalHMat;

  verticalHSign.parent =
    hospitalRoot;

  verticalHSign.isPickable = false;

  // =========================
  // JARDINERAS
  // =========================

  for (const x of [-10, -7.5, 7.5, 10]) {
    const planter =
      BABYLON.MeshBuilder.CreateBox(
        "manhattanHospitalPlanter",
        {
          width: 2,
          height: 0.55,
          depth: 1.4,
        },
        scene
      );

    planter.position =
      new BABYLON.Vector3(
        x,
        0.48,
        -12.2
      );

    planter.material =
      hospitalConcreteMat;

    planter.parent =
      hospitalRoot;

    planter.isPickable = false;

    const bush =
      BABYLON.MeshBuilder.CreateSphere(
        "manhattanHospitalBush",
        {
          diameter: 1.45,
          segments: 8,
        },
        scene
      );

    bush.position =
      new BABYLON.Vector3(
        x,
        1.08,
        -12.2
      );

    bush.scaling =
      new BABYLON.Vector3(
        1.15,
        0.72,
        0.85
      );

    bush.material =
      treeMat;

    bush.parent =
      hospitalRoot;

    bush.isPickable = false;
  }

  // =========================
  // BOLARDOS FRONTALES
  // =========================

  for (const x of [-8, -5.5, 5.5, 8]) {
    const bollard =
      BABYLON.MeshBuilder.CreateCylinder(
        "manhattanHospitalBollard",
        {
          height: 1.2,
          diameter: 0.32,
          tessellation: 12,
        },
        scene
      );

    bollard.position =
      new BABYLON.Vector3(
        x,
        0.75,
        -14
      );

    bollard.material =
      hospitalDarkMat;

    bollard.parent =
      hospitalRoot;

    bollard.isPickable = false;

    const bollardLight =
      BABYLON.MeshBuilder.CreateCylinder(
        "manhattanHospitalBollardLight",
        {
          height: 0.14,
          diameter: 0.34,
          tessellation: 12,
        },
        scene
      );

    bollardLight.position =
      new BABYLON.Vector3(
        x,
        1.3,
        -14
      );

    bollardLight.material =
      hospitalEntranceLightMat;

    bollardLight.parent =
      hospitalRoot;

    bollardLight.isPickable = false;
  }

  // =========================
  // ILUMINACIÓN REAL
  // =========================
  // Solo dos luces para evitar una caída importante
  // de FPS.

  const hospitalFacadeLight =
    new BABYLON.PointLight(
      "manhattanHospitalFacadeLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  hospitalFacadeLight.parent =
    hospitalRoot;

  hospitalFacadeLight.position =
    new BABYLON.Vector3(
      0,
      8,
      -12
    );

  hospitalFacadeLight.diffuse =
    new BABYLON.Color3(
      0.55,
      0.75,
      1
    );

  hospitalFacadeLight.specular =
    BABYLON.Color3.Black();

  hospitalFacadeLight.intensity =
    1.35;

  hospitalFacadeLight.range =
    27;

  const hospitalEntranceLight =
    new BABYLON.PointLight(
      "manhattanHospitalEntranceLight",
      BABYLON.Vector3.Zero(),
      scene
    );

  hospitalEntranceLight.parent =
    hospitalRoot;

  hospitalEntranceLight.position =
    new BABYLON.Vector3(
      0,
      4.7,
      -11.8
    );

  hospitalEntranceLight.diffuse =
    new BABYLON.Color3(
      1,
      0.82,
      0.55
    );

  hospitalEntranceLight.specular =
    BABYLON.Color3.Black();

  hospitalEntranceLight.intensity =
    1.65;

  hospitalEntranceLight.range =
    17;

  // =========================
  // ARO DE ENTRADA
  // =========================
  // Más adelante este aro activará la recogida
  // de medicinas para la misión de fantasmas.

  const hospitalAuraMat =
    new BABYLON.StandardMaterial(
      "manhattanHospitalAuraMat",
      scene
    );

  hospitalAuraMat.diffuseColor =
    new BABYLON.Color3(
      0.10,
      0.48,
      1
    );

  hospitalAuraMat.emissiveColor =
    new BABYLON.Color3(
      0.10,
      0.48,
      1
    );

  hospitalAuraMat.alpha = 0.58;

  manhattanHospitalEntranceAura =
    BABYLON.MeshBuilder.CreateCylinder(
      "manhattanHospitalEntranceAura",
      {
        diameter: 8,
        height: 0.28,
        tessellation: 48,
      },
      scene
    );

  manhattanHospitalEntranceAura.position =
    new BABYLON.Vector3(
      0,
      0.32,
      -15
    );

  manhattanHospitalEntranceAura.material =
    hospitalAuraMat;

  manhattanHospitalEntranceAura.parent =
    hospitalRoot;

  manhattanHospitalEntranceAura.isPickable =
    false;

  manhattanHospitalEntranceAura
    .alwaysSelectAsActiveMesh = true;

  // Por ahora el aro se mantiene oculto.
  // Se activará cuando creemos la misión.
  manhattanHospitalEntranceAura.setEnabled(
    false
  );

  // =========================
  // REGISTRO
  // =========================

  activeMapMeshes.push(
    hospitalRoot
  );

  // Registrar únicamente la raíz porque todas
  // las partes del hospital son hijas.
  registerChunkMesh(
    hospitalRoot
  );

  registerCullable(
    hospitalRoot
  );

  // Agregar el hospital al minimapa.
  const hospitalAlreadyRegistered =
    mapLegendPoints.some(
      (item) =>
        item.name ===
        "Manhattan Hospital"
    );

  if (!hospitalAlreadyRegistered) {
    mapLegendPoints.push({
  name: "Manhattan Hospital",
  lon,
  lat,
  icon: "🏥",
  color: "#1260B8",
  mapName: "manhattan",
});
  }

  hospitalRoot.metadata = {
    type: "manhattanHospital",
    latitude: lat,
    longitude: lon,
    entranceAura:
      manhattanHospitalEntranceAura,
  };

  return hospitalRoot;
}
// =========================
// CASA NEOYORQUINA PARA ENTREGA
// DE MEDICINAS - CASA 1
// =========================

function createManhattanMedicineHouseAtLonLat(
  name: string,
  lon: number,
  lat: number,
  rotationY: number,
  addressLine1: string,
  addressLine2: string
) {
  const pos = lonLatToWorld(
    lon,
    lat
  );

  // Identificador seguro para materiales y meshes.
  const houseId =
    name
      .replaceAll(" ", "_")
      .toLowerCase();

  // =========================
  // OCULTAR EDIFICIO OSM CERCANO
  // =========================
  // Evita que un edificio generado por el mapa
  // atraviese la casa personalizada.

  for (const mesh of scene.meshes) {
    if (
      mesh.name !== "osmBuilding" ||
      mesh.isDisposed()
    ) {
      continue;
    }

    const dx =
      mesh.position.x - pos.x;

    const dz =
      mesh.position.z - pos.z;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    if (distance < 14) {
      mesh.setEnabled(false);
    }
  }

  // =========================
  // MATERIALES
  // =========================

  const brickMat = mat(
    `${houseId}_brickMat`,
    new BABYLON.Color3(
      0.34,
      0.12,
      0.08
    )
  );

  brickMat.specularColor =
    new BABYLON.Color3(
      0.03,
      0.03,
      0.03
    );

  const darkBrickMat = mat(
    `${houseId}_darkBrickMat`,
    new BABYLON.Color3(
      0.19,
      0.065,
      0.045
    )
  );

  const trimMat = mat(
    `${houseId}_trimMat`,
    new BABYLON.Color3(
      0.76,
      0.70,
      0.60
    )
  );

  const stoneMat = mat(
    `${houseId}_stoneMat`,
    new BABYLON.Color3(
      0.37,
      0.38,
      0.40
    )
  );

  const stairMat = mat(
    `${houseId}_stairMat`,
    new BABYLON.Color3(
      0.25,
      0.26,
      0.28
    )
  );

  const doorMat = mat(
    `${houseId}_doorMat`,
    new BABYLON.Color3(
      0.055,
      0.08,
      0.11
    )
  );

  const metalMat = mat(
    `${houseId}_metalMat`,
    new BABYLON.Color3(
      0.16,
      0.17,
      0.19
    )
  );

  const glassMat =
    new BABYLON.StandardMaterial(
      `${houseId}_glassMat`,
      scene
    );

  glassMat.diffuseColor =
    new BABYLON.Color3(
      0.10,
      0.25,
      0.32
    );

  glassMat.emissiveColor =
    new BABYLON.Color3(
      0.015,
      0.045,
      0.055
    );

  glassMat.specularColor =
    new BABYLON.Color3(
      0.10,
      0.12,
      0.14
    );

  glassMat.alpha = 0.88;
  glassMat.needDepthPrePass = true;
  glassMat.backFaceCulling = true;

  const warmWindowMat =
    new BABYLON.StandardMaterial(
      `${houseId}_warmWindowMat`,
      scene
    );

  warmWindowMat.diffuseColor =
    new BABYLON.Color3(
      0.90,
      0.67,
      0.36
    );

  warmWindowMat.emissiveColor =
    new BABYLON.Color3(
      0.16,
      0.095,
      0.035
    );

  warmWindowMat.specularColor =
    BABYLON.Color3.Black();

  const mailboxMat = mat(
    `${houseId}_mailboxMat`,
    new BABYLON.Color3(
      0.08,
      0.10,
      0.13
    )
  );

  // =========================
  // RAÍZ PRINCIPAL
  // =========================

  const houseRoot =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_root`,
      {
        width: 0.1,
        height: 0.1,
        depth: 0.1,
      },
      scene
    );

  houseRoot.position =
    new BABYLON.Vector3(
      pos.x,
      0,
      pos.z
    );

  houseRoot.rotation.y =
    rotationY;

  houseRoot.isVisible =
    false;

  houseRoot.isPickable =
    false;

  // =========================
  // PLATAFORMA
  // =========================

  const platform =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_platform`,
      {
        width: 10,
        height: 0.20,
        depth: 11,
      },
      scene
    );

  platform.position =
    new BABYLON.Vector3(
      0,
      0.10,
      0
    );

  platform.material =
    stoneMat;

  platform.parent =
    houseRoot;

  platform.isPickable =
    false;

  // =========================
  // CUERPO PRINCIPAL
  // =========================

  const mainBody =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_mainBody`,
      {
        width: 7.4,
        height: 10.5,
        depth: 7.5,
      },
      scene
    );

  mainBody.position =
    new BABYLON.Vector3(
      0,
      5.35,
      1
    );

  mainBody.material =
    brickMat;

  mainBody.parent =
    houseRoot;

  mainBody.isPickable =
    false;

  // =========================
  // BASE DE PIEDRA
  // =========================

  const lowerStoneBase =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_lowerStoneBase`,
      {
        width: 7.55,
        height: 1.35,
        depth: 7.65,
      },
      scene
    );

  lowerStoneBase.position =
    new BABYLON.Vector3(
      0,
      0.82,
      1
    );

  lowerStoneBase.material =
    darkBrickMat;

  lowerStoneBase.parent =
    houseRoot;

  lowerStoneBase.isPickable =
    false;

  // =========================
  // BORDE SUPERIOR
  // =========================

  const roofTrim =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_roofTrim`,
      {
        width: 7.9,
        height: 0.48,
        depth: 7.9,
      },
      scene
    );

  roofTrim.position =
    new BABYLON.Vector3(
      0,
      10.75,
      1
    );

  roofTrim.material =
    trimMat;

  roofTrim.parent =
    houseRoot;

  roofTrim.isPickable =
    false;

  const roofTop =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_roofTop`,
      {
        width: 7.5,
        height: 0.38,
        depth: 7.5,
      },
      scene
    );

  roofTop.position =
    new BABYLON.Vector3(
      0,
      11.15,
      1
    );

  roofTop.material =
    darkBrickMat;

  roofTop.parent =
    houseRoot;

  roofTop.isPickable =
    false;

  // =========================
  // FACHADA FRONTAL
  // =========================

  const frontFacade =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_frontFacade`,
      {
        width: 7.55,
        height: 9.1,
        depth: 0.24,
      },
      scene
    );

  frontFacade.position =
    new BABYLON.Vector3(
      0,
      5.55,
      -2.86
    );

  frontFacade.material =
    brickMat;

  frontFacade.parent =
    houseRoot;

  frontFacade.isPickable =
    false;

  // =========================
  // PUERTA PRINCIPAL
  // =========================

  const doorFrame =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_doorFrame`,
      {
        width: 2.55,
        height: 4.6,
        depth: 0.34,
      },
      scene
    );

  doorFrame.position =
    new BABYLON.Vector3(
      0,
      3.55,
      -3.10
    );

  doorFrame.material =
    trimMat;

  doorFrame.parent =
    houseRoot;

  doorFrame.isPickable =
    false;

  const door =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_door`,
      {
        width: 2.05,
        height: 4.15,
        depth: 0.24,
      },
      scene
    );

  door.position =
    new BABYLON.Vector3(
      0,
      3.45,
      -3.31
    );

  door.material =
    doorMat;

  door.parent =
    houseRoot;

  door.isPickable =
    false;

  // Ventana de la puerta
  const doorGlass =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_doorGlass`,
      {
        width: 1.35,
        height: 1.35,
        depth: 0.08,
      },
      scene
    );

  doorGlass.position =
    new BABYLON.Vector3(
      0,
      4.15,
      -3.47
    );

  doorGlass.material =
    glassMat;

  doorGlass.parent =
    houseRoot;

  doorGlass.isPickable =
    false;

  // Manija
  const doorHandle =
    BABYLON.MeshBuilder.CreateSphere(
      `${houseId}_doorHandle`,
      {
        diameter: 0.18,
        segments: 8,
      },
      scene
    );

  doorHandle.position =
    new BABYLON.Vector3(
      0.72,
      3.25,
      -3.49
    );

  doorHandle.material =
    trimMat;

  doorHandle.parent =
    houseRoot;

  doorHandle.isPickable =
    false;

  // =========================
  // VENTANAS
  // =========================
  // Cuatro ventanas principales.
  // Pocos meshes para mantener buen rendimiento.

  const windowPositions = [
    {
      x: -2.15,
      y: 3.1,
    },
    {
      x: 2.15,
      y: 3.1,
    },
    {
      x: -2.15,
      y: 7.35,
    },
    {
      x: 2.15,
      y: 7.35,
    },
  ];

  for (
    let i = 0;
    i < windowPositions.length;
    i++
  ) {
    const windowPosition =
      windowPositions[i];

    const frame =
      BABYLON.MeshBuilder.CreateBox(
        `${houseId}_windowFrame`,
        {
          width: 2.05,
          height: 2.55,
          depth: 0.28,
        },
        scene
      );

    frame.position =
      new BABYLON.Vector3(
        windowPosition.x,
        windowPosition.y,
        -3.03
      );

    frame.material =
      trimMat;

    frame.parent =
      houseRoot;

    frame.isPickable =
      false;

    const windowGlass =
      BABYLON.MeshBuilder.CreateBox(
        `${houseId}_windowGlass`,
        {
          width: 1.68,
          height: 2.18,
          depth: 0.12,
        },
        scene
      );

    windowGlass.position =
      new BABYLON.Vector3(
        windowPosition.x,
        windowPosition.y,
        -3.22
      );

    /*
     * Las ventanas inferiores usan luz cálida.
     * Las superiores usan cristal oscuro.
     */
    windowGlass.material =
      i < 2
        ? warmWindowMat
        : glassMat;

    windowGlass.parent =
      houseRoot;

    windowGlass.isPickable =
      false;

    // División vertical sencilla.
    const windowDivider =
      BABYLON.MeshBuilder.CreateBox(
        `${houseId}_windowDivider`,
        {
          width: 0.08,
          height: 2.16,
          depth: 0.08,
        },
        scene
      );

    windowDivider.position =
      new BABYLON.Vector3(
        windowPosition.x,
        windowPosition.y,
        -3.33
      );

    windowDivider.material =
      trimMat;

    windowDivider.parent =
      houseRoot;

    windowDivider.isPickable =
      false;
  }

  // =========================
  // ESCALERAS FRONTALES
  // =========================

  const stairWidths = [
    4.6,
    4.2,
    3.8,
    3.4,
    3.0,
  ];

  for (
    let i = 0;
    i < stairWidths.length;
    i++
  ) {
    const stair =
      BABYLON.MeshBuilder.CreateBox(
        `${houseId}_stair`,
        {
          width: stairWidths[i],
          height: 0.32,
          depth: 1.05,
        },
        scene
      );

    stair.position =
      new BABYLON.Vector3(
        0,
        0.25 + i * 0.32,
        -4.15 + i * 0.55
      );

    stair.material =
      stairMat;

    stair.parent =
      houseRoot;

    stair.isPickable =
      false;
  }

  // Pequeña plataforma delante de la puerta.
  const entranceLanding =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_entranceLanding`,
      {
        width: 3,
        height: 0.28,
        depth: 1.8,
      },
      scene
    );

  entranceLanding.position =
    new BABYLON.Vector3(
      0,
      1.72,
      -2.85
    );

  entranceLanding.material =
    stairMat;

  entranceLanding.parent =
    houseRoot;

  entranceLanding.isPickable =
    false;

  // =========================
  // BARANDILLAS SENCILLAS
  // =========================

  for (const x of [-2.1, 2.1]) {
    const rail =
      BABYLON.MeshBuilder.CreateBox(
        `${houseId}_stairRail`,
        {
          width: 0.12,
          height: 1.2,
          depth: 4.1,
        },
        scene
      );

    rail.position =
      new BABYLON.Vector3(
        x,
        1.15,
        -3.95
      );

    rail.rotation.x =
      -0.16;

    rail.material =
      metalMat;

    rail.parent =
      houseRoot;

    rail.isPickable =
      false;
  }

  // =========================
  // LÁMPARA VISUAL
  // =========================

  const porchLamp =
    BABYLON.MeshBuilder.CreateSphere(
      `${houseId}_porchLamp`,
      {
        diameter: 0.34,
        segments: 8,
      },
      scene
    );

  porchLamp.position =
    new BABYLON.Vector3(
      -1.35,
      4.6,
      -3.47
    );

  porchLamp.material =
    warmWindowMat;

  porchLamp.parent =
    houseRoot;

  porchLamp.isPickable =
    false;

  // =========================
  // LUZ SUAVE
  // =========================
  // Una sola luz real para cuidar los FPS.

  const houseLight =
    new BABYLON.PointLight(
      `${houseId}_softLight`,
      BABYLON.Vector3.Zero(),
      scene
    );

  houseLight.parent =
    houseRoot;

  houseLight.position =
    new BABYLON.Vector3(
      0,
      3.5,
      -4
    );

  houseLight.diffuse =
    new BABYLON.Color3(
      1,
      0.72,
      0.42
    );

  houseLight.specular =
    BABYLON.Color3.Black();

  houseLight.intensity =
    0.72;

  houseLight.range =
    11;

  // =========================
  // BUZÓN
  // =========================

  const mailboxPost =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_mailboxPost`,
      {
        width: 0.18,
        height: 1.55,
        depth: 0.18,
      },
      scene
    );

  mailboxPost.position =
    new BABYLON.Vector3(
      3.7,
      0.88,
      -4.55
    );

  mailboxPost.material =
    metalMat;

  mailboxPost.parent =
    houseRoot;

  mailboxPost.isPickable =
    false;

  const mailbox =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_mailbox`,
      {
        width: 1.45,
        height: 0.75,
        depth: 0.75,
      },
      scene
    );

  mailbox.position =
    new BABYLON.Vector3(
      3.7,
      1.7,
      -4.55
    );

  mailbox.material =
    mailboxMat;

  mailbox.parent =
    houseRoot;

  mailbox.isPickable =
    false;

  // Ranura del buzón
  const mailboxSlot =
    BABYLON.MeshBuilder.CreateBox(
      `${houseId}_mailboxSlot`,
      {
        width: 0.78,
        height: 0.08,
        depth: 0.05,
      },
      scene
    );

  mailboxSlot.position =
    new BABYLON.Vector3(
      3.7,
      1.85,
      -4.95
    );

  mailboxSlot.material =
    trimMat;

  mailboxSlot.parent =
    houseRoot;

  mailboxSlot.isPickable =
    false;

  // =========================
  // PLACA DE DIRECCIÓN
  // =========================

  const addressTexture =
    new BABYLON.DynamicTexture(
      `${houseId}_addressTexture`,
      {
        width: 1024,
        height: 420,
      },
      scene,
      true
    );

  const addressCtx =
    addressTexture.getContext() as CanvasRenderingContext2D;

  addressCtx.fillStyle =
    "#F2EFE6";

  addressCtx.fillRect(
    0,
    0,
    1024,
    420
  );

  addressCtx.strokeStyle =
    "#151515";

  addressCtx.lineWidth =
    18;

  addressCtx.strokeRect(
    12,
    12,
    1000,
    396
  );

  addressCtx.fillStyle =
    "#111111";

  addressCtx.textAlign =
    "center";

  addressCtx.textBaseline =
    "middle";

  addressCtx.font =
    "bold 105px Arial";

  addressCtx.fillText(
    addressLine1,
    512,
    125
  );

  addressCtx.font =
  "bold 55px Arial";

addressCtx.fillText(
  addressLine2,
  512,
  290
);

  addressTexture.update();

  const addressMat =
    new BABYLON.StandardMaterial(
      `${houseId}_addressMat`,
      scene
    );

  addressMat.diffuseTexture =
    addressTexture;

  addressMat.emissiveTexture =
    addressTexture;

  // Emisión baja para que sea legible de noche
  // sin verse demasiado brillante.
  addressMat.emissiveColor =
    new BABYLON.Color3(
      0.22,
      0.22,
      0.22
    );

  addressMat.disableLighting =
    true;

  addressMat.backFaceCulling =
    false;

  const addressSign =
    BABYLON.MeshBuilder.CreatePlane(
      `${houseId}_addressSign`,
      {
        width: 2.65,
        height: 1.08,
        sideOrientation:
          BABYLON.Mesh.DOUBLESIDE,
      },
      scene
    );

  addressSign.position =
    new BABYLON.Vector3(
      3.7,
      2.45,
      -4.96
    );

  // La cara del letrero queda mirando hacia la calle.
  addressSign.rotation.y = 0;

  addressSign.material =
    addressMat;

  addressSign.parent =
    houseRoot;

  addressSign.isPickable =
    false;

  // =========================
  // NÚMERO EN LA PUERTA
  // =========================

  const numberTexture =
    new BABYLON.DynamicTexture(
      `${houseId}_numberTexture`,
      {
        width: 512,
        height: 256,
      },
      scene,
      true
    );

  const numberCtx =
    numberTexture.getContext() as CanvasRenderingContext2D;

  numberCtx.clearRect(
    0,
    0,
    512,
    256
  );

  numberCtx.fillStyle =
    "#E9D9A2";

  numberCtx.font =
    "bold 150px Arial";

  numberCtx.textAlign =
    "center";

  numberCtx.textBaseline =
    "middle";

  numberCtx.fillText(
    "15",
    256,
    135
  );

  numberTexture.update();

  const numberMat =
    new BABYLON.StandardMaterial(
      `${houseId}_numberMat`,
      scene
    );

  numberMat.diffuseTexture =
    numberTexture;

  numberMat.emissiveTexture =
    numberTexture;

  numberMat.emissiveColor =
    new BABYLON.Color3(
      0.28,
      0.22,
      0.10
    );

  numberMat.disableLighting =
    true;

  numberMat.backFaceCulling =
    false;

  const doorNumber =
    BABYLON.MeshBuilder.CreatePlane(
      `${houseId}_doorNumber`,
      {
        width: 0.8,
        height: 0.4,
        sideOrientation:
          BABYLON.Mesh.DOUBLESIDE,
      },
      scene
    );

  doorNumber.position =
    new BABYLON.Vector3(
      0,
      5.05,
      -3.49
    );

  doorNumber.rotation.y = 0;

  doorNumber.material =
    numberMat;

  doorNumber.parent =
    houseRoot;

  doorNumber.isPickable =
    false;

  // =========================
  // ARO DE ENTREGA
  // =========================

  const auraMat =
    new BABYLON.StandardMaterial(
      `${houseId}_deliveryAuraMat`,
      scene
    );

  auraMat.diffuseColor =
    new BABYLON.Color3(
      0.12,
      0.55,
      1
    );

  auraMat.emissiveColor =
    new BABYLON.Color3(
      0.12,
      0.55,
      1
    );

  auraMat.alpha =
    0.58;

  const deliveryAura =
    BABYLON.MeshBuilder.CreateCylinder(
      `${houseId}_deliveryAura`,
      {
        diameter: 7,
        height: 0.28,
        tessellation: 48,
      },
      scene
    );

  deliveryAura.position =
    new BABYLON.Vector3(
      0,
      0.30,
      -6
    );

  deliveryAura.material =
    auraMat;

  deliveryAura.parent =
    houseRoot;

  deliveryAura.isPickable =
    false;

  deliveryAura.alwaysSelectAsActiveMesh =
    true;

  /*
   * Por ahora permanece oculto.
   * Se activará cuando implementemos
   * la misión nocturna de fantasmas.
   */
  deliveryAura.setEnabled(
    false
  );

  // =========================
  // REGISTRO OPTIMIZADO
  // =========================

  activeMapMeshes.push(
    houseRoot
  );

  // Registrar solamente la raíz.
  registerChunkMesh(
    houseRoot
  );

  registerCullable(
    houseRoot
  );

  houseRoot.metadata = {
    type: "medicineDeliveryHouse",
    name,
    latitude: lat,
    longitude: lon,
    addressLine1,
    addressLine2,
    deliveryAura,
  };
const houseAlreadyRegistered =
  mapLegendPoints.some(
    (item) =>
      item.name === name &&
      Math.abs(item.lon - lon) < 0.00001 &&
      Math.abs(item.lat - lat) < 0.00001
  );

if (!houseAlreadyRegistered) {
  mapLegendPoints.push({
    name: addressLine1,
    lon,
    lat,
    icon: "🏠",
    color: "#2f83d8",
    mapName: "manhattan",
  });
}
  return {
    root: houseRoot,
    aura: deliveryAura,
  };
}
// =========================
// CREAR TODAS LAS CASAS
// DE ENTREGA EN MANHATTAN
// =========================

function createAllManhattanMedicineHouses() {
  // Limpiar referencias anteriores.
  manhattanMedicineHouses.length = 0;

  for (
    const houseData of
    MANHATTAN_MEDICINE_HOUSES
  ) {
    const createdHouse =
      createManhattanMedicineHouseAtLonLat(
        houseData.id,
        houseData.lon,
        houseData.lat,
        houseData.rotationY,
        houseData.addressLine1,
        houseData.addressLine2
      );

    manhattanMedicineHouses.push({
      id: houseData.id,
      root: createdHouse.root,
      aura: createdHouse.aura,
      lat: houseData.lat,
      lon: houseData.lon,
      addressLine1:
        houseData.addressLine1,
      addressLine2:
        houseData.addressLine2,
    });
  }

  // Mantener compatibilidad con el código
  // actual que todavía usa la casa 1.
  const firstHouse =
    manhattanMedicineHouses[0];

  if (firstHouse) {
    manhattanMedicineHouse1Root =
      firstHouse.root;

    manhattanMedicineHouse1Aura =
      firstHouse.aura;
  }

  console.log(
    "Casas de medicina creadas:",
    manhattanMedicineHouses.length
  );
}
// =========================
// CONFIGURACIÓN DE AROS ROSA
// PARA ENTREGA DE MEDICINAS
// =========================

function configureMedicineAura(
  aura: BABYLON.Mesh | null
) {
  if (!aura || aura.isDisposed()) {
    return;
  }

  const auraMaterial =
    aura.material as
      BABYLON.StandardMaterial | null;

  if (auraMaterial) {
    auraMaterial.diffuseColor =
      new BABYLON.Color3(
        1,
        0.05,
        0.62
      );

    auraMaterial.emissiveColor =
      new BABYLON.Color3(
        1,
        0.05,
        0.62
      );

    auraMaterial.alpha = 0.62;

    auraMaterial.specularColor =
      BABYLON.Color3.Black();
  }

  aura.isPickable = false;

  aura.alwaysSelectAsActiveMesh =
    true;
}

function enableMedicineHospitalAura() {
  if (
    !manhattanHospitalEntranceAura ||
    manhattanHospitalEntranceAura.isDisposed()
  ) {
    return;
  }

  configureMedicineAura(
    manhattanHospitalEntranceAura
  );

  manhattanHospitalEntranceAura.setEnabled(
    true
  );

  manhattanHospitalEntranceAura.computeWorldMatrix(
    true
  );
}

function disableMedicineHospitalAura() {
  if (
    !manhattanHospitalEntranceAura ||
    manhattanHospitalEntranceAura.isDisposed()
  ) {
    return;
  }

  manhattanHospitalEntranceAura.setEnabled(
    false
  );
}

function enableMedicineHouseAura() {
  if (
    !manhattanMedicineHouse1Aura ||
    manhattanMedicineHouse1Aura.isDisposed()
  ) {
    return;
  }

  configureMedicineAura(
    manhattanMedicineHouse1Aura
  );

  manhattanMedicineHouse1Aura.setEnabled(
    true
  );

  manhattanMedicineHouse1Aura.computeWorldMatrix(
    true
  );
}

function disableMedicineHouseAura() {
  if (
    !manhattanMedicineHouse1Aura ||
    manhattanMedicineHouse1Aura.isDisposed()
  ) {
    return;
  }

  manhattanMedicineHouse1Aura.setEnabled(
    false
  );
}
// =========================
// CREAR FANTASMA LIVIANO
// =========================

function createMedicineGhostAtLonLat(
  name: string,
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const position =
    lonLatToWorld(
      lon,
      lat
    );

  // =========================
  // MATERIALES
  // =========================

  const ghostMat =
    new BABYLON.StandardMaterial(
      `${name}_bodyMat`,
      scene
    );

  ghostMat.diffuseColor =
    new BABYLON.Color3(
      0.78,
      0.88,
      1
    );

  ghostMat.emissiveColor =
    new BABYLON.Color3(
      0.20,
      0.30,
      0.46
    );

  ghostMat.alpha = 0.84;

  ghostMat.specularColor =
    BABYLON.Color3.Black();

  ghostMat.needDepthPrePass =
    true;

  ghostMat.backFaceCulling =
    true;

  ghostMat.transparencyMode =
    BABYLON.Material.MATERIAL_ALPHABLEND;

  const ghostDarkMat =
    new BABYLON.StandardMaterial(
      `${name}_darkMat`,
      scene
    );

  ghostDarkMat.diffuseColor =
    new BABYLON.Color3(
      0.01,
      0.015,
      0.03
    );

  ghostDarkMat.emissiveColor =
    new BABYLON.Color3(
      0.005,
      0.008,
      0.015
    );

  ghostDarkMat.specularColor =
    BABYLON.Color3.Black();

  // =========================
  // RAÍZ Y COLISIÓN
  // =========================

  const ghostRoot =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_root`,
      {
        width: 2.6,
        height: 4.6,
        depth: 2.6,
      },
      scene
    );

  ghostRoot.position =
    new BABYLON.Vector3(
      position.x,
      2.7,
      position.z
    );

  ghostRoot.rotation.y =
    rotationY;

  ghostRoot.isVisible =
    false;

  ghostRoot.isPickable =
    false;

  // =========================
  // CABEZA
  // =========================

  const head =
    BABYLON.MeshBuilder.CreateSphere(
      `${name}_head`,
      {
        diameter: 2.3,
        segments: 12,
      },
      scene
    );

  head.position =
    new BABYLON.Vector3(
      0,
      1.15,
      0
    );

  head.scaling =
    new BABYLON.Vector3(
      0.88,
      1.05,
      0.82
    );

  head.material =
    ghostMat;

  head.parent =
    ghostRoot;

  head.isPickable =
    false;

  // =========================
  // CUERPO FLOTANTE
  // =========================

  const body =
    BABYLON.MeshBuilder.CreateCylinder(
      `${name}_body`,
      {
        height: 2.9,
        diameterTop: 1.85,
        diameterBottom: 2.75,
        tessellation: 12,
      },
      scene
    );

  body.position =
    new BABYLON.Vector3(
      0,
      -0.55,
      0
    );

  body.material =
    ghostMat;

  body.parent =
    ghostRoot;

  body.isPickable =
    false;

  // =========================
  // OJOS
  // =========================

  for (const x of [-0.45, 0.45]) {
    const eye =
      BABYLON.MeshBuilder.CreateSphere(
        `${name}_eye`,
        {
          diameter: 0.46,
          segments: 8,
        },
        scene
      );

    eye.position =
      new BABYLON.Vector3(
        x,
        1.38,
        -0.91
      );

    eye.scaling =
      new BABYLON.Vector3(
        0.72,
        1.25,
        0.32
      );

    eye.material =
      ghostDarkMat;

    eye.parent =
      ghostRoot;

    eye.isPickable =
      false;
  }

  // =========================
  // BOCA
  // =========================

  const mouth =
    BABYLON.MeshBuilder.CreateSphere(
      `${name}_mouth`,
      {
        diameter: 0.58,
        segments: 8,
      },
      scene
    );

  mouth.position =
    new BABYLON.Vector3(
      0,
      0.68,
      -0.94
    );

  mouth.scaling =
    new BABYLON.Vector3(
      0.65,
      1.15,
      0.28
    );

  mouth.material =
    ghostDarkMat;

  mouth.parent =
    ghostRoot;

  mouth.isPickable =
    false;

  // =========================
  // REGISTRO
  // =========================

  activeMapMeshes.push(
    ghostRoot
  );

  registerCullable(
    ghostRoot
  );

  // Punto central original del fantasma.
const centerPosition =
  ghostRoot.position.clone();

/*
 * Movimiento lateral de 12 metros en total:
 *
 * -6 metros hacia un lado.
 * +6 metros hacia el otro.
 *
 * Esto hace que atraviese la calle y regrese.
 */
const movementStart =
  centerPosition.add(
    new BABYLON.Vector3(
      -6,
      0,
      0
    )
  );

const movementEnd =
  centerPosition.add(
    new BABYLON.Vector3(
      6,
      0,
      0
    )
  );

// Empieza en uno de los extremos.
ghostRoot.position.copyFrom(
  movementStart
);

medicineGhosts.push({
  root: ghostRoot,

  centerPosition,

  movementStart,
  movementEnd,

  movementT: 0,

  movementDirection: 1,

  // Velocidad moderada.
  movementSpeed: 0.0022,

  baseY:
    centerPosition.y,

  floatOffset:
    Math.random() *
    Math.PI *
    2,

  floatSpeed:
    0.0018 +
    Math.random() *
    0.0005,

  /*
   * El fantasma es bastante ancho.
   * Usamos un radio mayor para que la
   * colisión sea confiable.
   */
  collisionRadius: 3.4,
});

  return ghostRoot;
}
// =========================
// GENERAR FANTASMAS
// =========================

function spawnMedicineMissionGhosts() {
  clearMedicineMissionGhosts();

  if (currentMapName !== "manhattan") {
    return;
  }

  createMedicineGhostAtLonLat(
    "medicineGhost1",
    MANHATTAN_MEDICINE_GHOST_1.lon,
    MANHATTAN_MEDICINE_GHOST_1.lat,
    MANHATTAN_MEDICINE_GHOST_1.rotationY
  );

  createMedicineGhostAtLonLat(
    "medicineGhost2",
    MANHATTAN_MEDICINE_GHOST_2.lon,
    MANHATTAN_MEDICINE_GHOST_2.lat,
    MANHATTAN_MEDICINE_GHOST_2.rotationY
  );

  createMedicineGhostAtLonLat(
    "medicineGhost3",
    MANHATTAN_MEDICINE_GHOST_3.lon,
    MANHATTAN_MEDICINE_GHOST_3.lat,
    MANHATTAN_MEDICINE_GHOST_3.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost4",
    MANHATTAN_MEDICINE_GHOST_4.lon,
    MANHATTAN_MEDICINE_GHOST_4.lat,
    MANHATTAN_MEDICINE_GHOST_4.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost5",
    MANHATTAN_MEDICINE_GHOST_5.lon,
    MANHATTAN_MEDICINE_GHOST_5.lat,
    MANHATTAN_MEDICINE_GHOST_5.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost6",
    MANHATTAN_MEDICINE_GHOST_6.lon,
    MANHATTAN_MEDICINE_GHOST_6.lat,
    MANHATTAN_MEDICINE_GHOST_6.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost7",
    MANHATTAN_MEDICINE_GHOST_7.lon,
    MANHATTAN_MEDICINE_GHOST_7.lat,
    MANHATTAN_MEDICINE_GHOST_7.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost8",
    MANHATTAN_MEDICINE_GHOST_8.lon,
    MANHATTAN_MEDICINE_GHOST_8.lat,
    MANHATTAN_MEDICINE_GHOST_8.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost9",
    MANHATTAN_MEDICINE_GHOST_9.lon,
    MANHATTAN_MEDICINE_GHOST_9.lat,
    MANHATTAN_MEDICINE_GHOST_9.rotationY
  );
  createMedicineGhostAtLonLat(
    "medicineGhost10",
    MANHATTAN_MEDICINE_GHOST_10.lon,
    MANHATTAN_MEDICINE_GHOST_10.lat,
    MANHATTAN_MEDICINE_GHOST_10.rotationY
  );
  createMedicineGhostAtLonLat(
  "medicineGhost11",
  MANHATTAN_MEDICINE_GHOST_11.lon,
  MANHATTAN_MEDICINE_GHOST_11.lat,
  MANHATTAN_MEDICINE_GHOST_11.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost12",
  MANHATTAN_MEDICINE_GHOST_12.lon,
  MANHATTAN_MEDICINE_GHOST_12.lat,
  MANHATTAN_MEDICINE_GHOST_12.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost13",
  MANHATTAN_MEDICINE_GHOST_13.lon,
  MANHATTAN_MEDICINE_GHOST_13.lat,
  MANHATTAN_MEDICINE_GHOST_13.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost14",
  MANHATTAN_MEDICINE_GHOST_14.lon,
  MANHATTAN_MEDICINE_GHOST_14.lat,
  MANHATTAN_MEDICINE_GHOST_14.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost15",
  MANHATTAN_MEDICINE_GHOST_15.lon,
  MANHATTAN_MEDICINE_GHOST_15.lat,
  MANHATTAN_MEDICINE_GHOST_15.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost16",
  MANHATTAN_MEDICINE_GHOST_16.lon,
  MANHATTAN_MEDICINE_GHOST_16.lat,
  MANHATTAN_MEDICINE_GHOST_16.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost17",
  MANHATTAN_MEDICINE_GHOST_17.lon,
  MANHATTAN_MEDICINE_GHOST_17.lat,
  MANHATTAN_MEDICINE_GHOST_17.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost18",
  MANHATTAN_MEDICINE_GHOST_18.lon,
  MANHATTAN_MEDICINE_GHOST_18.lat,
  MANHATTAN_MEDICINE_GHOST_18.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost19",
  MANHATTAN_MEDICINE_GHOST_19.lon,
  MANHATTAN_MEDICINE_GHOST_19.lat,
  MANHATTAN_MEDICINE_GHOST_19.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost20",
  MANHATTAN_MEDICINE_GHOST_20.lon,
  MANHATTAN_MEDICINE_GHOST_20.lat,
  MANHATTAN_MEDICINE_GHOST_20.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost21",
  MANHATTAN_MEDICINE_GHOST_21.lon,
  MANHATTAN_MEDICINE_GHOST_21.lat,
  MANHATTAN_MEDICINE_GHOST_21.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost22",
  MANHATTAN_MEDICINE_GHOST_22.lon,
  MANHATTAN_MEDICINE_GHOST_22.lat,
  MANHATTAN_MEDICINE_GHOST_22.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost23",
  MANHATTAN_MEDICINE_GHOST_23.lon,
  MANHATTAN_MEDICINE_GHOST_23.lat,
  MANHATTAN_MEDICINE_GHOST_23.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost24",
  MANHATTAN_MEDICINE_GHOST_24.lon,
  MANHATTAN_MEDICINE_GHOST_24.lat,
  MANHATTAN_MEDICINE_GHOST_24.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost25",
  MANHATTAN_MEDICINE_GHOST_25.lon,
  MANHATTAN_MEDICINE_GHOST_25.lat,
  MANHATTAN_MEDICINE_GHOST_25.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost26",
  MANHATTAN_MEDICINE_GHOST_26.lon,
  MANHATTAN_MEDICINE_GHOST_26.lat,
  MANHATTAN_MEDICINE_GHOST_26.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost27",
  MANHATTAN_MEDICINE_GHOST_27.lon,
  MANHATTAN_MEDICINE_GHOST_27.lat,
  MANHATTAN_MEDICINE_GHOST_27.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost28",
  MANHATTAN_MEDICINE_GHOST_28.lon,
  MANHATTAN_MEDICINE_GHOST_28.lat,
  MANHATTAN_MEDICINE_GHOST_28.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost29",
  MANHATTAN_MEDICINE_GHOST_29.lon,
  MANHATTAN_MEDICINE_GHOST_29.lat,
  MANHATTAN_MEDICINE_GHOST_29.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost30",
  MANHATTAN_MEDICINE_GHOST_30.lon,
  MANHATTAN_MEDICINE_GHOST_30.lat,
  MANHATTAN_MEDICINE_GHOST_30.rotationY
);
createMedicineGhostAtLonLat(
  "medicineGhost31",
  MANHATTAN_MEDICINE_GHOST_31.lon,
  MANHATTAN_MEDICINE_GHOST_31.lat,
  MANHATTAN_MEDICINE_GHOST_31.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost32",
  MANHATTAN_MEDICINE_GHOST_32.lon,
  MANHATTAN_MEDICINE_GHOST_32.lat,
  MANHATTAN_MEDICINE_GHOST_32.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost33",
  MANHATTAN_MEDICINE_GHOST_33.lon,
  MANHATTAN_MEDICINE_GHOST_33.lat,
  MANHATTAN_MEDICINE_GHOST_33.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost34",
  MANHATTAN_MEDICINE_GHOST_34.lon,
  MANHATTAN_MEDICINE_GHOST_34.lat,
  MANHATTAN_MEDICINE_GHOST_34.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost35",
  MANHATTAN_MEDICINE_GHOST_35.lon,
  MANHATTAN_MEDICINE_GHOST_35.lat,
  MANHATTAN_MEDICINE_GHOST_35.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost36",
  MANHATTAN_MEDICINE_GHOST_36.lon,
  MANHATTAN_MEDICINE_GHOST_36.lat,
  MANHATTAN_MEDICINE_GHOST_36.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost37",
  MANHATTAN_MEDICINE_GHOST_37.lon,
  MANHATTAN_MEDICINE_GHOST_37.lat,
  MANHATTAN_MEDICINE_GHOST_37.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost38",
  MANHATTAN_MEDICINE_GHOST_38.lon,
  MANHATTAN_MEDICINE_GHOST_38.lat,
  MANHATTAN_MEDICINE_GHOST_38.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost39",
  MANHATTAN_MEDICINE_GHOST_39.lon,
  MANHATTAN_MEDICINE_GHOST_39.lat,
  MANHATTAN_MEDICINE_GHOST_39.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost40",
  MANHATTAN_MEDICINE_GHOST_40.lon,
  MANHATTAN_MEDICINE_GHOST_40.lat,
  MANHATTAN_MEDICINE_GHOST_40.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost41",
  MANHATTAN_MEDICINE_GHOST_41.lon,
  MANHATTAN_MEDICINE_GHOST_41.lat,
  MANHATTAN_MEDICINE_GHOST_41.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost42",
  MANHATTAN_MEDICINE_GHOST_42.lon,
  MANHATTAN_MEDICINE_GHOST_42.lat,
  MANHATTAN_MEDICINE_GHOST_42.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost43",
  MANHATTAN_MEDICINE_GHOST_43.lon,
  MANHATTAN_MEDICINE_GHOST_43.lat,
  MANHATTAN_MEDICINE_GHOST_43.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost44",
  MANHATTAN_MEDICINE_GHOST_44.lon,
  MANHATTAN_MEDICINE_GHOST_44.lat,
  MANHATTAN_MEDICINE_GHOST_44.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost45",
  MANHATTAN_MEDICINE_GHOST_45.lon,
  MANHATTAN_MEDICINE_GHOST_45.lat,
  MANHATTAN_MEDICINE_GHOST_45.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost46",
  MANHATTAN_MEDICINE_GHOST_46.lon,
  MANHATTAN_MEDICINE_GHOST_46.lat,
  MANHATTAN_MEDICINE_GHOST_46.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost47",
  MANHATTAN_MEDICINE_GHOST_47.lon,
  MANHATTAN_MEDICINE_GHOST_47.lat,
  MANHATTAN_MEDICINE_GHOST_47.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost48",
  MANHATTAN_MEDICINE_GHOST_48.lon,
  MANHATTAN_MEDICINE_GHOST_48.lat,
  MANHATTAN_MEDICINE_GHOST_48.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost49",
  MANHATTAN_MEDICINE_GHOST_49.lon,
  MANHATTAN_MEDICINE_GHOST_49.lat,
  MANHATTAN_MEDICINE_GHOST_49.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost50",
  MANHATTAN_MEDICINE_GHOST_50.lon,
  MANHATTAN_MEDICINE_GHOST_50.lat,
  MANHATTAN_MEDICINE_GHOST_50.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost51",
  MANHATTAN_MEDICINE_GHOST_51.lon,
  MANHATTAN_MEDICINE_GHOST_51.lat,
  MANHATTAN_MEDICINE_GHOST_51.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost52",
  MANHATTAN_MEDICINE_GHOST_52.lon,
  MANHATTAN_MEDICINE_GHOST_52.lat,
  MANHATTAN_MEDICINE_GHOST_52.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost53",
  MANHATTAN_MEDICINE_GHOST_53.lon,
  MANHATTAN_MEDICINE_GHOST_53.lat,
  MANHATTAN_MEDICINE_GHOST_53.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost54",
  MANHATTAN_MEDICINE_GHOST_54.lon,
  MANHATTAN_MEDICINE_GHOST_54.lat,
  MANHATTAN_MEDICINE_GHOST_54.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost55",
  MANHATTAN_MEDICINE_GHOST_55.lon,
  MANHATTAN_MEDICINE_GHOST_55.lat,
  MANHATTAN_MEDICINE_GHOST_55.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost56",
  MANHATTAN_MEDICINE_GHOST_56.lon,
  MANHATTAN_MEDICINE_GHOST_56.lat,
  MANHATTAN_MEDICINE_GHOST_56.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost57",
  MANHATTAN_MEDICINE_GHOST_57.lon,
  MANHATTAN_MEDICINE_GHOST_57.lat,
  MANHATTAN_MEDICINE_GHOST_57.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost58",
  MANHATTAN_MEDICINE_GHOST_58.lon,
  MANHATTAN_MEDICINE_GHOST_58.lat,
  MANHATTAN_MEDICINE_GHOST_58.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost59",
  MANHATTAN_MEDICINE_GHOST_59.lon,
  MANHATTAN_MEDICINE_GHOST_59.lat,
  MANHATTAN_MEDICINE_GHOST_59.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost60",
  MANHATTAN_MEDICINE_GHOST_60.lon,
  MANHATTAN_MEDICINE_GHOST_60.lat,
  MANHATTAN_MEDICINE_GHOST_60.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost61",
  MANHATTAN_MEDICINE_GHOST_61.lon,
  MANHATTAN_MEDICINE_GHOST_61.lat,
  MANHATTAN_MEDICINE_GHOST_61.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost62",
  MANHATTAN_MEDICINE_GHOST_62.lon,
  MANHATTAN_MEDICINE_GHOST_62.lat,
  MANHATTAN_MEDICINE_GHOST_62.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost63",
  MANHATTAN_MEDICINE_GHOST_63.lon,
  MANHATTAN_MEDICINE_GHOST_63.lat,
  MANHATTAN_MEDICINE_GHOST_63.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost64",
  MANHATTAN_MEDICINE_GHOST_64.lon,
  MANHATTAN_MEDICINE_GHOST_64.lat,
  MANHATTAN_MEDICINE_GHOST_64.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost65",
  MANHATTAN_MEDICINE_GHOST_65.lon,
  MANHATTAN_MEDICINE_GHOST_65.lat,
  MANHATTAN_MEDICINE_GHOST_65.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost66",
  MANHATTAN_MEDICINE_GHOST_66.lon,
  MANHATTAN_MEDICINE_GHOST_66.lat,
  MANHATTAN_MEDICINE_GHOST_66.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost67",
  MANHATTAN_MEDICINE_GHOST_67.lon,
  MANHATTAN_MEDICINE_GHOST_67.lat,
  MANHATTAN_MEDICINE_GHOST_67.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost68",
  MANHATTAN_MEDICINE_GHOST_68.lon,
  MANHATTAN_MEDICINE_GHOST_68.lat,
  MANHATTAN_MEDICINE_GHOST_68.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost69",
  MANHATTAN_MEDICINE_GHOST_69.lon,
  MANHATTAN_MEDICINE_GHOST_69.lat,
  MANHATTAN_MEDICINE_GHOST_69.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost70",
  MANHATTAN_MEDICINE_GHOST_70.lon,
  MANHATTAN_MEDICINE_GHOST_70.lat,
  MANHATTAN_MEDICINE_GHOST_70.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost71",
  MANHATTAN_MEDICINE_GHOST_71.lon,
  MANHATTAN_MEDICINE_GHOST_71.lat,
  MANHATTAN_MEDICINE_GHOST_71.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost72",
  MANHATTAN_MEDICINE_GHOST_72.lon,
  MANHATTAN_MEDICINE_GHOST_72.lat,
  MANHATTAN_MEDICINE_GHOST_72.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost73",
  MANHATTAN_MEDICINE_GHOST_73.lon,
  MANHATTAN_MEDICINE_GHOST_73.lat,
  MANHATTAN_MEDICINE_GHOST_73.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost74",
  MANHATTAN_MEDICINE_GHOST_74.lon,
  MANHATTAN_MEDICINE_GHOST_74.lat,
  MANHATTAN_MEDICINE_GHOST_74.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost75",
  MANHATTAN_MEDICINE_GHOST_75.lon,
  MANHATTAN_MEDICINE_GHOST_75.lat,
  MANHATTAN_MEDICINE_GHOST_75.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost76",
  MANHATTAN_MEDICINE_GHOST_76.lon,
  MANHATTAN_MEDICINE_GHOST_76.lat,
  MANHATTAN_MEDICINE_GHOST_76.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost77",
  MANHATTAN_MEDICINE_GHOST_77.lon,
  MANHATTAN_MEDICINE_GHOST_77.lat,
  MANHATTAN_MEDICINE_GHOST_77.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost78",
  MANHATTAN_MEDICINE_GHOST_78.lon,
  MANHATTAN_MEDICINE_GHOST_78.lat,
  MANHATTAN_MEDICINE_GHOST_78.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost79",
  MANHATTAN_MEDICINE_GHOST_79.lon,
  MANHATTAN_MEDICINE_GHOST_79.lat,
  MANHATTAN_MEDICINE_GHOST_79.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost80",
  MANHATTAN_MEDICINE_GHOST_80.lon,
  MANHATTAN_MEDICINE_GHOST_80.lat,
  MANHATTAN_MEDICINE_GHOST_80.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost81",
  MANHATTAN_MEDICINE_GHOST_81.lon,
  MANHATTAN_MEDICINE_GHOST_81.lat,
  MANHATTAN_MEDICINE_GHOST_81.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost82",
  MANHATTAN_MEDICINE_GHOST_82.lon,
  MANHATTAN_MEDICINE_GHOST_82.lat,
  MANHATTAN_MEDICINE_GHOST_82.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost83",
  MANHATTAN_MEDICINE_GHOST_83.lon,
  MANHATTAN_MEDICINE_GHOST_83.lat,
  MANHATTAN_MEDICINE_GHOST_83.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost84",
  MANHATTAN_MEDICINE_GHOST_84.lon,
  MANHATTAN_MEDICINE_GHOST_84.lat,
  MANHATTAN_MEDICINE_GHOST_84.rotationY
);

createMedicineGhostAtLonLat(
  "medicineGhost85",
  MANHATTAN_MEDICINE_GHOST_85.lon,
  MANHATTAN_MEDICINE_GHOST_85.lat,
  MANHATTAN_MEDICINE_GHOST_85.rotationY
);
}
// =========================
// ELIMINAR FANTASMAS
// =========================

function clearMedicineMissionGhosts() {
  for (
    const ghost of
    medicineGhosts
  ) {
    if (
      ghost.root &&
      !ghost.root.isDisposed()
    ) {
      ghost.root.dispose(
        false,
        true
      );
    }
  }

  medicineGhosts.length = 0;
}
// =========================
// PERDER MISIÓN POR FANTASMA
// =========================

function loseMedicineDeliveryMission() {
  if (
    !medicineDeliveryMissionActive ||
    medicineMissionDefeatProcessing
  ) {
    return;
  }

  medicineMissionDefeatProcessing = true;

  // =========================
  // DESCONTAR MONEDAS
  // =========================

  const previousCoins =
    digitalCoins;

  digitalCoins =
    Math.max(
      0,
      digitalCoins -
        medicineMissionPenalty
    );

  const deductedCoins =
    previousCoins -
    digitalCoins;

  saveWallet();
  updateWalletButton();

  // =========================
  // DETENER LA MISIÓN
  // =========================

  medicineDeliveryMissionActive =
    false;

  medicineDeliveryStage =
    "inactive";

  medicineHospitalAuraTouched =
    false;

  medicineHouseAuraTouched =
    false;

  disableMedicineHospitalAura();
  disableMedicineHouseAura();

  // =========================
  // DETENER GPS
  // =========================

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;
  gpsTargetLon = null;
  gpsTargetLat = null;
  gpsCurrentIndex = 0;

  if (
    gpsArrow &&
    !gpsArrow.isDisposed()
  ) {
    gpsArrow.setEnabled(false);
  }

  if (
    gpsDestinationAura &&
    !gpsDestinationAura.isDisposed()
  ) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  // =========================
  // ELIMINAR FANTASMAS
  // =========================

  clearMedicineMissionGhosts();

  hideMedicineMissionPanel();
  hideMissionCard();

  carVelocity = 0;

  if (deductedCoins > 0) {
    showMissionMessage(
      `¡El fantasma te atrapó! Perdiste la misión y se descontaron ${deductedCoins} monedas.`,
      6500
    );
  } else {
    showMissionMessage(
      "¡El fantasma te atrapó! Perdiste la misión. No tenías monedas para descontar.",
      6500
    );
  }

  console.log(
    "MISIÓN DE MEDICINA PERDIDA",
    {
      monedasAntes:
        previousCoins,

      monedasDescontadas:
        deductedCoins,

      monedasActuales:
        digitalCoins,
    }
  );

  setTimeout(() => {
    medicineMissionDefeatProcessing =
      false;
  }, 1200);
}
// =========================
// ACTUALIZAR FANTASMAS
// =========================

function updateMedicineMissionGhosts() {
  if (
    !medicineDeliveryMissionActive ||
    medicineMissionDefeatProcessing
  ) {
    return;
  }

  if (
    currentMapName !==
    "manhattan"
  ) {
    return;
  }

  if (!player || !car) {
    return;
  }

  const now =
    performance.now();

  for (
    const ghost of
    medicineGhosts
  ) {
    if (
      !ghost.root ||
      ghost.root.isDisposed()
    ) {
      continue;
    }

    /*
     * Asegura que el fantasma permanezca
     * activo durante la misión.
     */
    if (!ghost.root.isEnabled()) {
      ghost.root.setEnabled(true);
    }

    // =========================
    // MOVIMIENTO DE LADO A LADO
    // =========================

    ghost.movementT +=
      ghost.movementSpeed *
      ghost.movementDirection;

    if (
      ghost.movementT >= 1
    ) {
      ghost.movementT = 1;
      ghost.movementDirection = -1;
    }

    if (
      ghost.movementT <= 0
    ) {
      ghost.movementT = 0;
      ghost.movementDirection = 1;
    }

    const movementPosition =
      BABYLON.Vector3.Lerp(
        ghost.movementStart,
        ghost.movementEnd,
        ghost.movementT
      );

    ghost.root.position.x =
      movementPosition.x;

    ghost.root.position.z =
      movementPosition.z;

    // =========================
    // FLOTACIÓN SUAVE
    // =========================

    ghost.root.position.y =
      ghost.baseY +
      Math.sin(
        now *
          ghost.floatSpeed +
          ghost.floatOffset
      ) *
        0.35;

    // Gira mirando hacia la dirección
    // en la que se está desplazando.
    const movementDirection =
      ghost.movementEnd.subtract(
        ghost.movementStart
      );

    if (
      ghost.movementDirection < 0
    ) {
      movementDirection.scaleInPlace(
        -1
      );
    }

    if (
      movementDirection.lengthSquared() >
      0.001
    ) {
      ghost.root.rotation.y =
        Math.atan2(
          movementDirection.x,
          movementDirection.z
        );
    }

    // Forzar actualización de la posición mundial.
    ghost.root.computeWorldMatrix(true);

    const ghostWorldPosition =
      ghost.root.getAbsolutePosition();

    // =========================
    // COLISIÓN CON EL AVATAR
    // =========================

    let avatarDistance =
      Infinity;

    /*
     * Solo comprobar el avatar cuando está
     * fuera del automóvil y está habilitado.
     */
    if (
      !inCar &&
      player.isEnabled()
    ) {
      const playerDx =
        player.position.x -
        ghostWorldPosition.x;

      const playerDz =
        player.position.z -
        ghostWorldPosition.z;

      avatarDistance =
        Math.sqrt(
          playerDx * playerDx +
          playerDz * playerDz
        );
    }

    // =========================
    // COLISIÓN CON EL AUTO
    // =========================

    let carDistance =
      Infinity;

    if (
      inCar &&
      car.isEnabled()
    ) {
      const carDx =
        car.position.x -
        ghostWorldPosition.x;

      const carDz =
        car.position.z -
        ghostWorldPosition.z;

      carDistance =
        Math.sqrt(
          carDx * carDx +
          carDz * carDz
        );
    }

    /*
     * Radio del avatar:
     * fantasma 3.4 + avatar 0.8.
     *
     * Radio del auto:
     * fantasma 3.4 + auto 2.3.
     */
    const avatarCollisionDistance =
      ghost.collisionRadius +
      0.5;

    const carCollisionDistance =
      ghost.collisionRadius +
      1;

    const avatarTouchedGhost =
      avatarDistance <=
      avatarCollisionDistance;

    const carTouchedGhost =
      carDistance <=
      carCollisionDistance;

    if (
      avatarTouchedGhost ||
      carTouchedGhost
    ) {
      console.log(
        "COLISIÓN CON FANTASMA",
        {
          inCar,
          avatarDistance,
          carDistance,
          ghostPosition:
            ghostWorldPosition.toString(),
        }
      );

      loseMedicineDeliveryMission();
      return;
    }
  }
}
function createBuildingAtLonLat(
  lon: number,
  lat: number,
  width: number,
  height: number,
  depth: number,
  color: BABYLON.Color3
) {
  const pos = lonLatToWorld(lon, lat);
  const buildingRotation = 1.2; // gira el frente del edificio

  const buildingMat = mat(
    "manualBuildingMat",
    color
  );

  const building = BABYLON.MeshBuilder.CreateBox(
    "manualBuilding",
    {
      width,
      height,
      depth,
    },
    scene
  );

  building.position = new BABYLON.Vector3(
    pos.x,
    height / 2,
    pos.z
  );

  building.material = buildingMat;

registerCullable(building);

return building;
}
// =========================
// BOTS NPC
// =========================

type BotNPC = {
  root: BABYLON.TransformNode;
  collider: BABYLON.Mesh;
  leftLeg: BABYLON.Mesh;
  rightLeg: BABYLON.Mesh;
  leftArm: BABYLON.Mesh;
  rightArm: BABYLON.Mesh;
  walkTime: number;
  path: SidewalkPath;
  pathT: number;
  direction: number;
  speed: number;
};
type RaceBot = {
  car: BABYLON.Mesh;
  route: BABYLON.Vector3[];
  routeIndex: number;
  currentSpeed: number;
  currentGear: number;
  finished: boolean;
  color: string;
  aggression: number;
  brakeTimer: number;
  lap: number;
  target: "finish" | "start";
};

const raceBots: RaceBot[] = [];

const bots: BotNPC[] = [];

function createBotAtLonLat(
  name: string,
  lon: number,
  lat: number,
  color: BABYLON.Color3
) {
  const pos = lonLatToWorld(lon, lat);

  const collider = BABYLON.MeshBuilder.CreateBox(
    `${name}_collider`,
    {
      width: 1,
      height: 2,
      depth: 1,
    },
    scene
  );

  collider.position = new BABYLON.Vector3(pos.x, 1, pos.z);
  collider.isVisible = false;

  const root = new BABYLON.TransformNode(name, scene);
  root.parent = collider;

  const bodyMat = mat(`${name}_mat`, color);

  const head = BABYLON.MeshBuilder.CreateSphere(
    `${name}_head`,
    { diameter: 0.55 },
    scene
  );
  head.position = new BABYLON.Vector3(0, 1.25, 0);
  head.material = skinMat;
  head.parent = root;

  const body = BABYLON.MeshBuilder.CreateBox(
    `${name}_body`,
    { width: 0.7, height: 0.9, depth: 0.35 },
    scene
  );
  body.position = new BABYLON.Vector3(0, 0.75, 0);
  body.material = bodyMat;
  body.parent = root;

  const leftArm = BABYLON.MeshBuilder.CreateBox(
    `${name}_leftArm`,
    { width: 0.22, height: 0.75, depth: 0.22 },
    scene
  );
  leftArm.position = new BABYLON.Vector3(-0.55, 0.55, 0);
  leftArm.material = bodyMat;
  leftArm.parent = root;

  const rightArm = BABYLON.MeshBuilder.CreateBox(
    `${name}_rightArm`,
    { width: 0.22, height: 0.75, depth: 0.22 },
    scene
  );
  rightArm.position = new BABYLON.Vector3(0.55, 0.55, 0);
  rightArm.material = bodyMat;
  rightArm.parent = root;

  const leftLeg = BABYLON.MeshBuilder.CreateBox(
    `${name}_leftLeg`,
    { width: 0.25, height: 0.8, depth: 0.25 },
    scene
  );
  leftLeg.position = new BABYLON.Vector3(-0.22, -0.25, 0);
  leftLeg.material = bodyMat;
  leftLeg.parent = root;

  const rightLeg = BABYLON.MeshBuilder.CreateBox(
    `${name}_rightLeg`,
    { width: 0.25, height: 0.8, depth: 0.25 },
    scene
  );
  rightLeg.position = new BABYLON.Vector3(0.22, -0.25, 0);
  rightLeg.material = bodyMat;
  rightLeg.parent = root;

  const nearestPath = getNearestSidewalkPath(collider.position);

  collider.position = BABYLON.Vector3.Lerp(
    nearestPath.a,
    nearestPath.b,
    0.5
  );
  collider.position.y = 1;

  bots.push({
    root,
    collider,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    walkTime: Math.random() * 10,
    path: nearestPath,
    pathT: Math.random(),
    direction: Math.random() > 0.5 ? 1 : -1,
    speed: 0.0008 + Math.random() * 0.0005,
  });
}

function clearPedestrianBots() {
  for (const bot of bots) {
    bot.collider.dispose();
  }

  bots.length = 0;
}

function spawnBotsForZone(zoneName: string) {
  clearPedestrianBots();

  if (zoneName === "kennedy") {
    createBotAtLonLat("bot1", -77.0305, -12.1218, new BABYLON.Color3(0.8, 0.2, 0.2));
    createBotAtLonLat("bot2", -77.0298, -12.1222, new BABYLON.Color3(0.2, 0.8, 0.2));
    createBotAtLonLat("bot3", -77.0310, -12.1212, new BABYLON.Color3(0.2, 0.4, 1));
  }

  if (zoneName === "este") {
    createBotAtLonLat("botEste1", -77.0215, -12.1217, new BABYLON.Color3(0.8, 0.4, 0.1));
    createBotAtLonLat("botEste2", -77.0198, -12.1225, new BABYLON.Color3(0.1, 0.7, 0.8));
    createBotAtLonLat("botEste3", -77.0188, -12.1208, new BABYLON.Color3(0.6, 0.2, 0.8));
  }

  if (zoneName === "sur") {
    createBotAtLonLat("botSur1", -77.0310, -12.1295, new BABYLON.Color3(0.7, 0.3, 0.2));
    createBotAtLonLat("botSur2", -77.0290, -12.1310, new BABYLON.Color3(0.2, 0.7, 0.3));
  }

  if (zoneName === "oeste") {
    createBotAtLonLat("botOeste1", -77.0400, -12.1165, new BABYLON.Color3(0.2, 0.5, 0.9));
    createBotAtLonLat("botOeste2", -77.0450, -12.1145, new BABYLON.Color3(0.9, 0.5, 0.2));
  }
}
function updateNiuStoreLights() {
  if (!player || !car) return;

  const reference =
    inCar ? car.position : player.position;

  for (
    let i = niuStoreLightEntries.length - 1;
    i >= 0;
    i--
  ) {
    const entry = niuStoreLightEntries[i];

    if (
      entry.root.isDisposed() ||
      entry.light.isDisposed()
    ) {
      niuStoreLightEntries.splice(i, 1);
      continue;
    }

    const distance =
      BABYLON.Vector3.Distance(
        reference,
        entry.root.position
      );

    // La luz solo se calcula cuando estamos cerca.
    entry.light.setEnabled(
      entry.root.isEnabled() &&
      distance < 65
    );
  }
}
function createNiuStoreAtLonLat(
  name: string,
  lon: number,
  lat: number,
  type: "pizza" | "cafe" | "farmacia",
  color: BABYLON.Color3,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // Identificador único para evitar conflictos entre locales
  const storeId =
    `${type}_${lon.toFixed(5)}_${lat.toFixed(5)}`
      .replaceAll("-", "m")
      .replaceAll(".", "_");

  // =========================
  // CONFIGURACIÓN POR NEGOCIO
  // =========================

  let businessName = name;
  let businessSubtitle = "";
  let businessIcon = "";

  let mainColor = color;
  let secondaryColor = new BABYLON.Color3(0.1, 0.1, 0.12);
  let accentColor = new BABYLON.Color3(1, 1, 1);
  let lightColor = new BABYLON.Color3(1, 0.65, 0.35);

  if (type === "pizza") {
    businessName = "NIU PIZZA";
    businessSubtitle = "PIZZA • DELIVERY";
    businessIcon = "🍕";

    mainColor = new BABYLON.Color3(0.82, 0.08, 0.07);
    secondaryColor = new BABYLON.Color3(0.055, 0.045, 0.05);
    accentColor = new BABYLON.Color3(1, 0.82, 0.25);
    lightColor = new BABYLON.Color3(1, 0.38, 0.12);
  }

  if (type === "cafe") {
    businessName = "NIU CAFÉ";
    businessSubtitle = "COFFEE • BAKERY";
    businessIcon = "☕";

    mainColor = new BABYLON.Color3(0.30, 0.16, 0.08);
    secondaryColor = new BABYLON.Color3(0.065, 0.045, 0.035);
    accentColor = new BABYLON.Color3(0.92, 0.74, 0.46);
    lightColor = new BABYLON.Color3(1, 0.68, 0.32);
  }

  if (type === "farmacia") {
    businessName = "NIU FARMA";
    businessSubtitle = "SALUD • BIENESTAR";
    businessIcon = "✚";

    mainColor = new BABYLON.Color3(0.04, 0.57, 0.35);
    secondaryColor = new BABYLON.Color3(0.035, 0.10, 0.11);
    accentColor = new BABYLON.Color3(0.20, 0.95, 0.72);
    lightColor = new BABYLON.Color3(0.10, 1, 0.72);
  }

  // =========================
  // MATERIALES
  // =========================

  const mainMat = mat(
    `${storeId}_mainMat`,
    mainColor
  );

  mainMat.specularColor = new BABYLON.Color3(
    0.12,
    0.12,
    0.12
  );

  const secondaryMat = mat(
    `${storeId}_secondaryMat`,
    secondaryColor
  );

  secondaryMat.specularColor = new BABYLON.Color3(
    0.07,
    0.07,
    0.07
  );

  const accentMat = mat(
    `${storeId}_accentMat`,
    accentColor
  );

  accentMat.emissiveColor =
    accentColor.scale(0.28);

  const whiteMat = mat(
    `${storeId}_whiteMat`,
    new BABYLON.Color3(0.95, 0.95, 0.96)
  );

  const metalMat = mat(
    `${storeId}_metalMat`,
    new BABYLON.Color3(0.28, 0.29, 0.32)
  );

  const floorMat = mat(
    `${storeId}_floorMat`,
    new BABYLON.Color3(0.40, 0.41, 0.43)
  );

  const glassMat = new BABYLON.StandardMaterial(
    `${storeId}_glassMat`,
    scene
  );

  glassMat.diffuseColor = new BABYLON.Color3(
    0.08,
    0.25,
    0.34
  );

  glassMat.emissiveColor =
    lightColor.scale(0.12);

  glassMat.alpha = 0.68;
  glassMat.backFaceCulling = false;
  glassMat.specularColor = new BABYLON.Color3(
    0.75,
    0.75,
    0.75
  );

  const interiorLightMat =
    new BABYLON.StandardMaterial(
      `${storeId}_interiorLightMat`,
      scene
    );

  interiorLightMat.diffuseColor = lightColor;
  interiorLightMat.emissiveColor =
    lightColor.scale(0.85);

  // =========================
  // RAÍZ PRINCIPAL
  // =========================

  const storeRoot = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_root`,
    {
      width: 0.1,
      height: 0.1,
      depth: 0.1,
    },
    scene
  );

  storeRoot.position = new BABYLON.Vector3(
    pos.x,
    0,
    pos.z
  );

  storeRoot.rotation.y = rotationY;
  storeRoot.isVisible = false;
  storeRoot.isPickable = false;

  // =========================
  // PLATAFORMA
  // =========================

  const platform = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_platform`,
    {
      width: 8,
      height: 0.18,
      depth: 8,
    },
    scene
  );

  platform.position = new BABYLON.Vector3(
    0,
    0.09,
    0
  );

  platform.material = floorMat;
  platform.parent = storeRoot;

  // Escalón frontal
  const frontStep = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_frontStep`,
    {
      width: 4.5,
      height: 0.16,
      depth: 1.1,
    },
    scene
  );

  frontStep.position = new BABYLON.Vector3(
    0,
    0.13,
    -4.25
  );

  frontStep.material = metalMat;
  frontStep.parent = storeRoot;

  // =========================
  // CUERPO DEL LOCAL
  // =========================

  const building = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_building`,
    {
      width: 7,
      height: 4.5,
      depth: 7,
    },
    scene
  );

  building.position = new BABYLON.Vector3(
    0,
    2.35,
    0
  );

  building.material = secondaryMat;
  building.parent = storeRoot;

  // Pared trasera reforzada
  const backWall = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_backWall`,
    {
      width: 7.2,
      height: 4.55,
      depth: 0.28,
    },
    scene
  );

  backWall.position = new BABYLON.Vector3(
    0,
    2.35,
    3.55
  );

  backWall.material = secondaryMat;
  backWall.parent = storeRoot;

  // Pared lateral izquierda
  const leftWall = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_leftWall`,
    {
      width: 0.28,
      height: 4.55,
      depth: 7.2,
    },
    scene
  );

  leftWall.position = new BABYLON.Vector3(
    -3.55,
    2.35,
    0
  );

  leftWall.material = mainMat;
  leftWall.parent = storeRoot;

  // Pared lateral derecha
  const rightWall = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_rightWall`,
    {
      width: 0.28,
      height: 4.55,
      depth: 7.2,
    },
    scene
  );

  rightWall.position = new BABYLON.Vector3(
    3.55,
    2.35,
    0
  );

  rightWall.material = mainMat;
  rightWall.parent = storeRoot;

  // =========================
  // TECHO FLOTANTE
  // =========================

  const roof = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_roof`,
    {
      width: 8.2,
      height: 0.42,
      depth: 8.2,
    },
    scene
  );

  roof.position = new BABYLON.Vector3(
    0,
    4.85,
    0
  );

  roof.material = mainMat;
  roof.parent = storeRoot;

  // Parte oscura encima del techo
  const roofTop = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_roofTop`,
    {
      width: 7.6,
      height: 0.18,
      depth: 7.6,
    },
    scene
  );

  roofTop.position = new BABYLON.Vector3(
    0,
    5.15,
    0
  );

  roofTop.material = secondaryMat;
  roofTop.parent = storeRoot;

  // Borde luminoso frontal
  const roofLightBand = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_roofLightBand`,
    {
      width: 8.25,
      height: 0.14,
      depth: 0.20,
    },
    scene
  );

  roofLightBand.position = new BABYLON.Vector3(
    0,
    4.62,
    -4.12
  );

  roofLightBand.material = accentMat;
  roofLightBand.parent = storeRoot;

  // Bordes luminosos laterales
  for (const x of [-4.12, 4.12]) {
    const sideLightBand =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_sideLightBand`,
        {
          width: 0.20,
          height: 0.14,
          depth: 8.25,
        },
        scene
      );

    sideLightBand.position =
      new BABYLON.Vector3(
        x,
        4.62,
        0
      );

    sideLightBand.material = accentMat;
    sideLightBand.parent = storeRoot;
  }

  // =========================
  // FACHADA FRONTAL
  // =========================

  const upperFacade = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_upperFacade`,
    {
      width: 7.15,
      height: 1.05,
      depth: 0.25,
    },
    scene
  );

  upperFacade.position = new BABYLON.Vector3(
    0,
    4.05,
    -3.60
  );

  upperFacade.material = mainMat;
  upperFacade.parent = storeRoot;

  // Franja inferior de la fachada
  const lowerFacade = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_lowerFacade`,
    {
      width: 7.15,
      height: 0.35,
      depth: 0.28,
    },
    scene
  );

  lowerFacade.position = new BABYLON.Vector3(
    0,
    0.48,
    -3.62
  );

  lowerFacade.material = mainMat;
  lowerFacade.parent = storeRoot;

  // =========================
  // VENTANALES
  // =========================

  const leftWindow = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_leftWindow`,
    {
      width: 2.05,
      height: 2.7,
      depth: 0.16,
    },
    scene
  );

  leftWindow.position = new BABYLON.Vector3(
    -2.35,
    2.08,
    -3.68
  );

  leftWindow.material = glassMat;
  leftWindow.parent = storeRoot;

  const rightWindow = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_rightWindow`,
    {
      width: 2.05,
      height: 2.7,
      depth: 0.16,
    },
    scene
  );

  rightWindow.position = new BABYLON.Vector3(
    2.35,
    2.08,
    -3.68
  );

  rightWindow.material = glassMat;
  rightWindow.parent = storeRoot;

  // =========================
  // PUERTA DOBLE
  // =========================

  const leftDoor = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_leftDoor`,
    {
      width: 0.92,
      height: 2.85,
      depth: 0.18,
    },
    scene
  );

  leftDoor.position = new BABYLON.Vector3(
    -0.48,
    1.82,
    -3.72
  );

  leftDoor.material = glassMat;
  leftDoor.parent = storeRoot;

  const rightDoor = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_rightDoor`,
    {
      width: 0.92,
      height: 2.85,
      depth: 0.18,
    },
    scene
  );

  rightDoor.position = new BABYLON.Vector3(
    0.48,
    1.82,
    -3.72
  );

  rightDoor.material = glassMat;
  rightDoor.parent = storeRoot;

  // Marco superior de puerta
  const doorTop = BABYLON.MeshBuilder.CreateBox(
    `${storeId}_doorTop`,
    {
      width: 2.25,
      height: 0.20,
      depth: 0.25,
    },
    scene
  );

  doorTop.position = new BABYLON.Vector3(
    0,
    3.35,
    -3.77
  );

  doorTop.material = whiteMat;
  doorTop.parent = storeRoot;

  // Marcos laterales de puerta
  for (const x of [-1.08, 1.08]) {
    const doorFrame =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_doorFrame`,
        {
          width: 0.18,
          height: 3.05,
          depth: 0.25,
        },
        scene
      );

    doorFrame.position =
      new BABYLON.Vector3(
        x,
        1.78,
        -3.77
      );

    doorFrame.material = whiteMat;
    doorFrame.parent = storeRoot;
  }

  // Manijas
  for (const x of [-0.18, 0.18]) {
    const handle =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_doorHandle`,
        {
          width: 0.07,
          height: 0.65,
          depth: 0.12,
        },
        scene
      );

    handle.position =
      new BABYLON.Vector3(
        x,
        1.72,
        -3.88
      );

    handle.material = metalMat;
    handle.parent = storeRoot;
  }

  // =========================
  // MARQUESINA
  // =========================

  const entranceCanopy =
    BABYLON.MeshBuilder.CreateBox(
      `${storeId}_entranceCanopy`,
      {
        width: 3.3,
        height: 0.23,
        depth: 1.35,
      },
      scene
    );

  entranceCanopy.position =
    new BABYLON.Vector3(
      0,
      3.55,
      -4.25
    );

  entranceCanopy.material = accentMat;
  entranceCanopy.parent = storeRoot;

  // Soportes de marquesina
  for (const x of [-1.35, 1.35]) {
    const canopySupport =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_canopySupport`,
        {
          width: 0.12,
          height: 0.75,
          depth: 0.12,
        },
        scene
      );

    canopySupport.position =
      new BABYLON.Vector3(
        x,
        3.18,
        -4.25
      );

    canopySupport.material = metalMat;
    canopySupport.parent = storeRoot;
  }

  // =========================
  // CARTEL PRINCIPAL
  // =========================

  const signTexture =
    new BABYLON.DynamicTexture(
      `${storeId}_signTexture`,
      {
        width: 1024,
        height: 300,
      },
      scene,
      true
    );

  const signCtx =
    signTexture.getContext() as CanvasRenderingContext2D;

  const mainHex = mainColor.toHexString();
  const accentHex = accentColor.toHexString();

  signCtx.fillStyle = mainHex;
  signCtx.fillRect(0, 0, 1024, 300);

  signCtx.fillStyle = secondaryColor.toHexString();
  signCtx.fillRect(12, 12, 1000, 276);

  signCtx.strokeStyle = accentHex;
  signCtx.lineWidth = 14;
  signCtx.strokeRect(14, 14, 996, 272);

  signCtx.textAlign = "center";
  signCtx.textBaseline = "middle";

  signCtx.fillStyle = "white";
  signCtx.font = "bold 88px Arial";
  signCtx.fillText(
    `${businessIcon} ${businessName}`,
    512,
    118
  );

  signCtx.fillStyle = accentHex;
  signCtx.font = "bold 37px Arial";
  signCtx.fillText(
    businessSubtitle,
    512,
    218
  );

  signTexture.update();

  const signMat =
    new BABYLON.StandardMaterial(
      `${storeId}_signMat`,
      scene
    );

  signMat.diffuseTexture = signTexture;
  signMat.emissiveTexture = signTexture;
  signMat.emissiveColor =
    accentColor.scale(0.55);

  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    `${storeId}_sign`,
    {
      width: 6.2,
      height: 1.8,
    },
    scene
  );

  sign.position = new BABYLON.Vector3(
    0,
    5.85,
    -0.5
  );

  sign.billboardMode =
    BABYLON.Mesh.BILLBOARDMODE_ALL;

  sign.material = signMat;
  sign.parent = storeRoot;
  sign.isPickable = false;
  sign.alwaysSelectAsActiveMesh = true;

  // =========================
  // DETALLES NIU PIZZA
  // =========================

  if (type === "pizza") {
    // Horno decorativo visible
    const oven = BABYLON.MeshBuilder.CreateBox(
      `${storeId}_pizzaOven`,
      {
        width: 1.5,
        height: 1.35,
        depth: 0.8,
      },
      scene
    );

    oven.position = new BABYLON.Vector3(
      -2.25,
      1.15,
      -2.85
    );

    oven.material = secondaryMat;
    oven.parent = storeRoot;

    const ovenOpening =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_ovenOpening`,
        {
          width: 0.95,
          height: 0.60,
          depth: 0.08,
        },
        scene
      );

    ovenOpening.position =
      new BABYLON.Vector3(
        -2.25,
        1.25,
        -3.28
      );

    ovenOpening.material = interiorLightMat;
    ovenOpening.parent = storeRoot;

    // Barras decorativas rojas
    for (const x of [-3.25, 3.25]) {
      const pizzaColumn =
        BABYLON.MeshBuilder.CreateBox(
          `${storeId}_pizzaColumn`,
          {
            width: 0.28,
            height: 3.7,
            depth: 0.35,
          },
          scene
        );

      pizzaColumn.position =
        new BABYLON.Vector3(
          x,
          2.25,
          -3.80
        );

      pizzaColumn.material = mainMat;
      pizzaColumn.parent = storeRoot;
    }
  }

  // =========================
  // DETALLES NIU CAFÉ
  // =========================

  if (type === "cafe") {
    // Banco exterior
    const benchSeat =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_cafeBenchSeat`,
        {
          width: 2,
          height: 0.18,
          depth: 0.55,
        },
        scene
      );

    benchSeat.position =
      new BABYLON.Vector3(
        2.35,
        0.75,
        -4.40
      );

    benchSeat.material = accentMat;
    benchSeat.parent = storeRoot;

    const benchBack =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_cafeBenchBack`,
        {
          width: 2,
          height: 0.9,
          depth: 0.15,
        },
        scene
      );

    benchBack.position =
      new BABYLON.Vector3(
        2.35,
        1.20,
        -4.66
      );

    benchBack.material = accentMat;
    benchBack.parent = storeRoot;

    for (const x of [1.65, 3.05]) {
      const benchLeg =
        BABYLON.MeshBuilder.CreateBox(
          `${storeId}_cafeBenchLeg`,
          {
            width: 0.14,
            height: 0.7,
            depth: 0.14,
          },
          scene
        );

      benchLeg.position =
        new BABYLON.Vector3(
          x,
          0.40,
          -4.40
        );

      benchLeg.material = metalMat;
      benchLeg.parent = storeRoot;
    }

    // Mesa pequeña
    const tableTop =
      BABYLON.MeshBuilder.CreateCylinder(
        `${storeId}_cafeTable`,
        {
          diameter: 1.15,
          height: 0.14,
          tessellation: 24,
        },
        scene
      );

    tableTop.position =
      new BABYLON.Vector3(
        -2.4,
        0.95,
        -4.45
      );

    tableTop.material = accentMat;
    tableTop.parent = storeRoot;

    const tableLeg =
      BABYLON.MeshBuilder.CreateCylinder(
        `${storeId}_cafeTableLeg`,
        {
          height: 0.9,
          diameter: 0.13,
          tessellation: 16,
        },
        scene
      );

    tableLeg.position =
      new BABYLON.Vector3(
        -2.4,
        0.48,
        -4.45
      );

    tableLeg.material = metalMat;
    tableLeg.parent = storeRoot;
  }

  // =========================
  // DETALLES NIU FARMA
  // =========================

  if (type === "farmacia") {
    // Cruz verde luminosa
    const crossVertical =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_crossVertical`,
        {
          width: 0.45,
          height: 1.55,
          depth: 0.18,
        },
        scene
      );

    crossVertical.position =
      new BABYLON.Vector3(
        2.7,
        4.10,
        -3.85
      );

    crossVertical.material = accentMat;
    crossVertical.parent = storeRoot;

    const crossHorizontal =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_crossHorizontal`,
        {
          width: 1.55,
          height: 0.45,
          depth: 0.18,
        },
        scene
      );

    crossHorizontal.position =
      new BABYLON.Vector3(
        2.7,
        4.10,
        -3.85
      );

    crossHorizontal.material = accentMat;
    crossHorizontal.parent = storeRoot;

    // Franja sanitaria blanca
    const pharmacyWhiteBand =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_pharmacyWhiteBand`,
        {
          width: 7.2,
          height: 0.22,
          depth: 0.26,
        },
        scene
      );

    pharmacyWhiteBand.position =
      new BABYLON.Vector3(
        0,
        3.53,
        -3.72
      );

    pharmacyWhiteBand.material = whiteMat;
    pharmacyWhiteBand.parent = storeRoot;
  }

  // =========================
  // LUCES DEL TECHO
  // =========================

  for (const x of [-2.4, 0, 2.4]) {
    const ceilingLamp =
      BABYLON.MeshBuilder.CreateBox(
        `${storeId}_ceilingLamp`,
        {
          width: 1.25,
          height: 0.07,
          depth: 0.55,
        },
        scene
      );

    ceilingLamp.position =
      new BABYLON.Vector3(
        x,
        4.47,
        -1.2
      );

    ceilingLamp.material = interiorLightMat;
    ceilingLamp.parent = storeRoot;
  }

  // =========================
  // ILUMINACIÓN REAL
  // =========================

  const storeLight = new BABYLON.PointLight(
  `${storeId}_light`,
  new BABYLON.Vector3(
    0,
    3,
    -3.3
  ),
  scene
);

storeLight.parent = storeRoot;
storeLight.diffuse = lightColor;

// Luz exterior de la entrada
const entranceLight = new BABYLON.SpotLight(
  `${storeId}_entranceLight`,
  new BABYLON.Vector3(
    0,
    3.6,
    -4
  ),
  new BABYLON.Vector3(
    0,
    -0.65,
    -0.40
  ),
  Math.PI / 2.2,
  2,
  scene
);

entranceLight.parent = storeRoot;
entranceLight.diffuse = lightColor;
entranceLight.specular = lightColor;
entranceLight.intensity = 2.2;
entranceLight.range = 15;

// El specular consume recursos y no es necesario
// para estas casetas.
storeLight.specular = new BABYLON.Color3(
  0,
  0,
  0
);

if (type === "pizza") {
  storeLight.intensity = 1.15;
  storeLight.range = 13;
}

if (type === "cafe") {
  storeLight.intensity = 1;
  storeLight.range = 12;
}

if (type === "farmacia") {
  storeLight.intensity = 1.2;
  storeLight.range = 14;
}

  // =========================
  // REGISTRO Y OPTIMIZACIÓN
  // =========================

  activeMapMeshes.push(storeRoot);

  // Solo se registra la raíz porque todos los elementos
  // del local son hijos de ella.
  registerChunkMesh(storeRoot);
  registerCullable(storeRoot);

  storeRoot.metadata = {
  type: "niuStore",
  businessType: type,
  businessName,
  longitude: lon,
  latitude: lat,
  light: storeLight,
};

  return storeRoot;
}
function createBuildingBetweenCoords(
  name: string,
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  height: number,
  color: BABYLON.Color3,
  signText?: string,
  rotationOffset: number = 0
) {
  const p1 = lonLatToWorld(lon1, lat1);
  const p2 = lonLatToWorld(lon2, lat2);

  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;

  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;

  const distance = BABYLON.Vector3.Distance(p1, p2);

  // Rotación del edificio siguiendo las dos coordenadas
  const rotationY =
  Math.atan2(dx, dz) +
  Math.PI / 2 +
  rotationOffset;

  // Tamaño equilibrado y ligero
  const buildingWidth = Math.max(16, distance);
  const buildingDepth = 10;
  const buildingHeight = Math.max(12, height);

  // =========================
  // MATERIALES
  // =========================

  const darkMat = mat(
    `${name}_darkMat`,
    new BABYLON.Color3(0.025, 0.035, 0.075)
  );

  const glassMat = new BABYLON.StandardMaterial(
    `${name}_glassMat`,
    scene
  );

  glassMat.diffuseColor = new BABYLON.Color3(
    0.05,
    0.20,
    0.42
  );

  glassMat.emissiveColor = new BABYLON.Color3(
    0.015,
    0.055,
    0.13
  );

  glassMat.specularColor = new BABYLON.Color3(
    0.28,
    0.42,
    0.58
  );

  const blueMat = mat(
    `${name}_blueMat`,
    new BABYLON.Color3(0.035, 0.18, 0.72)
  );

  const purpleMat = mat(
    `${name}_purpleMat`,
    new BABYLON.Color3(0.48, 0.08, 0.95)
  );

  const whiteMat = mat(
    `${name}_whiteMat`,
    new BABYLON.Color3(0.92, 0.94, 1)
  );

  const entranceGlassMat =
    new BABYLON.StandardMaterial(
      `${name}_entranceGlassMat`,
      scene
    );

  entranceGlassMat.diffuseColor =
    new BABYLON.Color3(0.06, 0.28, 0.50);

  entranceGlassMat.emissiveColor =
    new BABYLON.Color3(0.02, 0.09, 0.16);

  entranceGlassMat.alpha = 0.78;
  entranceGlassMat.backFaceCulling = false;

  // Material LED morado
  const purpleLedMat =
    new BABYLON.StandardMaterial(
      `${name}_purpleLedMat`,
      scene
    );

  purpleLedMat.diffuseColor =
    new BABYLON.Color3(0.65, 0.10, 1);

  purpleLedMat.emissiveColor =
    new BABYLON.Color3(0.65, 0.10, 1);

  purpleLedMat.specularColor =
    new BABYLON.Color3(0, 0, 0);

  // Material LED azul
  const blueLedMat =
    new BABYLON.StandardMaterial(
      `${name}_blueLedMat`,
      scene
    );

  blueLedMat.diffuseColor =
    new BABYLON.Color3(0.05, 0.48, 1);

  blueLedMat.emissiveColor =
    new BABYLON.Color3(0.05, 0.48, 1);

  blueLedMat.specularColor =
    new BABYLON.Color3(0, 0, 0);

  // =========================
  // RAÍZ PRINCIPAL
  // =========================

  const buildingRoot =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_root`,
      {
        width: 0.1,
        height: 0.1,
        depth: 0.1,
      },
      scene
    );

  buildingRoot.position =
    new BABYLON.Vector3(
      centerX,
      0,
      centerZ
    );

  buildingRoot.rotation.y = rotationY;
  buildingRoot.isVisible = false;
  buildingRoot.isPickable = false;

  // =========================
  // PLATAFORMA
  // =========================

  const platform =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_platform`,
      {
        width: buildingWidth + 3,
        height: 0.28,
        depth: buildingDepth + 3,
      },
      scene
    );

  platform.position =
    new BABYLON.Vector3(
      0,
      0.14,
      0
    );

  platform.material = darkMat;
  platform.parent = buildingRoot;

  // =========================
  // CUERPO PRINCIPAL
  // =========================

  const mainBody =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_mainBody`,
      {
        width: buildingWidth,
        height: buildingHeight,
        depth: buildingDepth,
      },
      scene
    );

  mainBody.position =
    new BABYLON.Vector3(
      0,
      buildingHeight / 2,
      0
    );

  mainBody.material = darkMat;
  mainBody.parent = buildingRoot;

  // =========================
  // FACHADA DE VIDRIO
  // =========================

  const glassFacade =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_glassFacade`,
      {
        width: buildingWidth - 2.6,
        height: buildingHeight - 2.2,
        depth: 0.22,
      },
      scene
    );

  glassFacade.position =
    new BABYLON.Vector3(
      0,
      buildingHeight / 2,
      -buildingDepth / 2 - 0.13
    );

  glassFacade.material = glassMat;
  glassFacade.parent = buildingRoot;

  // =========================
  // COLUMNAS LATERALES
  // =========================

  const columnWidth = 1.15;

  for (const x of [
    -buildingWidth / 2 + 0.7,
    buildingWidth / 2 - 0.7,
  ]) {
    const column =
      BABYLON.MeshBuilder.CreateBox(
        `${name}_sideColumn`,
        {
          width: columnWidth,
          height: buildingHeight + 0.5,
          depth: buildingDepth + 0.4,
        },
        scene
      );

    column.position =
      new BABYLON.Vector3(
        x,
        buildingHeight / 2,
        0
      );

    column.material = blueMat;
    column.parent = buildingRoot;
  }

  // =========================
  // FRANJAS VERTICALES LED
  // =========================

  for (const x of [
    -buildingWidth / 2 + 1.35,
    buildingWidth / 2 - 1.35,
  ]) {
    const verticalLed =
      BABYLON.MeshBuilder.CreateBox(
        `${name}_verticalLed`,
        {
          width: 0.18,
          height: buildingHeight - 1,
          depth: 0.16,
        },
        scene
      );

    verticalLed.position =
      new BABYLON.Vector3(
        x,
        buildingHeight / 2,
        -buildingDepth / 2 - 0.28
      );

    verticalLed.material = purpleLedMat;
    verticalLed.parent = buildingRoot;
  }

  // =========================
  // TECHO SUPERIOR
  // =========================

  const roof =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_roof`,
      {
        width: buildingWidth + 1.2,
        height: 0.55,
        depth: buildingDepth + 1.2,
      },
      scene
    );

  roof.position =
    new BABYLON.Vector3(
      0,
      buildingHeight + 0.28,
      0
    );

  roof.material = whiteMat;
  roof.parent = buildingRoot;

  // LED superior azul
  const topLed =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_topLed`,
      {
        width: buildingWidth + 1.35,
        height: 0.18,
        depth: 0.22,
      },
      scene
    );

  topLed.position =
    new BABYLON.Vector3(
      0,
      buildingHeight + 0.02,
      -buildingDepth / 2 - 0.65
    );

  topLed.material = blueLedMat;
  topLed.parent = buildingRoot;

  // =========================
  // ENTRADA PRINCIPAL
  // =========================

  const entranceWidth = 5;
  const entranceHeight = 4.2;

  const entranceFrame =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_entranceFrame`,
      {
        width: entranceWidth + 0.8,
        height: entranceHeight + 0.7,
        depth: 0.6,
      },
      scene
    );

  entranceFrame.position =
    new BABYLON.Vector3(
      0,
      entranceHeight / 2,
      -buildingDepth / 2 - 0.45
    );

  entranceFrame.material = purpleMat;
  entranceFrame.parent = buildingRoot;

  const entranceGlass =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_entranceGlass`,
      {
        width: entranceWidth,
        height: entranceHeight,
        depth: 0.22,
      },
      scene
    );

  entranceGlass.position =
    new BABYLON.Vector3(
      0,
      entranceHeight / 2,
      -buildingDepth / 2 - 0.78
    );

  entranceGlass.material = entranceGlassMat;
  entranceGlass.parent = buildingRoot;

  // División central de las puertas
  const doorDivider =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_doorDivider`,
      {
        width: 0.16,
        height: entranceHeight,
        depth: 0.14,
      },
      scene
    );

  doorDivider.position =
    new BABYLON.Vector3(
      0,
      entranceHeight / 2,
      -buildingDepth / 2 - 0.92
    );

  doorDivider.material = whiteMat;
  doorDivider.parent = buildingRoot;

  // Marquesina sobre la entrada
  const entranceCanopy =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_entranceCanopy`,
      {
        width: entranceWidth + 2,
        height: 0.28,
        depth: 2,
      },
      scene
    );

  entranceCanopy.position =
    new BABYLON.Vector3(
      0,
      entranceHeight + 0.8,
      -buildingDepth / 2 - 1
    );

  entranceCanopy.material = whiteMat;
  entranceCanopy.parent = buildingRoot;

  // LED bajo la marquesina
  const canopyLed =
    BABYLON.MeshBuilder.CreateBox(
      `${name}_canopyLed`,
      {
        width: entranceWidth + 1.6,
        height: 0.10,
        depth: 1.5,
      },
      scene
    );

  canopyLed.position =
    new BABYLON.Vector3(
      0,
      entranceHeight + 0.6,
      -buildingDepth / 2 - 1
    );

  canopyLed.material = purpleLedMat;
  canopyLed.parent = buildingRoot;

  // =========================
  // LETRERO PRINCIPAL
  // =========================

  const finalSignText =
    signText || "NIU DIGITAL WORLD";

  const signTexture =
    new BABYLON.DynamicTexture(
      `${name}_signTexture`,
      {
        width: 1024,
        height: 320,
      },
      scene,
      true
    );

  const ctx =
    signTexture.getContext() as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, 1024, 320);

  // Fondo oscuro
  ctx.fillStyle = "#080A18";
  ctx.fillRect(0, 0, 1024, 320);

  // Borde morado
  ctx.strokeStyle = "#9A38FF";
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 1000, 296);

  // Línea azul interior
  ctx.strokeStyle = "#168CFF";
  ctx.lineWidth = 5;
  ctx.strokeRect(29, 29, 966, 262);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "white";
  ctx.font = "bold 82px Arial";
  ctx.fillText("NIU", 512, 88);

  ctx.fillStyle = "#C873FF";
  ctx.font = "bold 68px Arial";
  ctx.fillText(
    finalSignText
      .replace(/^NIU\s*/i, "")
      .toUpperCase(),
    512,
    170
  );

  ctx.fillStyle = "#70B8FF";
  ctx.font = "bold 31px Arial";
  ctx.fillText(
    "• DIGITAL CITY • ",
    512,
    255
  );

  signTexture.update();

  const signMat =
    new BABYLON.StandardMaterial(
      `${name}_signMat`,
      scene
    );

  signMat.diffuseTexture = signTexture;
  signMat.emissiveTexture = signTexture;

  signMat.emissiveColor =
    new BABYLON.Color3(
      0.72,
      0.72,
      0.72
    );

  signMat.backFaceCulling = false;

  const sign =
    BABYLON.MeshBuilder.CreatePlane(
      `${name}_mainSign`,
      {
        width: Math.min(
          buildingWidth - 3,
          13
        ),
        height: 4.1,
      },
      scene
    );

  sign.position =
    new BABYLON.Vector3(
      0,
      buildingHeight - 2.7,
      -buildingDepth / 2 - 0.4
    );

  sign.material = signMat;
  sign.parent = buildingRoot;
  sign.isPickable = false;

  // =========================
  // ILUMINACIÓN
  // =========================

  // Luz azul para toda la fachada
  const facadeLight =
    new BABYLON.PointLight(
      `${name}_facadeLight`,
      BABYLON.Vector3.Zero(),
      scene
    );

  facadeLight.parent = buildingRoot;

  facadeLight.position =
    new BABYLON.Vector3(
      0,
      buildingHeight * 0.65,
      -buildingDepth / 2 - 3
    );

  facadeLight.diffuse =
    new BABYLON.Color3(
      0.12,
      0.38,
      1
    );

  facadeLight.intensity = 1.4;
  facadeLight.range = 24;

  // Luz morada para la entrada
  const entranceLight =
    new BABYLON.PointLight(
      `${name}_entranceLight`,
      BABYLON.Vector3.Zero(),
      scene
    );

  entranceLight.parent = buildingRoot;

  entranceLight.position =
    new BABYLON.Vector3(
      0,
      2.8,
      -buildingDepth / 2 - 3
    );

  entranceLight.diffuse =
    new BABYLON.Color3(
      0.7,
      0.12,
      1
    );

  entranceLight.intensity = 1.35;
  entranceLight.range = 16;

  // =========================
  // OPTIMIZACIÓN
  // =========================

  activeMapMeshes.push(buildingRoot);

  // Registrar únicamente la raíz.
  // No registres cada pared o luz por separado.
  registerChunkMesh(buildingRoot);
  registerCullable(buildingRoot);

  return buildingRoot;
}
function createMarkerAtLonLat(
  name: string,
  lon: number,
  lat: number,
  material: BABYLON.Material,
  height: number = 2.2
) {
  const pos = lonLatToWorld(lon, lat);

  const pole = BABYLON.MeshBuilder.CreateCylinder(
    name + "_pole",
    { height, diameter: 0.25 },
    scene
  );
  pole.position = new BABYLON.Vector3(pos.x, height / 2, pos.z);
  pole.material = material;
  registerChunkMesh(pole);
registerCullable(pole);

  const sign = BABYLON.MeshBuilder.CreateBox(
    name + "_sign",
    { width: 1.2, height: 0.8, depth: 0.15 },
    scene
  );
  sign.position = new BABYLON.Vector3(pos.x, height + 0.35, pos.z);
  sign.material = material;
  registerChunkMesh(sign);
registerCullable(sign);
}
// =========================
// MINI MAPA
// =========================

const minimap = document.createElement("canvas");
minimap.width = 180;
minimap.height = 180;
let minimapExpanded = false;
let mapOffsetX = 0;
let mapOffsetZ = 0;
let mapZoom = 0.18;
let isDraggingMap = false;
let lastMouseX = 0;
let lastMouseY = 0;
minimap.style.position = "fixed";
minimap.style.left = "12px";
minimap.style.bottom = "12px";
minimap.style.width = "180px";
minimap.style.height = "180px";
minimap.style.background = "rgba(0, 0, 0, 0.55)";
minimap.style.border = "2px solid white";
minimap.style.borderRadius = "12px";
minimap.style.zIndex = "100";
document.body.appendChild(minimap);

const minimapCtx = minimap.getContext("2d")!;

// =========================
// TEXTO DE CARRERAS
// =========================

const raceText = document.createElement("div");
const missionHint = document.createElement("div");

missionHint.style.position = "fixed";
missionHint.style.top = "120px";
missionHint.style.left = "50%";
missionHint.style.transform = "translateX(-50%)";
missionHint.style.padding = "10px 18px";
missionHint.style.background = "rgba(0,0,0,0.75)";
missionHint.style.color = "white";
missionHint.style.borderRadius = "10px";
missionHint.style.fontFamily = "Arial";
missionHint.style.fontSize = "18px";
missionHint.style.zIndex = "99999";
missionHint.style.display = "none";

document.body.appendChild(missionHint);

function showMissionMessage(
  text: string,
  duration = 3500
) {
  missionHint.innerText = text;
  missionHint.style.display = "block";

  clearTimeout((missionHint as any)._timer);

  (missionHint as any)._timer = setTimeout(() => {
    missionHint.style.display = "none";
  }, duration);
}

raceText.style.position = "fixed";
raceText.style.top = "50%";
raceText.style.left = "50%";
raceText.style.transform = "translate(-50%, -50%)";
raceText.style.fontSize = "120px";
raceText.style.fontWeight = "bold";
raceText.style.color = "white";
raceText.style.textAlign = "center";
raceText.style.textShadow = "0 0 15px black";
raceText.style.zIndex = "99999";
raceText.style.display = "none";

document.body.appendChild(raceText);

// =========================
// GPS POR CALLES
// =========================

let gpsRoute: BABYLON.Vector3[] = [];
let gpsDestination: BABYLON.Vector3 | null = null;
let gpsNavigationActive = false;
let gpsCurrentIndex = 0;
let gpsDestinationAura: BABYLON.Mesh | null = null;

let gpsTargetLon: number | null = null;
let gpsTargetLat: number | null = null;
let gpsChangingZone = false;

function pointKey(p: BABYLON.Vector3) {
  return `${p.x.toFixed(2)},${p.z.toFixed(2)}`;
}

function getNearestRoadNode(pos: BABYLON.Vector3, useGlobalGps = false) {
  const source = useGlobalGps && gpsRoadSegments.length > 0
    ? gpsRoadSegments
    : roadSegments;

  let best = source[0]?.a || pos;
  let bestDist = Infinity;

  for (const seg of source) {
    const da = BABYLON.Vector3.Distance(pos, seg.a);
    const db = BABYLON.Vector3.Distance(pos, seg.b);

    if (da < bestDist) {
      bestDist = da;
      best = seg.a;
    }

    if (db < bestDist) {
      bestDist = db;
      best = seg.b;
    }
  }

  return best;
}

function calculateGpsRoute(start: BABYLON.Vector3, end: BABYLON.Vector3) {
  const source = gpsRoadSegments.length > 0 ? gpsRoadSegments : roadSegments;

  const startNode = getNearestRoadNode(start, true);
  const endNode = getNearestRoadNode(end, true);

  const graph = new Map<
    string,
    { point: BABYLON.Vector3; links: { key: string; cost: number }[] }
  >();

  function addNode(p: BABYLON.Vector3) {
    const key = pointKey(p);

    if (!graph.has(key)) {
      graph.set(key, {
        point: p,
        links: [],
      });
    }

    return key;
  }

  for (const seg of source) {
    const aKey = addNode(seg.a);
    const bKey = addNode(seg.b);
    const cost = BABYLON.Vector3.Distance(seg.a, seg.b);

    if (seg.oneway) {

    graph.get(aKey)!.links.push({
        key: bKey,
        cost
    });

} else {

    graph.get(aKey)!.links.push({
        key: bKey,
        cost
    });

    graph.get(bKey)!.links.push({
        key: aKey,
        cost
    });

}
  }

  const startKey = pointKey(startNode);
  const endKey = pointKey(endNode);

  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const key of graph.keys()) {
    distances.set(key, Infinity);
    previous.set(key, null);
    unvisited.add(key);
  }

  distances.set(startKey, 0);

  while (unvisited.size > 0) {
    let currentKey: string | null = null;
    let currentDist = Infinity;

    for (const key of unvisited) {
      const dist = distances.get(key)!;

      if (dist < currentDist) {
        currentDist = dist;
        currentKey = key;
      }
    }

    if (!currentKey) break;
    if (currentKey === endKey) break;

    unvisited.delete(currentKey);

    const currentNode = graph.get(currentKey);
    if (!currentNode) continue;

    for (const link of currentNode.links) {
      const newDist = currentDist + link.cost;

      if (newDist < distances.get(link.key)!) {
        distances.set(link.key, newDist);
        previous.set(link.key, currentKey);
      }
    }
  }

  const route: BABYLON.Vector3[] = [];
  let current: string | null = endKey;

  while (current) {
    const node = graph.get(current);
    if (node) route.unshift(node.point);
    current = previous.get(current) || null;
  }

  if (route.length <= 1) {
    gpsRoute = [];
    return;
  }

  gpsRoute = [
  start.clone(),
  ...route,
  end.clone(),
];

gpsDestination = end;
gpsCurrentIndex = 0;
}
function startDeliveryMission() {
    missionStage = "pickup";

    pickupAura.setEnabled(true);
    deliveryAura.setEnabled(false);

    setGpsDestination(
        -77.028950,
        -12.120720
    );

    showMissionMessage("Misión Entrega y Recojo iniciada");
}
function setGpsDestination(lon: number, lat: number) {
  if (!player || !car || !gpsArrow) return;

  gpsTargetLon = lon;
  gpsTargetLat = lat;

  const destination = lonLatToWorld(lon, lat);
  const reference = inCar ? car.position : player.position;

  gpsDestination = destination;
  gpsNavigationActive = true;
  gpsCurrentIndex = 0;

  calculateGpsRoute(reference, destination);

  if (gpsRoute.length < 2) {
    gpsRoute = [
      reference.clone(),
      destination.clone(),
    ];
  }

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  const gpsAuraMat = new BABYLON.StandardMaterial(
    "gpsDestinationAuraMat",
    scene
  );

  gpsAuraMat.diffuseColor = new BABYLON.Color3(1, 0.1, 0.75);
  gpsAuraMat.emissiveColor = new BABYLON.Color3(1, 0.1, 0.75);
  gpsAuraMat.alpha = 0.65;

  gpsDestinationAura = BABYLON.MeshBuilder.CreateCylinder(
    "gpsDestinationAura",
    {
      diameter: 8,
      height: 0.28,
      tessellation: 64,
    },
    scene
  );

  gpsDestinationAura.position = new BABYLON.Vector3(
    destination.x,
    0.28,
    destination.z
  );

  gpsDestinationAura.material = gpsAuraMat;

  gpsArrow.setEnabled(true);

  console.log("GPS ACTIVADO:", {
    lon,
    lat,
    routePoints: gpsRoute.length,
  });
}
function refreshGpsAfterZoneChange() {
  if (!gpsNavigationActive) return;
  if (gpsTargetLon === null || gpsTargetLat === null) return;
  if (!player || !car) return;

  gpsChangingZone = true;

  const destination = lonLatToWorld(gpsTargetLon, gpsTargetLat);
  const start = inCar ? car.position : player.position;

  gpsDestination = destination;
  calculateGpsRoute(
    getNearestGpsRoadPoint(start),
    getNearestGpsRoadPoint(destination)
);
  if (gpsRoute.length <= 1) {
  gpsRoute = [start.clone(), destination.clone()];
}

  if (gpsDestinationAura) {
    gpsDestinationAura.position = new BABYLON.Vector3(
      destination.x,
      0.28,
      destination.z
    );
    gpsDestinationAura.setEnabled(true);
  }

  if (gpsArrow) {
    gpsArrow.setEnabled(true);
  }

  setTimeout(() => {
    gpsChangingZone = false;
  }, 800);

  console.log("GPS mantenido al cambiar zona:", gpsRoute.length);
}
type MapLegendPoint = {
  name: string;
  lon: number;
  lat: number;
  icon: string;
  color: string;

  // Mapa donde debe aparecer el marcador.
  mapName?: string;
};

const mapLegendPoints: MapLegendPoint[] = [
  {
    name: "Niu Digital World",
    lon: -77.02887372477591,
    lat: -12.120712547159264,
    icon: "🏢",
    color: "#8b35ff",
    },
  {
    name: "Niu Travel",
    lon: -77.03492756931041,
    lat: -12.123254168936334,
    icon: "✈️",
    color: "#ff1493",
  },
  {
  name: "Niu Market",
  lon: -77.0334361682421,
  lat: -12.119236469653597,
  icon: "🛍️",
  color: "#ffbf1f",
},
// =========================
  // MANHATTAN
  // =========================
  {
    name: "Niu Travel",
    lon: -73.98940620374685,
    lat: 40.74128561935433,
    icon: "✈️",
    color: "#ff1493",
    mapName: "manhattan",
  },

  // =========================
  // BEVERLY HILLS
  // =========================
  {
    name: "Niu Travel",
    lon: -118.410152798886,
    lat: 34.08369100987586,
    icon: "✈️",
    color: "#ff1493",
    mapName: "beverly-hills",
  },
];
function registerGasStationOnMap(
  lon: number,
  lat: number,
  name: string = "NIU Gasoline"
) {
  // Evita registrar dos veces la misma gasolinera.
  const alreadyRegistered = mapLegendPoints.some((item) => {
    const sameType = item.icon === "⛽";

    const sameLongitude =
      Math.abs(item.lon - lon) < 0.00001;

    const sameLatitude =
      Math.abs(item.lat - lat) < 0.00001;

    return (
      sameType &&
      sameLongitude &&
      sameLatitude
    );
  });

  if (alreadyRegistered) {
    return;
  }

  mapLegendPoints.push({
    name,
    lon,
    lat,
    icon: "⛽",
    color: "#2f6bff",
  });
}
function drawMinimap() {
  if (!player || !car) return;

  const ctx = minimapCtx;
  const w = minimap.width;
  const h = minimap.height;

  ctx.clearRect(0, 0, w, h);

  // Fondo
  ctx.fillStyle = "rgba(20, 20, 20, 0.9)";
  ctx.fillRect(0, 0, w, h);

  // Centro del minimapa: avatar o auto
  const reference = inCar ? car.position : player.position;

const mapCenter = minimapExpanded
  ? new BABYLON.Vector3(
      reference.x + mapOffsetX,
      0,
      reference.z + mapOffsetZ
    )
  : reference;

const scale = minimapExpanded ? mapZoom : 0.35;

  function worldToMini(pos: BABYLON.Vector3) {
  return {
    x: w / 2 + (pos.x - mapCenter.x) * scale,
    y: h / 2 - (pos.z - mapCenter.z) * scale,
  };
}

  // Dibujar calles cercanas
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;

  for (const seg of roadSegments) {
    const a = worldToMini(seg.a);
    const b = worldToMini(seg.b);

    // No dibujar segmentos muy lejos del minimapa
    if (
      (a.x < -20 && b.x < -20) ||
      (a.x > w + 20 && b.x > w + 20) ||
      (a.y < -20 && b.y < -20) ||
      (a.y > h + 20 && b.y > h + 20)
    ) {
      continue;
    }

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    // Nombre de calle en el mini mapa
if (seg.name) {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;

  const dx = b.x - a.x;
  const dy = b.y - a.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  // Solo mostrar nombres si el tramo es suficientemente largo
  if (length > 35) {
    ctx.save();

    ctx.translate(midX, midY);
    ctx.rotate(Math.atan2(dy, dx));

    ctx.fillStyle = "white";
    ctx.font = minimapExpanded ? "11px Arial" : "8px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;

    ctx.fillText(seg.name, 0, -4);

    ctx.restore();
  }
}
  }

  // Amigos en el minimapa
for (const friend of friends) {
  const friendPoint = worldToMini(
    new BABYLON.Vector3(friend.x, 0, friend.z)
  );

  ctx.fillStyle = friend.online ? "lime" : "gray";
  ctx.beginPath();
  ctx.arc(friendPoint.x, friendPoint.y, 5, 0, Math.PI * 2);
  ctx.fill();

  if (minimapExpanded) {
    ctx.fillStyle = "white";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(friend.name, friendPoint.x, friendPoint.y - 8);
  }
}
// Ruta GPS
if (gpsRoute.length > 1) {
  ctx.strokeStyle = "#00A8FF";
  ctx.lineWidth = minimapExpanded ? 5 : 3;
  ctx.shadowColor = "#00A8FF";
  ctx.shadowBlur = 8;

  ctx.beginPath();

  for (let i = 0; i < gpsRoute.length; i++) {
    const p = worldToMini(gpsRoute[i]);

    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  ctx.stroke();

  ctx.shadowBlur = 0;
}

// Punto destino GPS
if (gpsDestination) {
  const dest = worldToMini(gpsDestination);

  ctx.fillStyle = "#00A8FF";
  ctx.beginPath();
  ctx.arc(dest.x, dest.y, minimapExpanded ? 8 : 5, 0, Math.PI * 2);
  ctx.fill();
}
for (const bot of raceBots) {
  const botPoint = worldToMini(bot.car.position);

  ctx.fillStyle = bot.color;
  ctx.beginPath();
  ctx.arc(
    botPoint.x,
    botPoint.y,
    minimapExpanded ? 6 : 4,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
// =========================
// LUGARES IMPORTANTES
// Se muestran en mapa pequeño y grande
// =========================

for (const item of mapLegendPoints) {
  // No dibujar lugares pertenecientes
  // a una ciudad diferente.
  if (
    item.mapName &&
    item.mapName !== currentMapName
  ) {
    continue;
  }

  const worldPosition = lonLatToWorld(
    item.lon,
    item.lat
  );

  const point = worldToMini(worldPosition);

  // No dibujar el punto si está fuera del mapa
  const outsideMargin = minimapExpanded ? 50 : 20;

  if (
    point.x < -outsideMargin ||
    point.x > w + outsideMargin ||
    point.y < -outsideMargin ||
    point.y > h + outsideMargin
  ) {
    continue;
  }

  const markerRadius = minimapExpanded ? 11 : 7;
  const iconFontSize = minimapExpanded ? 16 : 11;

  // Sombra del marcador
  ctx.save();

  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = minimapExpanded ? 8 : 4;

  // Círculo del marcador
  ctx.fillStyle = item.color;
  ctx.beginPath();
  ctx.arc(
    point.x,
    point.y,
    markerRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Borde blanco
  ctx.strokeStyle = "white";
  ctx.lineWidth = minimapExpanded ? 2 : 1.3;
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Emoji
  ctx.fillStyle = "white";
  ctx.font = `${iconFontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    item.icon,
    point.x,
    point.y + 1
  );

  ctx.restore();

  // Nombre completo solo en el mapa grande
  if (minimapExpanded) {
    ctx.save();

    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const textWidth =
      ctx.measureText(item.name).width;

    const labelX = point.x;
    const labelY = point.y - 16;

    // Fondo oscuro del nombre
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fillRect(
      labelX - textWidth / 2 - 5,
      labelY - 16,
      textWidth + 10,
      18
    );

    // Nombre
    ctx.fillStyle = "white";
    ctx.fillText(
      item.name,
      labelX,
      labelY
    );

    ctx.restore();
  }
}
  // Auto
  const carPoint = worldToMini(car.position);
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(carPoint.x, carPoint.y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Avatar
  if (!inCar) {
    const playerPoint = worldToMini(player.position);
    ctx.fillStyle = "dodgerblue";
    ctx.beginPath();
    ctx.arc(playerPoint.x, playerPoint.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Centro actual
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Letra N de norte
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("N", w / 2, 18);
  ctx.font = "10px Arial";
ctx.fillText("M: mapa", w / 2, h - 10);
}
function createModernOrangeBuildingAtLonLat(
  lon: number,
  lat: number
) {
  const pos = lonLatToWorld(lon, lat);

  // Esta rotación mantiene el edificio mirando hacia Av. 28 de Julio
  const buildingRotation = 0.25;

  function rotatedPosition(x: number, y: number, z: number) {
    const cos = Math.cos(buildingRotation);
    const sin = Math.sin(buildingRotation);

    return new BABYLON.Vector3(
      pos.x + x * cos + z * sin,
      y,
      pos.z - x * sin + z * cos
    );
  }

  const orangeMat = mat("modernOrangeMat", new BABYLON.Color3(0.95, 0.38, 0.08));
  const blackMat = mat("modernBlackMat", new BABYLON.Color3(0.03, 0.03, 0.035));
  const glassMat = mat("modernGlassMat", new BABYLON.Color3(0.15, 0.35, 0.55));

  const building = BABYLON.MeshBuilder.CreateBox(
    "modernOrangeBuilding",
    { width: 18, height: 38, depth: 14 },
    scene
  );
  building.position = rotatedPosition(0, 19, 0);
  building.rotation.y = buildingRotation;
  building.material = orangeMat;
  registerCullable(building);
  registerChunkMesh(building);

  // FACHADA AL FRENTE
  const frontPanel = BABYLON.MeshBuilder.CreateBox(
    "blackFrontPanel",
    { width: 14, height: 34, depth: 0.25 },
    scene
  );
  frontPanel.position = rotatedPosition(0, 19, -7.15);
  frontPanel.rotation.y = buildingRotation;
  frontPanel.material = blackMat;
  registerCullable(frontPanel);
  registerChunkMesh(frontPanel);

  // Ventanas frontales
  for (let floor = 0; floor < 8; floor++) {
    for (let col = -2; col <= 2; col++) {
      const windowBox = BABYLON.MeshBuilder.CreateBox(
        "buildingWindow",
        { width: 1.8, height: 1.4, depth: 0.12 },
        scene
      );

      windowBox.position = rotatedPosition(
        col * 2.4,
        5 + floor * 3.5,
        -7.32
      );

      windowBox.rotation.y = buildingRotation;
      windowBox.material = glassMat;
      registerCullable(windowBox);
      registerChunkMesh(windowBox);
    }
  }

  // Puerta frontal
  const door = BABYLON.MeshBuilder.CreateBox(
    "buildingDoor",
    { width: 4, height: 4, depth: 0.18 },
    scene
  );
  door.position = rotatedPosition(0, 2.1, -7.4);
  door.rotation.y = buildingRotation;
  door.material = glassMat;
  registerCullable(door);
  registerChunkMesh(door);

  return building;
}
function createStopSignAtLonLat(lon: number, lat: number) {
  const pos = lonLatToWorld(lon, lat);

  const poleMat = mat("stopPoleMat", new BABYLON.Color3(0.55, 0.55, 0.55));

  // Poste
  const pole = BABYLON.MeshBuilder.CreateCylinder(
    "stopPole",
    { height: 2, diameter: 0.12 },
    scene
  );
  pole.position = new BABYLON.Vector3(pos.x, 1, pos.z);
  pole.material = poleMat;

  // Textura roja con STOP impreso
  const stopTexture = new BABYLON.DynamicTexture(
    "stopPrintedTexture",
    { width: 512, height: 512 },
    scene,
    true
  );

  const ctx = stopTexture.getContext() as CanvasRenderingContext2D;

  ctx.clearRect(0, 0, 512, 512);

  // Fondo transparente
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 512, 512);

  // Octágono rojo
  ctx.beginPath();
  const centerX = 256;
  const centerY = 256;
  const radius = 210;

  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 8 + (i * Math.PI) / 4;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.closePath();
  ctx.fillStyle = "#d00000";
  ctx.fill();

  // Borde blanco
  ctx.lineWidth = 18;
  ctx.strokeStyle = "white";
  ctx.stroke();

  // Texto STOP impreso
  ctx.fillStyle = "white";
  ctx.font = "bold 125px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("STOP", 256, 270);

  stopTexture.update();

  const stopMat = new BABYLON.StandardMaterial("stopPrintedMat", scene);
  stopMat.diffuseTexture = stopTexture;
  stopMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  stopMat.backFaceCulling = false;

  // Señal plana, sin billboard
  const sign = BABYLON.MeshBuilder.CreatePlane(
    "stopPrintedSign",
    { width: 1.25, height: 1.25 },
    scene
  );

  sign.position = new BABYLON.Vector3(pos.x, 2.15, pos.z);
  sign.rotation.y = Math.PI;
  sign.material = stopMat;
  // Parte trasera negra sin letras
const backMat = mat("stopBackMat", new BABYLON.Color3(0.02, 0.02, 0.02));
backMat.backFaceCulling = false;

const backSign = BABYLON.MeshBuilder.CreatePlane(
  "stopBackSign",
  { width: 1.25, height: 1.25 },
  scene
);

backSign.position = new BABYLON.Vector3(pos.x, 2.15, pos.z - 0.015);
backSign.rotation.y = 0;
backSign.material = backMat;

registerChunkMesh(backSign);
registerCullable(backSign);

  registerChunkMesh(pole);
  registerChunkMesh(sign);
  registerCullable(pole);
  registerCullable(sign);
}
function createStreetArrowAtLonLat(
  lon: number,
  lat: number,
  rotationY: number
) {
  const pos = lonLatToWorld(lon, lat);

  const arrowRoot = new BABYLON.TransformNode("streetArrowRoot", scene);
  arrowRoot.position = new BABYLON.Vector3(pos.x, 0.28, pos.z);
  arrowRoot.rotation.y = rotationY;

  // cuerpo
  const body = BABYLON.MeshBuilder.CreateBox(
    "streetArrowBody",
    { width: 0.45, height: 0.04, depth: 5 },
    scene
  );
  body.position.z = -0.8;
  body.material = lineMat;
  body.parent = arrowRoot;

  // punta izquierda
  const leftTip = BABYLON.MeshBuilder.CreateBox(
    "streetArrowLeftTip",
    { width: 0.35, height: 0.04, depth: 2 },
    scene
  );
  leftTip.position = new BABYLON.Vector3(-0.65, 0, -3);
  leftTip.rotation.y = -0.65;
  leftTip.material = lineMat;
  leftTip.parent = arrowRoot;

  // punta derecha
  const rightTip = BABYLON.MeshBuilder.CreateBox(
    "streetArrowRightTip",
    { width: 0.35, height: 0.04, depth: 2 },
    scene
  );
  rightTip.position = new BABYLON.Vector3(0.65, 0, -3);
  rightTip.rotation.y = 0.65;
  rightTip.material = lineMat;
  rightTip.parent = arrowRoot;
}
function createStreetSignBetweenCoords(
  name: string,
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
) {
  const p1 = lonLatToWorld(lon1, lat1);
  const p2 = lonLatToWorld(lon2, lat2);

  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;

  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;

  const distance = BABYLON.Vector3.Distance(p1, p2);

  const poleMat = mat(
    "streetPoleMat",
    new BABYLON.Color3(0.75, 0.75, 0.75)
  );

  const leftPole = BABYLON.MeshBuilder.CreateCylinder(
    "leftStreetPole",
    {
      height: 5.5,
      diameter: 0.18,
    },
    scene
  );
  leftPole.position = new BABYLON.Vector3(p1.x, 2.75, p1.z);
  leftPole.material = poleMat;

  const rightPole = BABYLON.MeshBuilder.CreateCylinder(
    "rightStreetPole",
    {
      height: 5.5,
      diameter: 0.18,
    },
    scene
  );
  rightPole.position = new BABYLON.Vector3(p2.x, 2.75, p2.z);
  rightPole.material = poleMat;

  const signTexture = new BABYLON.DynamicTexture(
    name + "_streetSignTexture",
    { width: 1024, height: 256 },
    scene,
    true
  );

  const ctx = signTexture.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = "#0B8A3C";
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 1008, 240);

  ctx.fillStyle = "white";
  ctx.font = "bold 105px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 512, 128);

  signTexture.update();

  const signMat = new BABYLON.StandardMaterial(
    name + "_streetSignMat",
    scene
  );
  signMat.diffuseTexture = signTexture;
  signMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    name + "_streetSignPanel",
    {
      width: Math.max(distance, 7),
      height: 2,
    },
    scene
  );

  sign.position = new BABYLON.Vector3(centerX, 4.8, centerZ);

  // Esta rotación alinea el cartel entre ambos postes
  sign.rotation.y = Math.atan2(dx, dz) + Math.PI / 2;

  sign.material = signMat;

  registerChunkMesh(leftPole);
  registerChunkMesh(rightPole);
  registerChunkMesh(sign);

  registerCullable(leftPole);
  registerCullable(rightPole);
  registerCullable(sign);
}
function createBotWalkingBetweenCoords(
  name: string,
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  color: BABYLON.Color3
) {
  const p1 = lonLatToWorld(lon1, lat1);
  const p2 = lonLatToWorld(lon2, lat2);

  const fakePath: SidewalkPath = {
    a: getNearestSidewalkPoint(p1),
    b: getNearestSidewalkPoint(p2),
  };

  createBotAtLonLat(name, lon1, lat1, color);

  const bot = bots[bots.length - 1];

  bot.path = fakePath;
  bot.pathT = 0;
  bot.direction = 1;
  bot.collider.position.copyFrom(fakePath.a);
}function createMissionSystem() {
  const pickupMat = new BABYLON.StandardMaterial("pickupAuraMat", scene);
pickupMat.diffuseColor = new BABYLON.Color3(1, 0.15, 0.75);
pickupMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0.75);
pickupMat.alpha = 0.65;

const deliveryMat = new BABYLON.StandardMaterial("deliveryAuraMat", scene);
deliveryMat.diffuseColor = new BABYLON.Color3(0.1, 0.45, 1);
deliveryMat.emissiveColor = new BABYLON.Color3(0.1, 0.45, 1);
deliveryMat.alpha = 0.65;

  pickupAura = BABYLON.MeshBuilder.CreateCylinder(
    "pickupAura",
    { diameter: 8, height: 0.35 },
    scene
  );
  pickupAura.position = new BABYLON.Vector3(pickupPoint.x, 0.25, pickupPoint.z);
  pickupAura.material = pickupMat;
  pickupAura.setEnabled(false);

  deliveryAura = BABYLON.MeshBuilder.CreateCylinder(
    "deliveryAura",
    { diameter: 5, height: 0.25 },
    scene
  );
  deliveryAura.position = new BABYLON.Vector3(deliveryPoint.x, 0.25, deliveryPoint.z);
  deliveryAura.material = deliveryMat;
  deliveryAura.setEnabled(false);

  gpsArrow = new BABYLON.TransformNode("gpsArrow", scene);

  const arrowMat = new BABYLON.StandardMaterial("gpsArrowMat", scene);
  arrowMat.diffuseColor = new BABYLON.Color3(0.1, 0.45, 1);
  arrowMat.emissiveColor = new BABYLON.Color3(0.1, 0.45, 1);

  const body = BABYLON.MeshBuilder.CreateBox(
    "gpsArrowBody",
    { width: 0.45, height: 0.18, depth: 1.8 },
    scene
  );
  body.position.z = -0.5;
  body.material = arrowMat;
  body.parent = gpsArrow;

  const leftTip = BABYLON.MeshBuilder.CreateBox(
    "gpsArrowLeftTip",
    { width: 0.3, height: 0.25, depth: 1 },
    scene
  );
  leftTip.position = new BABYLON.Vector3(-0.45, 0, -1.35);
  leftTip.rotation.y = -0.7;
  leftTip.material = arrowMat;
  leftTip.parent = gpsArrow;

  const rightTip = BABYLON.MeshBuilder.CreateBox(
    "gpsArrowRightTip",
    { width: 0.3, height: 0.25, depth: 1 },
    scene
  );
  rightTip.position = new BABYLON.Vector3(0.45, 0, -1.35);
  rightTip.rotation.y = 0.7;
  rightTip.material = arrowMat;
  rightTip.parent = gpsArrow;

  gpsArrow.setEnabled(false);
}
// =========================
// TARJETA DE MISIÓN ACTIVA
// =========================

const missionCard = document.createElement("div");

missionCard.style.position = "fixed";
missionCard.style.left = "12px";
missionCard.style.top = "78px";
missionCard.style.width = "260px";
missionCard.style.boxSizing = "border-box";
missionCard.style.background = "rgba(15,15,18,0.92)";
missionCard.style.color = "white";
missionCard.style.borderRadius = "13px";
missionCard.style.padding = "10px";
missionCard.style.zIndex = "650";
missionCard.style.fontFamily = "Arial";
missionCard.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";
missionCard.style.display = "none";

document.body.appendChild(missionCard);

function showRaceMissionCard() {
  missionCard.style.display = "block";

  missionCard.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
      <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#8b35ff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      ">⚑</div>

      <div style="font-size:16px; font-weight:bold;">
        MISIÓN ACTIVA
      </div>
    </div>

    <div style="
      color:#b86cff;
      font-weight:bold;
      font-size:14px;
      margin-bottom:8px;
    ">
      ${activeRaceConfig.name}
    </div>

    <div style="
      font-size:13px;
      line-height:1.3;
      margin-bottom:8px;
    ">
      Ve al punto ubicado en el mapa para iniciar la carrera.
    </div>

    <div style="
      font-size:12px;
      color:#d8d8d8;
      margin-bottom:10px;
    ">
      Para salir de la misión presiona 3.
    </div>

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:10px;
      font-size:14px;
      font-weight:bold;
    ">
      <span>Pago:</span>
      <strong style="color:#ffd23c; font-size:19px;">🟡 ${activeRaceConfig.reward}</strong>
    </div>

    <button id="viewRaceMapBtn" style="
      width:100%;
      padding:7px;
      border:0;
      border-radius:8px;
      background:#2faa3f;
      color:white;
      font-weight:bold;
      font-size:14px;
      cursor:pointer;
    ">
      VER EN MAPA
    </button>
  `;

  setTimeout(() => {
    const btn = document.getElementById("viewRaceMapBtn");

    if (!btn) return;

    btn.onclick = () => {
      if (!minimapExpanded) {
        minimapExpanded = true;

        minimap.width = 520;
        minimap.height = 520;

        minimap.style.width = "520px";
        minimap.style.height = "520px";
        minimap.style.left = "50%";
        minimap.style.bottom = "50%";
        minimap.style.transform = "translate(-50%, 50%)";
        minimap.style.zIndex = "999";

        const startPoint = lonLatToWorld(
  activeRaceConfig.start.lon,
  activeRaceConfig.start.lat
);

        const reference = inCar ? car.position : player.position;

        mapOffsetX = startPoint.x - reference.x;
        mapOffsetZ = startPoint.z - reference.z;
        mapZoom = 0.45;

        btn.textContent = "OCULTAR MAPA";
      } else {
        minimapExpanded = false;

        minimap.width = 180;
        minimap.height = 180;

        minimap.style.width = "180px";
        minimap.style.height = "180px";
        minimap.style.left = "12px";
        minimap.style.bottom = "12px";
        minimap.style.transform = "none";
        minimap.style.zIndex = "100";

        btn.textContent = "VER EN MAPA";
      }
    };
  }, 50);
}
function showRouteMissionCard() {

  if (!currentRouteMission) return;

  missionCard.style.display = "block";

  missionCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">

        <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#8b35ff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
        ">
        📍
        </div>

        <div style="
        font-size:16px;
        font-weight:bold;
        ">
        MISIÓN ACTIVA
        </div>

      </div>

      <div style="
      color:#b86cff;
      font-weight:bold;
      margin-bottom:10px;
      ">
      ${currentRouteMission.name}
      </div>

      <div style="
      margin-bottom:10px;
      font-size:13px;
      ">
      Sigue todos los puntos marcados del recorrido.
      </div>

      <div style="
      margin-bottom:10px;
      font-size:12px;
      color:#ccc;
      ">
      Para cancelar presiona 3.
      </div>

      <div style="
      display:flex;
      justify-content:space-between;
      font-weight:bold;
      margin-bottom:10px;
      ">
        <span>Pago</span>

        <span style="
        color:#ffd23c;
        font-size:18px;
        ">
        🟡 ${currentRouteMission.reward}
        </span>

      </div>

      <button
      id="viewRouteMapBtn"
      style="
      width:100%;
      padding:8px;
      background:#2faa3f;
      color:white;
      border:0;
      border-radius:8px;
      cursor:pointer;
      ">
      VER EN MAPA
      </button>
  `;
setTimeout(() => {

    const btn = document.getElementById(
        "viewRouteMapBtn"
    ) as HTMLButtonElement;

    if (!btn) return;

    btn.onclick = () => {

        if (!minimapExpanded) {

            minimapExpanded = true;

            minimap.width = 520;
            minimap.height = 520;

            minimap.style.width = "520px";
            minimap.style.height = "520px";
            minimap.style.left = "50%";
            minimap.style.bottom = "50%";
            minimap.style.transform =
                "translate(-50%,50%)";

            minimap.style.zIndex = "999";

            const point =
                lonLatToWorld(

                    currentRouteMission!.points[0][1],

                    currentRouteMission!.points[0][0]

                );

            const reference =
                inCar ? car.position : player.position;

            mapOffsetX =
                point.x - reference.x;

            mapOffsetZ =
                point.z - reference.z;

            mapZoom = 0.45;

            btn.innerText = "OCULTAR MAPA";

        } else {

            minimapExpanded = false;

            minimap.width = 180;
            minimap.height = 180;

            minimap.style.width = "180px";
            minimap.style.height = "180px";
            minimap.style.left = "12px";
            minimap.style.bottom = "12px";
            minimap.style.transform = "none";

            btn.innerText = "VER EN MAPA";

        }

    };

},50);
}
function showRealEstateVisitCard() {
  missionCard.style.display = "block";

  missionCard.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      margin-bottom:10px;
    ">
      <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#d9b85f;
        color:#10151b;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      ">
        🏘️
      </div>

      <div style="
        font-size:16px;
        font-weight:bold;
      ">
        VISITANDO PROYECTO INMOBILIARIO
      </div>
    </div>

    <div style="
      color:#e5c873;
      font-weight:bold;
      font-size:14px;
      margin-bottom:9px;
    ">
      Residencial El Olivar
    </div>

    <div style="
      font-size:13px;
      line-height:1.4;
      margin-bottom:11px;
      color:#f2f2f2;
    ">
      Estás visitando el proyecto inmobiliario demo El Olivar.
      Recorre sus calles, viviendas y áreas recreativas.
    </div>

    <div style="
      padding:9px 10px;
      background:rgba(217,184,95,0.14);
      border:1px solid rgba(229,200,115,0.42);
      border-radius:8px;
      font-size:12px;
      line-height:1.35;
      color:#f2dfaa;
    ">
      Presiona <strong style="color:white;">3</strong>
      para volver a Lima.
    </div>
  `;
}
function hideMissionCard() {
  missionCard.style.display = "none";
}
function createRaceBot(
  start: BABYLON.Vector3,
  color: BABYLON.Color3,
  laneOffset: number
) {
  const botCar = BABYLON.MeshBuilder.CreateBox(
    "raceBotCar",
    { width: 2.05, height: 0.85, depth: 3.45 },
    scene
  );

  botCar.position = start.clone();
  botCar.position.x += laneOffset;
  botCar.position.y = 0.22;
  botCar.isVisible = false;

  const bodyMat = mat("raceBotBodyMat", color);
  const darkMat = mat("raceBotDarkMat", new BABYLON.Color3(0.02, 0.02, 0.025));
  const glassMat = mat("raceBotGlassMat", new BABYLON.Color3(0.08, 0.16, 0.25));
  const tireMat = mat("raceBotTireMat", new BABYLON.Color3(0.01, 0.01, 0.01));

  const root = new BABYLON.TransformNode("raceBotRoot", scene);
  root.parent = botCar;
  root.scaling = new BABYLON.Vector3(0.65, 0.65, 0.65);

  const base = BABYLON.MeshBuilder.CreateBox("raceBotBase", { width: 3.1, height: 0.75, depth: 5.2 }, scene);
  base.position.y = 0.45;
  base.material = bodyMat;
  base.parent = root;

  const hood = BABYLON.MeshBuilder.CreateBox("raceBotHood", { width: 2.8, height: 0.35, depth: 1.5 }, scene);
  hood.position = new BABYLON.Vector3(0, 0.85, 1.35);
  hood.material = bodyMat;
  hood.parent = root;

  const cabin = BABYLON.MeshBuilder.CreateBox("raceBotCabin", { width: 2.35, height: 0.9, depth: 2.05 }, scene);
  cabin.position = new BABYLON.Vector3(0, 1.15, -0.35);
  cabin.material = glassMat;
  cabin.parent = root;

  const roof = BABYLON.MeshBuilder.CreateBox("raceBotRoof", { width: 2.15, height: 0.18, depth: 1.65 }, scene);
  roof.position = new BABYLON.Vector3(0, 1.68, -0.35);
  roof.material = darkMat;
  roof.parent = root;

  const spoiler = BABYLON.MeshBuilder.CreateBox("raceBotSpoiler", { width: 2.6, height: 0.12, depth: 0.45 }, scene);
  spoiler.position = new BABYLON.Vector3(0, 1.15, -2.45);
  spoiler.material = darkMat;
  spoiler.parent = root;

  for (const x of [-1.62, 1.62]) {
    for (const z of [-1.65, 1.55]) {
      const wheel = BABYLON.MeshBuilder.CreateCylinder(
        "raceBotWheel",
        { diameter: 0.78, height: 0.38, tessellation: 16 },
        scene
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position = new BABYLON.Vector3(x, 0.35, z);
      wheel.material = tireMat;
      wheel.parent = root;
    }
  }

  const finish = lonLatToWorld(
  activeRaceConfig.finish.lon,
  activeRaceConfig.finish.lat
);

  calculateGpsRoute(start, finish);

  const botRoute = gpsRoute.length > 1
    ? gpsRoute.map((p) => p.clone())
    : [start.clone(), finish.clone()];

  raceBots.push({
  car: botCar,
  route: botRoute,
  routeIndex: 1,
  currentSpeed: 0,
  currentGear: 1,
  finished: false,
  color: color.toHexString(),
  aggression: 0.92 + Math.random() * 0.16,
  brakeTimer: 0,
  lap: 1,
target: "finish",
});
}
async function startRace(config: RaceConfig) {
  await loadGpsGraph();

  activeRaceConfig = config;

  raceMissionActive = true;
  showRaceMissionCard();

  raceGoingToStart = true;
  raceStarted = false;
  raceCountdownDone = false;
  raceLap = 1;
  raceTarget = "finish";

  if (raceStartLine) raceStartLine.dispose();
  if (raceFinishLine) raceFinishLine.dispose();

  raceStartLine = createRaceLine(
    config.start.lon,
    config.start.lat,
    new BABYLON.Color3(0, 1, 0)
  );

  raceFinishLine = createRaceLine(
    config.finish.lon,
    config.finish.lat,
    new BABYLON.Color3(1, 0, 0)
  );

  raceFinishLine.setEnabled(false);

  clearRaceBots();

  const startPos = lonLatToWorld(config.start.lon, config.start.lat);
  const finishPos = lonLatToWorld(config.finish.lon, config.finish.lat);

  const forwardDir = finishPos.subtract(startPos);
  forwardDir.y = 0;
  forwardDir.normalize();

  const sideDir = new BABYLON.Vector3(
    -forwardDir.z,
    0,
    forwardDir.x
  );

  const gridCenter = getNearestGpsRoadPoint(startPos);

  createRaceBot(gridCenter.add(forwardDir.scale(8)).add(sideDir.scale(3)), new BABYLON.Color3(1, 0, 0), 0);
  createRaceBot(gridCenter.add(forwardDir.scale(8)).add(sideDir.scale(8)), new BABYLON.Color3(0, 0.4, 1), 0);
  createRaceBot(gridCenter.add(forwardDir.scale(1)).add(sideDir.scale(3)), new BABYLON.Color3(0, 1, 0), 0);
  createRaceBot(gridCenter.add(forwardDir.scale(1)).add(sideDir.scale(8)), new BABYLON.Color3(1, 1, 0), 0);

  for (const bot of raceBots) {
    bot.car.position.copyFrom(getNearestGpsRoadPoint(bot.car.position));
    bot.car.rotation.y = Math.atan2(forwardDir.x, forwardDir.z);
    bot.lap = 1;
    bot.target = "finish";
    bot.finished = false;
  }

  setGpsDestination(config.start.lon, config.start.lat);

  showMissionMessage(`Dirígete al punto de salida de ${config.name}`);
}
async function startRaceCountdown() {
  if (countdownActive) return;
  if (!raceMissionActive && !multiplayerRaceActive) return;
  if (!raceGoingToStart) return;

  const myToken = ++raceCountdownToken;
  countdownActive = true;

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  if (gpsArrow) {
    gpsArrow.setEnabled(false);
  }

  carVelocity = 0;
  raceCountdownDone = false;
  keys["w"] = false;
  keys["s"] = false;
  keys[" "] = false;

  raceText.style.display = "block";
  raceText.style.fontSize = "120px";

  raceText.innerText = "3";
  await new Promise((r) => setTimeout(r, 1000));
  if (myToken !== raceCountdownToken) {
    countdownActive = false;
    raceText.style.display = "none";
    return;
  }

  raceText.innerText = "2";
  await new Promise((r) => setTimeout(r, 1000));
  if (myToken !== raceCountdownToken) {
    countdownActive = false;
    raceText.style.display = "none";
    return;
  }

  raceText.innerText = "1";
  await new Promise((r) => setTimeout(r, 1000));
  if (myToken !== raceCountdownToken) {
    countdownActive = false;
    raceText.style.display = "none";
    return;
  }

  raceText.innerText = "GO!";
  await new Promise((r) => setTimeout(r, 800));
  if (myToken !== raceCountdownToken) {
    countdownActive = false;
    raceText.style.display = "none";
    return;
  }

  raceText.style.display = "none";

  countdownActive = false;
  raceGoingToStart = false;
  raceStarted = true;
  raceCountdownDone = true;

  if (raceFinishLine) {
    raceFinishLine.setEnabled(true);
  }

  // GPS hacia el punto final
  raceTarget = "finish";

  setGpsDestination(
    activeRaceConfig.finish.lon,
    activeRaceConfig.finish.lat
  );
}
function clearCurrentMap() {

  // Borra todos los meshes excepto el suelo base
  for (const mesh of [...scene.meshes]) {

    if (mesh.name !== "base") {
      mesh.dispose();
    }

  }

  // Borra transform nodes:
  // avatarRoot, miniCooper, gpsArrow, bots, etc.
  for (const node of [...scene.transformNodes]) {
    node.dispose();
  }

  // Limpia arrays
  activeMapMeshes.length = 0;
  roadSegments.length = 0;
  sidewalkPaths.length = 0;

  // Limpiar el grafo GPS perteneciente
// a la ciudad anterior.
gpsRoadSegments.length = 0;
gpsGraphLoaded = false;
gpsLoadedMapName = "";

gpsRoute = [];
gpsDestination = null;
gpsNavigationActive = false;
gpsCurrentIndex = 0;
gpsTargetLon = null;
gpsTargetLat = null;

  chunks.clear();

  mapMeshes.length = 0;
  cullableMeshes.length = 0;

  bots.length = 0;

  gasStationTriggers.length = 0;
gasStationAura = null;

// Eliminar todas las luces de gasolineras
for (const gasLight of gasStationLights) {
  if (!gasLight.isDisposed()) {
    gasLight.dispose();
  }
}

gasStationLights.length = 0;

niuFuelWindowOpen = false;
niuFuelCooldown = false;
gasAuraWasTouched = false;

  salesBoothAura =
  undefined as any;

pickupAura =
  undefined as any;

deliveryAura =
  undefined as any;

gpsArrow =
  undefined as any;

// Reiniciar ventana del proyecto inmobiliario.
realEstateEntryWindowOpen = false;
realEstateEntryCooldown = false;
salesBoothAuraWasTouched = false;

// Eliminar luces de todas las terminales Niu Travel
for (const travelLight of niuTravelLights) {
  if (!travelLight.isDisposed()) {
    travelLight.dispose();
  }
}

niuTravelLights.length = 0;

niuTravelAura = undefined as any;
niuTravelWindowOpen = false;
niuTravelCooldown = false;
niuTravelInProgress = false;

// Cerrar cualquier ventana abierta
socialWindow.style.display = "none";
socialWindow.innerHTML = "";

  missionStage = "inactive";

  inCar = false;
  carVelocity = 0;
    // Eliminar luces anteriores de Niu Market
  for (const marketLight of niuMarketLights) {
    if (!marketLight.isDisposed()) {
      marketLight.dispose();
    }
  }

  niuMarketLights.length = 0;

  niuMarketAura = null;
  niuMarketWindowOpen = false;
  niuMarketCooldown = false;
  niuStoreLightEntries.length = 0;

  // Limpiar misión Entrega Medicina
medicineDeliveryMissionActive = false;
medicineDeliveryStage = "inactive";
medicineDeliveryCount = 0;

medicineHospitalAuraTouched = false;
medicineHouseAuraTouched = false;

manhattanHospitalRoot = null;
manhattanHospitalEntranceAura = null;

manhattanMedicineHouse1Root = null;
manhattanMedicineHouse1Aura = null;

hideMedicineMissionPanel();
}
function createCentrixBillboardAtLonLat(lon: number, lat: number) {
  const pos = lonLatToWorld(lon, lat);

  // Ajusta esta rotación si quieres girarlo un poco más
  // Esta está orientada para mirar hacia Calle Francisco de Miranda
  const billboardRotation = 1.55;

  const billboardWidth = 8;
  const billboardHeight = 2.7;
  const poleHeight = 5.5;

  const poleMat = mat("centrixPoleMat", new BABYLON.Color3(0.45, 0.45, 0.45));

  const dirX = Math.cos(billboardRotation);
  const dirZ = -Math.sin(billboardRotation);

  const halfWidth = billboardWidth / 2;

  const leftX = pos.x - dirX * halfWidth;
  const leftZ = pos.z - dirZ * halfWidth;

  const rightX = pos.x + dirX * halfWidth;
  const rightZ = pos.z + dirZ * halfWidth;

  const leftPole = BABYLON.MeshBuilder.CreateCylinder(
    "centrixLeftPole",
    { height: poleHeight, diameter: 0.18 },
    scene
  );
  leftPole.position = new BABYLON.Vector3(leftX, poleHeight / 2, leftZ);
  leftPole.material = poleMat;

  const rightPole = BABYLON.MeshBuilder.CreateCylinder(
    "centrixRightPole",
    { height: poleHeight, diameter: 0.18 },
    scene
  );
  rightPole.position = new BABYLON.Vector3(rightX, poleHeight / 2, rightZ);
  rightPole.material = poleMat;

  const texture = new BABYLON.DynamicTexture(
    "centrixBillboardTexture",
    { width: 1536, height: 512 },
    scene,
    true
  );

  const ctx = texture.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1536, 512);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 1512, 488);

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = "bold 150px Arial";
  ctx.fillText("CENTRIX 28", 768, 115);

  ctx.font = "bold 78px Arial";
  ctx.fillText("Proyecto inmobiliario", 768, 245);

  ctx.font = "bold 95px Arial";
  ctx.textAlign = "left";

  const startX = 435;
  const y = 385;

  ctx.fillStyle = "#D00000";
  ctx.fillText("E", startX, y);

  ctx.fillStyle = "#777777";
  ctx.fillText("E", startX + 62, y);

  ctx.fillStyle = "black";
  ctx.fillText(" Inmobiliaria", startX + 124, y);

  texture.update();

  const signMat = new BABYLON.StandardMaterial("centrixBillboardMat", scene);
  signMat.diffuseTexture = texture;
  signMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    "centrixBillboard",
    { width: billboardWidth, height: billboardHeight },
    scene
  );

  sign.position = new BABYLON.Vector3(pos.x, 4.8, pos.z);
  sign.rotation.y = billboardRotation;
  sign.material = signMat;

  registerChunkMesh(leftPole);
  registerChunkMesh(rightPole);
  registerChunkMesh(sign);

  registerCullable(leftPole);
  registerCullable(rightPole);
  registerCullable(sign);

  return sign;
}
async function loadCarModel(fileName: string, position: BABYLON.Vector3) {
  car = BABYLON.MeshBuilder.CreateBox(
    "carCollider",
    { width: 2.8, height: 1.4, depth: 4.4 },
    scene
  );

  car.position = position.clone();
  car.position.y = 0.18;
  car.isVisible = false;

  const modelUrl = `/models/${fileName}`;

  try {
    const test = await fetch(modelUrl);
    console.log("Probando modelo:", modelUrl, test.status, test.statusText);

    if (!test.ok) {
      throw new Error(`No se encontró el archivo: ${modelUrl}`);
    }

    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      null,
      "/models/",
      fileName,
      scene
    );

    let totalVertices = 0;

for (const mesh of result.meshes) {
  if (mesh instanceof BABYLON.Mesh) {
    totalVertices += mesh.getTotalVertices();
  }
}

console.log("Vértices del auto:", totalVertices);
console.log("Meshes del auto:", result.meshes.length);

    console.log("Auto importado:", result.meshes.length, result.meshes);

    const carRoot = new BABYLON.TransformNode("importedCarRoot", scene);
    carRoot.parent = car;

    for (const mesh of result.meshes) {

  if (mesh instanceof BABYLON.Mesh) {

    mesh.parent = carRoot;

    mesh.setEnabled(true);
    mesh.isVisible = true;

    // Optimización
    mesh.alwaysSelectAsActiveMesh = false;
    mesh.doNotSyncBoundingInfo = false;
    mesh.isPickable = false;

    // Muy importante
    mesh.receiveShadows = false;
    mesh.freezeNormals();

  }
}

    carRoot.position = new BABYLON.Vector3(0, 0.05, 0);
    carRoot.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
    console.log("Meshes del auto:", result.meshes.length);
    carRoot.rotation.y = 0;

    console.log("Auto GLB cargado correctamente");
  } catch (error) {
    console.error("ERROR REAL cargando GLB:", error);

    const fallback = BABYLON.MeshBuilder.CreateBox(
      "fallbackCar",
      { width: 2.8, height: 1, depth: 4.4 },
      scene
    );

    fallback.position.y = 0.5;
    fallback.parent = car;

    const fallbackMat = mat("fallbackCarMat", new BABYLON.Color3(1, 0, 0));
    fallback.material = fallbackMat;
  }
}
async function loadTreeModel(
  name: string,
  lon: number,
  lat: number,
  scale: number = 1
) {
  const pos = lonLatToWorld(lon, lat);

  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    null,
    "/models/",
    "niu_three_trees_line.glb",
    scene
  );

  const treeRoot = new BABYLON.TransformNode(name, scene);
  treeRoot.position = new BABYLON.Vector3(pos.x, 0, pos.z);
  treeRoot.scaling = new BABYLON.Vector3(scale, scale, scale);

  for (const mesh of result.meshes) {
    if (mesh instanceof BABYLON.Mesh) {
      mesh.parent = treeRoot;
      mesh.isPickable = false;
      mesh.alwaysSelectAsActiveMesh = false;
      mesh.freezeNormals();
    }
  }

  // Importante: registrar el root, no los meshes internos
  registerCullable(treeRoot as any);
  registerChunkMesh(treeRoot as any);

  return treeRoot;
}
type MapZone = {
  name: string;
  file: string;
  center: BABYLON.Vector3;
  loadDistance: number;
  loaded: boolean;
  loading: boolean;
};

const mapZones: MapZone[] = [
  {
    name: "kennedy",
    file: "miraflores-zona-kennedy.geojson",
    center: lonLatToWorld(-77.0301, -12.1219),
    loadDistance: 450,
    loaded: false,
    loading: false,
  },
  {
    name: "este",
    file: "miraflores-zona-este.geojson",
    center: lonLatToWorld(-77.0205, -12.1219),
    loadDistance: 900,
    loaded: false,
    loading: false,
  },
  {
    name: "sur",
    file: "miraflores-zona-sur.geojson",
    center: lonLatToWorld(-77.0301, -12.1320),
    loadDistance: 900,
    loaded: false,
    loading: false,
  },
];

async function updateMapStreaming() {
  if (!player || !car) return;

  const reference = inCar ? car.position : player.position;

  for (const zone of mapZones) {
    if (zone.loaded || zone.loading) continue;

    const dist = BABYLON.Vector3.Distance(reference, zone.center);

    if (dist < zone.loadDistance) {
      zone.loading = true;
      console.log("Cargando zona:", zone.name);

      await loadMap(zone.file);

      zone.loaded = true;
      zone.loading = false;

      console.log("Zona cargada:", zone.name);
    }
  }
}
function clearOnlyMapMeshes() {
  for (const mesh of [...activeMapMeshes]) {
    mesh.dispose();
  }

  activeMapMeshes.length = 0;
  roadSegments.length = 0;
  sidewalkPaths.length = 0;
  clearPedestrianBots();

  gpsRoadSegments.length = 0;
gpsGraphLoaded = false;
gpsLoadedMapName = "";

  chunks.clear();
  mapMeshes.length = 0;
  cullableMeshes.length = 0;
  gasStationTriggers.length = 0;
gasStationAura = null;

// Eliminar las luces de las gasolineras
// pertenecientes a la zona anterior.
for (const gasLight of gasStationLights) {
  if (!gasLight.isDisposed()) {
    gasLight.dispose();
  }
}

gasStationLights.length = 0;

niuFuelWindowOpen = false;
niuFuelCooldown = false;
gasAuraWasTouched = false;
// Eliminar luces de las terminales Niu Travel
for (const travelLight of niuTravelLights) {
  if (!travelLight.isDisposed()) {
    travelLight.dispose();
  }
}

niuTravelLights.length = 0;

niuTravelAura = undefined as any;
niuTravelWindowOpen = false;
niuTravelCooldown = false;
  // Eliminar luces anteriores de Niu Market
  for (const marketLight of niuMarketLights) {
    if (!marketLight.isDisposed()) {
      marketLight.dispose();
    }
  }

  niuMarketLights.length = 0;

  niuMarketAura = null;
  niuMarketWindowOpen = false;
  niuMarketCooldown = false;
  niuStoreLightEntries.length = 0;

  medicineDeliveryMissionActive = false;
medicineDeliveryStage = "inactive";

medicineHospitalAuraTouched = false;
medicineHouseAuraTouched = false;

manhattanHospitalRoot = null;
manhattanHospitalEntranceAura = null;

manhattanMedicineHouse1Root = null;
manhattanMedicineHouse1Aura = null;

hideMedicineMissionPanel();
}
let currentZone = "kennedy";
let changingZone = false;

// Evita cambios de zona instantáneos o falsos
let pendingZone: string | null = null;
let pendingZoneSince = 0;
let lastZoneChangeTime = 0;

const ZONE_CONFIRMATION_TIME = 1500;
const ZONE_CHANGE_COOLDOWN = 4000;
const loadedZones = new Set<string>(["kennedy"]);
const preloadingZones = new Set<string>();

async function preloadZone(zoneName: string) {
  if (loadedZones.has(zoneName)) return;
  if (preloadingZones.has(zoneName)) return;

  const fileName = zoneFiles[zoneName];
  if (!fileName) return;

  preloadingZones.add(zoneName);

  console.log("Precargando zona sin borrar mapa:", zoneName);

  await loadMap(fileName);

  loadedZones.add(zoneName);
  preloadingZones.delete(zoneName);

  updateChunks();
  updateMapVisibility();
  updateCulling();

  console.log("Zona precargada:", zoneName);
}

async function switchMapZone(
  fileName: string,
  zoneName: string
) {
  if (!player || !car || changingZone) {
    return;
  }

  changingZone = true;

  const savedPlayerPos =
    player.position.clone();

  const savedCarPos =
    car.position.clone();

  const savedCarRot =
    car.rotation.clone();

  const savedCameraTarget =
    (camera.target as BABYLON.Vector3).clone();

  // Cubrir solamente el instante en el que
  // se elimina y reconstruye el mapa.
  showTravelLoading("Cargando zona...");

  // Permitir que el navegador dibuje primero
  // la pantalla antes de borrar el escenario.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  try {
    clearOnlyMapMeshes();

    salesBoothAura = undefined as any;
    gasStationAura = undefined as any;
    centrixAura = undefined as any;
    centrixWebOpened = false;

    await loadMap(fileName);
    await loadGpsGraph();

    spawnBotsForZone(zoneName);

    if (zoneName === "kennedy") {
      createKennedyCustomObjects();
    }

    if (zoneName === "este") {
      createEsteCustomObjects();
    }

    if (zoneName === "sur") {
      createSurCustomObjects();
    }

    if (zoneName === "oeste") {
      createOesteCustomObjects();
    }

    player.position.copyFrom(
      savedPlayerPos
    );

    car.position.copyFrom(
      savedCarPos
    );

    car.rotation.copyFrom(
      savedCarRot
    );

    camera.target.copyFrom(
      savedCameraTarget
    );

    currentZone = zoneName;

    updateChunks();
    updateMapVisibility();
    updateCulling();

    refreshGpsAfterZoneChange();

    console.log(
      "Zona actual cargada:",
      currentZone
    );
  } catch (error) {
    console.error(
      "Error cambiando de zona:",
      error
    );
  } finally {
    changingZone = false;

    // Esperar hasta que Babylon haya dibujado
    // al menos un frame del nuevo mapa.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    hideTravelLoading();
  }
}

const zoneFiles: Record<string, string> = {
  kennedy: "miraflores-zona-kennedy.geojson",
  oeste: "miraflores-zona-oeste.geojson",
  sur: "miraflores-zona-sur.geojson",
  este: "miraflores-zona-este.geojson",

  manhattan: "manhattan.geojson",
  beverlyHills: "beverly-hills.geojson",
};

function getWorldBounds(
  south: number,
  west: number,
  north: number,
  east: number
) {
  const sw = lonLatToWorld(west, south);
  const ne = lonLatToWorld(east, north);

  return {
    minX: Math.min(sw.x, ne.x),
    maxX: Math.max(sw.x, ne.x),
    minZ: Math.min(sw.z, ne.z),
    maxZ: Math.max(sw.z, ne.z),
  };
}

type LatLonPoint = {
  lat: number;
  lon: number;
};

const zonePolygons: Record<string, LatLonPoint[]> = {
  kennedy: [
    { lat: -12.118562409612899, lon: -77.02532506357323 },
    { lat: -12.11896159271892, lon: -77.03599142679158 },
    { lat: -12.125947200388483, lon: -77.03594039156087 },
    { lat: -12.126745543901162, lon: -77.02435539418974 },
  ],

  oeste: [
    { lat: -12.118562409389941, lon: -77.02512092239023 },
    { lat: -12.102544694755423, lon: -77.0265499088501 },
    { lat: -12.1079339396414, lon: -77.0557420610763 },
    { lat: -12.11776404139026, lon: -77.05594620199913 },
  ],

  sur: [
    { lat: -12.11896159271892, lon: -77.03599142679158 },
    { lat: -12.125947200388483, lon: -77.03594039156087 },
    { lat: -12.126745543901162, lon: -77.02435539418974 },
    { lat: -12.134479372924218, lon: -77.02226294973063 },
    { lat: -12.140915743408641, lon: -77.03134722078298 },
    { lat: -12.118163225945558, lon: -77.05252684152754 },
  ],

  este: [
    { lat: -12.114969734824298, lon: -77.01052484665337 },
    { lat: -12.130737225655416, lon: -77.0010322935873 },
    { lat: -12.133980423031248, lon: -77.02001739941136 },
    { lat: -12.118362817882456, lon: -77.02552920432801 },
  ],
};

function worldToLonLat(pos: BABYLON.Vector3) {
  const metersPerDegreeLat = 110540;
  const metersPerDegreeLon =
    111320 * Math.cos((centerLat * Math.PI) / 180);

  const lon = pos.x / metersPerDegreeLon + centerLon;
  const lat = pos.z / metersPerDegreeLat + centerLat;

  return { lon, lat };
}

function pointInPolygon(point: LatLonPoint, polygon: LatLonPoint[]) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lon <
        ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

function detectZoneFromPosition(pos: BABYLON.Vector3) {
  const point = worldToLonLat(pos);

  if (pointInPolygon(point, zonePolygons.kennedy)) return "kennedy";
  if (pointInPolygon(point, zonePolygons.sur)) return "sur";
  if (pointInPolygon(point, zonePolygons.oeste)) return "oeste";
  if (pointInPolygon(point, zonePolygons.este)) return "este";

  return currentZone;
}
async function checkZoneTransition() {
  if (!car || changingZone) return;

  // En otras ciudades no se utiliza el sistema
  // de zonas internas de Miraflores.
  if (currentMapName !== "miraflores") {
    pendingZone = null;
    return;
  }

  const detectedZone = detectZoneFromPosition(
    car.position
  );

  // Seguimos dentro de la zona actual
  if (
    !detectedZone ||
    detectedZone === currentZone
  ) {
    pendingZone = null;
    pendingZoneSince = 0;
    return;
  }

  const now = performance.now();

  // Evita volver a cambiar inmediatamente
  // después de terminar una transición.
  if (
    now - lastZoneChangeTime <
    ZONE_CHANGE_COOLDOWN
  ) {
    return;
  }

  // Primera detección de la nueva zona.
  // Todavía no cambiamos el mapa.
  if (pendingZone !== detectedZone) {
    pendingZone = detectedZone;
    pendingZoneSince = now;
    return;
  }

  // El auto debe permanecer realmente dentro
  // de la nueva zona durante cierto tiempo.
  if (
    now - pendingZoneSince <
    ZONE_CONFIRMATION_TIME
  ) {
    return;
  }

  const fileName = zoneFiles[detectedZone];

  if (!fileName) {
    pendingZone = null;
    pendingZoneSince = 0;
    return;
  }

  console.log(
    "Cambio confirmado:",
    currentZone,
    "=>",
    detectedZone
  );

  pendingZone = null;
  pendingZoneSince = 0;
  lastZoneChangeTime = now;

  await switchMapZone(
    fileName,
    detectedZone
  );
}
function createGasStationAtLonLat(
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);
  registerGasStationOnMap(
  lon,
  lat,
  "NIU Gasoline"
);

  // =========================
  // MATERIALES
  // =========================

  const blueMat = mat(
    "gasBlueMat",
    new BABYLON.Color3(0.06, 0.22, 0.78)
  );

  const darkBlueMat = mat(
    "gasDarkBlueMat",
    new BABYLON.Color3(0.025, 0.08, 0.28)
  );

  const whiteMat = mat(
    "gasWhiteMat",
    new BABYLON.Color3(0.95, 0.95, 0.97)
  );

  const grayMat = mat(
    "gasGrayMat",
    new BABYLON.Color3(0.45, 0.47, 0.52)
  );

  const darkMat = mat(
    "gasDarkMat",
    new BABYLON.Color3(0.08, 0.09, 0.11)
  );

  const yellowMat = mat(
    "gasYellowMat",
    new BABYLON.Color3(1, 0.72, 0.08)
  );

  const glassMat = new BABYLON.StandardMaterial(
    "gasGlassMat",
    scene
  );

  glassMat.diffuseColor = new BABYLON.Color3(
    0.12,
    0.38,
    0.62
  );

  glassMat.emissiveColor = new BABYLON.Color3(
    0.015,
    0.04,
    0.08
  );

  glassMat.alpha = 0.72;
  glassMat.backFaceCulling = false;

  // =========================
  // RAÍZ DE LA GASOLINERA
  // =========================

  const gasRoot = BABYLON.MeshBuilder.CreateBox(
  "gasStationRoot",
  {
    width: 0.1,
    height: 0.1,
    depth: 0.1,
  },
  scene
);

gasRoot.position = new BABYLON.Vector3(
  pos.x,
  0,
  pos.z
);

gasRoot.rotation.y = rotationY;

gasRoot.isVisible = false;
  gasRoot.isPickable = false;

  // =========================
  // PLATAFORMA
  // =========================

  const platform = BABYLON.MeshBuilder.CreateBox(
    "gasPlatform",
    {
      width: 18,
      height: 0.18,
      depth: 13,
    },
    scene
  );

  platform.position = new BABYLON.Vector3(
    0,
    0.09,
    0
  );

  platform.material = grayMat;
  platform.parent = gasRoot;

  // =========================
  // TECHO PRINCIPAL
  // =========================

  const canopy = BABYLON.MeshBuilder.CreateBox(
    "gasCanopy",
    {
      width: 17,
      height: 0.55,
      depth: 10,
    },
    scene
  );

  canopy.position = new BABYLON.Vector3(
    0,
    5.2,
    -0.5
  );

  canopy.material = whiteMat;
  canopy.parent = gasRoot;

  // Capa azul superior
  const canopyTop = BABYLON.MeshBuilder.CreateBox(
    "gasCanopyTop",
    {
      width: 17.2,
      height: 0.22,
      depth: 10.2,
    },
    scene
  );

  canopyTop.position = new BABYLON.Vector3(
    0,
    5.53,
    -0.5
  );

  canopyTop.material = blueMat;
  canopyTop.parent = gasRoot;

  // Borde azul frontal
  const canopyFrontBand = BABYLON.MeshBuilder.CreateBox(
    "gasCanopyFrontBand",
    {
      width: 17.2,
      height: 0.7,
      depth: 0.28,
    },
    scene
  );

  canopyFrontBand.position = new BABYLON.Vector3(
    0,
    5.05,
    -5.55
  );

  canopyFrontBand.material = blueMat;
  canopyFrontBand.parent = gasRoot;

  // Detalle amarillo
  const canopyYellowBand = BABYLON.MeshBuilder.CreateBox(
    "gasCanopyYellowBand",
    {
      width: 17.25,
      height: 0.13,
      depth: 0.3,
    },
    scene
  );

  canopyYellowBand.position = new BABYLON.Vector3(
    0,
    4.67,
    -5.58
  );

  canopyYellowBand.material = yellowMat;
  canopyYellowBand.parent = gasRoot;

  // =========================
  // COLUMNAS
  // =========================

  for (const x of [-6.2, 6.2]) {
    for (const z of [-3.4, 2.4]) {
      const pillar = BABYLON.MeshBuilder.CreateBox(
        "gasPillar",
        {
          width: 0.5,
          height: 5,
          depth: 0.5,
        },
        scene
      );

      pillar.position = new BABYLON.Vector3(
        x,
        2.5,
        z
      );

      pillar.material = whiteMat;
      pillar.parent = gasRoot;

      const pillarBase = BABYLON.MeshBuilder.CreateBox(
        "gasPillarBase",
        {
          width: 0.85,
          height: 0.3,
          depth: 0.85,
        },
        scene
      );

      pillarBase.position = new BABYLON.Vector3(
        x,
        0.15,
        z
      );

      pillarBase.material = darkBlueMat;
      pillarBase.parent = gasRoot;
    }
  }

  // =========================
  // ISLAS DE SURTIDORES
  // =========================

  for (const x of [-4.2, 0, 4.2]) {
    const island = BABYLON.MeshBuilder.CreateBox(
      "gasPumpIsland",
      {
        width: 2.4,
        height: 0.22,
        depth: 4.2,
      },
      scene
    );

    island.position = new BABYLON.Vector3(
      x,
      0.2,
      -0.6
    );

    island.material = whiteMat;
    island.parent = gasRoot;

    const islandBand = BABYLON.MeshBuilder.CreateBox(
      "gasPumpIslandBand",
      {
        width: 2.45,
        height: 0.1,
        depth: 4.25,
      },
      scene
    );

    islandBand.position = new BABYLON.Vector3(
      x,
      0.35,
      -0.6
    );

    islandBand.material = blueMat;
    islandBand.parent = gasRoot;

    // =========================
    // SURTIDOR
    // =========================

    const pumpBody = BABYLON.MeshBuilder.CreateBox(
      "fuelPump",
      {
        width: 1.25,
        height: 2.45,
        depth: 0.95,
      },
      scene
    );

    pumpBody.position = new BABYLON.Vector3(
      x,
      1.55,
      -0.6
    );

    pumpBody.material = whiteMat;
    pumpBody.parent = gasRoot;

    const pumpTop = BABYLON.MeshBuilder.CreateBox(
      "fuelPumpTop",
      {
        width: 1.35,
        height: 0.35,
        depth: 1.05,
      },
      scene
    );

    pumpTop.position = new BABYLON.Vector3(
      x,
      2.95,
      -0.6
    );

    pumpTop.material = blueMat;
    pumpTop.parent = gasRoot;

    const screen = BABYLON.MeshBuilder.CreateBox(
      "fuelPumpScreen",
      {
        width: 0.72,
        height: 0.48,
        depth: 0.08,
      },
      scene
    );

    screen.position = new BABYLON.Vector3(
      x,
      2,
      -1.11
    );

    screen.material = darkMat;
    screen.parent = gasRoot;

    const lowerPanel = BABYLON.MeshBuilder.CreateBox(
      "fuelPumpLowerPanel",
      {
        width: 0.78,
        height: 0.72,
        depth: 0.08,
      },
      scene
    );

    lowerPanel.position = new BABYLON.Vector3(
      x,
      1.15,
      -1.11
    );

    lowerPanel.material = darkBlueMat;
    lowerPanel.parent = gasRoot;

    // Manguera simple a cada lado
    for (const side of [-1, 1]) {
      const hose = BABYLON.MeshBuilder.CreateCylinder(
        "fuelHose",
        {
          height: 1.45,
          diameter: 0.09,
          tessellation: 12,
        },
        scene
      );

      hose.position = new BABYLON.Vector3(
        x + side * 0.72,
        1.55,
        -0.62
      );

      hose.rotation.z = 0.16 * side;
      hose.material = darkMat;
      hose.parent = gasRoot;

      const nozzle = BABYLON.MeshBuilder.CreateBox(
        "fuelNozzle",
        {
          width: 0.16,
          height: 0.5,
          depth: 0.14,
        },
        scene
      );

      nozzle.position = new BABYLON.Vector3(
        x + side * 0.82,
        2.1,
        -0.62
      );

      nozzle.material = darkMat;
      nozzle.parent = gasRoot;
    }
  }

  // =========================
  // TIENDA TRASERA
  // =========================

  const shop = BABYLON.MeshBuilder.CreateBox(
    "gasShop",
    {
      width: 11,
      height: 4.4,
      depth: 4.5,
    },
    scene
  );

  shop.position = new BABYLON.Vector3(
    0,
    2.2,
    5.2
  );

  shop.material = whiteMat;
  shop.parent = gasRoot;

  // Fachada oscura
  const shopFront = BABYLON.MeshBuilder.CreateBox(
    "gasShopFront",
    {
      width: 11.2,
      height: 4.1,
      depth: 0.22,
    },
    scene
  );

  shopFront.position = new BABYLON.Vector3(
    0,
    2.15,
    2.9
  );

  shopFront.material = darkBlueMat;
  shopFront.parent = gasRoot;

  // Franja azul
  const shopBlueBand = BABYLON.MeshBuilder.CreateBox(
    "gasShopBlueBand",
    {
      width: 11.3,
      height: 0.55,
      depth: 0.25,
    },
    scene
  );

  shopBlueBand.position = new BABYLON.Vector3(
    0,
    3.85,
    2.75
  );

  shopBlueBand.material = blueMat;
  shopBlueBand.parent = gasRoot;

  // Puerta doble
  for (const x of [-0.7, 0.7]) {
    const door = BABYLON.MeshBuilder.CreateBox(
      "gasShopDoor",
      {
        width: 1.25,
        height: 2.8,
        depth: 0.16,
      },
      scene
    );

    door.position = new BABYLON.Vector3(
      x,
      1.45,
      2.72
    );

    door.material = glassMat;
    door.parent = gasRoot;
  }

  // Vitrinas
  for (const x of [-3.5, 3.5]) {
    const windowBox = BABYLON.MeshBuilder.CreateBox(
      "gasShopWindow",
      {
        width: 2.5,
        height: 2.25,
        depth: 0.16,
      },
      scene
    );

    windowBox.position = new BABYLON.Vector3(
      x,
      1.75,
      2.72
    );

    windowBox.material = glassMat;
    windowBox.parent = gasRoot;
  }

  // Marcos blancos
  for (const x of [-5.1, -2.1, 2.1, 5.1]) {
    const frame = BABYLON.MeshBuilder.CreateBox(
      "gasShopFrame",
      {
        width: 0.16,
        height: 2.55,
        depth: 0.22,
      },
      scene
    );

    frame.position = new BABYLON.Vector3(
      x,
      1.75,
      2.61
    );

    frame.material = whiteMat;
    frame.parent = gasRoot;
  }

  // =========================
  // ILUMINACIÓN BAJO EL TECHO
  // =========================

  for (const x of [-5, 0, 5]) {
    const lightPanelMat = new BABYLON.StandardMaterial(
      `gasLightPanelMat_${x}`,
      scene
    );

    lightPanelMat.diffuseColor = new BABYLON.Color3(
      1,
      1,
      0.92
    );

    lightPanelMat.emissiveColor = new BABYLON.Color3(
      0.75,
      0.75,
      0.62
    );

    const lightPanel = BABYLON.MeshBuilder.CreateBox(
      "gasLightPanel",
      {
        width: 2.2,
        height: 0.08,
        depth: 1,
      },
      scene
    );

    lightPanel.position = new BABYLON.Vector3(
      x,
      4.88,
      -0.5
    );

    lightPanel.material = lightPanelMat;
    lightPanel.parent = gasRoot;
  }

  // =========================
// LUZ REAL DE LA GASOLINERA
// =========================

const canopyLight = new BABYLON.PointLight(
  `gasCanopyLight_${gasStationLights.length}`,
  new BABYLON.Vector3(
    0,
    4.4,
    -0.5
  ),
  scene
);

// La luz pertenece a la raíz de esta gasolinera.
// Así respeta su posición y rotación.
canopyLight.parent = gasRoot;

canopyLight.diffuse = new BABYLON.Color3(
  1,
  0.96,
  0.82
);

canopyLight.specular = new BABYLON.Color3(
  1,
  0.95,
  0.80
);

canopyLight.intensity = 2.4;
canopyLight.range = 30;

// Evita cálculos innecesarios fuera de su alcance
canopyLight.falloffType =
  BABYLON.Light.FALLOFF_PHYSICAL;

// Guardar la luz para poder eliminarla
// correctamente al cambiar de zona.
gasStationLights.push(canopyLight);

  // =========================
  // LETRERO NIU GASOLINE
  // NO SE CAMBIA EL DISEÑO
  // =========================

  const signTexture = new BABYLON.DynamicTexture(
    "niuFuelTexture",
    {
      width: 512,
      height: 128,
    },
    scene,
    true
  );

  const ctx =
    signTexture.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = "#0B2FA5";
  ctx.fillRect(0, 0, 512, 128);

  ctx.fillStyle = "white";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("NIU", 256, 38);
  ctx.fillText("Gasoline", 256, 88);

  signTexture.update();

  const signMat = new BABYLON.StandardMaterial(
    "niuFuelSignMat",
    scene
  );

  signMat.diffuseTexture = signTexture;
  signMat.emissiveTexture = signTexture;
  signMat.emissiveColor = new BABYLON.Color3(
    0.35,
    0.35,
    0.35
  );

  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    "niuFuelSign",
    {
      width: 7,
      height: 1.8,
    },
    scene
  );

  sign.parent = gasRoot;

sign.parent = gasRoot;

sign.position = new BABYLON.Vector3(
  0,
  7,
  -3
);

sign.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
sign.material = signMat;

// Evita que Babylon descarte el letrero incorrectamente
// cuando gira para mirar hacia la cámara.
sign.alwaysSelectAsActiveMesh = true;
sign.isPickable = false;

  // =========================
  // ARO ROSA
  // =========================

  const gasAuraMat = new BABYLON.StandardMaterial(
    "gasAuraMat",
    scene
  );

  gasAuraMat.diffuseColor = new BABYLON.Color3(
    1,
    0.15,
    0.75
  );

  gasAuraMat.emissiveColor = new BABYLON.Color3(
    1,
    0.15,
    0.75
  );

  gasAuraMat.alpha = 0.62;

  gasStationAura = BABYLON.MeshBuilder.CreateCylinder(
  "gasStationAura",
  {
    diameter: 8,
    height: 0.18,
    tessellation: 64,
  },
  scene
);

gasStationAura.parent = gasRoot;

gasStationAura.position = new BABYLON.Vector3(
  0,
  0.25,
  0
);

gasStationAura.material = gasAuraMat;
gasStationAura.isPickable = false;
gasStationAura.alwaysSelectAsActiveMesh = true;

// Guardamos una referencia propia para esta gasolinera.
// No dependemos de la posición local del aro.
const stationAura = gasStationAura;

gasStationTriggers.push({
  root: gasRoot,
  aura: stationAura,
  worldPosition: new BABYLON.Vector3(
    pos.x,
    0,
    pos.z
  ),
});

// La raíz debe eliminarse al cambiar de zona.
activeMapMeshes.push(gasRoot);

// Registrar solamente la raíz.
// No registrar el aro por separado porque tiene posición local.
registerChunkMesh(gasRoot);
registerCullable(gasRoot);

return pos;
}
// =========================
// MANSÓN 1 - BEVERLY HILLS
// =========================

function createBeverlyMansion1AtLonLat(
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // =========================
  // MATERIALES
  // =========================

  const wallWhite = mat(
    "mansion1_wallWhite",
    new BABYLON.Color3(0.92, 0.91, 0.88)
  );

  const wallStone = mat(
    "mansion1_wallStone",
    new BABYLON.Color3(0.78, 0.74, 0.68)
  );

  const wallDark = mat(
    "mansion1_wallDark",
    new BABYLON.Color3(0.18, 0.18, 0.20)
  );

  const woodMat = mat(
    "mansion1_wood",
    new BABYLON.Color3(0.35, 0.22, 0.12)
  );

  const glassMat = new BABYLON.StandardMaterial(
    "mansion1_glass",
    scene
  );
  glassMat.diffuseColor = new BABYLON.Color3(0.45, 0.62, 0.78);
  glassMat.emissiveColor = new BABYLON.Color3(0.08, 0.12, 0.18);
  glassMat.alpha = 0.75;
  glassMat.specularColor = new BABYLON.Color3(0.4, 0.45, 0.5);
  glassMat.needDepthPrePass = true;
  glassMat.backFaceCulling = true;

  const roofMat = mat(
    "mansion1_roof",
    new BABYLON.Color3(0.55, 0.55, 0.52)
  );

  const poolMat = new BABYLON.StandardMaterial(
    "mansion1_pool",
    scene
  );
  poolMat.diffuseColor = new BABYLON.Color3(0.15, 0.55, 0.75);
  poolMat.emissiveColor = new BABYLON.Color3(0.05, 0.22, 0.35);
  poolMat.alpha = 0.85;
  poolMat.specularColor = new BABYLON.Color3(0.5, 0.7, 0.9);

  const deckMat = mat(
    "mansion1_deck",
    new BABYLON.Color3(0.82, 0.80, 0.75)
  );

  const hedgeMat = mat(
    "mansion1_hedge",
    new BABYLON.Color3(0.12, 0.38, 0.14)
  );

  const cypressMat = mat(
    "mansion1_cypress",
    new BABYLON.Color3(0.08, 0.28, 0.12)
  );

  const metalMat = mat(
    "mansion1_metal",
    new BABYLON.Color3(0.08, 0.08, 0.09)
  );

  const carBodyMat = mat(
    "mansion1_carBody",
    new BABYLON.Color3(0.05, 0.05, 0.06)
  );

  const lightMat = new BABYLON.StandardMaterial(
    "mansion1_light",
    scene
  );
  lightMat.diffuseColor = new BABYLON.Color3(1, 0.92, 0.7);
  lightMat.emissiveColor = new BABYLON.Color3(0.85, 0.7, 0.35);
  lightMat.specularColor = BABYLON.Color3.Black();

  // =========================
  // RAÍZ
  // =========================

  const root = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_root",
    { width: 0.1, height: 0.1, depth: 0.1 },
    scene
  );
  root.position = new BABYLON.Vector3(pos.x, 0, pos.z);
  root.rotation.y = rotationY;
  root.isVisible = false;
  root.isPickable = false;

  // =========================
  // PLATAFORMA / TERRENO
  // =========================

  const platform = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_platform",
    { width: 42, height: 0.3, depth: 38 },
    scene
  );
  platform.position = new BABYLON.Vector3(0, 0.15, 0);
  platform.material = deckMat;
  platform.parent = root;
  platform.isPickable = false;

  // =========================
  // CUERPO PRINCIPAL (izquierda blanca)
  // =========================

  const mainLeft = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_mainLeft",
    { width: 14, height: 9, depth: 12 },
    scene
  );
  mainLeft.position = new BABYLON.Vector3(-6, 4.7, 2);
  mainLeft.material = wallWhite;
  mainLeft.parent = root;
  mainLeft.isPickable = false;

  // =========================
  // TORRE OSCURA CENTRAL
  // =========================

  const darkTower = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_darkTower",
    { width: 5.5, height: 12, depth: 10 },
    scene
  );
  darkTower.position = new BABYLON.Vector3(2.5, 6.2, 1);
  darkTower.material = wallDark;
  darkTower.parent = root;
  darkTower.isPickable = false;

  // =========================
  // ALA DERECHA SUPERIOR
  // =========================

  const rightWing = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_rightWing",
    { width: 12, height: 7.5, depth: 11 },
    scene
  );
  rightWing.position = new BABYLON.Vector3(11, 5.5, 1.5);
  rightWing.material = wallWhite;
  rightWing.parent = root;
  rightWing.isPickable = false;

  // =========================
  // VOLADIZO SUPERIOR / BALCÓN
  // =========================

  const overhang = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_overhang",
    { width: 16, height: 0.45, depth: 4 },
    scene
  );
  overhang.position = new BABYLON.Vector3(8, 9.3, -5.2);
  overhang.material = wallWhite;
  overhang.parent = root;
  overhang.isPickable = false;

  // Baranda del balcón
  const balconyRail = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_balconyRail",
    { width: 15.5, height: 0.9, depth: 0.12 },
    scene
  );
  balconyRail.position = new BABYLON.Vector3(8, 9.9, -7);
  balconyRail.material = metalMat;
  balconyRail.parent = root;
  balconyRail.isPickable = false;

  // =========================
  // ENTRADA CON PIEDRA
  // =========================

  const entranceStone = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_entranceStone",
    { width: 8, height: 5.5, depth: 3.5 },
    scene
  );
  entranceStone.position = new BABYLON.Vector3(2, 2.9, -6.5);
  entranceStone.material = wallStone;
  entranceStone.parent = root;
  entranceStone.isPickable = false;

  // Puerta de madera
  const door = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_door",
    { width: 2.4, height: 3.4, depth: 0.2 },
    scene
  );
  door.position = new BABYLON.Vector3(2, 1.9, -8.35);
  door.material = woodMat;
  door.parent = root;
  door.isPickable = false;

  // =========================
  // VENTANAS
  // =========================

  const windowPositions = [
    // Izquierda
    { x: -10, y: 3.5, z: -4.1 },
    { x: -6.5, y: 3.5, z: -4.1 },
    { x: -10, y: 7, z: -4.1 },
    { x: -6.5, y: 7, z: -4.1 },
    // Torre oscura
    { x: 2.5, y: 8, z: -4.1 },
    { x: 2.5, y: 10.5, z: -4.1 },
    // Derecha
    { x: 8, y: 4, z: -4.1 },
    { x: 12, y: 4, z: -4.1 },
    { x: 8, y: 7.5, z: -4.1 },
    { x: 12, y: 7.5, z: -4.1 },
  ];

  for (let i = 0; i < windowPositions.length; i++) {
    const wp = windowPositions[i];
    const win = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion1_window_${i}`,
      { width: 2.4, height: 2.1, depth: 0.15 },
      scene
    );
    win.position = new BABYLON.Vector3(wp.x, wp.y, wp.z);
    win.material = glassMat;
    win.parent = root;
    win.isPickable = false;
  }

  // =========================
  // PORTÓN Y PILARES
  // =========================

  // Pilar izquierdo
  const pillarL = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_pillarL",
    { width: 1.4, height: 2.4, depth: 1.4 },
    scene
  );
  pillarL.position = new BABYLON.Vector3(-8, 1.2, -16);
  pillarL.material = wallStone;
  pillarL.parent = root;
  pillarL.isPickable = false;

  // Pilar derecho
  const pillarR = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_pillarR",
    { width: 1.4, height: 2.4, depth: 1.4 },
    scene
  );
  pillarR.position = new BABYLON.Vector3(8, 1.2, -16);
  pillarR.material = wallStone;
  pillarR.parent = root;
  pillarR.isPickable = false;

  // Portón izquierdo
  const gateL = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_gateL",
    { width: 5.5, height: 2.1, depth: 0.15 },
    scene
  );
  gateL.position = new BABYLON.Vector3(-3.5, 1.15, -16);
  gateL.material = metalMat;
  gateL.parent = root;
  gateL.isPickable = false;

  // Portón derecho
  const gateR = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_gateR",
    { width: 5.5, height: 2.1, depth: 0.15 },
    scene
  );
  gateR.position = new BABYLON.Vector3(3.5, 1.15, -16);
  gateR.material = metalMat;
  gateR.parent = root;
  gateR.isPickable = false;

  // Placa BH
  const plaqueTexture = new BABYLON.DynamicTexture(
    "beverlyMansion1_plaqueTex",
    { width: 512, height: 320 },
    scene,
    true
  );
  const pctx = plaqueTexture.getContext() as CanvasRenderingContext2D;
  pctx.fillStyle = "#1a1a1a";
  pctx.fillRect(0, 0, 512, 320);
  pctx.strokeStyle = "#c9a84c";
  pctx.lineWidth = 14;
  pctx.strokeRect(12, 12, 488, 296);
  pctx.fillStyle = "#e8d48b";
  pctx.font = "bold 72px Arial";
  pctx.textAlign = "center";
  pctx.fillText("BH", 256, 120);
  pctx.fillStyle = "#dddddd";
  pctx.font = "bold 28px Arial";
  pctx.fillText("BEVERLY HILLS", 256, 185);
  pctx.fillText("ESTATE", 256, 230);
  plaqueTexture.update();

  const plaqueMat = new BABYLON.StandardMaterial(
    "beverlyMansion1_plaqueMat",
    scene
  );
  plaqueMat.diffuseTexture = plaqueTexture;
  plaqueMat.emissiveTexture = plaqueTexture;
  plaqueMat.emissiveColor = new BABYLON.Color3(0.4, 0.4, 0.4);
  plaqueMat.disableLighting = true;
  plaqueMat.backFaceCulling = false;

  const plaque = BABYLON.MeshBuilder.CreatePlane(
    "beverlyMansion1_plaque",
    { width: 2.2, height: 1.4 },
    scene
  );
  plaque.position = new BABYLON.Vector3(-8, 1.8, -16.75);
  plaque.material = plaqueMat;
  plaque.parent = root;
  plaque.isPickable = false;

  // =========================
  // SETOS / JARDÍN FRONTAL
  // =========================

  for (const x of [-14, -11, 11, 14]) {
    const hedge = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion1_hedge",
      { width: 3.2, height: 1.6, depth: 1.2 },
      scene
    );
    hedge.position = new BABYLON.Vector3(x, 0.95, -14);
    hedge.material = hedgeMat;
    hedge.parent = root;
    hedge.isPickable = false;
  }

  // Cipreses
  for (const x of [-4, 0, 4, 7, 10]) {
    const cypress = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion1_cypress",
      { height: 5.5, diameterTop: 0.35, diameterBottom: 1.1, tessellation: 10 },
      scene
    );
    cypress.position = new BABYLON.Vector3(x, 3, -7.5);
    cypress.material = cypressMat;
    cypress.parent = root;
    cypress.isPickable = false;
  }

  // =========================
  // PISCINA ATRÁS
  // =========================

  const poolDeck = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_poolDeck",
    { width: 18, height: 0.25, depth: 12 },
    scene
  );
  poolDeck.position = new BABYLON.Vector3(2, 0.28, 14);
  poolDeck.material = deckMat;
  poolDeck.parent = root;
  poolDeck.isPickable = false;

  const pool = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_pool",
    { width: 12, height: 0.35, depth: 7 },
    scene
  );
  pool.position = new BABYLON.Vector3(2, 0.35, 14);
  pool.material = poolMat;
  pool.parent = root;
  pool.isPickable = false;

  // Sombrillas + sillas
  for (const [sx, sz] of [
    [-3, 11],
    [7, 11],
    [-3, 17],
    [7, 17],
  ] as [number, number][]) {
    // Silla
    const chair = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion1_chair",
      { width: 1.1, height: 0.35, depth: 1.8 },
      scene
    );
    chair.position = new BABYLON.Vector3(sx, 0.5, sz);
    chair.material = wallWhite;
    chair.parent = root;
    chair.isPickable = false;

    // Mástil sombrilla
    const pole = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion1_umbrellaPole",
      { height: 2.4, diameter: 0.08, tessellation: 8 },
      scene
    );
    pole.position = new BABYLON.Vector3(sx, 1.5, sz);
    pole.material = metalMat;
    pole.parent = root;
    pole.isPickable = false;

    // Tela sombrilla
    const umbrella = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion1_umbrella",
      {
        height: 0.25,
        diameterTop: 0.1,
        diameterBottom: 2.6,
        tessellation: 16,
      },
      scene
    );
    umbrella.position = new BABYLON.Vector3(sx, 2.7, sz);
    umbrella.material = mat(
      "mansion1_umbrellaCloth",
      new BABYLON.Color3(0.85, 0.75, 0.55)
    );
    umbrella.parent = root;
    umbrella.isPickable = false;
  }

  // =========================
  // AUTO ESTACIONADO
  // =========================

  const carRoot = new BABYLON.TransformNode(
    "beverlyMansion1_car",
    scene
  );
  carRoot.parent = root;
  carRoot.position = new BABYLON.Vector3(-10, 0.35, -11);
  carRoot.rotation.y = Math.PI * 0.15;

  const carBody = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_carBody",
    { width: 2.1, height: 0.7, depth: 4.2 },
    scene
  );
  carBody.position.y = 0.45;
  carBody.material = carBodyMat;
  carBody.parent = carRoot;
  carBody.isPickable = false;

  const carCabin = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion1_carCabin",
    { width: 1.9, height: 0.55, depth: 2 },
    scene
  );
  carCabin.position = new BABYLON.Vector3(0, 0.95, -0.2);
  carCabin.material = glassMat;
  carCabin.parent = carRoot;
  carCabin.isPickable = false;

  for (const [wx, wz] of [
    [-1.05, 1.3],
    [1.05, 1.3],
    [-1.05, -1.3],
    [1.05, -1.3],
  ] as [number, number][]) {
    const wheel = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion1_carWheel",
      { diameter: 0.55, height: 0.28, tessellation: 16 },
      scene
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position = new BABYLON.Vector3(wx, 0.28, wz);
    wheel.material = metalMat;
    wheel.parent = carRoot;
    wheel.isPickable = false;
  }

  // =========================
  // LUCES DE ENTRADA
  // =========================

  for (const x of [-1.5, 5.5]) {
    const lamp = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion1_lamp",
      { diameter: 0.35, segments: 8 },
      scene
    );
    lamp.position = new BABYLON.Vector3(x, 4.2, -8.2);
    lamp.material = lightMat;
    lamp.parent = root;
    lamp.isPickable = false;
  }

  const entranceLight = new BABYLON.PointLight(
    "beverlyMansion1_entranceLight",
    BABYLON.Vector3.Zero(),
    scene
  );
  entranceLight.parent = root;
  entranceLight.position = new BABYLON.Vector3(2, 4.5, -9);
  entranceLight.diffuse = new BABYLON.Color3(1, 0.85, 0.55);
  entranceLight.specular = BABYLON.Color3.Black();
  entranceLight.intensity = 1.2;
  entranceLight.range = 18;

  // =========================
  // REGISTRO
  // =========================

  activeMapMeshes.push(root);
  registerChunkMesh(root);
  // No registrar en culling agresivo para que no desaparezca de lejos
  // registerCullable(root);

  return root;
}
// =========================
// MANSÓN 2 - BEVERLY HILLS (CLÁSICA)
// =========================

function createBeverlyMansion2AtLonLat(
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // =========================
  // MATERIALES
  // =========================

  const wallCream = mat(
    "mansion2_wallCream",
    new BABYLON.Color3(0.93, 0.90, 0.84)
  );

  const wallStone = mat(
    "mansion2_wallStone",
    new BABYLON.Color3(0.82, 0.79, 0.74)
  );

  const roofDark = mat(
    "mansion2_roof",
    new BABYLON.Color3(0.22, 0.22, 0.24)
  );

  const woodDark = mat(
    "mansion2_wood",
    new BABYLON.Color3(0.22, 0.14, 0.08)
  );

  const metalBlack = mat(
    "mansion2_metal",
    new BABYLON.Color3(0.06, 0.06, 0.07)
  );

  const glassWarm = new BABYLON.StandardMaterial(
    "mansion2_glassWarm",
    scene
  );
  glassWarm.diffuseColor = new BABYLON.Color3(1, 0.82, 0.45);
  glassWarm.emissiveColor = new BABYLON.Color3(0.55, 0.38, 0.12);
  glassWarm.specularColor = new BABYLON.Color3(0.3, 0.25, 0.15);
  glassWarm.alpha = 0.92;

  const glassClear = new BABYLON.StandardMaterial(
    "mansion2_glassClear",
    scene
  );
  glassClear.diffuseColor = new BABYLON.Color3(0.5, 0.65, 0.8);
  glassClear.emissiveColor = new BABYLON.Color3(0.06, 0.1, 0.14);
  glassClear.alpha = 0.7;
  glassClear.needDepthPrePass = true;

  const hedgeMat = mat(
    "mansion2_hedge",
    new BABYLON.Color3(0.14, 0.40, 0.16)
  );

  const grassFront = mat(
    "mansion2_grass",
    new BABYLON.Color3(0.18, 0.48, 0.18)
  );

  const flowerMat = mat(
    "mansion2_flower",
    new BABYLON.Color3(0.85, 0.75, 0.80)
  );

  const pathMat = mat(
    "mansion2_path",
    new BABYLON.Color3(0.72, 0.70, 0.66)
  );

  const poolMat = new BABYLON.StandardMaterial(
    "mansion2_pool",
    scene
  );
  poolMat.diffuseColor = new BABYLON.Color3(0.12, 0.48, 0.72);
  poolMat.emissiveColor = new BABYLON.Color3(0.04, 0.18, 0.32);
  poolMat.alpha = 0.88;
  poolMat.specularColor = new BABYLON.Color3(0.5, 0.75, 0.95);

  const deckMat = mat(
    "mansion2_deck",
    new BABYLON.Color3(0.86, 0.84, 0.78)
  );

  const lightMat = new BABYLON.StandardMaterial(
    "mansion2_light",
    scene
  );
  lightMat.diffuseColor = new BABYLON.Color3(1, 0.9, 0.65);
  lightMat.emissiveColor = new BABYLON.Color3(0.9, 0.72, 0.3);
  lightMat.specularColor = BABYLON.Color3.Black();

  const treeDark = mat(
    "mansion2_treeDark",
    new BABYLON.Color3(0.12, 0.10, 0.14)
  );

  // =========================
  // RAÍZ
  // =========================

  const root = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_root",
    { width: 0.1, height: 0.1, depth: 0.1 },
    scene
  );
  root.position = new BABYLON.Vector3(pos.x, 0, pos.z);
  root.rotation.y = rotationY;
  root.isVisible = false;
  root.isPickable = false;

  // =========================
  // TERRENO / CÉSPED
  // =========================

  const lawn = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_lawn",
    { width: 48, height: 0.2, depth: 42 },
    scene
  );
  lawn.position = new BABYLON.Vector3(0, 0.1, 0);
  lawn.material = grassFront;
  lawn.parent = root;
  lawn.isPickable = false;

  // Camino central
  const path = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_path",
    { width: 3.2, height: 0.12, depth: 14 },
    scene
  );
  path.position = new BABYLON.Vector3(0, 0.22, -14);
  path.material = pathMat;
  path.parent = root;
  path.isPickable = false;

  // =========================
  // CUERPO PRINCIPAL
  // =========================

  // Planta baja
  const baseFloor = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_baseFloor",
    { width: 28, height: 5.2, depth: 14 },
    scene
  );
  baseFloor.position = new BABYLON.Vector3(0, 2.8, 0);
  baseFloor.material = wallCream;
  baseFloor.parent = root;
  baseFloor.isPickable = false;

  // Segundo piso
  const secondFloor = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_secondFloor",
    { width: 28, height: 4.6, depth: 13.5 },
    scene
  );
  secondFloor.position = new BABYLON.Vector3(0, 7.5, 0.2);
  secondFloor.material = wallCream;
  secondFloor.parent = root;
  secondFloor.isPickable = false;

  // Bloque central (frontón)
  const centerBlock = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_centerBlock",
    { width: 8.5, height: 11.5, depth: 15 },
    scene
  );
  centerBlock.position = new BABYLON.Vector3(0, 5.9, -0.3);
  centerBlock.material = wallStone;
  centerBlock.parent = root;
  centerBlock.isPickable = false;

  // Frontón triangular (techo a dos aguas del centro)
  const pediment = BABYLON.MeshBuilder.CreateCylinder(
    "beverlyMansion2_pediment",
    { diameter: 9.2, height: 3.2, tessellation: 3 },
    scene
  );
  pediment.rotation.z = Math.PI / 2;
  pediment.rotation.y = Math.PI / 2;
  pediment.position = new BABYLON.Vector3(0, 12.4, -7.2);
  pediment.scaling = new BABYLON.Vector3(0.45, 1, 0.35);
  pediment.material = wallStone;
  pediment.parent = root;
  pediment.isPickable = false;

  // =========================
  // TECHO PRINCIPAL
  // =========================

  const mainRoof = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_mainRoof",
    { width: 29.5, height: 0.55, depth: 15 },
    scene
  );
  mainRoof.position = new BABYLON.Vector3(0, 10.1, 0.2);
  mainRoof.material = roofDark;
  mainRoof.parent = root;
  mainRoof.isPickable = false;

  // Buhardillas (dormers)
  for (const x of [-9, -4.5, 4.5, 9]) {
    const dormerBody = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_dormerBody",
      { width: 2.4, height: 1.8, depth: 2.2 },
      scene
    );
    dormerBody.position = new BABYLON.Vector3(x, 11.2, -5.5);
    dormerBody.material = wallCream;
    dormerBody.parent = root;
    dormerBody.isPickable = false;

    const dormerRoof = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion2_dormerRoof",
      { diameter: 2.8, height: 2.3, tessellation: 3 },
      scene
    );
    dormerRoof.rotation.z = Math.PI / 2;
    dormerRoof.position = new BABYLON.Vector3(x, 12.4, -5.5);
    dormerRoof.scaling = new BABYLON.Vector3(0.4, 1, 0.45);
    dormerRoof.material = roofDark;
    dormerRoof.parent = root;
    dormerRoof.isPickable = false;

    const dormerWin = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_dormerWin",
      { width: 1.3, height: 1.1, depth: 0.12 },
      scene
    );
    dormerWin.position = new BABYLON.Vector3(x, 11.15, -6.65);
    dormerWin.material = glassWarm;
    dormerWin.parent = root;
    dormerWin.isPickable = false;
  }

  // =========================
  // ENTRADA CON ARCO
  // =========================

  const archFrame = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_archFrame",
    { width: 5.5, height: 4.2, depth: 1.2 },
    scene
  );
  archFrame.position = new BABYLON.Vector3(0, 2.3, -7.6);
  archFrame.material = wallStone;
  archFrame.parent = root;
  archFrame.isPickable = false;

  // Puerta principal
  const mainDoor = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_mainDoor",
    { width: 2.6, height: 3.3, depth: 0.22 },
    scene
  );
  mainDoor.position = new BABYLON.Vector3(0, 1.85, -8.25);
  mainDoor.material = woodDark;
  mainDoor.parent = root;
  mainDoor.isPickable = false;

  // Escalones de entrada
  for (let i = 0; i < 4; i++) {
    const step = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion2_step_${i}`,
      { width: 4.5 - i * 0.2, height: 0.18, depth: 0.7 },
      scene
    );
    step.position = new BABYLON.Vector3(
      0,
      0.25 + i * 0.18,
      -9.2 - i * 0.45
    );
    step.material = wallStone;
    step.parent = root;
    step.isPickable = false;
  }

  // =========================
  // VENTANAS (simétricas, iluminadas)
  // =========================

  const windowLayout = [
    // Planta baja izquierda
    { x: -10.5, y: 2.4, z: -7.1, w: 2.0, h: 2.3 },
    { x: -7.2, y: 2.4, z: -7.1, w: 2.0, h: 2.3 },
    // Planta baja derecha
    { x: 7.2, y: 2.4, z: -7.1, w: 2.0, h: 2.3 },
    { x: 10.5, y: 2.4, z: -7.1, w: 2.0, h: 2.3 },
    // Segundo piso izquierda
    { x: -10.5, y: 7.2, z: -6.7, w: 2.0, h: 2.1 },
    { x: -7.2, y: 7.2, z: -6.7, w: 2.0, h: 2.1 },
    // Segundo piso derecha
    { x: 7.2, y: 7.2, z: -6.7, w: 2.0, h: 2.1 },
    { x: 10.5, y: 7.2, z: -6.7, w: 2.0, h: 2.1 },
    // Centro segundo piso (sobre la entrada)
    { x: -2.2, y: 7.4, z: -7.9, w: 1.7, h: 1.9 },
    { x: 2.2, y: 7.4, z: -7.9, w: 1.7, h: 1.9 },
  ];

  for (let i = 0; i < windowLayout.length; i++) {
    const w = windowLayout[i];

    // Marco
    const frame = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion2_winFrame_${i}`,
      { width: w.w + 0.25, height: w.h + 0.25, depth: 0.18 },
      scene
    );
    frame.position = new BABYLON.Vector3(w.x, w.y, w.z);
    frame.material = wallStone;
    frame.parent = root;
    frame.isPickable = false;

    // Cristal cálido
    const glass = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion2_winGlass_${i}`,
      { width: w.w, height: w.h, depth: 0.12 },
      scene
    );
    glass.position = new BABYLON.Vector3(w.x, w.y, w.z - 0.08);
    glass.material = glassWarm;
    glass.parent = root;
    glass.isPickable = false;
  }

  // =========================
  // BALCONES CON BARANDA NEGRA
  // =========================

  for (const x of [-8.85, 8.85]) {
    const balc = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_balcony",
      { width: 5.2, height: 0.18, depth: 1.4 },
      scene
    );
    balc.position = new BABYLON.Vector3(x, 5.5, -7.5);
    balc.material = wallStone;
    balc.parent = root;
    balc.isPickable = false;

    const rail = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_balconyRail",
      { width: 5.1, height: 0.85, depth: 0.08 },
      scene
    );
    rail.position = new BABYLON.Vector3(x, 6.0, -8.15);
    rail.material = metalBlack;
    rail.parent = root;
    rail.isPickable = false;

    // Barrotes verticales
    for (let i = -2; i <= 2; i++) {
      const bar = BABYLON.MeshBuilder.CreateBox(
        "beverlyMansion2_balcBar",
        { width: 0.06, height: 0.8, depth: 0.06 },
        scene
      );
      bar.position = new BABYLON.Vector3(
        x + i * 1.05,
        5.95,
        -8.15
      );
      bar.material = metalBlack;
      bar.parent = root;
      bar.isPickable = false;
    }
  }

  // =========================
  // PORTÓN Y REJA FRONTAL
  // =========================

  const gatePostL = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_gatePostL",
    { width: 0.7, height: 2.0, depth: 0.7 },
    scene
  );
  gatePostL.position = new BABYLON.Vector3(-2.4, 1.1, -20);
  gatePostL.material = wallStone;
  gatePostL.parent = root;
  gatePostL.isPickable = false;

  const gatePostR = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_gatePostR",
    { width: 0.7, height: 2.0, depth: 0.7 },
    scene
  );
  gatePostR.position = new BABYLON.Vector3(2.4, 1.1, -20);
  gatePostR.material = wallStone;
  gatePostR.parent = root;
  gatePostR.isPickable = false;

  const gate = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_gate",
    { width: 4.0, height: 1.7, depth: 0.12 },
    scene
  );
  gate.position = new BABYLON.Vector3(0, 1.0, -20);
  gate.material = metalBlack;
  gate.parent = root;
  gate.isPickable = false;

  // Reja lateral
  for (const side of [-1, 1]) {
    const fence = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_fence",
      { width: 12, height: 1.3, depth: 0.1 },
      scene
    );
    fence.position = new BABYLON.Vector3(side * 10, 0.8, -20);
    fence.material = metalBlack;
    fence.parent = root;
    fence.isPickable = false;
  }

  // =========================
  // JARDÍN FRONTAL
  // =========================

  // Setos bajos
  for (const x of [-14, -10, -6, 6, 10, 14]) {
    const hedge = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_hedge",
      { width: 3.5, height: 1.1, depth: 1.3 },
      scene
    );
    hedge.position = new BABYLON.Vector3(x, 0.7, -17);
    hedge.material = hedgeMat;
    hedge.parent = root;
    hedge.isPickable = false;
  }

  // Arbustos/árboles oscuros (como en la foto)
  for (const x of [-8, -4, 4, 8]) {
    const bush = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion2_bush",
      { diameter: 3.2, segments: 8 },
      scene
    );
    bush.position = new BABYLON.Vector3(x, 2.0, -11);
    bush.scaling.y = 1.15;
    bush.material = treeDark;
    bush.parent = root;
    bush.isPickable = false;
  }

  // Flores
  for (let i = 0; i < 10; i++) {
    const fx = -12 + i * 2.6;
    const flower = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion2_flower",
      { diameter: 0.55, segments: 6 },
      scene
    );
    flower.position = new BABYLON.Vector3(fx, 0.55, -18.2);
    flower.material = flowerMat;
    flower.parent = root;
    flower.isPickable = false;
  }

  // =========================
  // LUCES DE FACHADA
  // =========================

  for (const x of [-3.2, 3.2, -12, 12]) {
    const wallLamp = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion2_wallLamp",
      { diameter: 0.32, segments: 8 },
      scene
    );
    wallLamp.position = new BABYLON.Vector3(x, 3.6, -7.9);
    wallLamp.material = lightMat;
    wallLamp.parent = root;
    wallLamp.isPickable = false;
  }

  // Luces de camino
  for (const x of [-3.5, 3.5]) {
    const pathLamp = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion2_pathLamp",
      { height: 1.1, diameter: 0.22, tessellation: 8 },
      scene
    );
    pathLamp.position = new BABYLON.Vector3(x, 0.7, -16);
    pathLamp.material = wallStone;
    pathLamp.parent = root;
    pathLamp.isPickable = false;

    const pathBulb = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion2_pathBulb",
      { diameter: 0.28, segments: 8 },
      scene
    );
    pathBulb.position = new BABYLON.Vector3(x, 1.35, -16);
    pathBulb.material = lightMat;
    pathBulb.parent = root;
    pathBulb.isPickable = false;
  }

  const facadeLight = new BABYLON.PointLight(
    "beverlyMansion2_facadeLight",
    BABYLON.Vector3.Zero(),
    scene
  );
  facadeLight.parent = root;
  facadeLight.position = new BABYLON.Vector3(0, 5, -12);
  facadeLight.diffuse = new BABYLON.Color3(1, 0.82, 0.5);
  facadeLight.specular = BABYLON.Color3.Black();
  facadeLight.intensity = 1.35;
  facadeLight.range = 22;

  // =========================
  // ZONA RECREATIVA ATRÁS
  // Piscina + terraza + tenis pequeño
  // =========================

  const backDeck = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_backDeck",
    { width: 22, height: 0.22, depth: 16 },
    scene
  );
  backDeck.position = new BABYLON.Vector3(0, 0.25, 16);
  backDeck.material = deckMat;
  backDeck.parent = root;
  backDeck.isPickable = false;

  // Piscina rectangular elegante
  const pool = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_pool",
    { width: 10, height: 0.4, depth: 6 },
    scene
  );
  pool.position = new BABYLON.Vector3(-3, 0.35, 15);
  pool.material = poolMat;
  pool.parent = root;
  pool.isPickable = false;

  // Borde de piscina
  const poolBorder = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_poolBorder",
    { width: 11.2, height: 0.18, depth: 7.2 },
    scene
  );
  poolBorder.position = new BABYLON.Vector3(-3, 0.28, 15);
  poolBorder.material = wallStone;
  poolBorder.parent = root;
  poolBorder.isPickable = false;

  // Tumbonas
  for (const [sx, sz] of [
    [-8, 12],
    [-8, 15],
    [3, 12],
    [3, 15],
  ] as [number, number][]) {
    const lounger = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion2_lounger",
      { width: 0.9, height: 0.28, depth: 2.0 },
      scene
    );
    lounger.position = new BABYLON.Vector3(sx, 0.5, sz);
    lounger.material = wallCream;
    lounger.parent = root;
    lounger.isPickable = false;
  }

  // Pérgola / zona chill
  const pergolaTop = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_pergola",
    { width: 6, height: 0.15, depth: 4 },
    scene
  );
  pergolaTop.position = new BABYLON.Vector3(8, 3.0, 17);
  pergolaTop.material = woodDark;
  pergolaTop.parent = root;
  pergolaTop.isPickable = false;

  for (const x of [5.5, 10.5]) {
    for (const z of [15.5, 18.5]) {
      const col = BABYLON.MeshBuilder.CreateCylinder(
        "beverlyMansion2_pergolaCol",
        { height: 2.8, diameter: 0.25, tessellation: 8 },
        scene
      );
      col.position = new BABYLON.Vector3(x, 1.5, z);
      col.material = wallStone;
      col.parent = root;
      col.isPickable = false;
    }
  }

  // Cancha de tenis pequeña (marca en el suelo)
  const tennisCourt = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_tennis",
    { width: 8, height: 0.08, depth: 5 },
    scene
  );
  tennisCourt.position = new BABYLON.Vector3(8, 0.28, 10);
  tennisCourt.material = mat(
    "mansion2_tennis",
    new BABYLON.Color3(0.25, 0.55, 0.35)
  );
  tennisCourt.parent = root;
  tennisCourt.isPickable = false;

  const tennisNet = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion2_tennisNet",
    { width: 0.08, height: 0.9, depth: 4.5 },
    scene
  );
  tennisNet.position = new BABYLON.Vector3(8, 0.75, 10);
  tennisNet.material = metalBlack;
  tennisNet.parent = root;
  tennisNet.isPickable = false;

  // =========================
  // REGISTRO
  // =========================

  activeMapMeshes.push(root);
  registerChunkMesh(root);

  return root;
}
// =========================
// MANSÓN 3 - BEVERLY HILLS (ESTATE DE LUJO)
// =========================

function createBeverlyMansion3AtLonLat(
  lon: number,
  lat: number,
  rotationY: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // =========================
  // MATERIALES
  // =========================

  const wallWhite = mat(
    "mansion3_wallWhite",
    new BABYLON.Color3(0.96, 0.94, 0.90)
  );

  const wallCream = mat(
    "mansion3_wallCream",
    new BABYLON.Color3(0.90, 0.87, 0.82)
  );

  const roofFlat = mat(
    "mansion3_roof",
    new BABYLON.Color3(0.55, 0.55, 0.52)
  );

  const woodWarm = mat(
    "mansion3_wood",
    new BABYLON.Color3(0.40, 0.26, 0.14)
  );

  const metalDark = mat(
    "mansion3_metal",
    new BABYLON.Color3(0.12, 0.12, 0.13)
  );

  const glassWarm = new BABYLON.StandardMaterial(
    "mansion3_glassWarm",
    scene
  );
  glassWarm.diffuseColor = new BABYLON.Color3(1, 0.85, 0.5);
  glassWarm.emissiveColor = new BABYLON.Color3(0.6, 0.42, 0.14);
  glassWarm.specularColor = new BABYLON.Color3(0.35, 0.28, 0.15);
  glassWarm.alpha = 0.93;

  const glassClear = new BABYLON.StandardMaterial(
    "mansion3_glassClear",
    scene
  );
  glassClear.diffuseColor = new BABYLON.Color3(0.55, 0.7, 0.85);
  glassClear.emissiveColor = new BABYLON.Color3(0.05, 0.08, 0.12);
  glassClear.alpha = 0.72;
  glassClear.needDepthPrePass = true;

  const grassMat3 = mat(
    "mansion3_grass",
    new BABYLON.Color3(0.16, 0.48, 0.18)
  );

  const hedgeMat3 = mat(
    "mansion3_hedge",
    new BABYLON.Color3(0.10, 0.34, 0.12)
  );

  const stoneMat = mat(
    "mansion3_stone",
    new BABYLON.Color3(0.82, 0.80, 0.76)
  );

  const poolMat3 = new BABYLON.StandardMaterial(
    "mansion3_pool",
    scene
  );
  poolMat3.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.75);
  poolMat3.emissiveColor = new BABYLON.Color3(0.04, 0.2, 0.35);
  poolMat3.alpha = 0.9;
  poolMat3.specularColor = new BABYLON.Color3(0.55, 0.8, 1);

  const deckMat3 = mat(
    "mansion3_deck",
    new BABYLON.Color3(0.88, 0.86, 0.80)
  );

  const tennisMat = mat(
    "mansion3_tennis",
    new BABYLON.Color3(0.22, 0.52, 0.32)
  );

  const lightMat3 = new BABYLON.StandardMaterial(
    "mansion3_light",
    scene
  );
  lightMat3.diffuseColor = new BABYLON.Color3(1, 0.9, 0.65);
  lightMat3.emissiveColor = new BABYLON.Color3(0.95, 0.75, 0.3);
  lightMat3.specularColor = BABYLON.Color3.Black();

  const statueMat = mat(
    "mansion3_statue",
    new BABYLON.Color3(0.15, 0.15, 0.18)
  );

  const playMat = mat(
    "mansion3_play",
    new BABYLON.Color3(0.85, 0.25, 0.2)
  );

  // =========================
  // RAÍZ
  // =========================

  const root = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_root",
    { width: 0.1, height: 0.1, depth: 0.1 },
    scene
  );
  root.position = new BABYLON.Vector3(pos.x, 0, pos.z);
  root.rotation.y = rotationY;
  root.isVisible = false;
  root.isPickable = false;

  // =========================
  // TERRENO Y CÉSPED GRANDE
  // =========================

  const lawn = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_lawn",
    { width: 55, height: 0.18, depth: 48 },
    scene
  );
  lawn.position = new BABYLON.Vector3(0, 0.09, 2);
  lawn.material = grassMat3;
  lawn.parent = root;
  lawn.isPickable = false;

  // Círculo de césped frontal (diseño ornamental)
  const circleLawn = BABYLON.MeshBuilder.CreateCylinder(
    "beverlyMansion3_circleLawn",
    { diameter: 22, height: 0.12, tessellation: 48 },
    scene
  );
  circleLawn.position = new BABYLON.Vector3(0, 0.16, -10);
  circleLawn.material = mat(
    "mansion3_circleGrass",
    new BABYLON.Color3(0.2, 0.55, 0.22)
  );
  circleLawn.parent = root;
  circleLawn.isPickable = false;

  // Anillo interior del diseño
  const innerRing = BABYLON.MeshBuilder.CreateTorus(
    "beverlyMansion3_innerRing",
    { diameter: 10, thickness: 0.35, tessellation: 40 },
    scene
  );
  innerRing.position = new BABYLON.Vector3(0, 0.22, -10);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.material = stoneMat;
  innerRing.parent = root;
  innerRing.isPickable = false;

  // =========================
  // CUERPO PRINCIPAL DE LA MANSÓN
  // =========================

  // Bloque central alto
  const mainBlock = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_mainBlock",
    { width: 18, height: 8.5, depth: 14 },
    scene
  );
  mainBlock.position = new BABYLON.Vector3(0, 4.4, 4);
  mainBlock.material = wallWhite;
  mainBlock.parent = root;
  mainBlock.isPickable = false;

  // Ala izquierda
  const leftWing = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_leftWing",
    { width: 12, height: 6.5, depth: 12 },
    scene
  );
  leftWing.position = new BABYLON.Vector3(-13, 3.4, 3);
  leftWing.material = wallWhite;
  leftWing.parent = root;
  leftWing.isPickable = false;

  // Ala derecha (más baja, estilo terraza)
  const rightWing = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_rightWing",
    { width: 11, height: 5.5, depth: 11 },
    scene
  );
  rightWing.position = new BABYLON.Vector3(13, 2.9, 2.5);
  rightWing.material = wallWhite;
  rightWing.parent = root;
  rightWing.isPickable = false;

  // Torre / volumen curvo derecho (aprox con cilindro)
  const curvedTower = BABYLON.MeshBuilder.CreateCylinder(
    "beverlyMansion3_curvedTower",
    { diameter: 9, height: 6.2, tessellation: 24 },
    scene
  );
  curvedTower.position = new BABYLON.Vector3(8, 3.3, -3);
  curvedTower.material = wallWhite;
  curvedTower.parent = root;
  curvedTower.isPickable = false;

  // Terraza superior curva
  const topTerrace = BABYLON.MeshBuilder.CreateCylinder(
    "beverlyMansion3_topTerrace",
    { diameter: 10, height: 0.35, tessellation: 24 },
    scene
  );
  topTerrace.position = new BABYLON.Vector3(8, 6.55, -3);
  topTerrace.material = wallCream;
  topTerrace.parent = root;
  topTerrace.isPickable = false;

  // Baranda de la terraza superior
  const terraceRail = BABYLON.MeshBuilder.CreateTorus(
    "beverlyMansion3_terraceRail",
    { diameter: 9.2, thickness: 0.12, tessellation: 28 },
    scene
  );
  terraceRail.position = new BABYLON.Vector3(8, 7.0, -3);
  terraceRail.rotation.x = Math.PI / 2;
  terraceRail.material = wallWhite;
  terraceRail.parent = root;
  terraceRail.isPickable = false;

  // =========================
  // TECHO PLANO CON REMATES
  // =========================

  const roofMain = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_roofMain",
    { width: 19, height: 0.4, depth: 15 },
    scene
  );
  roofMain.position = new BABYLON.Vector3(0, 8.85, 4);
  roofMain.material = roofFlat;
  roofMain.parent = root;
  roofMain.isPickable = false;

  // Chimeneas / remates
  for (const x of [-6, 6]) {
    const chimney = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion3_chimney",
      { width: 1.4, height: 1.8, depth: 1.4 },
      scene
    );
    chimney.position = new BABYLON.Vector3(x, 9.9, 2);
    chimney.material = wallCream;
    chimney.parent = root;
    chimney.isPickable = false;
  }

  // =========================
  // TERRAZAS Y BALCONES FRONTALES
  // =========================

  // Terraza larga frontal
  const frontTerrace = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_frontTerrace",
    { width: 36, height: 0.3, depth: 4.5 },
    scene
  );
  frontTerrace.position = new BABYLON.Vector3(0, 2.9, -4.5);
  frontTerrace.material = wallCream;
  frontTerrace.parent = root;
  frontTerrace.isPickable = false;

  // Columnas de la terraza
  for (const x of [-14, -8, -3, 3, 8, 14]) {
    const col = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion3_col",
      { height: 2.7, diameter: 0.45, tessellation: 12 },
      scene
    );
    col.position = new BABYLON.Vector3(x, 1.5, -6.2);
    col.material = wallWhite;
    col.parent = root;
    col.isPickable = false;
  }

  // Balaustrada frontal
  const frontRail = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_frontRail",
    { width: 35, height: 0.7, depth: 0.15 },
    scene
  );
  frontRail.position = new BABYLON.Vector3(0, 3.35, -6.6);
  frontRail.material = wallWhite;
  frontRail.parent = root;
  frontRail.isPickable = false;

  // =========================
  // ENTRADA PRINCIPAL
  // =========================

  const entrance = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_entrance",
    { width: 6, height: 4.2, depth: 2.5 },
    scene
  );
  entrance.position = new BABYLON.Vector3(0, 2.3, -5.5);
  entrance.material = wallCream;
  entrance.parent = root;
  entrance.isPickable = false;

  const door = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_door",
    { width: 2.8, height: 3.2, depth: 0.2 },
    scene
  );
  door.position = new BABYLON.Vector3(0, 1.8, -6.85);
  door.material = woodWarm;
  door.parent = root;
  door.isPickable = false;

  // Escaleras de acceso
  for (let i = 0; i < 5; i++) {
    const step = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion3_step_${i}`,
      { width: 5.5 - i * 0.15, height: 0.18, depth: 0.75 },
      scene
    );
    step.position = new BABYLON.Vector3(
      0,
      0.2 + i * 0.18,
      -8.5 - i * 0.5
    );
    step.material = stoneMat;
    step.parent = root;
    step.isPickable = false;
  }

  // =========================
  // VENTANAS ILUMINADAS
  // =========================

  const windows = [
    // Planta baja
    { x: -14, y: 2.2, z: -3.2, w: 2.2, h: 2.0 },
    { x: -10, y: 2.2, z: -3.2, w: 2.2, h: 2.0 },
    { x: -5, y: 2.2, z: -3.2, w: 2.0, h: 2.0 },
    { x: 5, y: 2.2, z: -3.2, w: 2.0, h: 2.0 },
    { x: 11, y: 2.0, z: -3.5, w: 2.2, h: 1.8 },
    { x: 15, y: 2.0, z: -3.5, w: 2.2, h: 1.8 },
    // Segundo piso
    { x: -10, y: 6.2, z: -3.0, w: 2.3, h: 2.1 },
    { x: -5, y: 6.2, z: -3.0, w: 2.3, h: 2.1 },
    { x: 0, y: 6.2, z: -3.0, w: 2.5, h: 2.1 },
    { x: 5, y: 6.2, z: -3.0, w: 2.3, h: 2.1 },
    { x: 10, y: 5.5, z: -3.5, w: 2.0, h: 1.8 },
    // Torre curva
    { x: 6, y: 3.5, z: -7.3, w: 1.8, h: 1.8 },
    { x: 10, y: 3.5, z: -7.3, w: 1.8, h: 1.8 },
    { x: 8, y: 5.2, z: -7.3, w: 1.6, h: 1.4 },
  ];

  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const frame = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion3_winFrame_${i}`,
      { width: w.w + 0.2, height: w.h + 0.2, depth: 0.15 },
      scene
    );
    frame.position = new BABYLON.Vector3(w.x, w.y, w.z);
    frame.material = wallCream;
    frame.parent = root;
    frame.isPickable = false;

    const glass = BABYLON.MeshBuilder.CreateBox(
      `beverlyMansion3_winGlass_${i}`,
      { width: w.w, height: w.h, depth: 0.1 },
      scene
    );
    glass.position = new BABYLON.Vector3(w.x, w.y, w.z - 0.08);
    glass.material = glassWarm;
    glass.parent = root;
    glass.isPickable = false;
  }

  // =========================
  // BALAUSTRADA CURVA DEL JARDÍN
  // =========================

  for (let i = 0; i < 20; i++) {
    const angle = (i / 19) * Math.PI - Math.PI / 2;
    const radius = 18;
    const bx = Math.sin(angle) * radius;
    const bz = -10 + Math.cos(angle) * radius * 0.55;

    const post = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion3_balPost",
      { width: 0.35, height: 1.1, depth: 0.35 },
      scene
    );
    post.position = new BABYLON.Vector3(bx, 0.7, bz);
    post.material = wallWhite;
    post.parent = root;
    post.isPickable = false;
  }

  // Muro bajo blanco perimetral
  for (const [wx, wz, ww, wd] of [
    [-18, -18, 12, 0.5],
    [18, -18, 12, 0.5],
    [0, -22, 20, 0.5],
  ] as [number, number, number, number][]) {
    const wall = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion3_gardenWall",
      { width: ww, height: 1.3, depth: wd },
      scene
    );
    wall.position = new BABYLON.Vector3(wx, 0.75, wz);
    wall.material = wallWhite;
    wall.parent = root;
    wall.isPickable = false;
  }

  // =========================
  // SETOS Y JARDÍN
  // =========================

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const hx = Math.cos(angle) * 16;
    const hz = -10 + Math.sin(angle) * 9;

    const hedge = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion3_hedge",
      { width: 2.8, height: 1.4, depth: 1.1 },
      scene
    );
    hedge.position = new BABYLON.Vector3(hx, 0.85, hz);
    hedge.rotation.y = -angle;
    hedge.material = hedgeMat3;
    hedge.parent = root;
    hedge.isPickable = false;
  }

  // Estatua (caballo estilizado)
  const statueBase = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_statueBase",
    { width: 1.6, height: 0.35, depth: 1.0 },
    scene
  );
  statueBase.position = new BABYLON.Vector3(-5, 0.35, -12);
  statueBase.material = stoneMat;
  statueBase.parent = root;
  statueBase.isPickable = false;

  const horseBody = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_horseBody",
    { width: 0.7, height: 0.7, depth: 1.5 },
    scene
  );
  horseBody.position = new BABYLON.Vector3(-5, 1.0, -12);
  horseBody.material = statueMat;
  horseBody.parent = root;
  horseBody.isPickable = false;

  const horseNeck = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_horseNeck",
    { width: 0.35, height: 0.9, depth: 0.4 },
    scene
  );
  horseNeck.position = new BABYLON.Vector3(-5, 1.55, -12.7);
  horseNeck.material = statueMat;
  horseNeck.parent = root;
  horseNeck.isPickable = false;

  const horseHead = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_horseHead",
    { width: 0.3, height: 0.3, depth: 0.55 },
    scene
  );
  horseHead.position = new BABYLON.Vector3(-5, 2.0, -13.0);
  horseHead.material = statueMat;
  horseHead.parent = root;
  horseHead.isPickable = false;

  // =========================
  // LUCES
  // =========================

  for (const x of [-12, -6, 0, 6, 12]) {
    const lamp = BABYLON.MeshBuilder.CreateSphere(
      "beverlyMansion3_lamp",
      { diameter: 0.3, segments: 8 },
      scene
    );
    lamp.position = new BABYLON.Vector3(x, 3.5, -6.3);
    lamp.material = lightMat3;
    lamp.parent = root;
    lamp.isPickable = false;
  }

  const facadeLight = new BABYLON.PointLight(
    "beverlyMansion3_facadeLight",
    BABYLON.Vector3.Zero(),
    scene
  );
  facadeLight.parent = root;
  facadeLight.position = new BABYLON.Vector3(0, 6, -10);
  facadeLight.diffuse = new BABYLON.Color3(1, 0.85, 0.55);
  facadeLight.specular = BABYLON.Color3.Black();
  facadeLight.intensity = 1.5;
  facadeLight.range = 28;

  // =========================
  // ZONA TRASERA: PISCINA
  // =========================

  const backDeck = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_backDeck",
    { width: 28, height: 0.22, depth: 18 },
    scene
  );
  backDeck.position = new BABYLON.Vector3(0, 0.25, 18);
  backDeck.material = deckMat3;
  backDeck.parent = root;
  backDeck.isPickable = false;

  // Piscina grande tipo infinity
  const pool = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_pool",
    { width: 14, height: 0.4, depth: 8 },
    scene
  );
  pool.position = new BABYLON.Vector3(-4, 0.35, 17);
  pool.material = poolMat3;
  pool.parent = root;
  pool.isPickable = false;

  const poolBorder = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_poolBorder",
    { width: 15.5, height: 0.18, depth: 9.5 },
    scene
  );
  poolBorder.position = new BABYLON.Vector3(-4, 0.28, 17);
  poolBorder.material = stoneMat;
  poolBorder.parent = root;
  poolBorder.isPickable = false;

  // Tumbonas
  for (const [sx, sz] of [
    [-12, 14],
    [-12, 17],
    [-12, 20],
    [5, 14],
    [5, 17],
  ] as [number, number][]) {
    const lounger = BABYLON.MeshBuilder.CreateBox(
      "beverlyMansion3_lounger",
      { width: 0.95, height: 0.28, depth: 2.1 },
      scene
    );
    lounger.position = new BABYLON.Vector3(sx, 0.5, sz);
    lounger.material = wallWhite;
    lounger.parent = root;
    lounger.isPickable = false;
  }

  // Sombrillas
  for (const [ux, uz] of [
    [-12, 15.5],
    [5, 15.5],
  ] as [number, number][]) {
    const pole = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion3_umbPole",
      { height: 2.5, diameter: 0.08, tessellation: 8 },
      scene
    );
    pole.position = new BABYLON.Vector3(ux, 1.5, uz);
    pole.material = metalDark;
    pole.parent = root;
    pole.isPickable = false;

    const umb = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion3_umb",
      {
        height: 0.22,
        diameterTop: 0.1,
        diameterBottom: 2.8,
        tessellation: 16,
      },
      scene
    );
    umb.position = new BABYLON.Vector3(ux, 2.75, uz);
    umb.material = mat(
      "mansion3_umbCloth",
      new BABYLON.Color3(0.9, 0.88, 0.82)
    );
    umb.parent = root;
    umb.isPickable = false;
  }

  // =========================
  // CANCHA DE TENIS
  // =========================

  const tennis = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_tennis",
    { width: 10, height: 0.1, depth: 6 },
    scene
  );
  tennis.position = new BABYLON.Vector3(12, 0.28, 16);
  tennis.material = tennisMat;
  tennis.parent = root;
  tennis.isPickable = false;

  // Líneas de la cancha
  const net = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_tennisNet",
    { width: 0.08, height: 1.0, depth: 5.5 },
    scene
  );
  net.position = new BABYLON.Vector3(12, 0.8, 16);
  net.material = metalDark;
  net.parent = root;
  net.isPickable = false;

  const midLine = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_tennisLine",
    { width: 9.5, height: 0.05, depth: 0.08 },
    scene
  );
  midLine.position = new BABYLON.Vector3(12, 0.34, 16);
  midLine.material = wallWhite;
  midLine.parent = root;
  midLine.isPickable = false;

  // =========================
  // ÁREA DE JUEGOS
  // =========================

  // Suelo de juegos
  const playFloor = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_playFloor",
    { width: 8, height: 0.12, depth: 6 },
    scene
  );
  playFloor.position = new BABYLON.Vector3(12, 0.28, 8);
  playFloor.material = mat(
    "mansion3_playFloor",
    new BABYLON.Color3(0.35, 0.55, 0.35)
  );
  playFloor.parent = root;
  playFloor.isPickable = false;

  // Tobogán (estilizado)
  const slideBase = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_slideBase",
    { width: 1.2, height: 2.2, depth: 1.2 },
    scene
  );
  slideBase.position = new BABYLON.Vector3(10, 1.2, 8);
  slideBase.material = playMat;
  slideBase.parent = root;
  slideBase.isPickable = false;

  const slide = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_slide",
    { width: 0.9, height: 0.15, depth: 2.5 },
    scene
  );
  slide.position = new BABYLON.Vector3(11.2, 1.3, 8);
  slide.rotation.z = -0.45;
  slide.material = mat(
    "mansion3_slide",
    new BABYLON.Color3(0.2, 0.55, 0.9)
  );
  slide.parent = root;
  slide.isPickable = false;

  // Columpio (marco)
  for (const x of [13.5, 15.5]) {
    const swingPole = BABYLON.MeshBuilder.CreateCylinder(
      "beverlyMansion3_swingPole",
      { height: 2.4, diameter: 0.12, tessellation: 8 },
      scene
    );
    swingPole.position = new BABYLON.Vector3(x, 1.3, 7);
    swingPole.material = metalDark;
    swingPole.parent = root;
    swingPole.isPickable = false;
  }

  const swingTop = BABYLON.MeshBuilder.CreateCylinder(
    "beverlyMansion3_swingTop",
    { height: 2.2, diameter: 0.1, tessellation: 8 },
    scene
  );
  swingTop.rotation.z = Math.PI / 2;
  swingTop.position = new BABYLON.Vector3(14.5, 2.45, 7);
  swingTop.material = metalDark;
  swingTop.parent = root;
  swingTop.isPickable = false;

  const seat = BABYLON.MeshBuilder.CreateBox(
    "beverlyMansion3_swingSeat",
    { width: 0.7, height: 0.08, depth: 0.3 },
    scene
  );
  seat.position = new BABYLON.Vector3(14.5, 1.0, 7);
  seat.material = woodWarm;
  seat.parent = root;
  seat.isPickable = false;

  // =========================
  // REGISTRO
  // =========================

  activeMapMeshes.push(root);
  registerChunkMesh(root);

  return root;
}
function createRaceLine(
  lon: number,
  lat: number,
  color: BABYLON.Color3
) {
  const pos = lonLatToWorld(lon, lat);

  const matRace = mat(
    "raceLineMat",
    color
  );

  const line = BABYLON.MeshBuilder.CreateBox(
    "raceLine",
    {
      width: 12,
      height: 0.05,
      depth: 1.5
    },
    scene
  );

  line.position = new BABYLON.Vector3(
    pos.x,
    0.12,
    pos.z
  );

  line.material = matRace;

  return line;
}
function createDeliveryAura(name: string) {
  const auraMat = new BABYLON.StandardMaterial(name + "_mat", scene);
  auraMat.diffuseColor = new BABYLON.Color3(1, 0.1, 0.75);
  auraMat.emissiveColor = new BABYLON.Color3(1, 0.1, 0.75);
  auraMat.alpha = 0.65;

  const aura = BABYLON.MeshBuilder.CreateCylinder(
    name,
    {
      diameter: 8,
      height: 0.32,
      tessellation: 64,
    },
    scene
  );

  aura.position.y = 0.28;
  aura.material = auraMat;
  aura.setEnabled(false);

  registerCullable(aura);
  registerChunkMesh(aura);

  return aura;
}

function setDeliveryOfficeAuraPosition() {
  if (!deliveryOfficeAura) {
    deliveryOfficeAura = createDeliveryAura(
      "deliveryOfficeAura"
    );
  }

  const office = lonLatToWorld(
    deliveryOfficePoint.lon,
    deliveryOfficePoint.lat
  );

  deliveryOfficeAura.position.x = office.x;
  deliveryOfficeAura.position.y = 0.32;
  deliveryOfficeAura.position.z = office.z;

  // Tamaño inicial exclusivo del edificio Niu Digital World
  deliveryOfficeAura.scaling = new BABYLON.Vector3(
    2.5,
    1,
    2.5
  );

  deliveryOfficeAura.setEnabled(true);
}

function setDeliveryStoreAuraPosition() {
  if (!deliveryStoreAura) {
    deliveryStoreAura = createDeliveryAura("deliveryStoreAura");
  }

  const store = deliveryStores[deliveryStoreIndex];

  const pos = lonLatToWorld(
    store.lon,
    store.lat
  );

  deliveryStoreAura.position.x = pos.x;
  deliveryStoreAura.position.z = pos.z;
  deliveryStoreAura.setEnabled(true);
}
function showMedicineDeliveryMissionCard() {
  missionCard.style.display = "block";

  const objectiveText =
    medicineDeliveryStage === "goToHospital"
      ? "Dirígete al Manhattan Hospital para recoger las medicinas."
      : "Lleva las medicinas a la casa ubicada en 15th St.";

  missionCard.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:8px;
      margin-bottom:10px;
    ">
      <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#e83e8c;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      ">
        💊
      </div>

      <div style="
        font-size:16px;
        font-weight:bold;
      ">
        MISIÓN ACTIVA
      </div>
    </div>

    <div style="
      color:#ff70b3;
      font-weight:bold;
      font-size:14px;
      margin-bottom:9px;
    ">
      Entrega Medicina
    </div>

    <div style="
      font-size:13px;
      line-height:1.4;
      margin-bottom:10px;
    ">
      ${objectiveText}
    </div>

    <div style="
      padding:8px;
      margin-bottom:10px;
      border-radius:8px;
      background:rgba(190,20,80,0.18);
      color:#ff7cac;
      font-size:12px;
      font-weight:bold;
      text-align:center;
    ">
      ⚠ CUIDADO CON LOS FANTASMAS
    </div>

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:7px;
      font-size:13px;
    ">
      <span>Entregas:</span>

      <strong style="color:white;">
        ${medicineDeliveryCount}
      </strong>
    </div>

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:9px;
      font-size:13px;
    ">
      <span>Pago por entrega:</span>

      <strong style="
        color:#ffd23c;
        font-size:17px;
      ">
        🟡 ${medicineDeliveryReward}
      </strong>
    </div>

    <div style="
      font-size:12px;
      color:#cccccc;
    ">
      Presiona 3 para cancelar.
    </div>
  `;
}
async function startMedicineDeliveryMission() {
  // La misión solo puede iniciarse en Manhattan.
  if (currentMapName !== "manhattan") {
    showMissionMessage(
      "La misión Entrega Medicina solo está disponible en Manhattan.",
      5000
    );

    return;
  }

  // Validar que el hospital y la casa estén creados.
  if (
    !manhattanHospitalRoot ||
    manhattanHospitalRoot.isDisposed() ||
    !manhattanHospitalEntranceAura ||
    manhattanHospitalEntranceAura.isDisposed()
  ) {
    showMissionMessage(
      "El Manhattan Hospital todavía no está disponible.",
      5000
    );

    return;
  }

  if (
    !manhattanMedicineHouse1Root ||
    manhattanMedicineHouse1Root.isDisposed() ||
    !manhattanMedicineHouse1Aura ||
    manhattanMedicineHouse1Aura.isDisposed()
  ) {
    showMissionMessage(
      "La casa de entrega todavía no está disponible.",
      5000
    );

    return;
  }

  await loadGpsGraph();

  // Cancela cualquier otra misión activa.
  cancelCurrentMission();

  medicineDeliveryMissionActive = true;
  medicineDeliveryStage = "goToHospital";
  medicineDeliveryCount = 0;

  currentMedicineHouseIndex = 0;

  medicineHospitalAuraTouched = false;
  medicineHouseAuraTouched = false;

  enableMedicineHospitalAura();
  disableMedicineHouseAura();

  // Crear los fantasmas únicamente
// cuando comienza la misión.
medicineMissionDefeatProcessing =
  false;

spawnMedicineMissionGhosts();

  setGpsDestination(
    MANHATTAN_HOSPITAL.lon,
    MANHATTAN_HOSPITAL.lat
  );

  // Mostrar únicamente la tarjeta principal
// donde aparece el objetivo y el pago.
hideMedicineMissionPanel();
showMedicineDeliveryMissionCard();

  showMissionMessage(
    "Ve al hospital y recoge las medicinas.",
    5000
  );
}  
function cancelMedicineDeliveryMission(
  showMessage: boolean = true
) {
  medicineDeliveryMissionActive = false;
  medicineDeliveryStage = "inactive";

  medicineHospitalAuraTouched = false;
  medicineHouseAuraTouched = false;

  disableMedicineHospitalAura();
  disableMedicineHouseAura();

  clearMedicineMissionGhosts();

medicineMissionDefeatProcessing =
  false;

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;
  gpsTargetLon = null;
  gpsTargetLat = null;
  gpsCurrentIndex = 0;

  if (gpsArrow) {
    gpsArrow.setEnabled(false);
  }

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  hideMedicineMissionPanel();
  hideMissionCard();

  if (showMessage) {
    showMissionMessage(
      "Misión Entrega Medicina cancelada.",
      3500
    );
  }
}
function getCurrentMedicineHouse() {
    return manhattanMedicineHouses[currentMedicineHouseIndex];
}
function updateMedicineDeliveryMission() {
  if (!medicineDeliveryMissionActive) {
    return;
  }

  // Si por alguna razón se cambia de ciudad,
  // la misión termina automáticamente.
  if (currentMapName !== "manhattan") {
    cancelMedicineDeliveryMission(false);

    showMissionMessage(
      "La misión terminó porque saliste de Manhattan.",
      4500
    );

    return;
  }

  if (!player || !car) {
    return;
  }

  const reference =
    inCar
      ? car.position
      : player.position;

  // =========================
  // IR AL HOSPITAL
  // =========================

  if (
    medicineDeliveryStage === "goToHospital"
  ) {
    if (
      !manhattanHospitalEntranceAura ||
      manhattanHospitalEntranceAura.isDisposed()
    ) {
      return;
    }

    const hospitalAura =
      manhattanHospitalEntranceAura;

    hospitalAura.setEnabled(true);

    hospitalAura.rotation.y += 0.035;

    const hospitalPulse =
      1 +
      Math.sin(
        Date.now() * 0.007
      ) * 0.10;

    hospitalAura.scaling.x =
      hospitalPulse;

    hospitalAura.scaling.z =
      hospitalPulse;

    /*
     * El aro tiene como padre el hospital.
     * Debemos obtener su posición mundial.
     */
    hospitalAura.computeWorldMatrix(true);

    const hospitalAuraWorldPosition =
      hospitalAura.getAbsolutePosition();

    const hospitalDx =
      reference.x -
      hospitalAuraWorldPosition.x;

    const hospitalDz =
      reference.z -
      hospitalAuraWorldPosition.z;

    const hospitalDistance =
      Math.sqrt(
        hospitalDx * hospitalDx +
        hospitalDz * hospitalDz
      );

    const touchingHospital =
      hospitalDistance < 6;

    if (touchingHospital) {
      if (!medicineHospitalAuraTouched) {
        medicineHospitalAuraTouched = true;

        medicineDeliveryStage =
          "goToHouse";

        disableMedicineHospitalAura();
        enableMedicineHouseAura();

        medicineHouseAuraTouched = false;

        const house = getCurrentMedicineHouse();

setGpsDestination(
    house.lon,
    house.lat
);

        showMedicineDeliveryMissionCard();

        showMissionMessage(
    `Medicinas recogidas. Ve a ${house.addressLine1}.`,
    5000
);
      }
    } else if (hospitalDistance > 9) {
      medicineHospitalAuraTouched = false;
    }

    return;
  }

  // =========================
  // IR A LA CASA
  // =========================

  if (
    medicineDeliveryStage === "goToHouse"
  ) {
    if (
      !manhattanMedicineHouse1Aura ||
      manhattanMedicineHouse1Aura.isDisposed()
    ) {
      return;
    }

    const house =
    getCurrentMedicineHouse();

const houseAura =
    house.aura;

    houseAura.setEnabled(true);

    houseAura.rotation.y += 0.035;

    const housePulse =
      1 +
      Math.sin(
        Date.now() * 0.007
      ) * 0.10;

    houseAura.scaling.x =
      housePulse;

    houseAura.scaling.z =
      housePulse;

    /*
     * El aro está colocado como hijo de la casa,
     * por lo que usamos su posición absoluta.
     */
    houseAura.computeWorldMatrix(true);

    const houseAuraWorldPosition =
      houseAura.getAbsolutePosition();

    const houseDx =
      reference.x -
      houseAuraWorldPosition.x;

    const houseDz =
      reference.z -
      houseAuraWorldPosition.z;

    const houseDistance =
      Math.sqrt(
        houseDx * houseDx +
        houseDz * houseDz
      );

    const touchingHouse =
      houseDistance < 6;

    if (touchingHouse) {
      if (!medicineHouseAuraTouched) {
        medicineHouseAuraTouched = true;

        addDigitalCoins(
          medicineDeliveryReward
        );

        medicineDeliveryCount++;

// Pasar a la siguiente casa
currentMedicineHouseIndex++;

if (
    currentMedicineHouseIndex >=
    manhattanMedicineHouses.length
) {
    currentMedicineHouseIndex = 0;
}

medicineDeliveryStage = "goToHospital";

disableMedicineHouseAura();
enableMedicineHospitalAura();

medicineHospitalAuraTouched = false;

setGpsDestination(
    MANHATTAN_HOSPITAL.lon,
    MANHATTAN_HOSPITAL.lat
);

        updateMedicineMissionPanel();
        showMedicineDeliveryMissionCard();

        showMissionMessage(
          `Medicina entregada. Ganaste ${medicineDeliveryReward} monedas. Regresa al hospital.`,
          5500
        );
      }
    } else if (houseDistance > 9) {
      medicineHouseAuraTouched = false;
    }
  }
}
function showDeliveryMissionCard() {
  const currentStore = deliveryStores[deliveryStoreIndex];

  missionCard.style.display = "block";

  missionCard.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
      <div style="
        width:28px;
        height:28px;
        border-radius:8px;
        background:#8b35ff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:17px;
      ">
        📦
      </div>

      <div style="font-size:16px;font-weight:bold;">
        MISIÓN ACTIVA
      </div>
    </div>

    <div style="color:#b86cff;font-weight:bold;margin-bottom:10px;">
      Entrega y Recojo
    </div>

    <div style="font-size:13px;margin-bottom:10px;line-height:1.35;">
      ${
        deliveryMissionStage === "goToOffice"
          ? "Ve al edificio Niu Digital World para iniciar el reparto."
          : deliveryMissionStage === "goToStore"
          ? "Ve a recoger el pedido en: " + currentStore.name
          : "Regresa al edificio Niu Digital World para entregar el pedido."
      }
    </div>

    <div style="font-size:12px;color:#ccc;margin-bottom:10px;">
      Para cancelar presiona 3.
    </div>

    <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:10px;">
      <span>Pago por entrega</span>
      <span style="color:#ffd23c;font-size:18px;">🟡 ${deliveryReward}</span>
    </div>
  `;
}

async function startDeliveryAndPickupMission() {
  await loadGpsGraph();

  cancelCurrentMission();

  deliveryMissionActive = true;
  deliveryMissionStage = "goToOffice";
  deliveryStoreIndex = 0;

  setDeliveryOfficeAuraPosition();

  if (deliveryStoreAura) {
    deliveryStoreAura.setEnabled(false);
  }

  setGpsDestination(
    deliveryOfficePoint.lon,
    deliveryOfficePoint.lat
  );

  showDeliveryMissionCard();

  showMissionMessage(
    "Entrega y Recojo iniciada. Ve a Niu Digital World."
  );
}

function finishDeliveryMission() {
  deliveryMissionActive = false;
  deliveryMissionStage = "inactive";

  if (deliveryOfficeAura) {
    deliveryOfficeAura.setEnabled(false);
  }

  if (deliveryStoreAura) {
    deliveryStoreAura.setEnabled(false);
  }

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;
  gpsTargetLon = null;
  gpsTargetLat = null;

  if (gpsArrow) {
    gpsArrow.setEnabled(false);
  }

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  hideMissionCard();

  showMissionMessage("Entrega y Recojo cancelada");
}

function updateDeliveryAndPickupMission() {
  if (!deliveryMissionActive) return;
  if (!car) return;

  if (deliveryOfficeAura) {
  deliveryOfficeAura.rotation.y += 0.04;

  // Aro grande exclusivo de Niu Digital World
  const officePulse =
    2.5 +
    Math.sin(Date.now() * 0.008) * 0.25;

  deliveryOfficeAura.scaling.x = officePulse;
  deliveryOfficeAura.scaling.y = 1;
  deliveryOfficeAura.scaling.z = officePulse;
}

  if (deliveryStoreAura) {
    deliveryStoreAura.rotation.y += 0.04;

    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
    deliveryStoreAura.scaling.x = pulse;
    deliveryStoreAura.scaling.z = pulse;
  }

  if (deliveryMissionStage === "goToOffice") {
    if (!deliveryOfficeAura) return;

    const dx = car.position.x - deliveryOfficeAura.position.x;
    const dz = car.position.z - deliveryOfficeAura.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 11) return;

    deliveryMissionStage = "goToStore";

    deliveryOfficeAura.setEnabled(false);
    setDeliveryStoreAuraPosition();

    const store = deliveryStores[deliveryStoreIndex];

    setGpsDestination(
      store.lon,
      store.lat
    );

    showDeliveryMissionCard();

    showMissionMessage(
      "Pedido asignado. Ve a " + store.name
    );

    return;
  }

  if (deliveryMissionStage === "goToStore") {
    if (!deliveryStoreAura) return;

    const dx = car.position.x - deliveryStoreAura.position.x;
    const dz = car.position.z - deliveryStoreAura.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 11) return;

    deliveryMissionStage = "returnToOffice";

    deliveryStoreAura.setEnabled(false);
    setDeliveryOfficeAuraPosition();

    setGpsDestination(
      deliveryOfficePoint.lon,
      deliveryOfficePoint.lat
    );

    showDeliveryMissionCard();

    showMissionMessage(
      "Pedido recogido. Regresa a Niu Digital World."
    );

    return;
  }

  if (deliveryMissionStage === "returnToOffice") {
    if (!deliveryOfficeAura) return;

    const dx = car.position.x - deliveryOfficeAura.position.x;
    const dz = car.position.z - deliveryOfficeAura.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 8) return;

    addDigitalCoins(deliveryReward);

    deliveryStoreIndex++;

    if (deliveryStoreIndex >= deliveryStores.length) {
      deliveryStoreIndex = 0;
    }

    deliveryMissionStage = "goToStore";

    deliveryOfficeAura.setEnabled(false);
    setDeliveryStoreAuraPosition();

    const nextStore = deliveryStores[deliveryStoreIndex];

    setGpsDestination(
      nextStore.lon,
      nextStore.lat
    );

    showDeliveryMissionCard();

    showMissionMessage(
      `Entrega completada. Ganaste ${deliveryReward} monedas. Nueva caseta: ${nextStore.name}`,
      5000
    );

    return;
  }
}
async function startRouteMission(config: RouteMissionConfig) {
  await loadGpsGraph();

  cancelCurrentMission();

  currentRouteMission = config;
  currentRouteIndex = 0;
  routeMissionActive = true;

  showRouteMissionCard();

  for (const mesh of currentRouteCheckpoints) {
    mesh.dispose();
  }

  currentRouteCheckpoints.length = 0;

  const checkpointMat = new BABYLON.StandardMaterial(
    "routeCheckpointMat",
    scene
  );

  checkpointMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
  checkpointMat.emissiveColor = new BABYLON.Color3(1, 0, 1);
  checkpointMat.alpha = 0.55;

  for (const point of config.points) {
    const world = lonLatToWorld(point[1], point[0]);

    const aura = BABYLON.MeshBuilder.CreateCylinder(
      "routeCheckpoint",
      {
        diameter: 7,
        height: 0.3,
        tessellation: 48,
      },
      scene
    );

    aura.position = new BABYLON.Vector3(world.x, 0.25, world.z);
    aura.material = checkpointMat;
    aura.setEnabled(false);

    currentRouteCheckpoints.push(aura);
  }

  if (currentRouteCheckpoints.length > 0) {
    currentRouteCheckpoints[0].setEnabled(true);
  }

  updateChunks();
  updateMapVisibility();
  updateCulling();

  setRouteGpsToCurrentCheckpoint();

  showMissionMessage(config.name);
}
function isGreenArea(props: any) {
  if (!props) return false;

  return (
    // Parques y ocio
    props.leisure === "park" ||
    props.leisure === "garden" ||
    props.leisure === "nature_reserve" ||
    props.leisure === "recreation_ground" ||
    props.leisure === "playground" ||
    props.leisure === "pitch" ||
    props.leisure === "golf_course" ||

    // Suelos
    props.landuse === "grass" ||
    props.landuse === "forest" ||
    props.landuse === "meadow" ||
    props.landuse === "recreation_ground" ||
    props.landuse === "village_green" ||
    props.landuse === "orchard" ||
    props.landuse === "cemetery" ||
    props.landuse === "allotments" ||

    // Natural
    props.natural === "wood" ||
    props.natural === "scrub" ||
    props.natural === "grassland" ||
    props.natural === "heath" ||
    props.natural === "tree_row" ||

    // Cobertura
    props.landcover === "grass" ||
    props.landcover === "trees" ||

    // Jardines
    props["garden:type"] !== undefined
  );
}

function getGreenAreaMaterial(props: any) {
  const isLightGrass =
    props.landuse === "grass" ||
    props.landuse === "meadow" ||
    props.landuse === "village_green" ||
    props.natural === "grassland" ||
    props.landcover === "grass";

  return isLightGrass ? grassMat : parkMat;
}
async function loadMap(fileName: string) {
    const response = await fetch(`/data/${fileName}`);

  if (!response.ok) {
    alert(`No se encontró public/data/${fileName}`);
    return;
  }

  const geojson = await response.json();

  for (const feature of geojson.features) {
    const props = feature.properties || {};
    const geometry = feature.geometry;

    if (!geometry) continue;

    // Calles
    if (props.highway && geometry.type === "LineString") {
      const width = roadWidth(props.highway);
      if (width !== 0) {
        const coords = geometry.coordinates;

        for (let i = 0; i < coords.length - 1; i++) {
          const a = lonLatToWorld(coords[i][0], coords[i][1]);
          const b = lonLatToWorld(coords[i + 1][0], coords[i + 1][1]);

          createRoad(
  a,
  b,
  width,
  props.name,
  props.oneway === "yes"
);
        }
      }
    }

  // =========================
// ÁREAS VERDES REALES
// (Miraflores, Manhattan, Beverly Hills, etc.)
// =========================

if (isGreenArea(props)) {
  const groups = getGroups(geometry);
  const greenMaterial = getGreenAreaMaterial(props);

  for (const group of groups) {
    if (!Array.isArray(group) || group.length < 3) continue;

    // Filtrar coordenadas válidas [lon, lat]
    let coordinates = group.filter(
      (coordinate: any) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2 &&
        Number.isFinite(Number(coordinate[0])) &&
        Number.isFinite(Number(coordinate[1]))
    );

    // Polígonos enormes de Manhattan: simplificar un poco
    if (coordinates.length > 80) {
      const step = Math.ceil(coordinates.length / 80);
      const simplified: any[] = [];
      for (let i = 0; i < coordinates.length; i += step) {
        simplified.push(coordinates[i]);
      }
      // Asegurar cierre aproximado
      if (simplified.length >= 3) {
        coordinates = simplified;
      }
    }

    if (coordinates.length < 3) continue;

    const points = coordinates.map((coordinate: any) =>
      lonLatToWorld(Number(coordinate[0]), Number(coordinate[1]))
    );

    // Evitar polígonos degenerados (casi una línea)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    }
    if (maxX - minX < 2 && maxZ - minZ < 2) continue;

    try {
      createPolygon(
        "green_area",
        points,
        greenMaterial,
        0.08
      );
    } catch (error) {
      console.warn("No se pudo crear área verde:", error);
    }

    // Árboles extra solo en Beverly Hills (como ya tenías)
    if (currentMapName === "beverly-hills") {
      for (let i = 0; i < points.length; i += 2) {
        const p = points[i];
        createTree(p.x, p.z);
      }
    }
  }
}

    // Edificios reales desde OpenStreetMap
    if (props.building) {
      const groups = getGroups(geometry);

      for (const group of groups) {
        const points = group.map((c: any) => lonLatToWorld(c[0], c[1]));

        let cx = 0;
        let cz = 0;

        for (const p of points) {
          cx += p.x;
          cz += p.z;
        }

        cx /= points.length;
        cz /= points.length;

        let buildingHeight = 12;

// altura real si existe
if (props.height) {

  const parsedHeight =
    parseFloat(props.height);

  if (!isNaN(parsedHeight)) {
    buildingHeight = parsedHeight;
  }
}

// niveles del edificio
else if (props["building:levels"]) {

  const levels =
    parseFloat(props["building:levels"]);

  if (!isNaN(levels)) {
    buildingHeight = levels * 3.2;
  }
}

// Manhattan más alto
else if (currentMapName === "manhattan") {

  buildingHeight =
    25 + Math.random() * 120;
}

// Beverly Hills
else if (currentMapName === "beverly-hills") {

  buildingHeight =
    6 + Math.random() * 8;
}

// Miraflores
else {

  buildingHeight =
    10 + Math.random() * 25;
}

const minX = Math.min(...points.map((p: BABYLON.Vector3) => p.x));
const maxX = Math.max(...points.map((p: BABYLON.Vector3) => p.x));
const minZ = Math.min(...points.map((p: BABYLON.Vector3) => p.z));
const maxZ = Math.max(...points.map((p: BABYLON.Vector3) => p.z));

let buildingWidth = Math.max(4, (maxX - minX) * 0.72);
let buildingDepth = Math.max(4, (maxZ - minZ) * 0.72);

if (currentMapName === "manhattan") {
  buildingWidth = Math.max(4, (maxX - minX) * 0.45);
  buildingDepth = Math.max(4, (maxZ - minZ) * 0.45);
}

if (currentMapName === "miraflores") {
  buildingWidth = Math.max(5, (maxX - minX) * 0.58);
  buildingDepth = Math.max(5, (maxZ - minZ) * 0.58);
}

if (currentMapName === "beverly-hills") {
  buildingWidth = Math.max(4, (maxX - minX) * 0.5);
  buildingDepth = Math.max(4, (maxZ - minZ) * 0.5);
}

const mirafloresColors = [
  new BABYLON.Color3(0.96, 0.88, 0.72),
  new BABYLON.Color3(0.90, 0.82, 0.62),
  new BABYLON.Color3(0.72, 0.80, 0.92),
  new BABYLON.Color3(0.86, 0.86, 0.90),
  new BABYLON.Color3(0.95, 0.78, 0.58),
  new BABYLON.Color3(0.72, 0.62, 0.92),
];

const manhattanColors = [
  new BABYLON.Color3(0.18, 0.22, 0.32),
  new BABYLON.Color3(0.25, 0.28, 0.38),
  new BABYLON.Color3(0.42, 0.45, 0.52),
  new BABYLON.Color3(0.55, 0.58, 0.62),
  new BABYLON.Color3(0.40, 0.34, 0.28),
  new BABYLON.Color3(0.22, 0.42, 0.58),
];

const beverlyColors = [
  new BABYLON.Color3(1.0, 0.42, 0.18),  // coral fuerte
  new BABYLON.Color3(1.0, 0.65, 0.18),  // naranja dorado
  new BABYLON.Color3(0.95, 0.45, 0.08), // terracota viva
  new BABYLON.Color3(1.0, 0.82, 0.25),  // amarillo cálido
  new BABYLON.Color3(0.90, 0.30, 0.16), // adobe intenso
];
const building = BABYLON.MeshBuilder.CreateBox(
  "osmBuilding",
  {
    width: buildingWidth,
    height: buildingHeight,
    depth: buildingDepth,
  },
  scene
);

        building.position = new BABYLON.Vector3(cx, buildingHeight / 2, cz);
        let colors = mirafloresColors;

if (currentMapName === "manhattan") {
  colors = manhattanColors;
}

if (currentMapName === "beverly-hills") {
  colors = beverlyColors;
}

const randomColor =
  colors[Math.floor(Math.random() * colors.length)];

const buildingMat = mat(
  "osmBuildingMat",
  randomColor
);

if (currentMapName === "beverly-hills") {
  buildingMat.emissiveColor = randomColor.scale(0.22);
}

else if (currentMapName === "manhattan") {
  buildingMat.emissiveColor = randomColor.scale(0.18);
}

else {
  buildingMat.emissiveColor = randomColor.scale(0.17);
}

buildingMat.specularColor = new BABYLON.Color3(
  0.12,
  0.12,
  0.12
);

building.material = buildingMat;

        activeMapMeshes.push(building);
        registerChunkMesh(building);
        registerCullable(building);
        if (
  currentMapName === "beverly-hills" &&
  props.building
) {
  for (let i = 0; i < 8; i++) {
    if (Math.random() < 0.95) {
      createTree(
        cx + Math.random() * 34 - 17,
        cz + Math.random() * 34 - 17
      );
    }
  }
}
      }
    }
    
    // Arboles reales desde OpenStreetMap
    if (props.natural === "tree" && geometry.type === "Point") {
      
      const lon = geometry.coordinates[0];
      const lat = geometry.coordinates[1];
      const pos = lonLatToWorld(lon, lat);

      const trunk = BABYLON.MeshBuilder.CreateCylinder(
        "osmTreeTrunk",
        { height: 2, diameter: 0.25 },
        scene
      );
      trunk.position = new BABYLON.Vector3(pos.x, 1, pos.z);
      trunk.material = trunkMat;

      const top = BABYLON.MeshBuilder.CreateSphere(
        "osmTreeTop",
        { diameter: 2.4 },
        scene
      );
      top.position = new BABYLON.Vector3(pos.x, 2.5, pos.z);
      top.material = treeMat;

      activeMapMeshes.push(trunk, top);
      registerChunkMesh(trunk);
      registerChunkMesh(top);
      registerCullable(trunk);
      registerCullable(top);
    }
  }
    console.log("Mapa cargado:", fileName);
}
function createFriendAvatar(friend: any) {
  if (friendAvatars.some((f) => String(f.id) === String(friend.id))) {
    return;
  }

  // Colores iguales al jugador
  const bodyBlue = mat(
    `friendBody_${friend.id}`,
    new BABYLON.Color3(0.1, 0.45, 1) // mismo avatarMat
  );
  const purple = mat(
    `friendPurple_${friend.id}`,
    new BABYLON.Color3(0.36, 0.05, 0.75)
  );
  const dark = mat(
    `friendDark_${friend.id}`,
    new BABYLON.Color3(0.02, 0.02, 0.025)
  );
  const glass = mat(
    `friendGlass_${friend.id}`,
    new BABYLON.Color3(0.08, 0.16, 0.25)
  );
  const tire = mat(
    `friendTire_${friend.id}`,
    new BABYLON.Color3(0.01, 0.01, 0.01)
  );

  const baseX =
    typeof friend.x === "number" && (friend.x !== 0 || friend.z !== 0)
      ? friend.x
      : player
        ? player.position.x + 6
        : 0;
  const baseZ =
    typeof friend.z === "number" && (friend.x !== 0 || friend.z !== 0)
      ? friend.z
      : player
        ? player.position.z + 2
        : 0;

  const root = new BABYLON.TransformNode(`friend_${friend.id}`, scene);
  root.position = new BABYLON.Vector3(baseX, 0, baseZ);

  // ---- AVATAR (como el tuyo) ----
  const avatarRoot = new BABYLON.TransformNode(
    `friendAvatarRoot_${friend.id}`,
    scene
  );
  avatarRoot.parent = root;

  const head = BABYLON.MeshBuilder.CreateSphere(
    `friendHead_${friend.id}`,
    { diameter: 0.55 },
    scene
  );
  head.position = new BABYLON.Vector3(0, 1.05, 0);
  head.material = skinMat;
  head.parent = avatarRoot;

  const body = BABYLON.MeshBuilder.CreateBox(
    `friendBodyMesh_${friend.id}`,
    { width: 0.7, height: 0.8, depth: 0.35 },
    scene
  );
  body.position = new BABYLON.Vector3(0, 0.45, 0);
  body.material = bodyBlue;
  body.parent = avatarRoot;

  for (const [name, x] of [
    ["LArm", -0.55],
    ["RArm", 0.55],
  ] as const) {
    const arm = BABYLON.MeshBuilder.CreateBox(
      `friend${name}_${friend.id}`,
      { width: 0.22, height: 0.65, depth: 0.22 },
      scene
    );
    arm.position = new BABYLON.Vector3(x, 0.45, 0);
    arm.material = bodyBlue;
    arm.parent = avatarRoot;
  }

  for (const [name, x] of [
    ["LLeg", -0.22],
    ["RLeg", 0.22],
  ] as const) {
    const leg = BABYLON.MeshBuilder.CreateBox(
      `friend${name}_${friend.id}`,
      { width: 0.25, height: 0.75, depth: 0.25 },
      scene
    );
    leg.position = new BABYLON.Vector3(x, -0.35, 0);
    leg.material = bodyBlue;
    leg.parent = avatarRoot;
  }

  // ---- AUTO morado (simplificado estilo Niu Sport) ----
  const carRoot = new BABYLON.TransformNode(
    `friendCarRoot_${friend.id}`,
    scene
  );
  carRoot.parent = root;
  carRoot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
  carRoot.setEnabled(false); // por defecto a pie; se activa si in_car

  const base = BABYLON.MeshBuilder.CreateBox(
    `friendCarBase_${friend.id}`,
    { width: 3.1, height: 0.75, depth: 5.2 },
    scene
  );
  base.position.y = 0.45;
  base.material = purple;
  base.parent = carRoot;

  const cabin = BABYLON.MeshBuilder.CreateBox(
    `friendCabin_${friend.id}`,
    { width: 2.35, height: 0.9, depth: 2.05 },
    scene
  );
  cabin.position = new BABYLON.Vector3(0, 1.15, -0.35);
  cabin.material = glass;
  cabin.parent = carRoot;

  const roof = BABYLON.MeshBuilder.CreateBox(
    `friendRoof_${friend.id}`,
    { width: 2.15, height: 0.18, depth: 1.65 },
    scene
  );
  roof.position = new BABYLON.Vector3(0, 1.68, -0.35);
  roof.material = dark;
  roof.parent = carRoot;

  for (const [x, z] of [
    [-1.15, 1.6],
    [1.15, 1.6],
    [-1.15, -1.6],
    [1.15, -1.6],
  ]) {
    const wheel = BABYLON.MeshBuilder.CreateCylinder(
      `friendWheel_${friend.id}_${x}_${z}`,
      { height: 0.35, diameter: 0.75 },
      scene
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.28, z);
    wheel.material = tire;
    wheel.parent = carRoot;
  }

  // Nombre
  const labelTexture = new BABYLON.DynamicTexture(
    `friendLabelTex_${friend.id}`,
    { width: 512, height: 128 },
    scene,
    true
  );
  const ctx = labelTexture.getContext() as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(friend.name || "Amigo"), 256, 64);
  labelTexture.update();

  const labelMat = new BABYLON.StandardMaterial(
    `friendLabelMat_${friend.id}`,
    scene
  );
  labelMat.diffuseTexture = labelTexture;
  labelMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  labelMat.backFaceCulling = false;
  labelMat.disableLighting = true;

  const label = BABYLON.MeshBuilder.CreatePlane(
    `friendLabel_${friend.id}`,
    { width: 4.2, height: 0.9 },
    scene
  );
  label.position.y = 2.8;
  label.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  label.material = labelMat;
  label.parent = root;

  friendAvatars.push({
    id: friend.id,
    cloudId: friend.cloudId,
    name: friend.name,
    root,
    avatarRoot,
    carRoot,
    label,
  } as any);
}
function updateSpecialBuildingLights() {
  if (!player || !car) return;

  const reference =
    inCar ? car.position : player.position;

  for (const gasLight of gasStationLights) {
    if (gasLight.isDisposed()) continue;

    const position =
      gasLight.getAbsolutePosition();

    const distance =
      BABYLON.Vector3.Distance(
        reference,
        position
      );

    gasLight.setEnabled(
      distance < 60
    );
  }

  for (const travelLight of niuTravelLights) {
    if (travelLight.isDisposed()) continue;

    const position =
      travelLight.getAbsolutePosition();

    const distance =
      BABYLON.Vector3.Distance(
        reference,
        position
      );

    travelLight.setEnabled(
      distance < 55
    );
  }

  for (const marketLight of niuMarketLights) {
    if (marketLight.isDisposed()) continue;

    const position =
      marketLight.getAbsolutePosition();

    const distance =
      BABYLON.Vector3.Distance(
        reference,
        position
      );

    marketLight.setEnabled(
      distance < 55
    );
  }
}
function createNiuTravelBoothBetweenCoords(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  rotationOffset: number = 0
) {
  const p1 = lonLatToWorld(lon1, lat1);
  const p2 = lonLatToWorld(lon2, lat2);

  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;

  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;

  const rotationY =
    Math.atan2(dx, dz) + rotationOffset;

  // =========================
  // MATERIALES NIU TRAVEL
  // =========================

  const darkPurpleMat = mat(
    "niuTravelDarkPurpleMat",
    new BABYLON.Color3(0.10, 0.025, 0.20)
  );

  darkPurpleMat.specularColor =
    new BABYLON.Color3(0.25, 0.10, 0.38);

  const purpleMat = mat(
    "niuTravelPurpleMat",
    new BABYLON.Color3(0.39, 0.06, 0.72)
  );

  purpleMat.emissiveColor =
    new BABYLON.Color3(0.04, 0.005, 0.09);

  const pinkMat = mat(
    "niuTravelPinkMat",
    new BABYLON.Color3(1, 0.025, 0.55)
  );

  pinkMat.emissiveColor =
    new BABYLON.Color3(0.18, 0.005, 0.08);

  const whiteMat = mat(
    "niuTravelWhiteMat",
    new BABYLON.Color3(0.96, 0.96, 1)
  );

  const metallicMat = mat(
    "niuTravelMetallicMat",
    new BABYLON.Color3(0.30, 0.31, 0.38)
  );

  metallicMat.specularColor =
    new BABYLON.Color3(0.7, 0.7, 0.8);

  const glassMat = new BABYLON.StandardMaterial(
    "niuTravelGlassMat",
    scene
  );

  glassMat.diffuseColor =
    new BABYLON.Color3(0.11, 0.30, 0.55);

  glassMat.emissiveColor =
    new BABYLON.Color3(0.015, 0.055, 0.12);

  glassMat.specularColor =
    new BABYLON.Color3(0.7, 0.75, 1);

  glassMat.alpha = 0.88;

// Ayuda a estabilizar el orden de los cristales.
glassMat.needDepthPrePass = true;

// La ventana es una caja, no necesita renderizar
// sus caras internas.
glassMat.backFaceCulling = true;

glassMat.transparencyMode =
  BABYLON.Material.MATERIAL_ALPHABLEND;

  const ledPinkMat = new BABYLON.StandardMaterial(
    "niuTravelLedPinkMat",
    scene
  );

  ledPinkMat.diffuseColor =
    new BABYLON.Color3(1, 0.02, 0.62);

  ledPinkMat.emissiveColor =
    new BABYLON.Color3(1, 0.02, 0.62);

  const ledPurpleMat = new BABYLON.StandardMaterial(
    "niuTravelLedPurpleMat",
    scene
  );

  ledPurpleMat.diffuseColor =
    new BABYLON.Color3(0.52, 0.08, 1);

  ledPurpleMat.emissiveColor =
    new BABYLON.Color3(0.52, 0.08, 1);

  // =========================
  // RAÍZ PRINCIPAL
  // =========================

  const travelRoot = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRoot",
    {
      width: 0.1,
      height: 0.1,
      depth: 0.1,
    },
    scene
  );

  travelRoot.position = new BABYLON.Vector3(
    centerX,
    0,
    centerZ
  );

  travelRoot.rotation.y = rotationY;
  travelRoot.isVisible = false;
  travelRoot.isPickable = false;

  // =========================
  // PLATAFORMA
  // =========================

  const platform = BABYLON.MeshBuilder.CreateBox(
    "niuTravelPlatform",
    {
      width: 12,
      height: 0.22,
      depth: 10,
    },
    scene
  );

  platform.position = new BABYLON.Vector3(
    0,
    0.11,
    0
  );

  platform.material = metallicMat;
  platform.parent = travelRoot;

  // Plataforma morada superior
  const platformTop = BABYLON.MeshBuilder.CreateBox(
    "niuTravelPlatformTop",
    {
      width: 11.6,
      height: 0.09,
      depth: 9.6,
    },
    scene
  );

  platformTop.position = new BABYLON.Vector3(
    0,
    0.27,
    0
  );

  platformTop.material = darkPurpleMat;
  platformTop.parent = travelRoot;

  // =========================
  // CUERPO CENTRAL
  // =========================

  const building = BABYLON.MeshBuilder.CreateBox(
    "niuTravelBuilding",
    {
      width: 9,
      height: 4.8,
      depth: 7,
    },
    scene
  );

  building.position = new BABYLON.Vector3(
    0,
    2.65,
    0.5
  );

  building.material = darkPurpleMat;
  building.parent = travelRoot;

  // =========================
  // FACHADA PRINCIPAL
  // =========================

  const frontFacade = BABYLON.MeshBuilder.CreateBox(
    "niuTravelFrontFacade",
    {
      width: 9.3,
      height: 4.7,
      depth: 0.28,
    },
    scene
  );

  frontFacade.position = new BABYLON.Vector3(
    0,
    2.65,
    -3.08
  );

  frontFacade.material = purpleMat;
  frontFacade.parent = travelRoot;

  // Panel rosa central
  const centralPinkPanel = BABYLON.MeshBuilder.CreateBox(
    "niuTravelCentralPinkPanel",
    {
      width: 3.6,
      height: 4.75,
      depth: 0.15,
    },
    scene
  );

  centralPinkPanel.position = new BABYLON.Vector3(
    0,
    2.65,
    -3.26
  );

  centralPinkPanel.material = pinkMat;
  centralPinkPanel.parent = travelRoot;

  // =========================
  // PARED TRASERA
  // =========================

  const backWall = BABYLON.MeshBuilder.CreateBox(
    "niuTravelBackWall",
    {
      width: 9.2,
      height: 4.7,
      depth: 0.3,
    },
    scene
  );

  backWall.position = new BABYLON.Vector3(
    0,
    2.65,
    4.08
  );

  backWall.material = darkPurpleMat;
  backWall.parent = travelRoot;

  // =========================
  // PAREDES LATERALES
  // =========================

  const leftWall = BABYLON.MeshBuilder.CreateBox(
    "niuTravelLeftWall",
    {
      width: 0.3,
      height: 4.7,
      depth: 7.3,
    },
    scene
  );

  leftWall.position = new BABYLON.Vector3(
    -4.65,
    2.65,
    0.5
  );

  leftWall.material = purpleMat;
  leftWall.parent = travelRoot;

  const rightWall = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRightWall",
    {
      width: 0.3,
      height: 4.7,
      depth: 7.3,
    },
    scene
  );

  rightWall.position = new BABYLON.Vector3(
    4.65,
    2.65,
    0.5
  );

  rightWall.material = purpleMat;
  rightWall.parent = travelRoot;

  // =========================
  // VITRINAS LATERALES
  // =========================

  for (const x of [-4.82, 4.82]) {
    const sideGlass = BABYLON.MeshBuilder.CreateBox(
      "niuTravelSideGlass",
      {
        width: 0.12,
        height: 2.8,
        depth: 4.2,
      },
      scene
    );

    sideGlass.position = new BABYLON.Vector3(
      x,
      2.35,
      0.2
    );

    sideGlass.material = glassMat;
    sideGlass.parent = travelRoot;
  }

  // =========================
  // ENTRADA
  // =========================

  const entranceFrameTop =
    BABYLON.MeshBuilder.CreateBox(
      "niuTravelEntranceFrameTop",
      {
        width: 3.2,
        height: 0.28,
        depth: 0.35,
      },
      scene
    );

  entranceFrameTop.position =
    new BABYLON.Vector3(
      0,
      3.7,
      -3.42
    );

  entranceFrameTop.material = whiteMat;
  entranceFrameTop.parent = travelRoot;

  for (const x of [-1.5, 1.5]) {
    const entranceFrame =
      BABYLON.MeshBuilder.CreateBox(
        "niuTravelEntranceFrame",
        {
          width: 0.28,
          height: 3.4,
          depth: 0.35,
        },
        scene
      );

    entranceFrame.position =
      new BABYLON.Vector3(
        x,
        1.95,
        -3.42
      );

    entranceFrame.material = whiteMat;
    entranceFrame.parent = travelRoot;
  }

  // Puerta doble futurista
  for (const x of [-0.7, 0.7]) {
    const door = BABYLON.MeshBuilder.CreateBox(
      "niuTravelDoor",
      {
        width: 1.28,
        height: 3.15,
        depth: 0.16,
      },
      scene
    );

    door.position = new BABYLON.Vector3(
      x,
      1.85,
      -3.55
    );

    door.material = glassMat;
    door.parent = travelRoot;

    const doorLine = BABYLON.MeshBuilder.CreateBox(
      "niuTravelDoorLine",
      {
        width: 0.08,
        height: 2.5,
        depth: 0.06,
      },
      scene
    );

    doorLine.position = new BABYLON.Vector3(
      x > 0 ? 0.1 : -0.1,
      1.85,
      -3.66
    );

    doorLine.material = ledPurpleMat;
    doorLine.parent = travelRoot;
  }

  // Vitrinas frontales
  for (const x of [-3.15, 3.15]) {
    const frontGlass = BABYLON.MeshBuilder.CreateBox(
      "niuTravelFrontGlass",
      {
        width: 2.25,
        height: 2.55,
        depth: 0.16,
      },
      scene
    );

    frontGlass.position = new BABYLON.Vector3(
      x,
      2.05,
      -3.4
    );

    frontGlass.material = glassMat;
    frontGlass.parent = travelRoot;
  }

  // =========================
  // TECHO FLOTANTE
  // =========================

  const roof = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRoof",
    {
      width: 11,
      height: 0.48,
      depth: 9,
    },
    scene
  );

  roof.position = new BABYLON.Vector3(
    0,
    5.35,
    0.25
  );

  roof.material = whiteMat;
  roof.parent = travelRoot;

  const roofUpper = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRoofUpper",
    {
      width: 10.5,
      height: 0.28,
      depth: 8.5,
    },
    scene
  );

  roofUpper.position = new BABYLON.Vector3(
    0,
    5.73,
    0.25
  );

  roofUpper.material = purpleMat;
  roofUpper.parent = travelRoot;

  // =========================
  // FRANJAS LED DEL TECHO
  // =========================

  const roofFrontLed = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRoofFrontLed",
    {
      width: 11.1,
      height: 0.16,
      depth: 0.18,
    },
    scene
  );

  roofFrontLed.position = new BABYLON.Vector3(
    0,
    5.18,
    -4.32
  );

  roofFrontLed.material = ledPinkMat;
  roofFrontLed.parent = travelRoot;

  const roofBackLed = BABYLON.MeshBuilder.CreateBox(
    "niuTravelRoofBackLed",
    {
      width: 11.1,
      height: 0.16,
      depth: 0.18,
    },
    scene
  );

  roofBackLed.position = new BABYLON.Vector3(
    0,
    5.18,
    4.82
  );

  roofBackLed.material = ledPurpleMat;
  roofBackLed.parent = travelRoot;

  for (const x of [-5.5, 5.5]) {
    const sideLed = BABYLON.MeshBuilder.CreateBox(
      "niuTravelSideLed",
      {
        width: 0.18,
        height: 0.16,
        depth: 9,
      },
      scene
    );

    sideLed.position = new BABYLON.Vector3(
      x,
      5.18,
      0.25
    );

    sideLed.material =
      x < 0 ? ledPinkMat : ledPurpleMat;

    sideLed.parent = travelRoot;
  }

  // =========================
  // MARQUESINA DE ENTRADA
  // =========================

  const entranceCanopy =
    BABYLON.MeshBuilder.CreateBox(
      "niuTravelEntranceCanopy",
      {
        width: 5.2,
        height: 0.25,
        depth: 2,
      },
      scene
    );

  entranceCanopy.position =
    new BABYLON.Vector3(
      0,
      4.15,
      -4.25
    );

  entranceCanopy.material = purpleMat;
  entranceCanopy.parent = travelRoot;

  const canopyLed = BABYLON.MeshBuilder.CreateBox(
    "niuTravelCanopyLed",
    {
      width: 5.1,
      height: 0.10,
      depth: 0.15,
    },
    scene
  );

  canopyLed.position = new BABYLON.Vector3(
    0,
    4.02,
    -5.28
  );

  canopyLed.material = ledPinkMat;
  canopyLed.parent = travelRoot;

  // =========================
  // POSTES FUTURISTAS
  // =========================

  for (const x of [-4.8, 4.8]) {
    const exteriorPillar =
      BABYLON.MeshBuilder.CreateBox(
        "niuTravelExteriorPillar",
        {
          width: 0.45,
          height: 4.5,
          depth: 0.45,
        },
        scene
      );

    exteriorPillar.position =
      new BABYLON.Vector3(
        x,
        2.35,
        -4.15
      );

    exteriorPillar.material = darkPurpleMat;
    exteriorPillar.parent = travelRoot;

    const pillarLed =
      BABYLON.MeshBuilder.CreateBox(
        "niuTravelPillarLed",
        {
          width: 0.12,
          height: 3.7,
          depth: 0.12,
        },
        scene
      );

    pillarLed.position =
      new BABYLON.Vector3(
        x,
        2.4,
        -4.4
      );

    pillarLed.material =
      x < 0 ? ledPinkMat : ledPurpleMat;

    pillarLed.parent = travelRoot;
  }

  // =========================
  // LOGOTIPO NIU TRAVEL
  // =========================

  const signTexture = new BABYLON.DynamicTexture(
    "niuTravelSignTexture",
    {
      width: 1024,
      height: 256,
    },
    scene,
    true
  );

  const ctx =
    signTexture.getContext() as CanvasRenderingContext2D;

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      1024,
      0
    );

  gradient.addColorStop(0, "#5d16c9");
  gradient.addColorStop(0.5, "#c020f0");
  gradient.addColorStop(1, "#ff1493");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 1004, 236);

  ctx.fillStyle = "white";
  ctx.font = "bold 105px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NIU TRAVEL", 512, 128);

  signTexture.update();

  const signMat = new BABYLON.StandardMaterial(
    "niuTravelSignMat",
    scene
  );

  signMat.diffuseTexture = signTexture;
  signMat.emissiveTexture = signTexture;

  signMat.emissiveColor =
    new BABYLON.Color3(0.45, 0.25, 0.6);

  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    "niuTravelSign",
    {
      width: 8.5,
      height: 2.1,
    },
    scene
  );

  sign.position = new BABYLON.Vector3(
    centerX,
    7,
    centerZ
  );

  sign.billboardMode =
    BABYLON.Mesh.BILLBOARDMODE_ALL;

  sign.material = signMat;
  sign.alwaysSelectAsActiveMesh = true;
  sign.isPickable = false;

  // =========================
  // LUZ MORADA EXTERIOR
  // =========================

  const purpleGroundLight =
    new BABYLON.PointLight(
      `niuTravelPurpleLight_${niuTravelLights.length}`,
      new BABYLON.Vector3(
        0,
        3.4,
        -2.5
      ),
      scene
    );

  purpleGroundLight.parent = travelRoot;

  purpleGroundLight.diffuse =
    new BABYLON.Color3(
      0.58,
      0.08,
      1
    );

  purpleGroundLight.specular =
    new BABYLON.Color3(
      0.75,
      0.2,
      1
    );

  purpleGroundLight.intensity = 2.7;
  purpleGroundLight.range = 25;

  niuTravelLights.push(
    purpleGroundLight
  );

  // Luz rosa suave en la entrada
  const pinkEntranceLight =
    new BABYLON.PointLight(
      `niuTravelPinkLight_${niuTravelLights.length}`,
      new BABYLON.Vector3(
        0,
        2.8,
        -4.2
      ),
      scene
    );

  pinkEntranceLight.parent = travelRoot;

  pinkEntranceLight.diffuse =
    new BABYLON.Color3(
      1,
      0.06,
      0.55
    );

  pinkEntranceLight.intensity = 1.7;
  pinkEntranceLight.range = 16;

  niuTravelLights.push(
    pinkEntranceLight
  );

  // =========================
  // ARO ROSA DE INTERACCIÓN
  // =========================

  const auraMat = new BABYLON.StandardMaterial(
    "niuTravelAuraMat",
    scene
  );

  auraMat.diffuseColor =
    new BABYLON.Color3(
      1,
      0.05,
      0.75
    );

  auraMat.emissiveColor =
    new BABYLON.Color3(
      1,
      0.05,
      0.75
    );

  auraMat.alpha = 0.6;

  niuTravelAura =
    BABYLON.MeshBuilder.CreateCylinder(
      "niuTravelAura",
      {
        diameter: 11,
        height: 0.35,
        tessellation: 64,
      },
      scene
    );

  // El aro queda frente a la entrada
  const frontDirection =
    new BABYLON.Vector3(
      -Math.sin(rotationY),
      0,
      -Math.cos(rotationY)
    );

  niuTravelAura.position =
    new BABYLON.Vector3(
      centerX,
      0.28,
      centerZ
    ).add(
      frontDirection.scale(1)
    );

  niuTravelAura.material = auraMat;
  niuTravelAura.isPickable = false;
  niuTravelAura.alwaysSelectAsActiveMesh = true;

  // =========================
  // REGISTRO Y LIMPIEZA
  // =========================

  activeMapMeshes.push(
    travelRoot,
    sign,
    niuTravelAura
  );

  registerChunkMesh(travelRoot);
  registerCullable(travelRoot);

  registerChunkMesh(sign);
  registerCullable(sign);

  registerChunkMesh(niuTravelAura);
  registerCullable(niuTravelAura);

  return travelRoot;
}
function createNiuTravelBoothAtLonLat(
  lon: number,
  lat: number,
  rotationoffset: number = 0
) {
  createNiuTravelBoothBetweenCoords(
    lon - 0.00004,
    lat,
    lon + 0.00004,
    lat,
    rotationoffset
  );
}
function createNiuMarketAtLonLat(
  lon: number,
  lat: number,
  rotationOffset: number = 0
) {
  const pos = lonLatToWorld(lon, lat);

  // =========================
  // MATERIALES
  // =========================

  const darkGrayMat = mat(
    "niuMarketDarkGrayMat",
    new BABYLON.Color3(0.10, 0.11, 0.13)
  );

  const mediumGrayMat = mat(
    "niuMarketMediumGrayMat",
    new BABYLON.Color3(0.30, 0.32, 0.36)
  );

  const lightGrayMat = mat(
    "niuMarketLightGrayMat",
    new BABYLON.Color3(0.72, 0.74, 0.77)
  );

  const whiteMat = mat(
    "niuMarketWhiteMat",
    new BABYLON.Color3(0.96, 0.96, 0.96)
  );

  const blueMat = mat(
    "niuMarketBlueMat",
    new BABYLON.Color3(0.05, 0.28, 0.85)
  );

  const yellowMat = mat(
    "niuMarketYellowMat",
    new BABYLON.Color3(1, 0.72, 0.08)
  );

  const glassMat = new BABYLON.StandardMaterial(
    "niuMarketGlassMat",
    scene
  );

  glassMat.diffuseColor = new BABYLON.Color3(
    0.10,
    0.38,
    0.55
  );

  glassMat.emissiveColor = new BABYLON.Color3(
    0.02,
    0.08,
    0.12
  );

  glassMat.alpha = 0.72;
  glassMat.backFaceCulling = false;

  // =========================
  // RAÍZ PRINCIPAL
  // =========================
  // Esta raíz controla toda la tienda.
  // Es importante registrar solamente esta raíz
  // en el sistema de chunks.

  const marketRoot = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoot",
    {
      width: 0.1,
      height: 0.1,
      depth: 0.1,
    },
    scene
  );

  marketRoot.position = new BABYLON.Vector3(
    pos.x,
    0,
    pos.z
  );

  marketRoot.rotation.y = rotationOffset;
  marketRoot.isVisible = false;
  marketRoot.isPickable = false;

  // =========================
  // CUERPO CENTRAL
  // =========================

  const building = BABYLON.MeshBuilder.CreateBox(
    "niuMarketBuilding",
    {
      width: 9,
      height: 4.8,
      depth: 7,
    },
    scene
  );

  building.position = new BABYLON.Vector3(
    0,
    2.4,
    0
  );

  building.material = darkGrayMat;
  building.parent = marketRoot;

  // =========================
  // FACHADA FRONTAL
  // =========================

  const frontFacade = BABYLON.MeshBuilder.CreateBox(
    "niuMarketFrontFacade",
    {
      width: 9.2,
      height: 4.7,
      depth: 0.25,
    },
    scene
  );

  frontFacade.position = new BABYLON.Vector3(
    0,
    2.4,
    -3.58
  );

  frontFacade.material = mediumGrayMat;
  frontFacade.parent = marketRoot;

  // =========================
  // PARED TRASERA
  // =========================

  const backWall = BABYLON.MeshBuilder.CreateBox(
    "niuMarketBackWall",
    {
      width: 9.2,
      height: 4.8,
      depth: 0.3,
    },
    scene
  );

  backWall.position = new BABYLON.Vector3(
    0,
    2.4,
    3.58
  );

  backWall.material = darkGrayMat;
  backWall.parent = marketRoot;

  // =========================
  // PAREDES LATERALES
  // =========================

  const leftWall = BABYLON.MeshBuilder.CreateBox(
    "niuMarketLeftWall",
    {
      width: 0.3,
      height: 4.8,
      depth: 7.2,
    },
    scene
  );

  leftWall.position = new BABYLON.Vector3(
    -4.58,
    2.4,
    0
  );

  leftWall.material = lightGrayMat;
  leftWall.parent = marketRoot;

  const rightWall = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRightWall",
    {
      width: 0.3,
      height: 4.8,
      depth: 7.2,
    },
    scene
  );

  rightWall.position = new BABYLON.Vector3(
    4.58,
    2.4,
    0
  );

  rightWall.material = lightGrayMat;
  rightWall.parent = marketRoot;

  // =========================
  // TECHO PRINCIPAL
  // =========================

  const roof = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoof",
    {
      width: 10.2,
      height: 0.5,
      depth: 8.2,
    },
    scene
  );

  roof.position = new BABYLON.Vector3(
    0,
    5.05,
    0
  );

  roof.material = whiteMat;
  roof.parent = marketRoot;

  // =========================
  // BORDE AMARILLO DEL TECHO
  // =========================

  const roofFrontBorder = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoofFrontBorder",
    {
      width: 10.3,
      height: 0.18,
      depth: 0.25,
    },
    scene
  );

  roofFrontBorder.position = new BABYLON.Vector3(
    0,
    4.88,
    -4.1
  );

  roofFrontBorder.material = yellowMat;
  roofFrontBorder.parent = marketRoot;

  const roofBackBorder = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoofBackBorder",
    {
      width: 10.3,
      height: 0.18,
      depth: 0.25,
    },
    scene
  );

  roofBackBorder.position = new BABYLON.Vector3(
    0,
    4.88,
    4.1
  );

  roofBackBorder.material = yellowMat;
  roofBackBorder.parent = marketRoot;

  const roofLeftBorder = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoofLeftBorder",
    {
      width: 0.25,
      height: 0.18,
      depth: 8.2,
    },
    scene
  );

  roofLeftBorder.position = new BABYLON.Vector3(
    -5.1,
    4.88,
    0
  );

  roofLeftBorder.material = yellowMat;
  roofLeftBorder.parent = marketRoot;

  const roofRightBorder = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRoofRightBorder",
    {
      width: 0.25,
      height: 0.18,
      depth: 8.2,
    },
    scene
  );

  roofRightBorder.position = new BABYLON.Vector3(
    5.1,
    4.88,
    0
  );

  roofRightBorder.material = yellowMat;
  roofRightBorder.parent = marketRoot;

  // =========================
  // FRANJA AZUL FRONTAL
  // =========================

  const blueBand = BABYLON.MeshBuilder.CreateBox(
    "niuMarketBlueBand",
    {
      width: 9.25,
      height: 0.48,
      depth: 0.28,
    },
    scene
  );

  blueBand.position = new BABYLON.Vector3(
    0,
    4.15,
    -3.75
  );

  blueBand.material = blueMat;
  blueBand.parent = marketRoot;

  // =========================
  // FRANJA AMARILLA FRONTAL
  // =========================

  const yellowBand = BABYLON.MeshBuilder.CreateBox(
    "niuMarketYellowBand",
    {
      width: 9.25,
      height: 0.18,
      depth: 0.3,
    },
    scene
  );

  yellowBand.position = new BABYLON.Vector3(
    0,
    3.78,
    -3.78
  );

  yellowBand.material = yellowMat;
  yellowBand.parent = marketRoot;

  // =========================
  // MARCO DE ENTRADA
  // =========================

  const entranceTop = BABYLON.MeshBuilder.CreateBox(
    "niuMarketEntranceTop",
    {
      width: 3,
      height: 0.3,
      depth: 0.35,
    },
    scene
  );

  entranceTop.position = new BABYLON.Vector3(
    0,
    3.35,
    -3.83
  );

  entranceTop.material = whiteMat;
  entranceTop.parent = marketRoot;

  const entranceLeft = BABYLON.MeshBuilder.CreateBox(
    "niuMarketEntranceLeft",
    {
      width: 0.3,
      height: 3.2,
      depth: 0.35,
    },
    scene
  );

  entranceLeft.position = new BABYLON.Vector3(
    -1.35,
    1.65,
    -3.83
  );

  entranceLeft.material = whiteMat;
  entranceLeft.parent = marketRoot;

  const entranceRight = BABYLON.MeshBuilder.CreateBox(
    "niuMarketEntranceRight",
    {
      width: 0.3,
      height: 3.2,
      depth: 0.35,
    },
    scene
  );

  entranceRight.position = new BABYLON.Vector3(
    1.35,
    1.65,
    -3.83
  );

  entranceRight.material = whiteMat;
  entranceRight.parent = marketRoot;

  // =========================
  // PUERTA DOBLE DE CRISTAL
  // =========================

  const leftDoor = BABYLON.MeshBuilder.CreateBox(
    "niuMarketLeftDoor",
    {
      width: 1.15,
      height: 2.85,
      depth: 0.18,
    },
    scene
  );

  leftDoor.position = new BABYLON.Vector3(
    -0.6,
    1.48,
    -3.92
  );

  leftDoor.material = glassMat;
  leftDoor.parent = marketRoot;

  const rightDoor = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRightDoor",
    {
      width: 1.15,
      height: 2.85,
      depth: 0.18,
    },
    scene
  );

  rightDoor.position = new BABYLON.Vector3(
    0.6,
    1.48,
    -3.92
  );

  rightDoor.material = glassMat;
  rightDoor.parent = marketRoot;

  // Manijas de las puertas

  const handleMat = mat(
    "niuMarketHandleMat",
    new BABYLON.Color3(0.85, 0.85, 0.88)
  );

  for (const x of [-0.18, 0.18]) {
    const handle = BABYLON.MeshBuilder.CreateBox(
      "niuMarketDoorHandle",
      {
        width: 0.08,
        height: 0.65,
        depth: 0.12,
      },
      scene
    );

    handle.position = new BABYLON.Vector3(
      x,
      1.55,
      -4.05
    );

    handle.material = handleMat;
    handle.parent = marketRoot;
  }

  // =========================
  // VITRINAS GRANDES
  // =========================

  const leftWindow = BABYLON.MeshBuilder.CreateBox(
    "niuMarketLeftWindow",
    {
      width: 2.35,
      height: 2.25,
      depth: 0.18,
    },
    scene
  );

  leftWindow.position = new BABYLON.Vector3(
    -3,
    1.75,
    -3.92
  );

  leftWindow.material = glassMat;
  leftWindow.parent = marketRoot;

  const rightWindow = BABYLON.MeshBuilder.CreateBox(
    "niuMarketRightWindow",
    {
      width: 2.35,
      height: 2.25,
      depth: 0.18,
    },
    scene
  );

  rightWindow.position = new BABYLON.Vector3(
    3,
    1.75,
    -3.92
  );

  rightWindow.material = glassMat;
  rightWindow.parent = marketRoot;

  // Marcos de las vitrinas

  for (const x of [-4.2, -1.8, 1.8, 4.2]) {
    const frame = BABYLON.MeshBuilder.CreateBox(
      "niuMarketWindowFrame",
      {
        width: 0.14,
        height: 2.5,
        depth: 0.25,
      },
      scene
    );

    frame.position = new BABYLON.Vector3(
      x,
      1.75,
      -4
    );

    frame.material = whiteMat;
    frame.parent = marketRoot;
  }

  // =========================
  // MARQUESINA DE ENTRADA
  // =========================

  const canopy = BABYLON.MeshBuilder.CreateBox(
    "niuMarketCanopy",
    {
      width: 4.4,
      height: 0.25,
      depth: 1.8,
    },
    scene
  );

  canopy.position = new BABYLON.Vector3(
    0,
    3.55,
    -4.55
  );

  canopy.material = yellowMat;
  canopy.parent = marketRoot;

  // Soportes de la marquesina

  for (const x of [-1.8, 1.8]) {
    const canopySupport = BABYLON.MeshBuilder.CreateBox(
      "niuMarketCanopySupport",
      {
        width: 0.16,
        height: 0.9,
        depth: 0.16,
      },
      scene
    );

    canopySupport.position = new BABYLON.Vector3(
      x,
      3.15,
      -4.55
    );

    canopySupport.material = whiteMat;
    canopySupport.parent = marketRoot;
  }

  // =========================
  // BASE DEL EDIFICIO
  // =========================

  const platform = BABYLON.MeshBuilder.CreateBox(
    "niuMarketPlatform",
    {
      width: 10.5,
      height: 0.18,
      depth: 8.6,
    },
    scene
  );

  platform.position = new BABYLON.Vector3(
    0,
    0.09,
    0
  );

  platform.material = lightGrayMat;
  platform.parent = marketRoot;

  // =========================
  // LETRERO NIU MARKET
  // =========================

  const signTexture = new BABYLON.DynamicTexture(
    "niuMarketSignTexture",
    {
      width: 1024,
      height: 256,
    },
    scene,
    true
  );

  const ctx =
    signTexture.getContext() as CanvasRenderingContext2D;

  ctx.fillStyle = "#202328";
  ctx.fillRect(0, 0, 1024, 256);

  ctx.strokeStyle = "#ffbf1f";
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, 1004, 236);

  ctx.fillStyle = "white";
  ctx.font = "bold 105px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NIU MARKET", 512, 128);

  signTexture.update();

  const signMat = new BABYLON.StandardMaterial(
    "niuMarketSignMat",
    scene
  );

  signMat.diffuseTexture = signTexture;
  signMat.emissiveTexture = signTexture;
  signMat.emissiveColor = new BABYLON.Color3(
    0.35,
    0.35,
    0.35
  );

  signMat.backFaceCulling = false;

  const sign = BABYLON.MeshBuilder.CreatePlane(
    "niuMarketSign",
    {
      width: 8,
      height: 2,
    },
    scene
  );

  sign.position = new BABYLON.Vector3(
    pos.x,
    6.45,
    pos.z
  );

  sign.billboardMode =
    BABYLON.Mesh.BILLBOARDMODE_ALL;

  sign.material = signMat;

  // =========================
  // ARO ROSA
  // =========================

  const auraMat = new BABYLON.StandardMaterial(
    "niuMarketAuraMat",
    scene
  );

  auraMat.diffuseColor = new BABYLON.Color3(
    1,
    0.05,
    0.7
  );

  auraMat.emissiveColor = new BABYLON.Color3(
    1,
    0.05,
    0.7
  );

  auraMat.alpha = 0.65;

  niuMarketAura = BABYLON.MeshBuilder.CreateCylinder(
    "niuMarketAura",
    {
      diameter: 5,
      height: 0.35,
      tessellation: 64,
    },
    scene
  );

  // Dirección del frente teniendo en cuenta
  // la rotación completa de la tienda

  const frontDirection = new BABYLON.Vector3(
    -Math.sin(marketRoot.rotation.y),
    0,
    -Math.cos(marketRoot.rotation.y)
  );

  niuMarketAura.position = new BABYLON.Vector3(
    pos.x,
    0.45,
    pos.z
  ).add(
    frontDirection.scale(4)
  );

  niuMarketAura.material = auraMat;

    // =========================
  // ILUMINACIÓN NIU MARKET
  // =========================

  // Luz turquesa principal.
  // Ilumina la fachada y el suelo frente al establecimiento.
  const marketTurquoiseLight = new BABYLON.PointLight(
    `niuMarketTurquoiseLight_${niuMarketLights.length}`,
    new BABYLON.Vector3(
      0,
      3.8,
      -3.2
    ),
    scene
  );

  marketTurquoiseLight.parent = marketRoot;

  marketTurquoiseLight.diffuse = new BABYLON.Color3(
    0.05,
    0.95,
    0.90
  );

  marketTurquoiseLight.specular = new BABYLON.Color3(
    0.25,
    1,
    0.95
  );

  marketTurquoiseLight.intensity = 3.2;
  marketTurquoiseLight.range = 24;

  niuMarketLights.push(
    marketTurquoiseLight
  );

  // Luz amarilla suave en la entrada.
  // Hace resaltar el color amarillo del techo y la marquesina.
  const marketEntranceLight = new BABYLON.PointLight(
    `niuMarketYellowLight_${niuMarketLights.length}`,
    new BABYLON.Vector3(
      0,
      2.8,
      -4.4
    ),
    scene
  );

  marketEntranceLight.parent = marketRoot;

  marketEntranceLight.diffuse = new BABYLON.Color3(
    1,
    0.72,
    0.12
  );

  marketEntranceLight.specular = new BABYLON.Color3(
    1,
    0.82,
    0.35
  );

  marketEntranceLight.intensity = 1.7;
  marketEntranceLight.range = 15;

  niuMarketLights.push(
    marketEntranceLight
  );

    // =========================
  // PANELES DE LUZ VISIBLES
  // =========================

  const turquoiseLedMat = new BABYLON.StandardMaterial(
    "niuMarketTurquoiseLedMat",
    scene
  );

  turquoiseLedMat.diffuseColor = new BABYLON.Color3(
    0.05,
    0.95,
    0.90
  );

  turquoiseLedMat.emissiveColor = new BABYLON.Color3(
    0.05,
    0.95,
    0.90
  );

  // Línea turquesa debajo de la franja amarilla
  const turquoiseFrontLed = BABYLON.MeshBuilder.CreateBox(
    "niuMarketTurquoiseFrontLed",
    {
      width: 8.8,
      height: 0.10,
      depth: 0.12,
    },
    scene
  );

  turquoiseFrontLed.position = new BABYLON.Vector3(
    0,
    3.58,
    -3.96
  );

  turquoiseFrontLed.material = turquoiseLedMat;
  turquoiseFrontLed.parent = marketRoot;

  // Luces pequeñas debajo de la marquesina
  for (const x of [-1.4, 0, 1.4]) {
    const entranceLamp = BABYLON.MeshBuilder.CreateBox(
      "niuMarketEntranceLamp",
      {
        width: 0.75,
        height: 0.08,
        depth: 0.45,
      },
      scene
    );

    entranceLamp.position = new BABYLON.Vector3(
      x,
      3.40,
      -4.72
    );

    entranceLamp.material = turquoiseLedMat;
    entranceLamp.parent = marketRoot;
  }

  // =========================
  // REGISTRO CORRECTO
  // =========================
  // No registres individualmente las paredes,
  // ventanas o techo porque usan posiciones locales.
  // Registramos la raíz principal.
  activeMapMeshes.push(
  marketRoot,
  sign,
  niuMarketAura
);
  registerChunkMesh(marketRoot);
  registerCullable(marketRoot);

  // Estos sí tienen posiciones globales.

  registerChunkMesh(sign);
  registerCullable(sign);

  registerChunkMesh(niuMarketAura);
  registerCullable(niuMarketAura);

  return marketRoot;
}
const travelLoadingScreen = document.createElement("div");

travelLoadingScreen.style.position = "fixed";
travelLoadingScreen.style.inset = "0";
travelLoadingScreen.style.background = "black";
travelLoadingScreen.style.color = "white";
travelLoadingScreen.style.zIndex = "999999";
travelLoadingScreen.style.display = "none";
travelLoadingScreen.style.alignItems = "center";
travelLoadingScreen.style.justifyContent = "center";
travelLoadingScreen.style.fontFamily = "Arial";
travelLoadingScreen.style.fontSize = "28px";
travelLoadingScreen.style.fontWeight = "bold";

document.body.appendChild(travelLoadingScreen);

function showTravelLoading(text: string) {
  travelLoadingScreen.innerText = text;
  travelLoadingScreen.style.display = "flex";
}

function hideTravelLoading() {
  travelLoadingScreen.style.display = "none";
}
async function buyNiuTravelTicket(
  cityName: string,
  cost: number
) {
  // Evita dos viajes ejecutándose al mismo tiempo
  if (niuTravelInProgress) return;

  if (digitalCoins < cost) {
    showMissionMessage(
      `No tienes monedas suficientes para viajar a ${cityName}`
    );
    return;
  }

  niuTravelInProgress = true;
  niuTravelCooldown = true;
  niuTravelWindowOpen = false;

  digitalCoins -= cost;
  saveWallet();
  updateWalletButton();
    const cityKey =
    cityName === "Manhattan"
      ? "manhattan"
      : cityName === "Beverly Hills"
        ? "beverly-hills"
        : "";

  if (cityKey && !unlockedCities.includes(cityKey)) {
    unlockedCities.push(cityKey);
  }
  savePlayerProfile();

  socialWindow.style.display = "none";
  socialWindow.innerHTML = "";

  showTravelLoading(
    `Cargando mapa de ${cityName}...`
  );

  // Deja que la pantalla de carga se dibuje antes
  // de comenzar a borrar y cargar el mapa.
  await new Promise((resolve) =>
    setTimeout(resolve, 150)
  );

  try {
    if (cityName === "Manhattan") {
      await travelToManhattan();
    } else if (cityName === "Beverly Hills") {
      await travelToBeverlyHills();
    }
  } catch (error) {
    console.error(
      `Error viajando a ${cityName}:`,
      error
    );

    showMissionMessage(
      `No se pudo cargar ${cityName}.`,
      5000
    );
  } finally {
    hideTravelLoading();

    niuTravelInProgress = false;

    setTimeout(() => {
      niuTravelCooldown = false;
    }, 3000);
  }
}
function openNiuTravelWindow() {
  socialWindow.style.display = "block";

  socialWindow.style.position = "fixed";
  socialWindow.style.left = "50%";
  socialWindow.style.top = "50%";
  socialWindow.style.right = "auto";
  socialWindow.style.transform =
    "translate(-50%, -50%)";

  socialWindow.style.width = "350px";
  socialWindow.style.minHeight = "auto";
  socialWindow.style.background =
    "rgba(28, 28, 30, 0.97)";

  socialWindow.style.color = "white";
  socialWindow.style.padding = "20px";
  socialWindow.style.borderRadius = "16px";
  socialWindow.style.zIndex = "99999";
  socialWindow.style.fontFamily = "Arial";
  socialWindow.style.boxSizing = "border-box";
  socialWindow.style.boxShadow =
    "0 10px 35px rgba(0,0,0,0.65)";

  let currentCityText = "Lima";
  let destinationsHtml = "";

  // =========================
  // PARQUE KENNEDY
  // =========================

  if (currentMapName === "miraflores") {
    currentCityText = "Parque Kennedy";

    destinationsHtml = `
      <div style="
        background:rgba(255,255,255,0.07);
        padding:13px;
        border-radius:11px;
        margin-bottom:12px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🗽 <strong>Manhattan</strong><br>
            <span style="font-size:13px;color:#ddd;">
              Costo:
              <strong style="color:#ffd23c;">
                300 monedas
              </strong>
            </span>
          </div>

          <button id="buyManhattan" style="
            background:#2faa3f;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Viajar
          </button>
        </div>
      </div>

      <div style="
        background:rgba(255,255,255,0.07);
        padding:13px;
        border-radius:11px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🌴 <strong>Beverly Hills</strong><br>
            <span style="font-size:13px;color:#ddd;">
              Costo:
              <strong style="color:#ffd23c;">
                550 monedas
              </strong>
            </span>
          </div>

          <button id="buyBeverly" style="
            background:#2faa3f;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Viajar
          </button>
        </div>
      </div>
      <hr style="
  border-color:rgba(255,255,255,0.15);
  margin:18px 0;
">

<div style="
  color:#b86cff;
  font-weight:bold;
  font-size:15px;
  margin-bottom:10px;
">
  Próximamente
</div>

<div style="
  color:#ddd;
  font-size:15px;
  line-height:2;
">

  🏰 <strong>Londres</strong>

  <span style="
    color:#888;
    margin-left:8px;
    font-size:13px;
  ">
    </span>

  <br>

  🗼 <strong>Tokio</strong>

  <span style="
    color:#888;
    margin-left:8px;
    font-size:13px;
  ">
    </span>

</div>
    `;
  }

  // =========================
  // MANHATTAN
  // =========================

  if (currentMapName === "manhattan") {
    currentCityText = "Manhattan";

    destinationsHtml = `
      <div style="
        background:rgba(255,255,255,0.07);
        padding:13px;
        border-radius:11px;
        margin-bottom:12px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🌴 <strong>Beverly Hills</strong><br>
            <span style="font-size:13px;color:#ddd;">
              Costo:
              <strong style="color:#ffd23c;">
                2 monedas
              </strong>
            </span>
          </div>

          <button id="buyBeverly" style="
            background:#2faa3f;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Viajar
          </button>
        </div>
      </div>

      <div style="
        background:rgba(139,53,255,0.18);
        border:1px solid rgba(184,108,255,0.55);
        padding:13px;
        border-radius:11px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🏠 <strong>Parque Kennedy</strong><br>
            <span style="
              font-size:13px;
              color:#65e779;
              font-weight:bold;
            ">
              Regreso gratuito
            </span>
          </div>

          <button id="returnToLima" style="
            background:#8b35ff;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Regresar
          </button>
        </div>
      </div>
    `;
  }

  // =========================
  // BEVERLY HILLS
  // =========================

  if (currentMapName === "beverly-hills") {
    currentCityText = "Beverly Hills";

    destinationsHtml = `
      <div style="
        background:rgba(255,255,255,0.07);
        padding:13px;
        border-radius:11px;
        margin-bottom:12px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🗽 <strong>Manhattan</strong><br>
            <span style="font-size:13px;color:#ddd;">
              Costo:
              <strong style="color:#ffd23c;">
                2 monedas
              </strong>
            </span>
          </div>

          <button id="buyManhattan" style="
            background:#2faa3f;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Viajar
          </button>
        </div>
      </div>

      <div style="
        background:rgba(139,53,255,0.18);
        border:1px solid rgba(184,108,255,0.55);
        padding:13px;
        border-radius:11px;
      ">
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        ">
          <div>
            🏠 <strong>Parque Kennedy</strong><br>
            <span style="
              font-size:13px;
              color:#65e779;
              font-weight:bold;
            ">
              Regreso gratuito
            </span>
          </div>

          <button id="returnToLima" style="
            background:#8b35ff;
            color:white;
            border:0;
            border-radius:8px;
            padding:10px 15px;
            font-weight:bold;
            cursor:pointer;
          ">
            Regresar
          </button>
        </div>
      </div>
    `;
  }

  socialWindow.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:16px;
    ">
      <div style="
        width:36px;
        height:36px;
        border-radius:9px;
        background:#ff1493;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
      ">
        ✈️
      </div>

      <div>
        <div style="
          font-size:19px;
          font-weight:bold;
        ">
          Niu Travel
        </div>

        <div style="
          color:#bbb;
          font-size:12px;
          margin-top:2px;
        ">
          Ubicación actual: ${currentCityText}
        </div>
      </div>

      <button id="closeNiuTravel" style="
        margin-left:auto;
        border:0;
        border-radius:7px;
        padding:5px 9px;
        cursor:pointer;
        background:#444;
        color:white;
      ">
        X
      </button>
    </div>

    <div style="
      color:#b86cff;
      font-weight:bold;
      font-size:15px;
      margin-bottom:12px;
    ">
      Destinos disponibles
    </div>

    ${destinationsHtml}

    <div style="
      margin-top:15px;
      text-align:center;
      color:#aaa;
      font-size:12px;
    ">
      Tus monedas: 🪙 ${digitalCoins}
    </div>
  `;

  const closeBtn = document.getElementById(
    "closeNiuTravel"
  ) as HTMLButtonElement | null;

  const manhattanBtn = document.getElementById(
    "buyManhattan"
  ) as HTMLButtonElement | null;

  const beverlyBtn = document.getElementById(
    "buyBeverly"
  ) as HTMLButtonElement | null;

  const returnToLimaBtn = document.getElementById(
    "returnToLima"
  ) as HTMLButtonElement | null;

  if (closeBtn) {
    closeBtn.onclick = () => {
      socialWindow.style.display = "none";
      socialWindow.innerHTML = "";

      niuTravelWindowOpen = false;
      niuTravelCooldown = true;

      setTimeout(() => {
        niuTravelCooldown = false;
      }, 3000);
    };
  }

  if (manhattanBtn) {
    manhattanBtn.onclick = () => {
      buyNiuTravelTicket(
        "Manhattan",
        300
      );
    };
  }

  if (beverlyBtn) {
    beverlyBtn.onclick = () => {
      buyNiuTravelTicket(
        "Beverly Hills",
        550
      );
    };
  }

  if (returnToLimaBtn) {
    returnToLimaBtn.onclick = async () => {
      socialWindow.style.display = "none";
      socialWindow.innerHTML = "";

      niuTravelWindowOpen = false;
      niuTravelCooldown = true;

      await travelToLimaKennedy();

      setTimeout(() => {
        niuTravelCooldown = false;
      }, 3000);
    };
  }
}
function openRealEstateEntryWindow() {
  if (
    realEstateEntryWindowOpen ||
    realEstateEntryCooldown ||
    realEstateTravelInProgress
  ) {
    return;
  }

  realEstateEntryWindowOpen = true;

  // Detener el auto para que no siga avanzando
  // mientras está abierta la confirmación.
  carVelocity = 0;

  keys["w"] = false;
  keys["s"] = false;
  keys["a"] = false;
  keys["d"] = false;

  socialWindow.style.display = "block";
  socialWindow.style.position = "fixed";
  socialWindow.style.left = "50%";
  socialWindow.style.top = "50%";
  socialWindow.style.right = "auto";
  socialWindow.style.transform =
    "translate(-50%, -50%)";

  socialWindow.style.width = "410px";
  socialWindow.style.minHeight = "auto";
  socialWindow.style.background =
    "linear-gradient(145deg, rgba(20,22,27,0.99), rgba(31,27,20,0.99))";

  socialWindow.style.color = "white";
  socialWindow.style.padding = "24px";
  socialWindow.style.borderRadius = "20px";
  socialWindow.style.zIndex = "99999";
  socialWindow.style.fontFamily = "Arial";
  socialWindow.style.boxSizing = "border-box";

  socialWindow.style.border =
    "1px solid rgba(229,200,115,0.48)";

  socialWindow.style.boxShadow =
    "0 18px 55px rgba(0,0,0,0.78), 0 0 28px rgba(217,184,95,0.15)";

  socialWindow.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:13px;
      margin-bottom:18px;
    ">
      <div style="
        width:48px;
        height:48px;
        min-width:48px;
        border-radius:14px;
        background:linear-gradient(
          135deg,
          #e5c873,
          #b88b35
        );
        color:#10151b;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:26px;
        box-shadow:0 5px 18px rgba(217,184,95,0.25);
      ">
        🏘️
      </div>

      <div>
        <div style="
          font-size:21px;
          font-weight:bold;
          letter-spacing:0.2px;
        ">
          Proyecto inmobiliario
        </div>

        <div style="
          color:#e5c873;
          font-size:13px;
          margin-top:4px;
          font-weight:bold;
        ">
          Residencial El Olivar
        </div>
      </div>

      <button
        id="closeRealEstateEntryBtn"
        aria-label="Cerrar"
        style="
          margin-left:auto;
          width:31px;
          height:31px;
          border:0;
          border-radius:9px;
          background:rgba(255,255,255,0.10);
          color:white;
          cursor:pointer;
          font-size:15px;
          font-weight:bold;
        "
      >
        X
      </button>
    </div>

    <div style="
      background:rgba(255,255,255,0.055);
      border:1px solid rgba(255,255,255,0.09);
      border-radius:15px;
      padding:17px;
      margin-bottom:18px;
    ">
      <div style="
        font-size:17px;
        font-weight:bold;
        margin-bottom:10px;
        color:white;
      ">
        ¿Deseas ingresar al proyecto?
      </div>

      <div style="
        color:#dedede;
        font-size:14px;
        line-height:1.55;
      ">
        Estás por visitar el proyecto inmobiliario demo
        <strong style="color:#f2d982;">
          El Olivar
        </strong>.
        Podrás recorrer sus viviendas, calles, áreas verdes,
        piscina, Club House y zona recreacional.
      </div>
    </div>

    <div style="
      display:flex;
      align-items:center;
      gap:9px;
      background:rgba(217,184,95,0.10);
      border:1px solid rgba(217,184,95,0.25);
      padding:11px 12px;
      border-radius:12px;
      margin-bottom:18px;
      color:#f1dfae;
      font-size:12px;
      line-height:1.4;
    ">
      <span style="font-size:18px;">ℹ️</span>

      <span>
        Al ingresar se cargará temporalmente el mapa
        de Residencial El Olivar.
      </span>
    </div>

    <button
      id="enterRealEstateProjectBtn"
      style="
        width:100%;
        padding:14px;
        border:0;
        border-radius:12px;
        background:linear-gradient(
          135deg,
          #d9b85f,
          #b58a36
        );
        color:#11151b;
        font-size:15px;
        font-weight:bold;
        letter-spacing:0.7px;
        cursor:pointer;
        box-shadow:0 6px 20px rgba(217,184,95,0.22);
      "
    >
      ENTRAR
    </button>

    <button
      id="cancelRealEstateEntryBtn"
      style="
        width:100%;
        padding:11px;
        margin-top:10px;
        border:1px solid rgba(255,255,255,0.12);
        border-radius:11px;
        background:rgba(255,255,255,0.07);
        color:#dddddd;
        font-size:14px;
        cursor:pointer;
      "
    >
      Ahora no
    </button>
  `;

  const enterBtn =
    document.getElementById(
      "enterRealEstateProjectBtn"
    ) as HTMLButtonElement | null;

  const closeBtn =
    document.getElementById(
      "closeRealEstateEntryBtn"
    ) as HTMLButtonElement | null;

  const cancelBtn =
    document.getElementById(
      "cancelRealEstateEntryBtn"
    ) as HTMLButtonElement | null;

  function closeRealEstateEntryWindow() {
    socialWindow.style.display = "none";
    socialWindow.innerHTML = "";

    realEstateEntryWindowOpen = false;
    realEstateEntryCooldown = true;

    // Evita que vuelva a abrir inmediatamente
    // si todavía se encuentra dentro del aro.
    setTimeout(() => {
      realEstateEntryCooldown = false;
    }, 1800);
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      closeRealEstateEntryWindow();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeRealEstateEntryWindow();
    };
  }

  if (enterBtn) {
    enterBtn.onclick = async () => {
      if (realEstateTravelInProgress) {
        return;
      }

      realEstateTravelInProgress = true;
      realEstateEntryWindowOpen = false;

      // Bloquear el botón para evitar dos clics.
      enterBtn.disabled = true;
      enterBtn.style.cursor = "default";
      enterBtn.style.opacity = "0.72";
      enterBtn.innerText =
        "CARGANDO PROYECTO...";

      // Detener completamente el vehículo.
      carVelocity = 0;
      carEngineOn = false;

      stopIdleSound();

      keys["w"] = false;
      keys["s"] = false;
      keys["a"] = false;
      keys["d"] = false;

      socialWindow.style.display = "none";
      socialWindow.innerHTML = "";

      try {
        await travelToRealEstateProject();
      } finally {
        realEstateTravelInProgress = false;
      }
    };
  }
}
function openNiuMarketWindow() {
  if (niuMarketWindowOpen) return;

  niuMarketWindowOpen = true;

  socialWindow.style.display = "block";
  socialWindow.style.position = "fixed";
  socialWindow.style.left = "50%";
  socialWindow.style.top = "50%";
  socialWindow.style.right = "auto";
  socialWindow.style.transform =
    "translate(-50%, -50%)";

  socialWindow.style.width = "390px";
  socialWindow.style.minHeight = "auto";
  socialWindow.style.background =
    "rgba(28, 29, 32, 0.98)";

  socialWindow.style.color = "white";
  socialWindow.style.padding = "22px";
  socialWindow.style.borderRadius = "18px";
  socialWindow.style.zIndex = "99999";
  socialWindow.style.fontFamily = "Arial";
  socialWindow.style.boxSizing = "border-box";
  socialWindow.style.boxShadow =
    "0 12px 38px rgba(0,0,0,0.70)";

  socialWindow.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:12px;
      margin-bottom:18px;
    ">
      <div style="
        width:40px;
        height:40px;
        border-radius:11px;
        background:#ffbf1f;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
      ">
        🛍️
      </div>

      <div>
        <div style="
          font-size:21px;
          font-weight:bold;
        ">
          Niu Market
        </div>

        <div style="
          color:#ffbf1f;
          font-size:13px;
          margin-top:3px;
        ">
          Próximamente
        </div>
      </div>
    </div>

    <div style="
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.10);
      padding:15px;
      border-radius:13px;
      font-size:14px;
      line-height:1.55;
      margin-bottom:14px;
    ">
      <strong style="
        color:#ffbf1f;
        font-size:16px;
      ">
        Muy pronto podrás usar tus monedas para comprar:
      </strong>

      <div style="
        margin-top:12px;
        line-height:1.8;
      ">
        👕 Ropa<br>
        🚗 Accesorios para autos<br>
        🐶 Mascotas<br>
        🏠 Muebles<br>
        🎒 Objetos especiales<br>
        🎁 Artículos de temporada
      </div>
    </div>

    <p style="
      font-size:14px;
      line-height:1.5;
      color:#e1e1e1;
      margin-bottom:15px;
    ">
      Sigue completando misiones.
      <br><br>
      Tus monedas ya se están guardando y podrás utilizarlas cuando Niu Market abra sus puertas.
    </p>

    <div style="
      background:linear-gradient(
        135deg,
        rgba(25,75,200,0.35),
        rgba(255,191,31,0.20)
      );
      border:1px solid rgba(255,191,31,0.45);
      border-radius:13px;
      padding:14px;
      text-align:center;
      margin-bottom:16px;
    ">
      <div style="
        font-size:13px;
        color:#ddd;
        margin-bottom:5px;
      ">
        Tus monedas
      </div>

      <div style="
        font-size:25px;
        font-weight:bold;
        color:#ffd23c;
      ">
        🪙 ${digitalCoins.toLocaleString("es-PE")}
      </div>
    </div>

    <button id="closeNiuMarketBtn" style="
      width:100%;
      padding:13px;
      border:0;
      border-radius:11px;
      background:#ffbf1f;
      color:#181818;
      font-size:15px;
      font-weight:bold;
      cursor:pointer;
      box-shadow:0 4px 14px rgba(255,191,31,0.25);
    ">
      Entendido
    </button>
  `;

  const closeBtn = document.getElementById(
    "closeNiuMarketBtn"
  ) as HTMLButtonElement | null;

  if (closeBtn) {
    closeBtn.onclick = () => {
      socialWindow.style.display = "none";
      socialWindow.innerHTML = "";

      niuMarketWindowOpen = false;
      niuMarketCooldown = true;

      setTimeout(() => {
        niuMarketCooldown = false;
      }, 2500);
    };
  }
}
function openNiuFuelWindow() {

  if (niuFuelWindowOpen) return;

  niuFuelWindowOpen = true;

  const currentPercent =
    Math.round(
      (fuelLiters / maxFuelLiters) * 100
    );

  const fuelToLoad =
    100 - currentPercent;

  const cost =
    getFuelPurchaseCost();

  const remainingCoins =
    digitalCoins - cost;

  socialWindow.style.display = "block";

  socialWindow.style.position = "fixed";
  socialWindow.style.left = "50%";
  socialWindow.style.top = "50%";
  socialWindow.style.transform = "translate(-50%,-50%)";

  socialWindow.style.width = "380px";

  socialWindow.style.background =
    "rgba(25,25,28,0.96)";

  socialWindow.style.color = "white";

  socialWindow.style.padding = "22px";

  socialWindow.style.borderRadius = "18px";

  socialWindow.style.fontFamily = "Arial";

  socialWindow.style.zIndex = "99999";

  socialWindow.innerHTML = `

<div style="
font-size:22px;
font-weight:bold;
margin-bottom:14px;
">
⛽ Niu Fuel Station
</div>

<div style="
color:#cccccc;
margin-bottom:20px;
">
Estación de Servicio Niu
</div>

<div style="line-height:2">

⛽ Combustible actual:
<b>${currentPercent}%</b>

<br>

📦 Combustible a cargar:
<b>${fuelToLoad}%</b>

<br><br>

<b>
Total a pagar:
${cost} 🪙
</b>

</div>

<hr style="
margin:18px 0;
border-color:#444;
">

<div style="line-height:2">

Saldo actual

<br>

🪙 Tus monedas:
<b>${digitalCoins}</b>

<br><br>

Saldo después de la compra

<br>

🪙
<b>

${Math.max(remainingCoins,0)}

</b>

</div>

<br>

<button
id="buyFuelBtn"
style="
width:100%;
padding:12px;
background:#2faa3f;
color:white;
border:0;
border-radius:10px;
font-size:15px;
font-weight:bold;
cursor:pointer;
">

🟢 Comprar combustible

</button>

<br><br>

<button
id="cancelFuelBtn"
style="
width:100%;
padding:12px;
background:#666;
color:white;
border:0;
border-radius:10px;
font-size:15px;
cursor:pointer;
">

⚪ Cancelar

</button>

`;



const buyBtn =
document.getElementById(
"buyFuelBtn"
) as HTMLButtonElement;

const cancelBtn =
document.getElementById(
"cancelFuelBtn"
) as HTMLButtonElement;



buyBtn.onclick = () => {

if (digitalCoins < cost) {

showMissionMessage(
"No tienes suficientes monedas."
);

return;

}

digitalCoins -= cost;

fuelLiters = maxFuelLiters;

saveWallet();

updateWalletButton();

resetFuelWarnings();

socialWindow.style.display = "none";

socialWindow.innerHTML = "";

niuFuelWindowOpen = false;

niuFuelCooldown = true;

showMissionMessage(
"Tanque lleno."
);

setTimeout(() => {

niuFuelCooldown = false;

},2000);

};



cancelBtn.onclick = () => {

socialWindow.style.display = "none";

socialWindow.innerHTML = "";

niuFuelWindowOpen = false;

niuFuelCooldown = true;

setTimeout(()=>{

niuFuelCooldown = false;

},2000);

};

}
function openNiuRoadAssistanceWindow() {
  if (niuAssistanceOpen) return;

  niuAssistanceOpen = true;
  carVelocity = 0;
  carEngineOn = false;
  stopIdleSound();

  const nearestDistance = getNearestGasStationDistanceKm();

const distanceKm =
    Number.isFinite(nearestDistance)
        ? nearestDistance.toFixed(1)
        : "?";

  socialWindow.style.display = "block";
  socialWindow.style.position = "fixed";
  socialWindow.style.left = "50%";
  socialWindow.style.top = "50%";
  socialWindow.style.right = "auto";
  socialWindow.style.transform = "translate(-50%, -50%)";
  socialWindow.style.width = "390px";
  socialWindow.style.minHeight = "auto";
  socialWindow.style.background = "rgba(28, 28, 30, 0.96)";
  socialWindow.style.color = "white";
  socialWindow.style.padding = "22px";
  socialWindow.style.borderRadius = "18px";
  socialWindow.style.zIndex = "99999";
  socialWindow.style.fontFamily = "Arial";
  socialWindow.style.boxShadow = "0 10px 35px rgba(0,0,0,0.65)";

  socialWindow.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
      <div style="
        width:36px;
        height:36px;
        border-radius:10px;
        background:#8b35ff;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:21px;
      ">🚗</div>

      <div style="font-size:20px; font-weight:bold;">
        Asistencia Niu
      </div>
    </div>

    <p style="font-size:15px; line-height:1.45;">
      Te has quedado sin combustible.
    </p>

    <p style="font-size:14px; color:#ddd; line-height:1.45;">
      Tu vehículo se encuentra a <strong>${distanceKm} km</strong> de la estación de servicio más cercana.
    </p>

    <hr style="border-color:rgba(255,255,255,0.15); margin:16px 0;">

    <div style="
      background:rgba(255,255,255,0.08);
      padding:12px;
      border-radius:12px;
      margin-bottom:12px;
    ">
      <strong>🛢️ Opción 1. Enviar combustible</strong>
      <p style="font-size:13px; line-height:1.4;">
        Un vehículo de asistencia te llevará combustible.<br>
        Costo: <strong style="color:#ffd23c;">100 monedas</strong><br>
        Tiempo estimado: 10 segundos.
      </p>

      <button id="sendFuelBtn" style="
        width:100%;
        padding:10px;
        border:0;
        border-radius:9px;
        background:#2faa3f;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
        Enviar combustible
      </button>
    </div>

    <div style="
      background:rgba(255,255,255,0.08);
      padding:12px;
      border-radius:12px;
    ">
      <strong>🚛 Opción 2. Remolcar vehículo</strong>
      <p style="font-size:13px; line-height:1.4;">
        Tu auto será trasladado a la estación de servicio más cercana y el tanque será llenado.<br>
        Costo: <strong style="color:#ffd23c;">200 monedas</strong><br>
        Tiempo estimado: 5 segundos.
      </p>

      <button id="towCarBtn" style="
        width:100%;
        padding:10px;
        border:0;
        border-radius:9px;
        background:#2f6bff;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
        Remolcar vehículo
      </button>
    </div>
        <div style="
      background:rgba(255,255,255,0.08);
      padding:12px;
      border-radius:12px;
      margin-top:12px;
      border:1px solid rgba(255,255,255,0.12);
    ">
      <strong>🚶 Opción 3. Caminar para ganar monedas</strong>
      <p style="font-size:13px; line-height:1.4;">
        Si no tienes monedas, baja del auto y camina 1 km con tu avatar.<br>
        Recompensa: <strong style="color:#ffd23c;">100 monedas</strong><br>
        Con eso podrás comprar combustible.
      </p>

      <button id="walkForFuelBtn" style="
        width:100%;
        padding:10px;
        border:0;
        border-radius:9px;
        background:#8b35ff;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
        Caminar 1 km
      </button>
    </div>
  `;

  const sendFuelBtn = document.getElementById("sendFuelBtn") as HTMLButtonElement;
  const towCarBtn = document.getElementById("towCarBtn") as HTMLButtonElement;
  const walkForFuelBtn = document.getElementById("walkForFuelBtn") as HTMLButtonElement;

if (walkForFuelBtn) {
  walkForFuelBtn.onclick = () => {
    socialWindow.style.display = "none";
    socialWindow.innerHTML = "";

    niuAssistanceOpen = false;
    niuAssistanceInProgress = false;

    startWalkingFuelMission();
  };
}

  sendFuelBtn.onclick = async () => {
    if (niuAssistanceInProgress) return;

    if (digitalCoins < 100) {
      showMissionMessage("No tienes monedas suficientes para enviar combustible.");
      return;
    }

    niuAssistanceInProgress = true;
    digitalCoins -= 100;
    saveWallet();
    updateWalletButton();

    showTravelLoading("Asistencia Niu en camino...");

    await new Promise((r) => setTimeout(r, 10000));

    fuelLiters = maxFuelLiters * 0.25;
    resetFuelWarnings();

    carEngineOn = false;
    carVelocity = 0;

    hideTravelLoading();
    socialWindow.style.display = "none";
    niuAssistanceOpen = false;
    niuAssistanceInProgress = false;

    showMissionMessage("Combustible recibido. Tanque al 25%.");
  };

  towCarBtn.onclick = async () => {
    if (niuAssistanceInProgress) return;

    if (digitalCoins < 200) {
      showMissionMessage("No tienes monedas suficientes para remolcar el vehículo.");
      return;
    }

    niuAssistanceInProgress = true;
    digitalCoins -= 200;
    saveWallet();
    updateWalletButton();

    showTravelLoading("Remolcando vehículo a NIU Gasoline...");

    await new Promise((r) => setTimeout(r, 5000));

    if (gasStationAura && car) {
      car.position.x = gasStationAura.position.x + 5;
      car.position.z = gasStationAura.position.z + 5;
      car.position.y = 0.22;
    }

    fuelLiters = maxFuelLiters;
    resetFuelWarnings();

    carEngineOn = false;
    carVelocity = 0;

    hideTravelLoading();
    socialWindow.style.display = "none";
    niuAssistanceOpen = false;
    niuAssistanceInProgress = false;

    showMissionMessage("Vehículo remolcado. Tanque lleno.");
  };
}
function updateFuelWarningSystem() {
  const fuelPercent = getFuelPercent();

  if (fuelPercent <= 20 && fuelPercent > 10 && !fuelWarning20Shown) {
    fuelWarning20Shown = true;
    showMissionMessage(
      "🟡 Combustible bajo. Se recomienda visitar una estación de servicio.",
      4500
    );
  }

  if (fuelPercent <= 10 && fuelPercent > 5 && !fuelWarning10Shown) {
    fuelWarning10Shown = true;
    showMissionMessage(
      "🔴 Advertencia. Queda poco combustible.",
      4500
    );
  }

  if (fuelPercent <= 5 && fuelPercent > 0 && !fuelWarning5Shown) {
    fuelWarning5Shown = true;
    playFuelBeep();
    showMissionMessage(
      "⛽ Combustible crítico. Busca una estación de servicio.",
      5000
    );
  }

  // === SIN COMBUSTIBLE ===
  if (fuelLiters <= 0) {
    fuelLiters = 0;
    carVelocity = 0;
    carEngineOn = false;
    stopIdleSound();

    keys["w"] = false;
    keys["s"] = false;

    // Solo abrir UNA vez (evita spam y posibles errores)
    if (!niuAssistanceOpen && !walkingFuelMissionActive) {
      openNiuRoadAssistanceWindow();
    }
  }
}
async function setupInitialGame(city: "lima" | "maturin") {
  // Cargar progreso desde Supabase (gasolina, monedas, ciudades)
  await loadProfileFromCloud();
  await loadFriendsFromCloud();
  await loadWorldChatFromCloud();
subscribeWorldChatRealtime();
subscribeFriendsPresence();
subscribeRaceInvitesRealtime();

  if (city === "lima") {
  currentMapName = "miraflores";
  currentZone = "kennedy";

  centerLon = -77.0301;
  centerLat = -12.1219;

  await loadMap("miraflores-zona-kennedy.geojson");
}

if (city === "maturin") {
  currentMapName = "maturin";
  currentZone = "maturin-centro";

  centerLon = -63.18323;
  centerLat = 9.74569;

  await loadMap("maturin-zona-centro.geojson");
}

  if (city === "maturin") {
  const startPos = lonLatToWorld(
    -63.17596409987798,
    9.744799293933644
  );

  createAvatar(new BABYLON.Vector3(startPos.x, 1, startPos.z));
  createNiuSportCar(new BABYLON.Vector3(startPos.x + 4, 0.18, startPos.z));
} else {
  createAvatar(new BABYLON.Vector3(0, 1, 20));
  createNiuSportCar(new BABYLON.Vector3(4, 0.18, 20));
}
  setupCarSounds();
  createMissionSystem();
  spawnBotsForZone(currentZone);

    // ===== Landmarks de Kennedy (ANTES de amigos) =====
  try {
    createGasStationAtLonLat(
      KENNEDY_GAS_STATION.lon,
      KENNEDY_GAS_STATION.lat,
      KENNEDY_GAS_STATION.rotationY
    );

    createSalesBoothAtLonLat(
      -77.02878209374222,
      -12.118881789293624
    );

    createCentrixBillboardAtLonLat(
      -77.02158113338712,
      -12.129906426232017
    );

    createWebAuraAtLonLat(
      -77.02146205441015,
      -12.12989534544568,
      "https://eeinmobiliaria.com/proyectos/centrix-28/"
    );

    createModernOrangeBuildingAtLonLat(
      -77.02146205441015,
      -12.12989534544568
    );

    createStreetSignBetweenCoords(
      "Av. Diagonal",
      -77.02941749930515,
      -12.119699686253044,
      -77.02927991625387,
      -12.119805535265524
    );

    // Niu Travel (usa dos puntos distintos para que no salga degenerado)
    createNiuTravelBoothBetweenCoords(
      -77.03495579750306,
      -12.123218777824798,
      -77.03495581248049,
      -12.1232220826237,
      1.5
    );

    createNiuMarketAtLonLat(
      -77.03343757265849,
      -12.119262055352637,
      -3
    );

    createNiuStoreAtLonLat(
      "NIU Cafe",
      -77.02756894510748,
      -12.126018298226239,
      "cafe",
      new BABYLON.Color3(0.45, 0.28, 0.12),
      -3
    );

    createBuildingBetweenCoords(
      "niuWdBuilding",
      -77.02886031373137,
      -12.120414902995638,
      -77.02888713582045,
      -12.12101019132289,
      11,
      new BABYLON.Color3(0.05, 0.22, 0.8),
      "Niu Digital World",
      -3.13
    );

    console.log("✅ Landmarks Kennedy creados (Travel, Market, Digital World, etc.)");
  } catch (e) {
    console.error("❌ Error creando landmarks Kennedy:", e);
  }

  // Amigos / presencia (si fallan, los edificios ya existen)
  for (const friend of friends) {
    try {
      createFriendAvatar(friend);
    } catch (e) {
      console.warn("Avatar amigo:", e);
    }
  }
  subscribeFriendsPresence();

  if (!isOnRoad(car.position) && roadSegments.length > 0) {
    const first = roadSegments[0];
    car.position = first.a.clone();
    car.position.y = 0.18;
    player.position = first.a.add(new BABYLON.Vector3(3, 1, 0));
  }

  camera.target = player.position;
}
function createSalesBoothAtLonLat(
  lon: number,
  lat: number
) {
  const pos =
    lonLatToWorld(
      lon,
      lat
    );

  // =========================
  // IDENTIFICADOR
  // =========================

  const boothId =
    "realEstateSalesBooth";

  // =========================
  // MATERIALES
  // =========================

  const darkMat =
    mat(
      `${boothId}_darkMat`,
      new BABYLON.Color3(
        0.055,
        0.065,
        0.085
      )
    );

  const wallMat =
    mat(
      `${boothId}_wallMat`,
      new BABYLON.Color3(
        0.88,
        0.78,
        0.56
      )
    );

  const secondaryWallMat =
    mat(
      `${boothId}_secondaryWallMat`,
      new BABYLON.Color3(
        0.93,
        0.90,
        0.82
      )
    );

  const roofMat =
    mat(
      `${boothId}_roofMat`,
      new BABYLON.Color3(
        0.30,
        0.11,
        0.07
      )
    );

  const woodMat =
    mat(
      `${boothId}_woodMat`,
      new BABYLON.Color3(
        0.34,
        0.18,
        0.08
      )
    );

  const stoneMat =
    mat(
      `${boothId}_stoneMat`,
      new BABYLON.Color3(
        0.45,
        0.46,
        0.48
      )
    );

  const goldMat =
    new BABYLON.StandardMaterial(
      `${boothId}_goldMat`,
      scene
    );

  goldMat.diffuseColor =
    new BABYLON.Color3(
      0.91,
      0.70,
      0.22
    );

  goldMat.emissiveColor =
    new BABYLON.Color3(
      0.16,
      0.10,
      0.015
    );

  goldMat.specularColor =
    new BABYLON.Color3(
      0.22,
      0.17,
      0.06
    );

  const glassMat =
    new BABYLON.StandardMaterial(
      `${boothId}_glassMat`,
      scene
    );

  glassMat.diffuseColor =
    new BABYLON.Color3(
      0.08,
      0.28,
      0.42
    );

  glassMat.emissiveColor =
    new BABYLON.Color3(
      0.012,
      0.045,
      0.065
    );

  glassMat.alpha = 0.82;

  glassMat.specularColor =
    new BABYLON.Color3(
      0.35,
      0.42,
      0.48
    );

  glassMat.needDepthPrePass =
    true;

  glassMat.backFaceCulling =
    true;

  const lightMat =
    new BABYLON.StandardMaterial(
      `${boothId}_lightMat`,
      scene
    );

  lightMat.diffuseColor =
    new BABYLON.Color3(
      1,
      0.72,
      0.30
    );

  lightMat.emissiveColor =
    new BABYLON.Color3(
      1,
      0.48,
      0.12
    );

  lightMat.specularColor =
    BABYLON.Color3.Black();

  // =========================
  // RAÍZ GENERAL
  // =========================

  const boothRoot =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_root`,
      {
        width: 0.1,
        height: 0.1,
        depth: 0.1,
      },
      scene
    );

  boothRoot.position =
    new BABYLON.Vector3(
      pos.x,
      0,
      pos.z
    );

  boothRoot.isVisible =
    false;

  boothRoot.isPickable =
    false;

  // Ajusta aquí la orientación
  // completa de la caseta.
  boothRoot.rotation.y =
    0;

  // =========================
  // PLATAFORMA
  // =========================

  const platform =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_platform`,
      {
        width: 11,
        height: 0.22,
        depth: 9,
      },
      scene
    );

  platform.position =
    new BABYLON.Vector3(
      0,
      0.11,
      0
    );

  platform.material =
    stoneMat;

  platform.parent =
    boothRoot;

  platform.isPickable =
    false;

  // Escalón frontal
  const frontStep =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_frontStep`,
      {
        width: 4.2,
        height: 0.18,
        depth: 1.3,
      },
      scene
    );

  frontStep.position =
    new BABYLON.Vector3(
      0,
      0.18,
      -4.75
    );

  frontStep.material =
    stoneMat;

  frontStep.parent =
    boothRoot;

  frontStep.isPickable =
    false;

  // =========================
  // CASA PRINCIPAL
  // =========================

  const mainHouse =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_mainHouse`,
      {
        width: 6.4,
        height: 4,
        depth: 5.2,
      },
      scene
    );

  mainHouse.position =
    new BABYLON.Vector3(
      -1.15,
      2.2,
      0.25
    );

  mainHouse.material =
    secondaryWallMat;

  mainHouse.parent =
    boothRoot;

  mainHouse.isPickable =
    false;

  // =========================
  // CASA SECUNDARIA
  // =========================
  // Crea la silueta de dos casas
  // parecida al emoticon 🏘️.

  const sideHouse =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_sideHouse`,
      {
        width: 3.8,
        height: 3.15,
        depth: 4.3,
      },
      scene
    );

  sideHouse.position =
    new BABYLON.Vector3(
      3.15,
      1.78,
      0.7
    );

  sideHouse.material =
    wallMat;

  sideHouse.parent =
    boothRoot;

  sideHouse.isPickable =
    false;

  // =========================
  // TECHOS INCLINADOS
  // =========================

  const mainRoof =
    BABYLON.MeshBuilder.CreateCylinder(
      `${boothId}_mainRoof`,
      {
        diameter: 7.6,
        height: 5.9,
        tessellation: 3,
      },
      scene
    );

  mainRoof.position =
    new BABYLON.Vector3(
      -1.15,
      4.65,
      0.25
    );

  mainRoof.rotation.z =
    Math.PI / 2;

  mainRoof.scaling =
    new BABYLON.Vector3(
      0.53,
      1,
      0.45
    );

  mainRoof.material =
    roofMat;

  mainRoof.parent =
    boothRoot;

  mainRoof.isPickable =
    false;

  const sideRoof =
    BABYLON.MeshBuilder.CreateCylinder(
      `${boothId}_sideRoof`,
      {
        diameter: 5,
        height: 4.8,
        tessellation: 3,
      },
      scene
    );

  sideRoof.position =
    new BABYLON.Vector3(
      3.15,
      3.75,
      0.7
    );

  sideRoof.rotation.z =
    Math.PI / 2;

  sideRoof.scaling =
    new BABYLON.Vector3(
      0.52,
      1,
      0.43
    );

  sideRoof.material =
    roofMat;

  sideRoof.parent =
    boothRoot;

  sideRoof.isPickable =
    false;

  // =========================
  // FACHADA PRINCIPAL
  // =========================

  const frontPanel =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_frontPanel`,
      {
        width: 6.55,
        height: 3.7,
        depth: 0.24,
      },
      scene
    );

  frontPanel.position =
    new BABYLON.Vector3(
      -1.15,
      2.2,
      -2.7
    );

  frontPanel.material =
    secondaryWallMat;

  frontPanel.parent =
    boothRoot;

  frontPanel.isPickable =
    false;

  // Puerta principal
  const door =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_door`,
      {
        width: 1.7,
        height: 2.8,
        depth: 0.20,
      },
      scene
    );

  door.position =
    new BABYLON.Vector3(
      -1.1,
      1.62,
      -2.86
    );

  door.material =
    woodMat;

  door.parent =
    boothRoot;

  door.isPickable =
    false;

  // Ventanas principales
  for (
    const x of [
      -3.3,
      1.15,
    ]
  ) {
    const windowMesh =
      BABYLON.MeshBuilder.CreateBox(
        `${boothId}_mainWindow`,
        {
          width: 1.5,
          height: 1.65,
          depth: 0.16,
        },
        scene
      );

    windowMesh.position =
      new BABYLON.Vector3(
        x,
        2.35,
        -2.88
      );

    windowMesh.material =
      glassMat;

    windowMesh.parent =
      boothRoot;

    windowMesh.isPickable =
      false;
  }

  // Cruz sencilla en las ventanas
  for (
    const x of [
      -3.3,
      1.15,
    ]
  ) {
    const verticalFrame =
      BABYLON.MeshBuilder.CreateBox(
        `${boothId}_windowVertical`,
        {
          width: 0.08,
          height: 1.62,
          depth: 0.08,
        },
        scene
      );

    verticalFrame.position =
      new BABYLON.Vector3(
        x,
        2.35,
        -2.99
      );

    verticalFrame.material =
      goldMat;

    verticalFrame.parent =
      boothRoot;

    verticalFrame.isPickable =
      false;

    const horizontalFrame =
      BABYLON.MeshBuilder.CreateBox(
        `${boothId}_windowHorizontal`,
        {
          width: 1.48,
          height: 0.08,
          depth: 0.08,
        },
        scene
      );

    horizontalFrame.position =
      new BABYLON.Vector3(
        x,
        2.35,
        -2.99
      );

    horizontalFrame.material =
      goldMat;

    horizontalFrame.parent =
      boothRoot;

    horizontalFrame.isPickable =
      false;
  }

  // =========================
  // FACHADA CASA PEQUEÑA
  // =========================

  const sideDoor =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_sideDoor`,
      {
        width: 1.25,
        height: 2.25,
        depth: 0.18,
      },
      scene
    );

  sideDoor.position =
    new BABYLON.Vector3(
      3.1,
      1.35,
      -1.53
    );

  sideDoor.material =
    woodMat;

  sideDoor.parent =
    boothRoot;

  sideDoor.isPickable =
    false;

  const sideWindow =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_sideWindow`,
      {
        width: 1.25,
        height: 1.25,
        depth: 0.16,
      },
      scene
    );

  sideWindow.position =
    new BABYLON.Vector3(
      4.45,
      2.15,
      -1.54
    );

  sideWindow.material =
    glassMat;

  sideWindow.parent =
    boothRoot;

  sideWindow.isPickable =
    false;

  // =========================
  // DETALLES DEL TECHO
  // =========================

  const chimney =
    BABYLON.MeshBuilder.CreateBox(
      `${boothId}_chimney`,
      {
        width: 0.65,
        height: 1.45,
        depth: 0.65,
      },
      scene
    );

  chimney.position =
    new BABYLON.Vector3(
      -3,
      5.15,
      0.5
    );

  chimney.material =
    darkMat;

  chimney.parent =
    boothRoot;

  chimney.isPickable =
    false;

  // =========================
  // JARDINERAS FRONTALES
  // =========================

  for (
    const x of [
      -3.5,
      3.6,
    ]
  ) {
    const planter =
      BABYLON.MeshBuilder.CreateBox(
        `${boothId}_planter`,
        {
          width: 1.9,
          height: 0.45,
          depth: 0.75,
        },
        scene
      );

    planter.position =
      new BABYLON.Vector3(
        x,
        0.43,
        -3.45
      );

    planter.material =
      stoneMat;

    planter.parent =
      boothRoot;

    planter.isPickable =
      false;

    const plant =
      BABYLON.MeshBuilder.CreateSphere(
        `${boothId}_plant`,
        {
          diameter: 1.15,
          segments: 8,
        },
        scene
      );

    plant.position =
      new BABYLON.Vector3(
        x,
        0.95,
        -3.45
      );

    plant.scaling.y =
      0.62;

    plant.material =
      grassMat;

    plant.parent =
      boothRoot;

    plant.isPickable =
      false;
  }

  // =========================
  // LÁMPARAS VISUALES
  // =========================

  for (
    const x of [
      -2.1,
      -0.1,
    ]
  ) {
    const porchLamp =
      BABYLON.MeshBuilder.CreateSphere(
        `${boothId}_porchLamp`,
        {
          diameter: 0.32,
          segments: 8,
        },
        scene
      );

    porchLamp.position =
      new BABYLON.Vector3(
        x,
        3.15,
        -3
      );

    porchLamp.material =
      lightMat;

    porchLamp.parent =
      boothRoot;

    porchLamp.isPickable =
      false;
  }

  // =========================
  // LUZ REAL SUAVE
  // =========================
  // Solo se usa una luz real para evitar
  // afectar el rendimiento.

  const boothLight =
  new BABYLON.PointLight(
    `${boothId}_light`,
    BABYLON.Vector3.Zero(),
    scene
  );

boothLight.parent =
  boothRoot;

boothLight.position =
  new BABYLON.Vector3(
    0,
    3.2,
    -3.2
  );

boothLight.diffuse =
  new BABYLON.Color3(
    1,
    0.65,
    0.28
  );

boothLight.specular =
  BABYLON.Color3.Black();

boothLight.intensity =
  1.15;

boothLight.range =
  22;

// Mantener siempre encendida.
boothLight.setEnabled(true);

// Evita que Babylon la desactive por distancia
// o por optimizaciones del escenario.


  // =========================
  // ANUNCIO SUPERIOR
  // =========================

  const signTexture =
    new BABYLON.DynamicTexture(
      `${boothId}_signTexture`,
      {
        width: 1200,
        height: 420,
      },
      scene,
      true
    );

  const signCtx = signTexture.getContext() as CanvasRenderingContext2D;

  const gradient =
    signCtx.createLinearGradient(
      0,
      0,
      1200,
      420
    );

  gradient.addColorStop(
    0,
    "#10151B"
  );

  gradient.addColorStop(
    1,
    "#2A2114"
  );

  signCtx.fillStyle =
    gradient;

  signCtx.fillRect(
    0,
    0,
    1200,
    420
  );

  // Borde exterior dorado
  signCtx.strokeStyle =
    "#D9B85F";

  signCtx.lineWidth =
    20;

  signCtx.strokeRect(
    16,
    16,
    1168,
    388
  );

  // Borde interior
  signCtx.strokeStyle =
    "#F0DB98";

  signCtx.lineWidth =
    5;

  signCtx.strokeRect(
    40,
    40,
    1120,
    340
  );

  signCtx.textAlign =
    "center";

  signCtx.textBaseline =
    "middle";

  signCtx.fillStyle =
    "#FFFFFF";

  signCtx.font =
    "bold 96px Arial";

  signCtx.fillText(
    "NIU RESIDENCIAL",
    600,
    120
  );

  signCtx.fillStyle =
    "#E5C873";

  signCtx.font =
    "bold 82px Arial";

  signCtx.fillText(
    "EL OLIVAR",
    600,
    225
  );

  signCtx.fillStyle =
    "#D7D7D7";

  signCtx.font =
    "bold 35px Arial";

  signCtx.fillText(
    "PROYECTO INMOBILIARIO DEMO",
    600,
    330
  );

  signTexture.update();

  const signMat =
    new BABYLON.StandardMaterial(
      `${boothId}_signMat`,
      scene
    );

  signMat.diffuseTexture =
    signTexture;

  signMat.emissiveTexture =
    signTexture;

  signMat.emissiveColor =
    new BABYLON.Color3(
      0.62,
      0.62,
      0.62
    );

  signMat.backFaceCulling =
    false;

  signMat.disableLighting =
    true;

  const sign =
    BABYLON.MeshBuilder.CreatePlane(
      `${boothId}_sign`,
      {
        width: 10.8,
        height: 3.8,
        sideOrientation:
          BABYLON.Mesh.DOUBLESIDE,
      },
      scene
    );

  /*
   * El cartel utiliza coordenadas globales
   * porque debe girar mirando a la cámara.
   *
   * Se coloca exactamente sobre el centro
   * de la caseta.
   */
  sign.position =
  new BABYLON.Vector3(
    pos.x,
    7.75,
    pos.z
  );

  sign.billboardMode =
    BABYLON.Mesh.BILLBOARDMODE_ALL;

  sign.material =
    signMat;

  sign.isPickable =
    false;

  sign.alwaysSelectAsActiveMesh =
    true;

  sign.renderingGroupId =
    2;

  // =========================
  // ARO ROSA DE ACCESO
  // =========================

  const auraMat =
    new BABYLON.StandardMaterial(
      `${boothId}_auraMat`,
      scene
    );

  auraMat.diffuseColor =
    new BABYLON.Color3(
      1,
      0.15,
      0.75
    );

  auraMat.emissiveColor =
    new BABYLON.Color3(
      1,
      0.15,
      0.75
    );

  auraMat.alpha =
    0.55;

  salesBoothAura =
    BABYLON.MeshBuilder.CreateCylinder(
      "salesBoothAura",
      {
        diameter: 9,
        height: 0.3,
        tessellation: 48,
      },
      scene
    );

  /*
   * El aro se coloca frente a la caseta,
   * no debajo del edificio.
   */
  const boothFrontDirection =
    new BABYLON.Vector3(
      -Math.sin(
        boothRoot.rotation.y
      ),
      0,
      -Math.cos(
        boothRoot.rotation.y
      )
    );

  salesBoothAura.position =
    new BABYLON.Vector3(
      pos.x,
      0.22,
      pos.z
    ).add(
      boothFrontDirection.scale(
        5.8
      )
    );

  salesBoothAura.material =
    auraMat;

  salesBoothAura.isPickable =
    false;

  salesBoothAura.alwaysSelectAsActiveMesh =
    true;

  salesBoothAura.renderingGroupId =
    1;

  // =========================
  // REGISTRO OPTIMIZADO
  // =========================

  activeMapMeshes.push(
    boothRoot,
    sign,
    salesBoothAura
  );

  /*
   * Registramos solamente la raíz de la caseta.
   * Las paredes, ventanas y techos son hijos
   * y se activan o desactivan junto a ella.
   */
  registerChunkMesh(
  boothRoot
);

// No registrar boothRoot en culling.
// Así la caseta y su iluminación no se apagan
// cuando el jugador está lejos.
// registerCullable(boothRoot);

  // El cartel y el aro usan posiciones globales.
  registerChunkMesh(
    sign
  );

  registerCullable(
    sign
  );

  registerChunkMesh(
    salesBoothAura
  );

  registerCullable(
    salesBoothAura
  );

  return boothRoot;
}
function createWebAuraAtLonLat(
  lon: number,
  lat: number,
  url: string
) {
  const pos = lonLatToWorld(lon, lat);

  const auraMat = new BABYLON.StandardMaterial("centrixWebAuraMat", scene);
  auraMat.diffuseColor = new BABYLON.Color3(1, 0.05, 0.75);
  auraMat.emissiveColor = new BABYLON.Color3(1, 0.05, 0.75);
  auraMat.alpha = 0.7;

  centrixAura = BABYLON.MeshBuilder.CreateCylinder(
    "centrixWebAura",
    {
      diameter: 22,
      height: 0.45,
      tessellation: 64,
    },
    scene
  );

  centrixAura.position = new BABYLON.Vector3(
    pos.x,
    0.35,
    pos.z
  );

  centrixAura.material = auraMat;

  centrixAura.metadata = {
    url,
  };

  registerCullable(centrixAura);
  registerChunkMesh(centrixAura);
}
function createKennedyCustomObjects() {
  createGasStationAtLonLat(
    KENNEDY_GAS_STATION.lon,
    KENNEDY_GAS_STATION.lat,
    KENNEDY_GAS_STATION.rotationY
  );
  createGasStationAtLonLat(
  -77.0194671100996,
  -12.121539417542508
);

  createSalesBoothAtLonLat(
    -77.02878209374222,
    -12.118881789293624
  );

  createCentrixBillboardAtLonLat(
    -77.02158113338712,
    -12.129906426232017
  );

  createWebAuraAtLonLat(
    -77.02146205441015,
    -12.12989534544568,
    "https://eeinmobiliaria.com/proyectos/centrix-28/"
  );
}
function createEsteCustomObjects() {
  createGasStationAtLonLat(
  -77.01941114106933,
  -12.12148882583615,
  0.65
  );
  createNiuStoreAtLonLat(
    "NIU Farma", 
    -77.02122803181176, 
    -12.124710441958168, 
    "farmacia", 
    new BABYLON.Color3(0.1, 0.55, 0.35),
    -1.8
  );
  createNiuStoreAtLonLat(
    "NIU Pizza", 
    -77.02401256596494, 
    -12.12010240065056, 
    "pizza", 
    new BABYLON.Color3(0.80, 0.25, 0.15),
    3.5
    );
  createNiuStoreAtLonLat(
    "NIU Cafe", 
    -77.01591801381268, 
    -12.118736901172753, 
    "cafe", 
    new BABYLON.Color3(0.45, 0.28, 0.12),
    3
    );
  createNiuStoreAtLonLat(
    "NIU Farma", 
    -77.01717756785459, 
    -12.121875592026024, 
    "farmacia", 
    new BABYLON.Color3(0.10, 0.55, 0.35),
    1.5
    );
  createNiuStoreAtLonLat(
    "NIU Pizza", 
    -77.01471377523659, 
    -12.121838404224162, 
    "pizza", 
    new BABYLON.Color3(0.80, 0.25, 0.15),
    -1.5
    );
  createNiuStoreAtLonLat(
    "NIU Cafe", 
    -77.01963730243068, 
    -12.12772497178878, 
    "cafe", 
    new BABYLON.Color3(0.45, 0.28, 0.12),
    -3
    );
  createNiuStoreAtLonLat(
    "NIU Farma", 
    -77.01616652157495, 
    -12.130103706735301, 
    "farmacia", 
    new BABYLON.Color3(0.10, 0.55, 0.35),
    3
    );
}

function createSurCustomObjects() {
  createGasStationAtLonLat(
  -77.04270662711423,
  -12.12045474446827,
  -1.5
  );
  createNiuStoreAtLonLat("NIU Pizza", -77.03219001443057, -12.129386944890697, "pizza", new BABYLON.Color3(0.80, 0.25, 0.15));
  createNiuStoreAtLonLat("NIU Cafe", -77.03788979893213, -12.123876815130611, "cafe", new BABYLON.Color3(0.45, 0.28, 0.12));
  createNiuStoreAtLonLat("NIU Farma", -77.04070055635407, -12.121757449029028, "farmacia", new BABYLON.Color3(0.10, 0.55, 0.35));
  createNiuStoreAtLonLat(
    "NIU Pizza", 
    -77.04462955621659, 
    -12.119800059412757, 
    "pizza", 
    new BABYLON.Color3(0.80, 0.25, 0.15),
    -1.5
    );
}

function createOesteCustomObjects() {
  createGasStationAtLonLat(
  -77.03068175404898,
  -12.114094049716474
  );
  createNiuStoreAtLonLat(
    "NIU Cafe", 
    -77.04544128497375, 
    -12.111636552006043, 
    "cafe", 
    new BABYLON.Color3(0.45, 0.28, 0.12),
    1
    );
  createNiuStoreAtLonLat(
    "NIU Farma",  
    -77.03697168623347, 
    -12.107450799916593, 
    "farmacia", 
    new BABYLON.Color3(0.10, 0.55, 0.35),
    3
    );
  createNiuStoreAtLonLat(
    "NIU Pizza", 
    -77.0340590870312, 
    -12.105419655719947, 
    "pizza", 
    new BABYLON.Color3(0.80, 0.25, 0.15),
    1
    );
  createNiuStoreAtLonLat("NIU Cafe", -77.03039415212709, -12.10884061432611, "cafe", new BABYLON.Color3(0.45, 0.28, 0.12),2.5);
  createNiuStoreAtLonLat("NIU Farma", -77.02833013404889, -12.107532286794402, "farmacia", new BABYLON.Color3(0.10, 0.55, 0.35), 3);
}
// =========================
// CHAT MUNDIAL DEMO
// =========================

let worldChatUsername =
  localStorage.getItem("niuwd_session_user") ||
  localStorage.getItem("niuwd_username") ||
  "Invitado";

localStorage.setItem("niuwd_username", worldChatUsername);

type WorldChatMessage = {
  user: string;
  text: string;
  time: number;
};

function getWorldChatMessages(): WorldChatMessage[] {
  return JSON.parse(
    localStorage.getItem("niuwd_world_chat") || "[]"
  );
}

function saveWorldChatMessages(messages: WorldChatMessage[]) {
  localStorage.setItem(
    "niuwd_world_chat",
    JSON.stringify(messages.slice(-40))
  );
}
const WORLD_CHAT_LIMIT = 21;

async function loadWorldChatFromCloud() {
  const { data, error } = await supabase
    .from("world_chat")
    .select("user_name, body, created_at")
    .order("created_at", { ascending: false })
    .limit(WORLD_CHAT_LIMIT);

  if (error) {
    console.warn("world_chat load:", error.message);
    return;
  }

  const messages = (data || [])
    .slice()
    .reverse()
    .map((m) => ({
      user: m.user_name,
      text: m.body,
      time: new Date(m.created_at).getTime(),
    }));

  localStorage.setItem("niuwd_world_chat", JSON.stringify(messages));
  renderWorldChat();
}

async function trimWorldChat() {
  const { data } = await supabase
    .from("world_chat")
    .select("id, created_at")
    .order("created_at", { ascending: false });

  if (!data || data.length <= WORLD_CHAT_LIMIT) return;

  const toDelete = data.slice(WORLD_CHAT_LIMIT).map((r) => r.id);
  if (toDelete.length) {
    await supabase.from("world_chat").delete().in("id", toDelete);
  }
}

function subscribeWorldChatRealtime() {
  supabase
    .channel("world-chat-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "world_chat" },
      () => {
        void loadWorldChatFromCloud();
      }
    )
    .subscribe();
}
// =========================
// PANEL MISIÓN ENTREGA MEDICINA
// Se muestra encima del chat mundial
// =========================

const medicineMissionPanel =
  document.createElement("div");

medicineMissionPanel.style.position = "fixed";
medicineMissionPanel.style.left = "12px";

// El chat está en bottom 205px y mide 210px.
// Este panel queda justo encima.
medicineMissionPanel.style.bottom = "425px";

medicineMissionPanel.style.width = "310px";
medicineMissionPanel.style.boxSizing = "border-box";

medicineMissionPanel.style.background =
  "rgba(18, 20, 27, 0.94)";

medicineMissionPanel.style.border =
  "1px solid rgba(255, 70, 160, 0.55)";

medicineMissionPanel.style.borderRadius = "12px";
medicineMissionPanel.style.padding = "12px";

medicineMissionPanel.style.color = "white";
medicineMissionPanel.style.fontFamily = "Arial";
medicineMissionPanel.style.zIndex = "510";

medicineMissionPanel.style.boxShadow =
  "0 6px 20px rgba(0,0,0,0.55)";

medicineMissionPanel.style.display = "none";

document.body.appendChild(
  medicineMissionPanel
);

function showMedicineMissionPanel() {
  medicineMissionPanel.style.display = "block";

  medicineMissionPanel.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:10px;
    ">
      <div style="
        width:34px;
        height:34px;
        min-width:34px;
        border-radius:9px;
        background:#e83e8c;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
      ">
        💊
      </div>

      <div>
        <div style="
          font-size:15px;
          font-weight:bold;
          color:white;
        ">
          ENTREGA MEDICINA
        </div>

        <div style="
          font-size:11px;
          color:#ff8bc0;
          margin-top:2px;
        ">
          Manhattan
        </div>
      </div>
    </div>

    <div style="
      font-size:14px;
      line-height:1.4;
      color:#f2f2f2;
      margin-bottom:9px;
    ">
      Ve al hospital y entrega las medicinas
      a los pacientes.
    </div>

    <div style="
      padding:8px 10px;
      border-radius:8px;
      background:rgba(185, 20, 80, 0.22);
      border:1px solid rgba(255, 58, 130, 0.45);
      color:#ff7cac;
      font-size:13px;
      font-weight:bold;
      text-align:center;
      letter-spacing:0.5px;
      margin-bottom:8px;
    ">
      ⚠ CUIDADO CON LOS FANTASMAS
    </div>

    <div id="medicineMissionProgress" style="
      font-size:12px;
      color:#cccccc;
      line-height:1.4;
    ">
      Entregas completadas: 0
    </div>
  `;
}

function updateMedicineMissionPanel() {
  const progress =
    document.getElementById(
      "medicineMissionProgress"
    );

  if (!progress) return;

  const objective =
    medicineDeliveryStage === "goToHospital"
      ? "Objetivo: recoge medicinas en el hospital."
      : "Objetivo: entrega las medicinas en la casa.";

  progress.innerHTML = `
    ${objective}<br>
    Entregas completadas:
    <strong style="color:#ffd23c;">
      ${medicineDeliveryCount}
    </strong>
  `;
}

function hideMedicineMissionPanel() {
  medicineMissionPanel.style.display = "none";
  medicineMissionPanel.innerHTML = "";
}
const worldChat = document.createElement("div");
worldChat.style.position = "fixed";
worldChat.style.left = "12px";
worldChat.style.bottom = "205px";
worldChat.style.width = "310px";
worldChat.style.height = "210px";
worldChat.style.background = "rgba(14, 18, 24, 0.88)";
worldChat.style.color = "white";
worldChat.style.borderRadius = "12px";
worldChat.style.padding = "12px";
worldChat.style.zIndex = "500";
worldChat.style.fontFamily = "Arial";
worldChat.style.fontSize = "16px";
worldChat.style.boxSizing = "border-box";
worldChat.style.boxShadow = "0 6px 18px rgba(0,0,0,0.45)";

worldChat.innerHTML = `
  <div style="
    font-weight:bold;
    margin-bottom:10px;
    font-size:16px;
    letter-spacing:0.5px;
  ">
    CHAT GLOBAL
  </div>

  <div id="worldChatMessages" style="
    height:116px;
    overflow-y:auto;
    padding:0 4px;
    margin-bottom:10px;
    line-height:1.35;
  "></div>

  <div style="
    display:flex;
    gap:6px;
    align-items:center;
    background:rgba(255,255,255,0.08);
    border-radius:8px;
    padding:6px;
  ">
    <input id="worldChatInput" placeholder="Escribe un mensaje..." style="
      flex:1;
      background:transparent;
      color:white;
      padding:6px;
      border:0;
      outline:none;
      font-size:15px;
    ">

    <button id="worldChatSend" style="
      width:34px;
      height:30px;
      border:0;
      border-radius:8px;
      cursor:pointer;
      font-weight:bold;
      background:rgba(255,255,255,0.2);
      color:white;
      font-size:18px;
    ">
      ➤
    </button>
  </div>
`;

document.body.appendChild(worldChat);

const worldChatMessagesDiv =
  document.getElementById("worldChatMessages") as HTMLDivElement;

const worldChatInput =
  document.getElementById("worldChatInput") as HTMLInputElement;

const worldChatSend =
  document.getElementById("worldChatSend") as HTMLButtonElement;

function safeChatText(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderWorldChat() {
  const messages = getWorldChatMessages();

  worldChatMessagesDiv.innerHTML = messages
    .map(
      (msg) =>
        `<div style="margin-bottom:6px;">
  <strong style="color:#38d86f;">${safeChatText(msg.user)}:</strong>
  ${safeChatText(msg.text)}
</div>`
    )
    .join("");

  worldChatMessagesDiv.scrollTop = worldChatMessagesDiv.scrollHeight;
}

async function sendWorldChatMessage() {
  const text = worldChatInput.value.trim();
  if (!text) return;

  const user =
    localStorage.getItem("niuwd_session_user") ||
    localStorage.getItem("niuwd_username") ||
    worldChatUsername ||
    "Invitado";

  const { error } = await supabase.from("world_chat").insert({
    user_name: user,
    body: text,
  });

  if (error) {
    console.warn("world_chat send:", error.message);
    alert("No se pudo enviar el mensaje");
    return;
  }

  worldChatInput.value = "";
  await trimWorldChat();
  await loadWorldChatFromCloud();
}

worldChatSend.onclick = sendWorldChatMessage;

worldChatInput.addEventListener("keydown", (e) => {
  e.stopPropagation();

  keys[e.key.toLowerCase()] = false;

  if (e.key === "Enter") {
    e.preventDefault();
    sendWorldChatMessage();
  }
});

worldChatInput.addEventListener("keyup", (e) => {
  e.stopPropagation();
  keys[e.key.toLowerCase()] = false;
});

worldChatInput.addEventListener("focus", () => {
  for (const k in keys) {
    keys[k] = false;
  }
});

worldChatInput.addEventListener("click", (e) => {
  e.stopPropagation();
  worldChatInput.focus();
});

renderWorldChat();

setInterval(renderWorldChat, 1000);

function showCitySelector() {
  const cityScreen = document.createElement("div");

  cityScreen.style.position = "fixed";
  cityScreen.style.inset = "0";
  cityScreen.style.background = "linear-gradient(#07111f, #000)";
  cityScreen.style.color = "white";
  cityScreen.style.zIndex = "99999";
  cityScreen.style.display = "flex";
  cityScreen.style.flexDirection = "column";
  cityScreen.style.alignItems = "center";
  cityScreen.style.justifyContent = "center";
  cityScreen.style.fontFamily = "Arial";
  cityScreen.style.gap = "18px";

  cityScreen.innerHTML = `
  <h1>NIUWD</h1>
  <p>Selecciona una ciudad</p>

  <button id="selectLima" style="
    padding:14px 32px;
    border-radius:12px;
    border:0;
    font-size:18px;
    cursor:pointer;
  ">
    Miraflores
  </button>
`;

  document.body.appendChild(cityScreen);

  document.getElementById("selectLima")!.onclick = async () => {
  cityScreen.remove();
  await setupInitialGame("lima");
};
}
// =========================
// AUTH NIU - Registro / Login
// =========================

const NIU_USERS_KEY = "niuwd_users";
const NIU_SESSION_KEY = "niuwd_session_user";

type NiuUser = {
  username: string;
  email: string;
  password: string;
  createdAt: number;
};

function getStoredUsers(): NiuUser[] {
  try {
    return JSON.parse(localStorage.getItem(NIU_USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveStoredUsers(users: NiuUser[]) {
  localStorage.setItem(NIU_USERS_KEY, JSON.stringify(users));
}

function setSessionUser(username: string) {
  localStorage.setItem(NIU_SESSION_KEY, username);
  localStorage.setItem("niuwd_username", username);
}

function getSessionUser(): string | null {
  return localStorage.getItem(NIU_SESSION_KEY);
}

function showAuthScreen(mode: "register" | "login" = "register") {
  const session = getSessionUser();
  if (session) {
    if (typeof worldChatUsername !== "undefined") {
      worldChatUsername = session;
    }
    setupInitialGame("lima");
    return;
  }

  const existing = document.getElementById("niuAuthScreen");
  if (existing) existing.remove();

  const isRegister = mode === "register";

  const screen = document.createElement("div");
  screen.id = "niuAuthScreen";
  screen.style.cssText = `
    position:fixed; inset:0; z-index:100000;
    background: radial-gradient(ellipse at 25% 15%, #15233d 0%, #0a1220 42%, #070b14 100%);
    color:#e8eef8; font-family: Arial, Helvetica, sans-serif;
    overflow:auto;
  `;

  screen.innerHTML = `
    <div style="
      min-height:100%;
      box-sizing:border-box;
      padding:28px 40px 110px;
      display:flex;
      flex-direction:column;
    ">
      <!-- TOP CONTENT -->
      <div style="
        flex:1;
        display:grid;
        grid-template-columns: 1.15fr 0.9fr;
        gap:40px;
        align-items:center;
        max-width:1180px;
        width:100%;
        margin:0 auto;
      ">
                <!-- LEFT -->
        <div style="display:flex; flex-direction:column; gap:22px;">

          <!-- Badge -->
          <img
            src="/niu-badge.png"
            alt="niu"
            style="width:130px; height:auto; display:block; border-radius:12px;"
          />

          <!-- Título + Logo en la MISMA fila -->
          <div style="
            display:grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap:18px;
            align-items:center;
          ">
            <!-- Texto -->
            <div>
              <h1 style="
                margin:0 0 14px 0;
                font-size:44px;
                line-height:1.05;
                font-weight:800;
                color:#ffffff;
              ">
                Explora.<br>Conecta.<br>Vive tu ciudad.
              </h1>
              <p style="
                margin:0;
                max-width:340px;
                color:#9eafc7;
                font-size:15px;
                line-height:1.55;
              ">
                Recorre ciudades reales, completa misiones, haz amigos y
                descubre un mundo lleno de posibilidades.
              </p>
            </div>

            <!-- Logo NIU Digital World -->
            <div style="display:flex; justify-content:center; align-items:center;">
              <img
                src="/niu-logo.png"
                alt="Niu Digital World"
                style="
                  width:370px;
                  max-width:none;
                  height:auto;
                  display:block;
                  filter: drop-shadow(0 0 20px rgba(60,130,255,0.4));
                "
              />
            </div>
          </div>

          <!-- Features 2x2 -->
          <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
            max-width:560px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.06);
            border-radius:18px;
            padding:14px;
          ">
                        ${miniFeature("#3b82f6", "📍", "Lugares reales", "Explora ciudades basadas en el mundo real.")}
            ${miniFeature("#eab308", "🪙", "Monedas Niu", "Acumula monedas y desbloquea nuevas opciones.")}
            ${miniFeature("#8b5cf6", "🔒", "Sin publicidad invasiva", "Disfruta de Niu sin interrupciones.")}
            ${miniFeature("#3b82f6", "🌐", "Siempre en evolución", "Nuevas funciones, ciudades y experiencias.")}
          </div>
        </div>

        <!-- RIGHT FORM -->
        <div style="
          background:rgba(14,22,36,0.95);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:22px;
          padding:30px 28px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        ">
          <h2 style="margin:0 0 6px 0; font-size:30px; color:#fff; font-weight:800;">
            ${isRegister ? "Únete a Niu" : "Iniciar Sesión"}
          </h2>
          <p style="margin:0 0 22px 0; color:#93a4bc; font-size:14px;">
            ${
              isRegister
                ? "Crea tu cuenta y comienza tu aventura."
                : "Bienvenido de vuelta. Nos alegra verte otra vez."
            }
          </p>

          <div style="display:grid; gap:13px;">
            <div>
              <label style="${labelStyle}">Nombre de usuario</label>
              <input id="authUsername" type="text" placeholder="Elige tu nombre en Niu" style="${inputStyle}" />
            </div>

            ${
              isRegister
                ? `
              <div>
                <label style="${labelStyle}">Correo electrónico</label>
                <input id="authEmail" type="email" placeholder="ejempo@correo.com" style="${inputStyle}" />
              </div>
            `
                : ""
            }

            <div>
              <label style="${labelStyle}">Contraseña</label>
              <input id="authPassword" type="password"
                placeholder="${isRegister ? "Crea una contraseña segura" : "Ingresa tu contraseña"}"
                style="${inputStyle}" />
            </div>

            ${
              isRegister
                ? `
              <label style="display:flex; gap:8px; align-items:flex-start; color:#9aa9c0; font-size:13px; cursor:pointer;">
                <input id="authTerms" type="checkbox" style="margin-top:2px;" />
                               <span>
                  Acepto los
                  <a
                    href="/terminos-de-uso.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color:#7ec8ff; text-decoration:underline;"
                  >Términos de uso</a>
                  y la
                  <a
                    href="/politica-de-privacidad.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="color:#7ec8ff; text-decoration:underline;"
                  >Política de privacidad</a>
                </span>
              </label>
            `
                : ""
            }

            <div id="authError" style="
              display:none; color:#ff6b6b; font-size:13px;
              background:rgba(255,80,80,0.08);
              border:1px solid rgba(255,80,80,0.25);
              padding:8px 10px; border-radius:10px;
            "></div>

            <button id="authPrimaryBtn" style="
              width:100%; border:0; border-radius:12px;
              padding:14px 16px; font-size:15px; font-weight:700;
              cursor:pointer; color:#ffffff;
background: linear-gradient(180deg, #3db7ff, #4d6dff);
              margin-top:2px;
            ">
              ${isRegister ? "Crear cuenta" : "Iniciar Sesión"}
            </button>

                        <button id="authSwitchBtn" style="
              width:100%;
              border:1px solid rgba(255,255,255,0.12);
              border-radius:12px;
              padding:13px 16px;
              font-size:14px;
              font-weight:700;
              cursor:pointer;
              background:#fff;
              color:#222;
              margin-top:4px;
            ">
              ${isRegister ? "Iniciar Sesión" : "Crear cuenta"}
            </button>

            <div style="margin-top:6px; display:flex; gap:8px; color:#7f8da6; font-size:12px; line-height:1.4;">
              <span>🛡️</span>
              <span>
                <strong style="color:#b7c5db;">Tu seguridad es importante</strong><br>
                No compartiremos tu información con terceros.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

        <div style="text-align:center; color:#7b8ba6; font-size:14px;">
        <div>© 2026 Niu. Todos los derechos reservados.</div>
        <div style="margin-top:4px;">
          </div>
      </div>
    </div>
  `;
    document.querySelectorAll('#niuAuthScreen a[href$=".pdf"]').forEach((a) => {
    a.addEventListener("click", (e) => e.stopPropagation());
  });

  const style = document.createElement("style");
  style.textContent = `
    @media (max-width: 920px) {
      #niuAuthScreen > div > div:first-child {
        grid-template-columns: 1fr !important;
      }
      #niuAuthScreen div[style*="grid-template-columns:repeat(4"] {
        grid-template-columns: 1fr 1fr !important;
      }
    }
    #niuAuthScreen input:focus {
      outline:none;
      border-color:#6aa8ff !important;
      box-shadow: 0 0 0 3px rgba(80,140,255,0.18);
    }
  `;
  screen.appendChild(style);
  document.body.appendChild(screen);

  // handlers (igual que antes)
  const errorBox = document.getElementById("authError") as HTMLDivElement;
  const usernameInput = document.getElementById("authUsername") as HTMLInputElement;
  const passwordInput = document.getElementById("authPassword") as HTMLInputElement;
  const emailInput = document.getElementById("authEmail") as HTMLInputElement | null;
  const termsInput = document.getElementById("authTerms") as HTMLInputElement | null;

  function showError(msg: string) {
    errorBox.style.display = "block";
    errorBox.textContent = msg;
  }

  document.getElementById("authSwitchBtn")!.onclick = () => {
    showAuthScreen(isRegister ? "login" : "register");
  };

    document.getElementById("authPrimaryBtn")!.onclick = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const email = emailInput?.value.trim() || "";

    if (!username || username.length < 3) {
      showError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (!password || password.length < 4) {
      showError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (isRegister) {
      // ===== REGISTRO CON SUPABASE =====
      if (!email || !email.includes("@")) {
        showError("Ingresa un correo electrónico válido.");
        return;
      }
      if (termsInput && !termsInput.checked) {
        showError("Debes aceptar los Términos y la Política de privacidad.");
        return;
      }

      showError(""); // limpia error
      const primaryBtn = document.getElementById("authPrimaryBtn") as HTMLButtonElement;
      if (primaryBtn) primaryBtn.disabled = true;

      try {
        // 1) Crear usuario en Auth (email + password)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) {
          showError(error.message);
          if (primaryBtn) primaryBtn.disabled = false;
          return;
        }

        if (!data.user) {
          showError("No se pudo crear la cuenta. Intenta de nuevo.");
          if (primaryBtn) primaryBtn.disabled = false;
          return;
        }

        // 2) Crear perfil en la tabla profiles
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: username,
          fuel_liters: 700,
          digital_coins: 0,
          unlocked_cities: ["miraflores"],
          last_city: "miraflores",
        });

        if (profileError) {
          console.error("Error perfil:", profileError);
          // Si el perfil falla, igual intentamos entrar
        }

        // 3) Limpiar datos locales viejos de demos
        localStorage.setItem("niuwd_friends", "[]");
        localStorage.setItem("niuwd_friend_requests", "[]");
        localStorage.setItem("niuwd_world_chat", "[]");
        Object.keys(localStorage)
          .filter((k) => k.startsWith("niuwd_chat_"))
          .forEach((k) => localStorage.removeItem(k));

        localStorage.setItem("niuwd_session_user", username);
        localStorage.setItem("niuwd_username", username);
        localStorage.setItem("niuwd_fuel_liters", "700");
        localStorage.setItem("niuwd_digital_coins", "0");

        if (typeof worldChatUsername !== "undefined") {
          worldChatUsername = username;
        }

        screen.remove();
        await setupInitialGame("lima");
      } catch (err: any) {
        showError(err?.message || "Error al registrar.");
        if (primaryBtn) primaryBtn.disabled = false;
      }

      return;
    }

    // ===== LOGIN CON SUPABASE =====
    // En login usamos el campo usuario como EMAIL
    // (si en tu formulario de login no hay email, el usuario debe escribir el correo)
    const loginEmail = email || username;

    if (!loginEmail.includes("@")) {
      showError("Para iniciar sesión escribe tu correo electrónico.");
      return;
    }

    const primaryBtn = document.getElementById("authPrimaryBtn") as HTMLButtonElement;
    if (primaryBtn) primaryBtn.disabled = true;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        showError(error.message);
        if (primaryBtn) primaryBtn.disabled = false;
        return;
      }

      if (!data.user) {
        showError("No se pudo iniciar sesión.");
        if (primaryBtn) primaryBtn.disabled = false;
        return;
      }

      // Cargar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const uname =
        profile?.username ||
        (data.user.user_metadata?.username as string) ||
        loginEmail.split("@")[0];

      if (profile) {
        localStorage.setItem("niuwd_fuel_liters", String(profile.fuel_liters ?? 700));
        localStorage.setItem("niuwd_digital_coins", String(profile.digital_coins ?? 0));
        if (Array.isArray(profile.unlocked_cities)) {
          // si tienes unlockedCities en memoria, se actualizará al cargar el juego
          localStorage.setItem(
            "niuwd_unlocked_cities",
            JSON.stringify(profile.unlocked_cities)
          );
        }
      }

      localStorage.setItem("niuwd_session_user", uname);
      localStorage.setItem("niuwd_username", uname);

      if (typeof worldChatUsername !== "undefined") {
        worldChatUsername = uname;
      }

      screen.remove();
      await setupInitialGame("lima");
    } catch (err: any) {
      showError(err?.message || "Error al iniciar sesión.");
      if (primaryBtn) primaryBtn.disabled = false;
    }
  };
}

function miniFeature(color: string, icon: string, title: string, text: string) {
  return `
    <div style="
      background:rgba(255,255,255,0.035);
      border:1px solid rgba(255,255,255,0.06);
      border-radius:14px;
      padding:12px;
    ">
      <div style="
        width:26px; height:26px; border-radius:8px;
        background:${color};
        display:flex; align-items:center; justify-content:center;
        margin-bottom:7px; font-size:13px;
      ">${icon}</div>
      <div style="font-weight:700; font-size:13px; color:#edf3ff; margin-bottom:2px;">${title}</div>
      <div style="font-size:11px; color:#8b9bb3; line-height:1.35;">${text}</div>
    </div>
  `;
}

function footerItem(icon: string, color: string, title: string, text: string) {
  return `
    <div style="display:flex; gap:8px; align-items:flex-start;">
      <div style="
        width:22px; height:22px; border-radius:999px;
        background:${color}22; color:${color};
        display:flex; align-items:center; justify-content:center;
        font-size:12px; flex-shrink:0;
      ">${icon}</div>
      <div>
        <div style="font-size:12px; font-weight:700; color:#dce6f5;">${title}</div>
        <div style="font-size:11px; color:#7f8da6; line-height:1.3;">${text}</div>
      </div>
    </div>
  `;
}

const labelStyle = `
  display:block; margin-bottom:6px;
  font-size:13px; color:#c2cde0; font-weight:600;
`;

const inputStyle = `
  width:100%; box-sizing:border-box;
  background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.10);
  border-radius:12px; padding:12px 14px;
  color:#fff; font-size:14px;
`;
// Pantalla de ciudades desactivada por ahora
// showCitySelector();
showAuthScreen("register"); // pantalla inicial: Únete a Niu

updateDayNightCycle();
setInterval(() => {
  updateDayNightCycle();
}, 60000);
function getNearestRoadPoint(pos: BABYLON.Vector3) {
  if (roadSegments.length === 0) {
    return pos.clone();
  }

  let bestPoint = pos.clone();
  let bestDist = Infinity;

  for (const seg of roadSegments) {
    const point = closestPointOnSegment(pos, seg.a, seg.b);
    const dist = BABYLON.Vector3.Distance(pos, point);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = point;
    }
  }

  bestPoint.y = 0.18;
  return bestPoint;
}
function getNearestGpsRoadPoint(pos: BABYLON.Vector3) {
  const source = gpsRoadSegments.length > 0 ? gpsRoadSegments : roadSegments;

  if (source.length === 0) {
    return pos.clone();
  }

  let bestPoint = pos.clone();
  let bestDist = Infinity;

  for (const seg of source) {
    const point = closestPointOnSegment(pos, seg.a, seg.b);
    const dist = BABYLON.Vector3.Distance(pos, point);

    if (dist < bestDist) {
      bestDist = dist;
      bestPoint = point;
    }
  }

  bestPoint.y = 0.22;
  return bestPoint;
}
async function travelToRealEstateProject() {
  showTravelLoading(
    "Ingresando a Residencial El Olivar..."
  );

  try {
    // =========================
    // REINICIAR ESTADO ANTERIOR
    // =========================

    inCar = false;
    carVelocity = 0;
    carEngineOn = false;
    currentGear = 1;
    speedKmh = 0;

    stopIdleSound();

    insideOlivarMap = true;
    currentMapName = "real-estate";
    currentZone = "realEstate";

    // Borrar Miraflores y sus objetos.
    clearCurrentMap();

    /*
     * Esperar a que Babylon termine de eliminar
     * los objetos del escenario anterior.
     */
    await new Promise<void>(
      (resolve) => {
        requestAnimationFrame(
          () => resolve()
        );
      }
    );

    // =========================
    // CENTRO DEL NUEVO MAPA
    // =========================

    centerLon =
      -76.55265251976029;

    centerLat =
      -12.132344151855332;

    // Eliminar segmentos anteriores.
    roadSegments.length = 0;
    sidewalkPaths.length = 0;

    // =========================
    // CREAR PROYECTO
    // =========================

    const project =
      createRealEstateProject({
        scene,

        addRoadSegment: (
          segment
        ) => {
          roadSegments.push({
            a: segment.a,
            b: segment.b,
            radius: segment.radius,
            name: segment.name,
            oneway: segment.oneway,
          });
        },

        registerChunkMesh: (
          mesh
        ) => {
          registerChunkMesh(mesh);
        },

        registerCullable: (
          mesh
        ) => {
          registerCullable(mesh);
        },
      });

    // =========================
    // POSICIONES DE APARICIÓN
    // =========================
    /*
     * La entrada del residencial se encuentra
     * aproximadamente en Z = -176.
     *
     * Colocamos al avatar y al auto antes de la
     * entrada para que el usuario pueda observarla
     * y entrar conduciendo.
     */

    const playerOutsideSpawn =
      new BABYLON.Vector3(
        -7,
        project.spawnPosition.y,
        -200
      );

    const carOutsideSpawn =
      new BABYLON.Vector3(
        7,
        project.carSpawnPosition.y,
        -180
      );

    // =========================
    // CREAR AVATAR
    // =========================

    createAvatar(
      playerOutsideSpawn
    );

    // =========================
    // CREAR VEHÍCULO
    // =========================

    createNiuSportCar(
      carOutsideSpawn
    );

    /*
     * Esperar un frame para que Babylon termine
     * de crear el auto, sus faros y sus nodos hijos.
     */
    await new Promise<void>(
      (resolve) => {
        requestAnimationFrame(
          () => resolve()
        );
      }
    );

    // =========================
    // ASEGURAR ESTADO DEL AUTO
    // =========================

    car.setEnabled(true);

    car.position.copyFrom(
      carOutsideSpawn
    );

    /*
     * El auto mira hacia la entrada del residencial.
     * La avenida avanza desde Z negativo hacia Z positivo.
     */
    car.rotation.set(
      0,
      0,
      0
    );

    /*
     * Fuerza la actualización de la posición mundial
     * del auto y de sus objetos hijos, incluidos los faros.
     */
    car.computeWorldMatrix(
      true
    );

    for (
      const child of
      car.getChildMeshes()
    ) {
      child.computeWorldMatrix(
        true
      );
    }

    // =========================
    // ASEGURAR ESTADO DEL AVATAR
    // =========================

    player.setEnabled(true);

    player.position.copyFrom(
      playerOutsideSpawn
    );

    player.rotation.y = 0;

    player.computeWorldMatrix(
      true
    );

    // El avatar comienza fuera del auto.
    inCar = false;
    carVelocity = 0;
    carEngineOn = false;
    currentGear = 1;
    speedKmh = 0;

    // Crear nuevamente los sonidos del vehículo.
    setupCarSounds();

    // Crear sistema de misiones.
    createMissionSystem();

    // =========================
    // CÁMARA
    // =========================

    camera.lockedTarget = null;

    camera.target.copyFrom(
      player.position
    );

    camera.alpha =
      Math.PI / 2;

    camera.beta =
      Math.PI / 3;

    camera.radius =
      28;

    // =========================
    // ACTUALIZAR ESCENARIO
    // =========================

    updateChunks();
    updateMapVisibility();
    updateCulling();
    updateDayNightCycle();

    /*
     * Esperar un segundo frame para que las luces,
     * la cámara y todos los nodos ya estén activos.
     */
    await new Promise<void>(
      (resolve) => {
        requestAnimationFrame(
          () => resolve()
        );
      }
    );

    car.computeWorldMatrix(
      true
    );

    player.computeWorldMatrix(
      true
    );

    hideTravelLoading();

    hideTravelLoading();

// Mostrar permanentemente la información
// de la visita mientras el usuario esté
// dentro del proyecto inmobiliario.
showRealEstateVisitCard();

showMissionMessage(
  "Bienvenido a NIU Residencial El Olivar",
  4000
);

    console.log(
      "Residencial El Olivar cargado correctamente"
    );

    console.log(
      "Avatar:",
      player.position.toString()
    );

    console.log(
      "Auto:",
      car.position.toString()
    );
  } catch (error) {
    console.error(
      "Error cargando Residencial El Olivar:",
      error
    );

    hideTravelLoading();

    showMissionMessage(
      "No se pudo cargar Residencial El Olivar.",
      6000
    );
  }
}
async function travelToSanIsidro() {
  insideOlivarMap = true;
  currentMapName = "san-isidro";

  clearCurrentMap();

  centerLon = -77.0360;
  centerLat = -12.0998;

  await loadMap("san-isidro-olivar.geojson");

  const startPos = lonLatToWorld(
    -77.0360,
    -12.0998
  );

  createAvatar(new BABYLON.Vector3(startPos.x, 1, startPos.z));
  createNiuSportCar(new BABYLON.Vector3(startPos.x + 4, 0.18, startPos.z));

  createMissionSystem();

  carVelocity = 0;
  inCar = false;

  camera.target = player.position;

  updateChunks();
  updateMapVisibility();
  updateCulling();

  console.log("Mapa Olivar cargado limpio");
}
async function travelToLimaKennedy() {
  // Evita ejecutar el regreso dos veces.
  if (
    currentMapName === "miraflores" &&
    !insideOlivarMap
  ) {
    return;
  }

  // Ocultar la tarjeta del proyecto.
  hideMissionCard();

  // Detener completamente el vehículo.
  inCar = false;
  carVelocity = 0;
  carEngineOn = false;
  speedKmh = 0;
  currentGear = 1;
  headlightMode = 0;

  stopIdleSound();

  // Cerrar ventanas abiertas.
  socialWindow.style.display = "none";
  socialWindow.innerHTML = "";

  showTravelLoading(
    "Regresando a Parque Kennedy..."
  );

  /*
   * Guardamos una marca temporal.
   * sessionStorage se conserva durante la recarga,
   * pero se elimina al cerrar la pestaña.
   */
  sessionStorage.setItem(
    RETURN_TO_LIMA_KEY,
    "true"
  );

  /*
   * Esperamos un momento para permitir que
   * aparezca la pantalla de carga.
   */
  await new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        250
      );
    }
  );

  /*
   * Recarga interna completa.
   * Esto reconstruye todos los materiales,
   * fachadas, luces, tiendas y objetos exactamente
   * como al comenzar el juego.
   */
  window.location.reload();
}
async function travelToManhattan() {
  // Evita que el loop intente usar objetos antiguos
  inCar = false;
  carVelocity = 0;
  carEngineOn = false;
  stopIdleSound();

  currentMapName = "manhattan";
  currentZone = "manhattan";
  insideOlivarMap = false;

  clearCurrentMap();

  // Esperar un frame después de limpiar Beverly Hills
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  centerLon = -73.98956329115248;
  centerLat = 40.74161558189231;

  updateDayNightCycle();

  await loadMap("manhattan.geojson");

  loadedZones.clear();
  loadedZones.add("manhattan");

  const startPos = lonLatToWorld(
    -73.98956329115248,
    40.74161558189231
  );

  createAvatar(
    new BABYLON.Vector3(
      startPos.x,
      1,
      startPos.z
    )
  );

  createNiuSportCar(
    new BABYLON.Vector3(
      startPos.x + 4,
      0.18,
      startPos.z
    )
  );

  createMissionSystem();

  // Niu Travel Manhattan
  createNiuTravelBoothAtLonLat(
  -73.98940620374685,
  40.74128561935433,
  Math.PI / 2
);

// =========================
// GASOLINERA MANHATTAN
// =========================
createGasStationAtLonLat(
  -73.9982908359761,
  40.74863802624437,
  0.5
);

// =========================
// MANHATTAN HOSPITAL
// Punto inicial de la futura
// misión nocturna de fantasmas
// =========================

createManhattanHospitalAtLonLat(
  MANHATTAN_HOSPITAL.lon,
  MANHATTAN_HOSPITAL.lat,
  MANHATTAN_HOSPITAL.rotationY
);

// =========================
// CASA 1 DE ENTREGA DE MEDICINAS
// =========================

// =========================
// CASAS DE ENTREGA DE MEDICINA
// =========================

createAllManhattanMedicineHouses();

  // Asegurar que el auto esté sobre una calle
  if (!isOnRoad(car.position) && roadSegments.length > 0) {
    const roadPoint =
      getNearestRoadPoint(car.position);

    car.position.copyFrom(roadPoint);
    car.position.y = 0.22;

    player.position.copyFrom(
      roadPoint.add(
        new BABYLON.Vector3(3, 0.85, 0)
      )
    );
  }

  carVelocity = 0;
  carEngineOn = false;
  currentGear = 1;
  speedKmh = 0;
  inCar = false;

  camera.target = player.position;

  updateChunks();
  updateMapVisibility();
  updateCulling();
  updateDayNightCycle();

  showMissionMessage(
    "Bienvenido a Manhattan",
    5000
  );
}

async function travelToBeverlyHills() {
  
  currentMapName = "beverly-hills";
  currentZone = "beverlyHills";

  clearCurrentMap();

  centerLon = -118.41021551751912;
  centerLat = 34.08324447121339;

  updateDayNightCycle();

  await loadMap("beverly-hills.geojson");

  loadedZones.clear();
  loadedZones.add("beverlyHills");

  const startPos = lonLatToWorld(
    -118.41021551751912,
    34.08324447121339
  );

  createAvatar(new BABYLON.Vector3(startPos.x, 1, startPos.z));
  createNiuSportCar(new BABYLON.Vector3(startPos.x + 4, 0.18, startPos.z));

  createMissionSystem();
  // Niu Travel Beverly Hills
createNiuTravelBoothAtLonLat(
  -118.410152798886,
  34.08369100987586,
  -Math.PI / 2.5
);

// Mansiones (aros de la misión)
createBeverlyMansionAuras();

// =========================
// MANSÓN 1
// =========================
createBeverlyMansion1AtLonLat(
  -118.4156511784348, // lon
  34.09381805787459,   // lat
  -1.57                    // rotationY (ajusta si no mira a la calle)
);

// =========================
// MANSÓN 2
// =========================
createBeverlyMansion2AtLonLat(
  -118.40096827750483, // lon
  34.09390871689806,  // lat
  0.01                    // rotationY
);

// =========================
// MANSÓN 3
// =========================
createBeverlyMansion3AtLonLat(
  -118.41436633095762, // lon
  34.089038349093336, // lat
  0                   // rotationY (ajusta con Math.PI / 2 si hace falta)
);

// =========================
// GASOLINERA BEVERLY HILLS
// =========================
createGasStationAtLonLat(
  -118.41450387189992,
  34.08571843040706,
  3.5
);

  carVelocity = 0;
  inCar = false;
  camera.target = player.position;

  updateChunks();
  updateMapVisibility();
  updateCulling();
  updateDayNightCycle();

  showMissionMessage("Bienvenido a Beverly Hills");
}
function updateGpsNavigationArrow() {
  if (!car || !gpsArrow) return;
  if (!gpsNavigationActive) return;

  let target: BABYLON.Vector3 | null = null;

  if (gpsRoute.length >= 2) {
  while (
    gpsCurrentIndex < gpsRoute.length - 1 &&
    BABYLON.Vector3.Distance(car.position, gpsRoute[gpsCurrentIndex]) < 10
  ) {
    gpsCurrentIndex++;
  }

  target = gpsRoute[gpsCurrentIndex];
}

  if (!target && gpsDestination) {
    target = gpsDestination;
  }

  if (!target) return;

  const dir = target.subtract(car.position);
  dir.y = 0;

  if (dir.length() < 0.1) return;

  dir.normalize();

  gpsArrow.position = car.position
    .add(dir.scale(1.8))
    .add(new BABYLON.Vector3(0, 2.05, 0));

  gpsArrow.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
  gpsArrow.scaling = new BABYLON.Vector3(0.85, 0.85, 0.85);
  gpsArrow.setEnabled(true);
}
function updateMission() {
  if (!car || !gpsArrow || !pickupAura || !deliveryAura) return;
  if (missionStage === "inactive") {
  return;
}

  const target = missionStage === "pickup" ? pickupPoint : deliveryPoint;
  const activeAura = missionStage === "pickup" ? pickupAura : deliveryAura;

  // Flecha GPS
  const dir = target.subtract(car.position);
  dir.y = 0;

  if (dir.length() > 0.1) {
    dir.normalize();
    gpsArrow.position = car.position.add(new BABYLON.Vector3(0, 3.2, 0));
    gpsArrow.rotation.y = Math.atan2(dir.x, dir.z) + Math.PI;
    gpsArrow.setEnabled(true);
  }

  // Animación del aura
  activeAura.rotation.y += 0.05;
  activeAura.scaling.x = 1 + Math.sin(Date.now() * 0.008) * 0.12;
  activeAura.scaling.z = 1 + Math.sin(Date.now() * 0.008) * 0.12;

  // Distancia horizontal real, ignorando altura
  const dx = car.position.x - activeAura.position.x;
  const dz = car.position.z - activeAura.position.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  // Si el auto toca el aura rosada
  if (missionStage === "pickup" && distance < 9) {
    missionStage = "delivery";

    pickupAura.setEnabled(false);
    deliveryAura.setEnabled(true);

    console.log("Pedido recogido");
    return;
  }

  // Si el auto toca el aura azul
  if (missionStage === "delivery" && distance < 9) {
  missionStage = "pickup";

  deliveryAura.setEnabled(false);
  pickupAura.setEnabled(true);

  addDigitalCoins(5);

  console.log("Pedido entregado. Ganaste 5 monedas digitales");
return;
}
}

minimap.addEventListener("mousedown", (e) => {
  if (!minimapExpanded) return;

  isDraggingMap = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

window.addEventListener("mouseup", () => {
  isDraggingMap = false;
});

window.addEventListener("mousemove", (e) => {
  if (!minimapExpanded || !isDraggingMap) return;

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;

  mapOffsetX -= dx / mapZoom;
  mapOffsetZ -= dy / mapZoom;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

minimap.addEventListener("wheel", (e) => {
  if (!minimapExpanded) return;

  e.preventDefault();

  if (e.deltaY < 0) {
    mapZoom *= 1.12;
  } else {
    mapZoom *= 0.88;
  }

  mapZoom = Math.max(0.25, Math.min(0.99, mapZoom));
});
function setRouteGpsToCurrentCheckpoint() {
  if (!currentRouteMission) return;
  if (!player || !car) return;

  const point = currentRouteMission.points[currentRouteIndex];

  if (!point) return;

  const lat = point[0];
  const lon = point[1];

  gpsRoute = [];
  gpsDestination = null;
  gpsCurrentIndex = 0;

  setGpsDestination(lon, lat);

  gpsNavigationActive = true;

  if (gpsArrow) {
    gpsArrow.setEnabled(true);
  }
}
function updateRouteMission() {
  if (!routeMissionActive) return;
  if (!car) return;
  if (!currentRouteMission) return;

  const checkpoint =
    currentRouteCheckpoints[currentRouteIndex];

  if (!checkpoint) return;

  checkpoint.rotation.y += 0.04;

  const pulse =
    1 + Math.sin(Date.now() * 0.008) * 0.15;

  checkpoint.scaling.x = pulse;
  checkpoint.scaling.z = pulse;

  const dx = car.position.x - checkpoint.position.x;
  const dz = car.position.z - checkpoint.position.z;

  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist >= 7) return;

  checkpoint.dispose();

  currentRouteIndex++;

  if (currentRouteIndex >= currentRouteCheckpoints.length) {
    routeMissionActive = false;

    hideMissionCard();

    gpsNavigationActive = false;
    gpsRoute = [];
    gpsDestination = null;
    gpsTargetLon = null;
    gpsTargetLat = null;

    if (gpsArrow) {
      gpsArrow.setEnabled(false);
    }

    if (gpsDestinationAura) {
      gpsDestinationAura.dispose();
      gpsDestinationAura = null;
    }

    addDigitalCoins(currentRouteMission.reward);

showMissionMessage(
  "Has finalizado el recorrido.\nGanaste 25 monedas.",
  5000
);

currentRouteMission = null;

return;
  }

  currentRouteCheckpoints[currentRouteIndex].setEnabled(true);

  setRouteGpsToCurrentCheckpoint();

  showMissionMessage(
    `Punto ${currentRouteIndex + 1} de ${currentRouteCheckpoints.length}`
  );
}
function updateGpsDestinationAura() {
  if (!car || !gpsDestinationAura) return;
  if (gpsChangingZone) return;

  gpsDestinationAura.rotation.y += 0.05;

  const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
  gpsDestinationAura.scaling.x = pulse;
  gpsDestinationAura.scaling.z = pulse;

  const dx = car.position.x - gpsDestinationAura.position.x;
  const dz = car.position.z - gpsDestinationAura.position.z;
  const distance = Math.sqrt(dx * dx + dz * dz);

  // IMPORTANTE:
  // Si el jugador llegó al destino
if (distance < 10) {

  // En carreras el control lo hace updateRaceCircuit()
  if (raceMissionActive) {
    return;
  }

  // En recorridos el control lo hace updateRouteMission()
  if (routeMissionActive) {
    return;
  }
  // En Entrega Medicina, el cambio de etapa
// lo controla updateMedicineDeliveryMission().
if (medicineDeliveryMissionActive) {
  return;
}

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;
  gpsTargetLon = null;
  gpsTargetLat = null;

  if (gpsArrow) {
    gpsArrow.setEnabled(false);
  }

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

    console.log("GPS finalizado");
}
}

function loseRace() {
  raceMissionActive = false;
  raceGoingToStart = false;
  raceStarted = false;
  raceCountdownDone = false;
  countdownActive = false;

  gpsNavigationActive = false;
  gpsRoute = [];
  gpsDestination = null;

  gpsArrow?.setEnabled(false);

  if (gpsDestinationAura) {
    gpsDestinationAura.dispose();
    gpsDestinationAura = null;
  }

  hideMissionCard();

  raceText.style.display = "block";
  raceText.style.fontSize = "58px";
  raceText.innerText = "Has perdido";

  setTimeout(() => {
    raceText.style.display = "none";
    raceText.style.fontSize = "120px";
  }, 3500);

  raceStartLine?.dispose();
  raceFinishLine?.dispose();
  raceStartLine = null;
  raceFinishLine = null;

  clearRaceBots();
}
function clearRaceBots() {
  for (const bot of raceBots) {
    const children = bot.car.getChildTransformNodes();

    for (const child of children) {
      child.dispose();
    }

    bot.car.dispose(false, true);
  }

  raceBots.length = 0;
}
function setRaceBotRoute(
  bot: RaceBot,
  destination: BABYLON.Vector3
) {
  const savedGpsRoute = gpsRoute.map((p) => p.clone());
  const savedGpsDestination = gpsDestination ? gpsDestination.clone() : null;

  calculateGpsRoute(bot.car.position, destination);

  bot.route =
    gpsRoute.length > 1
      ? gpsRoute.map((p) => p.clone())
      : [bot.car.position.clone(), destination.clone()];

  bot.routeIndex = 1;

  gpsRoute = savedGpsRoute;
  gpsDestination = savedGpsDestination;
}
function updateRaceCircuit() {
  if (!car) return;
  if (!raceMissionActive) return;

    if (raceGoingToStart && raceStartLine && !countdownActive) {
    const distStart = BABYLON.Vector3.Distance(
      car.position,
      raceStartLine.position
    );

    if (distStart < 8) {
      if (multiplayerRaceActive) {
        // Multijugador: marcarme como listo, NO iniciar solo
        void markMyselfReadyAtStart();
      } else {
        // Circuito normal (1 jugador + bots)
        startRaceCountdown();
      }
    }

    return;
  }

  if (!raceStarted || !raceCountdownDone) return;
  if (!raceStartLine || !raceFinishLine) return;

  const targetLine =
    raceTarget === "finish" ? raceFinishLine : raceStartLine;

  const distTarget = BABYLON.Vector3.Distance(
    car.position,
    targetLine.position
  );

  if (distTarget > 8) return;

  if (raceTarget === "finish") {
    raceTarget = "start";

    showMissionMessage(`Vuelta ${raceLap}: vuelve al inicio`);

    setGpsDestination(
      activeRaceConfig.start.lon,
      activeRaceConfig.start.lat
    );

    return;
  }

  if (raceTarget === "start") {
    raceLap++;

    if (raceLap <= activeRaceConfig.laps) {
      raceTarget = "finish";

      showMissionMessage(
        `Vuelta ${raceLap} de ${activeRaceConfig.laps}`
      );

      setGpsDestination(
        activeRaceConfig.finish.lon,
        activeRaceConfig.finish.lat
      );

      return;
    }

    raceMissionActive = false;
    raceGoingToStart = false;
    raceStarted = false;
    raceCountdownDone = false;

    gpsNavigationActive = false;
    gpsRoute = [];
    gpsDestination = null;

    gpsArrow?.setEnabled(false);

    if (gpsDestinationAura) {
      gpsDestinationAura.dispose();
      gpsDestinationAura = null;
    }

    addDigitalCoins(activeRaceConfig.reward);

    hideMissionCard();

    raceText.style.display = "block";
    raceText.style.fontSize = "42px";
    raceText.innerText =
      `Completado\nGanaste ${activeRaceConfig.name}`;

    setTimeout(() => {
      raceText.style.display = "none";
      raceText.style.fontSize = "120px";
    }, 4000);

    clearRaceBots();

    raceStartLine?.dispose();
    raceFinishLine?.dispose();
    raceStartLine = null;
    raceFinishLine = null;
  }
}
// Loop
scene.onBeforeRenderObservable.add(() => {
    // =========================
  // MOVIMIENTO DE BOTS
  // =========================

  for (const bot of bots) {
  bot.pathT += bot.speed * bot.direction;

  if (bot.pathT >= 1) {
    bot.pathT = 1;
    bot.direction = -1;
  }

  if (bot.pathT <= 0) {
    bot.pathT = 0;
    bot.direction = 1;
  }

  const oldPos = bot.collider.position.clone();

  const newPos = BABYLON.Vector3.Lerp(
    bot.path.a,
    bot.path.b,
    bot.pathT
  );

  newPos.y = 1;
  bot.collider.position.copyFrom(newPos);

  const moveDir = newPos.subtract(oldPos);
  moveDir.y = 0;

  if (moveDir.length() > 0.001) {
    moveDir.normalize();
    bot.collider.rotation.y = Math.atan2(moveDir.x, moveDir.z);
  }

  bot.walkTime += 0.08;

  bot.leftLeg.rotation.x = Math.sin(bot.walkTime) * 0.45;
  bot.rightLeg.rotation.x = Math.sin(bot.walkTime + Math.PI) * 0.45;
  bot.leftArm.rotation.x = Math.sin(bot.walkTime + Math.PI) * 0.3;
  bot.rightArm.rotation.x = Math.sin(bot.walkTime) * 0.3;
}
  if (!player || !car) return;

// =========================
// LINTERNA DEL AVATAR FIJA AL FRENTE
// =========================
if (avatarFlashlight) {
  avatarFlashlight.intensity =
    !inCar && flashlightOn ? 12 : 0;

  avatarFlashlight.range = 65;
  avatarFlashlight.angle = Math.PI / 5;
  avatarFlashlight.exponent = 3;

  avatarFlashlight.position = new BABYLON.Vector3(
    0.35,
    0.85,
    0.55
  );

  avatarFlashlight.direction = new BABYLON.Vector3(
    0,
    -0.08,
    1
  );
}

if (raceStarted) {
  for (const bot of raceBots) {
    if (bot.finished) continue;

    const target = bot.route[bot.routeIndex];

    // Si terminó la ruta actual, decidir próximo tramo
    if (!target) {
      if (bot.target === "finish") {
        bot.target = "start";

        const startPos = lonLatToWorld(
  activeRaceConfig.start.lon,
  activeRaceConfig.start.lat
);

        setRaceBotRoute(bot, startPos);
        continue;
      }

      if (bot.target === "start") {
        bot.lap++;

        if (bot.lap > activeRaceConfig.laps) {
  bot.finished = true;
  loseRace();
  break;
}

        bot.target = "finish";

        const finishPos = lonLatToWorld(
  activeRaceConfig.finish.lon,
  activeRaceConfig.finish.lat
);

        setRaceBotRoute(bot, finishPos);
        continue;
      }
    }

    // Caja automática igual al jugador
    if (bot.currentSpeed < 0.11) bot.currentGear = 1;
    else if (bot.currentSpeed < 0.22) bot.currentGear = 2;
    else if (bot.currentSpeed < 0.33) bot.currentGear = 3;
    else if (bot.currentSpeed < 0.44) bot.currentGear = 4;
    else if (bot.currentSpeed < 0.55) bot.currentGear = 5;
    else bot.currentGear = 6;

    const maxSpeedForGear = gearMaxSpeed[bot.currentGear];
    const accelForGear = gearAcceleration[bot.currentGear] * bot.aggression;

    bot.currentSpeed += accelForGear;

    if (bot.currentSpeed > maxSpeedForGear) {
      bot.currentSpeed = maxSpeedForGear;
    }

    const dir = target.subtract(bot.car.position);
    dir.y = 0;

    const distance = dir.length();

    if (distance < 4) {
      bot.routeIndex++;
      continue;
    }

    dir.normalize();

    bot.car.position.addInPlace(
      dir.scale(bot.currentSpeed)
    );

    bot.car.rotation.y = Math.atan2(dir.x, dir.z);

    if (!isOnRoad(bot.car.position)) {
      bot.car.position.copyFrom(
        getNearestRoadPoint(bot.car.position)
      );

      bot.currentSpeed *= 0.85;
    }
  }
}

cullingFrame++;
if (cullingFrame % 60 === 0 && car) {
  console.log("Zona:", currentZone, "X:", car.position.x.toFixed(0), "Z:", car.position.z.toFixed(0));
}

if (cullingFrame % 20 === 0) {
  checkZoneTransition();
  updateChunks();
  updateMapVisibility();
  updateCulling();
  updateNiuStoreLights();
}

if (cullingFrame % 3 === 0) {
  drawMinimap();
}
updateMission();
updateRouteMission();
updateDeliveryAndPickupMission();
updateWalkingFuelMission();
updateGpsNavigationArrow();
updateGpsDestinationAura();
updateRaceCircuit();
updateMedicineDeliveryMission();
updateBeverlyMansionMission();

// IMPORTANTE:
// Actualiza el movimiento del fantasma
// y detecta la colisión con el auto o avatar.
updateMedicineMissionGhosts();

// =========================
// GASOLINERAS
// =========================

if (car && gasStationTriggers.length > 0) {
  let carTouchingAnyGasAura = false;

  for (const station of gasStationTriggers) {
    if (
      !station.root ||
      station.root.isDisposed() ||
      !station.aura ||
      station.aura.isDisposed() ||
      !station.aura.isEnabled()
    ) {
      continue;
    }

    // Animación del aro
    station.aura.rotation.y += 0.04;

    const pulse =
      1 + Math.sin(Date.now() * 0.008) * 0.1;

    station.aura.scaling.x = pulse;
    station.aura.scaling.z = pulse;

    // MUY IMPORTANTE:
    // El aro tiene un padre, por eso no usamos aura.position.
    // Obtenemos su posición mundial verdadera.
    station.aura.computeWorldMatrix(true);

    const auraWorldPosition =
      station.aura.getAbsolutePosition();

    // Distancia horizontal entre el centro del auto y el centro del aro
    const dx =
      car.position.x - auraWorldPosition.x;

    const dz =
      car.position.z - auraWorldPosition.z;

    const horizontalDistance =
      Math.sqrt(dx * dx + dz * dz);

    /*
      El aro tiene diámetro 8:
      radio del aro = 4 metros.

      El auto mide aproximadamente 2 metros de ancho.
      Usamos 1 metro adicional para detectar cuando
      la parte delantera del auto toca el borde del aro.
    */
    const auraRadius =
      4 * station.aura.scaling.x;

    const carTouchRadius = 1;

    const exactTouchDistance =
      auraRadius + carTouchRadius;

    if (horizontalDistance <= exactTouchDistance) {
      carTouchingAnyGasAura = true;

      // Solo abrir cuando entra por primera vez
      if (
        !gasAuraWasTouched &&
        !niuFuelWindowOpen &&
        !niuFuelCooldown
      ) {
        gasAuraWasTouched = true;

        console.log(
          "AUTO TOCÓ EL ARO:",
          horizontalDistance.toFixed(2),
          "Límite:",
          exactTouchDistance.toFixed(2)
        );

        openNiuFuelWindow();
      }

      break;
    }
  }

  // Liberar el detector únicamente cuando
  // el auto haya salido completamente del aro.
  if (!carTouchingAnyGasAura) {
    gasAuraWasTouched = false;
  }
}
// Aura web Centrix 28
if (centrixAura && !centrixWebOpened) {
  centrixAura.rotation.y += 0.04;

  const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.18;
  centrixAura.scaling.x = pulse;
  centrixAura.scaling.z = pulse;

  const reference = inCar ? car.position : player.position;

  const dx = reference.x - centrixAura.position.x;
  const dz = reference.z - centrixAura.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 12) {
    centrixWebOpened = true;

    window.open(
      centrixAura.metadata.url,
      "_blank",
      "noopener,noreferrer"
    );
  }
}
// =========================
// ENTRADA AL PROYECTO INMOBILIARIO
// =========================

if (
  currentMapName === "miraflores" &&
  salesBoothAura &&
  !insideOlivarMap
) {
  // Animación del aro rosa.
  salesBoothAura.rotation.y +=
    0.03;

  const pulse =
    1 +
    Math.sin(
      Date.now() * 0.008
    ) * 0.08;

  salesBoothAura.scaling.x =
    pulse;

  salesBoothAura.scaling.z =
    pulse;

  /*
   * Puede activarse caminando o conduciendo.
   */
  const reference =
    inCar
      ? car.position
      : player.position;

  const dx =
    reference.x -
    salesBoothAura.position.x;

  const dz =
    reference.z -
    salesBoothAura.position.z;

  const distance =
    Math.sqrt(
      dx * dx +
      dz * dz
    );

  /*
   * El aro tiene diámetro 9.
   * Se abre cuando el avatar o el auto
   * llegan aproximadamente al borde.
   */
  const touchingAura =
    distance < 6;

  if (touchingAura) {
    // Abrir solamente la primera vez
    // que se entra al aro.
    if (
      !salesBoothAuraWasTouched &&
      !realEstateEntryWindowOpen &&
      !realEstateEntryCooldown &&
      !realEstateTravelInProgress
    ) {
      salesBoothAuraWasTouched =
        true;

      openRealEstateEntryWindow();
    }
  } else {
    /*
     * Al salir completamente del aro,
     * permitimos que vuelva a activarse.
     */
    if (distance > 9) {
      salesBoothAuraWasTouched =
        false;
    }
  }
}

if (niuTravelAura) {
  niuTravelAura.rotation.y += 0.04;

  const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.12;
  niuTravelAura.scaling.x = pulse;
  niuTravelAura.scaling.z = pulse;

  const reference = inCar ? car.position : player.position;

  const dx = reference.x - niuTravelAura.position.x;
  const dz = reference.z - niuTravelAura.position.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (
    dist < 7 &&
    !niuTravelWindowOpen &&
    !niuTravelCooldown
  ) {
    niuTravelWindowOpen = true;
    openNiuTravelWindow();
  }

  if (dist > 14) {
    niuTravelWindowOpen = false;
  }
}
// =========================
// INTERACCIÓN NIU MARKET
// =========================

if (niuMarketAura) {
  niuMarketAura.rotation.y += 0.04;

  const pulse =
    1 + Math.sin(Date.now() * 0.008) * 0.12;

  niuMarketAura.scaling.x = pulse;
  niuMarketAura.scaling.z = pulse;

  // Solo se abre caminando con el avatar
  if (!inCar) {
    const dx =
      player.position.x - niuMarketAura.position.x;

    const dz =
      player.position.z - niuMarketAura.position.z;

    const distance = Math.sqrt(
      dx * dx + dz * dz
    );

    if (
      distance < 6 &&
      !niuMarketWindowOpen &&
      !niuMarketCooldown
    ) {
      openNiuMarketWindow();
    }

    if (distance > 12) {
      niuMarketWindowOpen = false;
    }
  }
}
if (!inCar) {
  let moveX = 0;
  let moveZ = 0;

  // Dirección según cámara
  const cameraForward = camera.target.subtract(camera.position);
  cameraForward.y = 0;
  cameraForward.normalize();

  const cameraRight = new BABYLON.Vector3(
    cameraForward.z,
    0,
    -cameraForward.x
  );

  if (keys["w"]) {
    moveX += cameraForward.x;
    moveZ += cameraForward.z;
  }

  if (keys["s"]) {
    moveX -= cameraForward.x;
    moveZ -= cameraForward.z;
  }

  if (keys["a"]) {
    moveX -= cameraRight.x;
    moveZ -= cameraRight.z;
  }

  if (keys["d"]) {
    moveX += cameraRight.x;
    moveZ += cameraRight.z;
  }

  const dir = new BABYLON.Vector3(moveX, 0, moveZ);

  if (dir.length() > 0) {
    dir.normalize();

    player.position.addInPlace(dir.scale(0.22));

    // El avatar mira hacia donde camina
    player.rotation.y = Math.atan2(dir.x, dir.z);
    avatarLookDirection = dir.clone();

    walkTime += 0.18;

    if (leftLeg && rightLeg && leftArm && rightArm) {
      leftLeg.rotation.x = Math.sin(walkTime) * 0.35;
      rightLeg.rotation.x = Math.sin(walkTime + Math.PI) * 0.35;
      leftArm.rotation.x = Math.sin(walkTime + Math.PI) * 0.25;
      rightArm.rotation.x = Math.sin(walkTime) * 0.25;
    }
  } else {
    if (leftLeg && rightLeg && leftArm && rightArm) {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
    }
  }

  camera.target = BABYLON.Vector3.Lerp(
    camera.target as BABYLON.Vector3,
    player.position,
    0.15
  );

  return;
}

  const previousPosition = car.position.clone();
// =========================
// CONTROL DE LUCES
// =========================

if (leftHeadlight && rightHeadlight) {

  if (headlightMode === 0) {
    const plateMatActive = scene.getMaterialByName("plateMat") as BABYLON.StandardMaterial | null;

if (plateMatActive) {
  plateMatActive.emissiveColor =
    headlightMode > 0
      ? new BABYLON.Color3(0.35, 0.35, 0.28)
      : new BABYLON.Color3(0, 0, 0);
}
    leftHeadlight.intensity = 0;
    rightHeadlight.intensity = 0;
  }

  // Luz baja
if (headlightMode === 1) {
  leftHeadlight.intensity = 6;
rightHeadlight.intensity = 6;
}

// Luz alta
if (headlightMode === 2) {
  leftHeadlight.intensity = 12;
rightHeadlight.intensity = 12;
}
}
if (licensePlateMat) {

  licensePlateMat.emissiveColor =
    headlightMode > 0
      ? new BABYLON.Color3(
          0.45,
          0.45,
          0.38
        )
      : new BABYLON.Color3(
          0,
          0,
          0
        );
}

// =========================
// LUCES TRASERAS
// =========================

// luz tenue cuando las luces están encendidas
const rearIntensity =
  headlightMode > 0 ? 1.8 : 0;

// Luces traseras: aún no se crean como PointLight
// if (leftRearLight) {
//   leftRearLight.intensity = rearIntensity;
//   leftRearLight.range = 5;
// }
// if (rightRearLight) {
//   rightRearLight.intensity = rearIntensity;
//   rightRearLight.range = 5;
// }

// =========================
// ACELERACIÓN CON CAJA MANUAL
// =========================

const previousCarPositionForKm = car.position.clone();
const raceMovementLocked =
  raceMissionActive &&
  countdownActive &&
  !raceCountdownDone;

if (raceMovementLocked) {
  carVelocity = 0;
  keys["w"] = false;
  keys["s"] = false;
  keys[" "] = false;
}

updateFuelWarningSystem();

if (carEngineOn && fuelLiters > 0 && !raceMovementLocked) {
  if (transmissionMode === "auto") {
  if (keys["s"] && carVelocity <= 0.005) {
    currentGear = -1;
  } else if (carVelocity < 0.11) {
  currentGear = 1;
} else if (carVelocity < 0.22) {
  currentGear = 2;
} else if (carVelocity < 0.33) {
  currentGear = 3;
} else if (carVelocity < 0.44) {
  currentGear = 4;
} else if (carVelocity < 0.55) {
  currentGear = 5;
} else {
  currentGear = 6;
}
}

  const maxSpeedForGear = gearMaxSpeed[currentGear];
  const accelForGear = gearAcceleration[currentGear];

  if (keys["w"]) {
        if (currentGear > 0) {
      carVelocity += accelForGear;
    } else {
      carVelocity *= 0.98;
    }
  }

  if (keys["s"]) {
    if (carVelocity > 0.02) {
      carVelocity -= braking;
    } else if (currentGear === -1) {
      carVelocity -= gearAcceleration[-1] * 0.75;
    } else {
      carVelocity -= 0.0015;
    }
  }

  if (currentGear > 0 && carVelocity > maxSpeedForGear) {
    carVelocity = maxSpeedForGear;
  }

  if (currentGear === -1 && carVelocity < -gearMaxSpeed[-1]) {
    carVelocity = -gearMaxSpeed[-1];
  }

  if (currentGear === 0) {
    carVelocity *= 0.98;
  }
} else {
  carVelocity *= 0.92;
}

// Freno de mano con barra espaciadora
if (keys[" "]) {
  carVelocity *= 0.35;

  if (Math.abs(carVelocity) < 0.08) {
    carVelocity = 0;
  }
}

// Sin fricción: mantiene velocidad si no presionas W ni S

// Evitar movimiento muy pequeño infinito
if (Math.abs(carVelocity) < 0.00005) {
  carVelocity = 0;
}

// Velocidad visual
speedKmh = Math.abs(carVelocity) * 182;

// RPM aproximadas
if (!carEngineOn) {
  rpm = 0;
} else if (currentGear === 0) {
  rpm = keys["w"] ? 3500 : 900;
} else {
  const gearLimit = Math.max(gearMaxSpeed[currentGear], 0.01);
  rpm = 900 + Math.min(Math.abs(carVelocity) / gearLimit, 1) * 5200;
}

// =========================
// GIRO MÁS REALISTA
// =========================

const steeringStrength =
  Math.min(Math.abs(carVelocity) * 0.12, turnSoftness);

const reverseDirection = carVelocity < 0 ? -1 : 1;

if (keys["a"]) {
  car.rotation.y -= steeringStrength * reverseDirection;
}

if (keys["d"]) {
  car.rotation.y += steeringStrength * reverseDirection;
}

// =========================
// MOVIMIENTO
// =========================

const forward = new BABYLON.Vector3(
  Math.sin(car.rotation.y),
  0,
  Math.cos(car.rotation.y)
);

car.position.addInPlace(
  forward.scale(carVelocity)
);
// Kilometraje recorrido
const movedDistance = BABYLON.Vector3.Distance(
  previousCarPositionForKm,
  car.position
);

odometerKm += movedDistance / 1000;
const movedKm = movedDistance / 1000;

fuelLiters -= movedKm * fuelConsumptionPerKm;

if (fuelLiters < 0) {
  fuelLiters = 0;
}

// Guardar solo si se movió (evita escribir 60 veces por segundo sin necesidad)
if (movedKm > 0) {
  saveFuelLiters();
}

updateFuelWarningSystem();
// =========================
// ANIMACIÓN DE RUEDAS
// =========================

wheelSpin += carVelocity * 5.5;

for (const wheel of carWheels) {
  wheel.rotation.x = wheelSpin;
}

let steerAngle = 0;

if (keys["a"]) {
  steerAngle = -0.35;
}

if (keys["d"]) {
  steerAngle = 0.35;
}

for (const wheel of frontWheels) {
  wheel.rotation.y = steerAngle;
}

// =========================
// BLOQUEO DE ACERAS
// =========================

if (!isOnRoad(car.position)) {
  const fixedRoadPoint = getNearestRoadPoint(car.position);

  const distanceToRoad = BABYLON.Vector3.Distance(
    car.position,
    fixedRoadPoint
  );

  if (distanceToRoad < 8) {
    car.position.copyFrom(fixedRoadPoint);
  } else {
    car.position.copyFrom(previousPosition);
    carVelocity *= 0.4;
  }
}

// =========================
// CÁMARA SUAVE TIPO GTA
// =========================

let desiredCameraPosition: BABYLON.Vector3;
let cameraLookTarget: BABYLON.Vector3;

if (carCameraMode === 0) {
  // Vista GTA normal fija detrás del auto
  const cameraBackDirection = new BABYLON.Vector3(
    -Math.sin(car.rotation.y),
    0,
    -Math.cos(car.rotation.y)
  );

  desiredCameraPosition = car.position
    .add(cameraBackDirection.scale(8))
    .add(new BABYLON.Vector3(0, 2.8, 0));

  cameraLookTarget = car.position
    .add(new BABYLON.Vector3(0, 1.4, 0));
}

else if (carCameraMode === 1) {
  // Vista más alejada fija detrás del auto
  const cameraBackDirection = new BABYLON.Vector3(
    -Math.sin(car.rotation.y),
    0,
    -Math.cos(car.rotation.y)
  );

  desiredCameraPosition = car.position
    .add(cameraBackDirection.scale(16))
    .add(new BABYLON.Vector3(0, 6, 0));

  cameraLookTarget = car.position
    .add(new BABYLON.Vector3(0, 2, 0));
}

else {
  // Vista cabina / primera persona
  desiredCameraPosition = car.position
    .add(forward.scale(1.2))
    .add(new BABYLON.Vector3(0, 1.4, 0));

  cameraLookTarget = car.position
    .add(forward.scale(18))
    .add(new BABYLON.Vector3(0, 1.5, 0));
}

camera.target = BABYLON.Vector3.Lerp(
  camera.target as BABYLON.Vector3,
  cameraLookTarget,
  0.14
);

camera.position = BABYLON.Vector3.Lerp(
  camera.position,
  desiredCameraPosition,
  0.12
);
});

// Movimiento lento de nubes
// scene.onBeforeRenderObservable.add(() => {
//   for (const cloud of clouds) {
//     cloud.position.x += 0.01;
//
//     if (cloud.position.x > 180) {
//       cloud.position.x = -180;
//     }
//   }
// });
// =========================
// LOGO NIU (arriba izquierda)
// =========================
const niuHudLogo = document.createElement("img");
niuHudLogo.src = "/niu-badge.png";
niuHudLogo.alt = "Niu";
niuHudLogo.style.position = "fixed";
niuHudLogo.style.top = "12px";
niuHudLogo.style.left = "12px";
niuHudLogo.style.width = "120px";
niuHudLogo.style.height = "auto";
niuHudLogo.style.zIndex = "50";
niuHudLogo.style.borderRadius = "10px";
niuHudLogo.style.pointerEvents = "none";
niuHudLogo.style.filter = "drop-shadow(0 2px 8px rgba(0,0,0,0.35))";
document.body.appendChild(niuHudLogo);

// =========================
// HORA (arriba derecha)
// =========================
const statsText = document.createElement("div");
statsText.style.position = "fixed";
statsText.style.top = "12px";
statsText.style.right = "12px";
statsText.style.left = "auto";
statsText.style.color = "rgba(255,255,255,0.92)";
statsText.style.background = "rgba(0,0,0,0.55)";
statsText.style.padding = "8px 12px";
statsText.style.borderRadius = "10px";
statsText.style.zIndex = "50";
statsText.style.fontFamily = "Arial";
statsText.style.fontSize = "18px";
statsText.style.fontWeight = "600";
document.body.appendChild(statsText);

scene.onBeforeRenderObservable.add(() => {
  let cityLabel = "Lima";

  if (currentMapName === "manhattan") {
    cityLabel = "New York";
  }

  if (currentMapName === "beverly-hills") {
    cityLabel = "Los Angeles";
  }

  const cityTimeText = new Date().toLocaleTimeString("es-PE", {
    timeZone: getCurrentCityTimeZone(),
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Sin FPS ni Meshes
  statsText.innerText = `Hora ${cityLabel}: ${cityTimeText}`;
});
// =========================
// HUD DEL AUTO
// =========================
const carHud = document.createElement("div");
carHud.style.position = "fixed";
carHud.style.right = "18px";
carHud.style.bottom = "18px";
carHud.style.color = "white";
carHud.style.background = "rgba(0,0,0,0.65)";
carHud.style.padding = "12px";
carHud.style.borderRadius = "10px";
carHud.style.zIndex = "80";
carHud.style.fontFamily = "Arial";
carHud.style.fontSize = "15px";

document.body.appendChild(carHud);
carHud.style.display = "none";


let lastCarHudUpdate = 0;
scene.onBeforeRenderObservable.add(() => {
  const now = performance.now();

  if (now - lastCarHudUpdate < 150) {
    return;
  }

  lastCarHudUpdate = now;
    carHud.style.display = inCar ? "block" : "none";
  transmissionBtn.style.display = inCar ? "block" : "none";

  if (!inCar) {
    return;
  }

  const gearText =
    currentGear === -1 ? "R" :
    currentGear === 0 ? "N" :
    currentGear.toString();

    const fuelPercent = getFuelPercent();
  const fuelColor =
    fuelPercent <= 5 ? "#ff4d4d" :
    fuelPercent <= 20 ? "#ffcc00" :
    "#7CFF9A";

  carHud.innerHTML = `
    Modo: ${transmissionMode === "auto" ? "Automático" : "Manual"}<br>
    Cambio: ${gearText}<br>
    Velocidad: ${speedKmh.toFixed(0)} km/h<br>
    <div style="
      margin-top:6px;
      padding:6px 8px;
      border-radius:8px;
      background:rgba(255,255,255,0.08);
      border:1px solid ${fuelColor};
    ">
      <span style="color:${fuelColor}; font-weight:bold;">
        ⛽ Combustible: ${fuelLiters.toFixed(1)} L (${fuelPercent.toFixed(0)}%)
      </span>
    </div>
    ${walkingFuelMissionActive
      ? `<br>Caminata: ${(walkingFuelMissionDistance / 1000).toFixed(2)} / 1.00 km`
      : ""}
  `;
});
const transmissionBtn = document.createElement("button");
// =========================
// UI SOCIAL BÁSICA
// =========================

let friends = JSON.parse(
  localStorage.getItem("niuwd_friends") || "[]"
);

// Eliminar amigos demo antiguos si aún están guardados
const DEMO_FRIEND_NAMES = ["Juan NIU", "Carlos NIU", "Maria NIU"];
friends = friends.filter(
  (f: { name?: string }) => !DEMO_FRIEND_NAMES.includes(f.name || "")
);
localStorage.setItem("niuwd_friends", JSON.stringify(friends));
DEMO_FRIEND_NAMES.forEach((name) => {
  localStorage.removeItem(
    "niuwd_chat_" + name.replaceAll(" ", "_").toLowerCase()
  );
});
// =========================
// AMIGOS EN LA NUBE (Supabase)
// =========================

async function loadFriendsFromCloud() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    friends = [];
    friendRequests = [];
    return;
  }

  const { data: rows, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  if (error) {
    console.warn("Error cargando amistades:", error.message);
    return;
  }

  const accepted = (rows || []).filter((r) => r.status === "accepted");
  const pendingToMe = (rows || []).filter(
    (r) =>
      r.status === "pending" &&
      String(r.addressee_id) === String(user.id)
  );

  // IDs de los otros usuarios
  const friendIds = accepted.map((r) =>
    r.requester_id === user.id ? r.addressee_id : r.requester_id
  );
  const requestIds = pendingToMe.map((r) => r.requester_id);

  const allIds = [...new Set([...friendIds, ...requestIds])];

    let profilesMap: Record<string, string> = {};
  if (allIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", allIds);

    if (profErr) {
      console.warn("Error perfiles amigos:", profErr.message);
    }

    for (const p of profiles || []) {
      if (p.id && p.username) {
        profilesMap[String(p.id)] = p.username;
      }
    }
  }

  friends = accepted.map((r, index) => {
    const otherId =
      r.requester_id === user.id ? r.addressee_id : r.requester_id;
    const key = String(otherId);
    return {
      id: index + 1,
      cloudId: key,
      friendshipId: r.id,
      name: profilesMap[key] || "Usuario",
      online: false,
      x: 0,
      z: 0,
    };
  });

  friendRequests = pendingToMe.map((r, index) => {
    const otherId = r.requester_id;
    const key = String(otherId);
    return {
      id: index + 1,
      cloudId: key,
      friendshipId: String(r.id), // id real de la fila
      name: profilesMap[key] || "Usuario",
      online: false,
      x: 0,
      z: 0,
    };
  });

  localStorage.setItem("niuwd_friends", JSON.stringify(friends));
  localStorage.setItem("niuwd_friend_requests", JSON.stringify(friendRequests));
}
let friendshipsChannel: ReturnType<typeof supabase.channel> | null = null;

function subscribeFriendshipsRealtime() {
  // Evitar suscripciones duplicadas
  if (friendshipsChannel) {
    supabase.removeChannel(friendshipsChannel);
    friendshipsChannel = null;
  }

  friendshipsChannel = supabase
    .channel("friendships-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendships",
      },
      async (payload) => {
        console.log("Cambio en friendships:", payload.eventType);
        await loadFriendsFromCloud();

        // Si tienes la ventana de solicitudes abierta, no se redibuja sola;
        // el usuario puede volver a abrir Solicitudes o Amigos y ya verá datos nuevos.
        // Opcional: aviso simple
        if (payload.eventType === "INSERT") {
          // Nueva solicitud o relación
          console.log("Nueva fila de amistad en tiempo real");
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime friendships:", status);
    });
}
async function loadPrivateChat(friendCloudId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !friendCloudId) return [];

  const { data, error } = await supabase
    .from("private_messages")
    .select("from_id, body, created_at")
    .or(
      `and(from_id.eq.${user.id},to_id.eq.${friendCloudId}),and(from_id.eq.${friendCloudId},to_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.warn(error.message);
    return [];
  }

  return data || [];
}

async function sendPrivateMessage(friendCloudId: string, text: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !friendCloudId || !text.trim()) return;

  await supabase.from("private_messages").insert({
    from_id: user.id,
    to_id: friendCloudId,
    body: text.trim(),
  });
}
async function sendFriendRequestByUsername(targetUsername: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Debes iniciar sesión.");
    return;
  }

  const name = targetUsername.trim();
  if (!name) {
    alert("Escribe un nombre de usuario.");
    return;
  }

  // Buscar perfil del otro
  const { data: target, error: findErr } = await supabase
    .from("profiles")
    .select("id, username")
    .ilike("username", name)
    .maybeSingle();

  if (findErr || !target) {
    alert("No se encontró ese usuario.");
    return;
  }

  if (target.id === user.id) {
    alert("No puedes agregarte a ti mismo.");
    return;
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: target.id,
    status: "pending",
  });

  if (error) {
    if (error.message.includes("duplicate") || error.code === "23505") {
      alert("Ya existe una solicitud o amistad con ese usuario.");
    } else {
      alert("Error: " + error.message);
    }
    return;
  }

  alert(`Solicitud enviada a ${target.username}`);
}

async function acceptFriendRequestCloud(friendshipId: string) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", friendshipId);

  if (error) {
    alert("No se pudo aceptar: " + error.message);
    return;
  }

    await loadFriendsFromCloud();

  // Crear avatares de todos los amigos aceptados
  for (const f of friends) {
    createFriendAvatar(f);
  }
  subscribeFriendsPresence();
}


async function rejectFriendRequestCloud(friendshipId: string) {
  const { error } = await supabase
    .from("friendships")
    .update({ status: "rejected" })
    .eq("id", friendshipId);

  if (error) {
    alert("No se pudo rechazar: " + error.message);
    return;
  }
  await loadFriendsFromCloud();
}
function saveFriends() {
  localStorage.setItem(
    "niuwd_friends",
    JSON.stringify(friends)
  );
}
let friendRequests: {
  id: number;
  name: string;
  online: boolean;
  x: number;
  z: number;
}[] = JSON.parse(
  localStorage.getItem("niuwd_friend_requests") || "[]"
);

function saveFriendRequests() {
  localStorage.setItem(
    "niuwd_friend_requests",
    JSON.stringify(friendRequests)
  );
}
type FriendAvatar = {
  id: number;
  cloudId?: string;
  name: string;
  root: BABYLON.TransformNode;
  avatarRoot?: BABYLON.TransformNode;
  carRoot?: BABYLON.TransformNode;
  label: BABYLON.Mesh;
};

const friendAvatars: FriendAvatar[] = [];

// =========================
// PRESENCIA EN VIVO (amigos)
// =========================

let lastPresenceSent = 0;

async function publishMyPresence() {
  const now = Date.now();
  if (now - lastPresenceSent < 300) return;
  lastPresenceSent = now;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !player) return;

    const ref = inCar && car ? car : player;

    await supabase
      .from("profiles")
      .update({
        pos_x: ref.position.x,
        pos_z: ref.position.z,
        rot_y: ref.rotation?.y ?? 0,
        in_car: !!inCar,
        map_name: currentMapName || "miraflores",
        online_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  } catch (e) {
    // silencioso
  }
}

function subscribeFriendsPresence() {
  const ids = friends
    .map((f: any) => f.cloudId)
    .filter(Boolean)
    .map(String);

  if (!ids.length) return;

  supabase
    .channel("friends-presence")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
      },
      (payload) => {
        const row = payload.new as any;
        if (!row?.id) return;
        if (!ids.includes(String(row.id))) return;

        // Solo misma ciudad
        if (row.map_name && row.map_name !== currentMapName) return;

        const fa = friendAvatars.find(
          (f) => String((f as any).cloudId) === String(row.id)
        ) as FriendAvatar | undefined;

        if (!fa?.root) return;

        fa.root.position.x = Number(row.pos_x) || 0;
        fa.root.position.z = Number(row.pos_z) || 0;
        fa.root.rotation.y = Number(row.rot_y) || 0;

        if (fa.avatarRoot && fa.carRoot) {
          const driving = !!row.in_car;
          fa.avatarRoot.setEnabled(!driving);
          fa.carRoot.setEnabled(driving);
        }
      }
    )
    .subscribe();
}
function subscribeRaceInvitesRealtime() {
  supabase
    .channel("race-invites-live")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "race_invites",
      },
      async (payload) => {
        const row = payload.new as any;
        if (!row) return;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // --- Aceptó (host ve el lobby) ---
        if (row.status === "accepted" && row.from_id === user.id) {
          for (const pl of multiplayerLobbyPlayers) {
            if (!pl.isLocal && !pl.accepted) {
              pl.accepted = true;
              break;
            }
          }
          showMissionMessage("Un amigo aceptó la partida.", 3000);
          if (multiplayerSelectedCircuit && multiplayerIsHost) {
            renderMultiplayerLobbyWindow();
          }
        }

        // --- Rechazó ---
        if (row.status === "rejected" && row.from_id === user.id) {
          multiplayerLobbyPlayers = multiplayerLobbyPlayers.filter(
            (p) => p.isLocal || p.accepted
          );
          showMissionMessage("Tu amigo ha cancelado la solicitud", 4000);
          if (multiplayerSelectedCircuit && multiplayerIsHost) {
            renderMultiplayerLobbyWindow();
          }
        }

                // --- Host inició: INVITADO crea el aro rosa ---
        if (
          row.status === "started" &&
          String(row.to_id) === String(user.id) &&
          !multiplayerRaceActive
        ) {
          stopWaitingForRaceStart();
          await beginRaceAsGuest(row);
        }

                // --- Alguien llegó al rosa (ready_ids) ---
        if (
          row.status === "started" &&
          Array.isArray(row.ready_ids) &&
          multiplayerRaceActive &&
          raceGoingToStart &&
          !countdownActive &&
          !raceStarted
        ) {
          const need = Math.max(
            2,
            multiplayerLobbyPlayers.filter((p) => p.accepted).length || 2
          );
          const uniqueReady = [...new Set(row.ready_ids.map(String))];
          const readyCount = uniqueReady.length;

          showMissionMessage(
            `En el punto rosa: ${readyCount} / ${need}. Esperando a todos...`,
            3000
          );

          if (readyCount >= need) {
            startRaceCountdown();
          }
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime race_invites:", status);
    });
}
const socialPanel = document.createElement("div");
socialPanel.style.position = "fixed";
socialPanel.style.right = "18px";
socialPanel.style.top = "90px";
socialPanel.style.width = "160px";
socialPanel.style.background = "rgba(0,0,0,0.7)";
socialPanel.style.color = "white";
socialPanel.style.padding = "12px";
socialPanel.style.borderRadius = "12px";
socialPanel.style.zIndex = "120";
socialPanel.style.fontFamily = "Arial";
socialPanel.style.display = "flex";
socialPanel.style.flexDirection = "column";
socialPanel.style.gap = "8px";

function createSocialButton(text: string) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.style.padding = "10px";
  btn.style.borderRadius = "8px";
  btn.style.border = "0";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "bold";
  return btn;
}

const friendsBtn = createSocialButton("Amigos");
const messagesBtn = createSocialButton("Mensajes");
const profileBtn = createSocialButton("Perfil");
const requestsBtn = createSocialButton("Solicitudes");
const gpsBtn = createSocialButton("GPS");
const walletBtn = createSocialButton("Billetera");
const missionsBtn = createSocialButton("Misiones");
const controlsBtn = createSocialButton("Controles");
const logoutBtn = createSocialButton("Cerrar sesión");

logoutBtn.style.background = "rgba(180,60,60,0.9)";
logoutBtn.style.color = "white";

socialPanel.appendChild(friendsBtn);
socialPanel.appendChild(messagesBtn);
socialPanel.appendChild(requestsBtn);
socialPanel.appendChild(gpsBtn);
socialPanel.appendChild(walletBtn);
socialPanel.appendChild(missionsBtn);
socialPanel.appendChild(controlsBtn);
socialPanel.appendChild(profileBtn);
socialPanel.appendChild(logoutBtn);

document.body.appendChild(socialPanel);
const socialWindow = document.createElement("div");
socialWindow.style.position = "fixed";
socialWindow.style.right = "200px";
socialWindow.style.top = "90px";
socialWindow.style.width = "260px";
socialWindow.style.minHeight = "220px";
socialWindow.style.background = "rgba(0,0,0,0.82)";
socialWindow.style.color = "white";
socialWindow.style.padding = "14px";
socialWindow.style.borderRadius = "12px";
socialWindow.style.zIndex = "130";
socialWindow.style.fontFamily = "Arial";
socialWindow.style.display = "none";

document.body.appendChild(socialWindow);
function updateWalletButton() {
  walletBtn.innerText = `Billetera: ${digitalCoins} monedas`;
}

updateWalletButton();

walletBtn.onclick = () => {
  openSocialWindow(
    "Billetera",
    `
      <p><strong>Monedas digitales:</strong> ${digitalCoins}</p>
      <p><strong>Equivalente en Niu:</strong> ${coinsToNiu(digitalCoins).toFixed(2)} Niu</p>
      <hr>
      <p>Conversión:</p>
      <p>1 Niu = 1000 monedas digitales</p>
    `
  );
};
// =========================
// PERFIL DEL JUGADOR (guardado local)
// =========================

const PLAYER_PROFILE_KEY = "niuwd_player_profile";

type PlayerProfile = {
  username: string;
  digitalCoins: number;
  fuelLiters: number;
  unlockedCities: string[]; // ej: ["miraflores", "manhattan"]
  lastCity: string;
  updatedAt: number;
};

function getDefaultProfile(): PlayerProfile {
  return {
    username: "Invitado",
    digitalCoins: 0,
    fuelLiters: 700, // tanque lleno al crear cuenta
    unlockedCities: ["miraflores"], // Kennedy siempre libre
    lastCity: "miraflores",
    updatedAt: Date.now(),
  };
}

function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PLAYER_PROFILE_KEY);
    if (!raw) return getDefaultProfile();

    const data = JSON.parse(raw) as PlayerProfile;

    return {
      ...getDefaultProfile(),
      ...data,
      unlockedCities: Array.isArray(data.unlockedCities)
        ? data.unlockedCities
        : ["miraflores"],
      fuelLiters:
        typeof data.fuelLiters === "number"
          ? Math.max(0, Math.min(700, data.fuelLiters))
          : 700,
      digitalCoins:
        typeof data.digitalCoins === "number"
          ? Math.max(0, data.digitalCoins)
          : 0,
    };
  } catch {
    return getDefaultProfile();
  }
}

function savePlayerProfile() {
  const profile: PlayerProfile = {
    username: worldChatUsername || "Invitado",
    digitalCoins,
    fuelLiters,
    unlockedCities: loadPlayerProfile().unlockedCities, // se actualiza abajo con helper
    lastCity: currentMapName || "miraflores",
    updatedAt: Date.now(),
  };

  // Mantener ciudades desbloqueadas en memoria
  profile.unlockedCities = unlockedCities.slice();

  localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));

  // Compatibilidad con lo que ya tienes
    localStorage.setItem("niuwd_digital_coins", digitalCoins.toString());
  localStorage.setItem("niuwd_fuel_liters", String(fuelLiters));
  void syncProfileToCloud();
}
function openSocialWindow(title: string, content: string) {
  socialWindow.style.display = "block";
  socialWindow.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong>${title}</strong>
      <button id="closeSocialWindow" style="border:0; border-radius:6px; padding:4px 8px; cursor:pointer;">X</button>
    </div>
    <hr>
    <div>${content}</div>
  `;

  document.getElementById("closeSocialWindow")!.onclick = () => {
    socialWindow.style.display = "none";
  };
  const firstInput = socialWindow.querySelector(
  "input[type='text'], input:not([type]), input[type='search']"
) as HTMLInputElement | null;

if (firstInput) {
  setTimeout(() => {
    firstInput.focus();
  }, 50);
}
}

friendsBtn.onclick = () => {
  let friendsHtml = "";

  for (const friend of friends) {
    const status = friend.online ? "🟢 Conectado" : "⚪ Desconectado";

    friendsHtml += `
      <div style="
        padding:8px;
        margin-bottom:8px;
        border-bottom:1px solid rgba(255,255,255,0.15);
      ">
        <strong>${friend.name}</strong><br>
        ${status}<br><br>

        <button id="chat_friend_${friend.id}">Chat</button>
        <button id="map_friend_${friend.id}">Ver mapa</button>
      </div>
    `;
  }

  openSocialWindow(
    "Amigos",
    `
      <button id="addFriendBtn" style="
        width:100%;
        padding:8px;
        margin-bottom:12px;
        border:0;
        border-radius:8px;
        cursor:pointer;
        font-weight:bold;
      ">
        ➕ Agregar amigo
      </button>

      <div id="friendsScrollList" style="
        max-height:300px;
        overflow-y:auto;
        overflow-x:hidden;
        padding-right:6px;
        box-sizing:border-box;
      ">
        ${friendsHtml || "<p>No tienes amigos todavía.</p>"}
      </div>
    `
  );
  
  socialWindow.addEventListener("mousedown", (e) => {
  e.stopPropagation();
});

socialWindow.addEventListener("click", (e) => {
  e.stopPropagation();
});

  const addFriendBtn = document.getElementById(
    "addFriendBtn"
  ) as HTMLButtonElement | null;

  if (addFriendBtn) {
    addFriendBtn.onclick = () => {
      openSocialWindow(
        "Agregar amigo",
        `
          <input id="newFriendInput" placeholder="Nombre del usuario..." style="
            width:100%;
            padding:8px;
            box-sizing:border-box;
            border-radius:8px;
            border:0;
            margin-bottom:10px;
          ">

          <button id="sendFriendRequestBtn" style="
            width:100%;
            padding:8px;
            border:0;
            border-radius:8px;
            cursor:pointer;
          ">
            Enviar solicitud
          </button>
        `
      );

      setTimeout(() => {
        const sendBtn = document.getElementById(
          "sendFriendRequestBtn"
        ) as HTMLButtonElement | null;

        const input = document.getElementById(
          "newFriendInput"
        ) as HTMLInputElement | null;

        if (!sendBtn || !input) return;

                sendBtn.onclick = async () => {
          const username = input.value.trim();
          if (!username) return;
          await sendFriendRequestByUsername(username);
        };
      }, 50);
    };
  }

  for (const friend of friends) {
    const chatBtn = document.getElementById(
      `chat_friend_${friend.id}`
    ) as HTMLButtonElement | null;

    if (chatBtn) {
      chatBtn.onclick = () => {
        openChat(friend.name);
      };
    }

    const mapBtn = document.getElementById(
      `map_friend_${friend.id}`
    ) as HTMLButtonElement | null;

    if (mapBtn) {
      mapBtn.onclick = () => {
        minimapExpanded = true;

        minimap.width = 520;
        minimap.height = 520;

        minimap.style.width = "520px";
        minimap.style.height = "520px";
        minimap.style.left = "50%";
        minimap.style.bottom = "50%";
        minimap.style.transform = "translate(-50%, 50%)";
        minimap.style.zIndex = "999";

        const reference = inCar ? car.position : player.position;

        mapOffsetX = friend.x - reference.x;
        mapOffsetZ = friend.z - reference.z;
        mapZoom = 0.45;

        openSocialWindow(
          "Ubicación",
          `<p>${friend.name} está marcado en el mapa.</p>`
        );
      };
    }
  }
};

// =========================
// MENSAJES (fuera de friendsBtn)
// =========================
messagesBtn.onclick = () => {
  let messagesListHtml = "";

  if (friends.length === 0) {
    messagesListHtml = "<p>No tienes amigos para chatear.</p>";
  } else {
    for (const friend of friends) {
      const messages = getChatMessages(friend.name);
      const status = friend.online ? "🟢" : "⚪";

      let preview = "Sin mensajes todavía";

      if (messages.length > 0) {
        const last = messages[messages.length - 1];
        preview = String(last)
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (preview.length > 42) {
          preview = preview.slice(0, 42) + "...";
        }
      }

      messagesListHtml += `
        <div style="
          padding:10px 8px;
          margin-bottom:8px;
          border-bottom:1px solid rgba(255,255,255,0.12);
        ">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <strong>${status} ${friend.name}</strong>
            <span style="font-size:11px; color:#aaa;">${messages.length} msg</span>
          </div>
          <div style="font-size:12px; color:#ccc; margin-bottom:8px;">
            ${preview}
          </div>
          <button id="open_msg_${friend.id}" style="
            width:100%;
            padding:6px;
            border:0;
            border-radius:8px;
            cursor:pointer;
            font-weight:bold;
          ">
            Abrir chat
          </button>
        </div>
      `;
    }
  }

  openSocialWindow(
    "Mensajes",
    `
      <div style="
        max-height:360px;
        overflow-y:auto;
        padding-right:4px;
      ">
        ${messagesListHtml}
      </div>
    `
  );

  for (const friend of friends) {
    const btn = document.getElementById(
      `open_msg_${friend.id}`
    ) as HTMLButtonElement | null;

    if (!btn) continue;

    btn.onclick = () => {
      openChat(friend.name);
    };
  }
};
function getChatKey(friendName: string) {
  return "niuwd_chat_" + friendName.replaceAll(" ", "_").toLowerCase();
}

function getChatMessages(friendName: string) {
  return JSON.parse(
    localStorage.getItem(getChatKey(friendName)) || "[]"
  );
}

function saveChatMessages(friendName: string, messages: string[]) {
  localStorage.setItem(
    getChatKey(friendName),
    JSON.stringify(messages)
  );
}

let privateChatChannel: ReturnType<typeof supabase.channel> | null = null;

async function openChat(friendName: string) {
  const friend = friends.find((f: any) => f.name === friendName) as any;
  const friendCloudId = friend?.cloudId as string | undefined;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let messagesHtml = "";

  if (friendCloudId && user) {
    const rows = await loadPrivateChat(friendCloudId);
    if (rows.length === 0) {
      messagesHtml = `<p style="opacity:0.7">Sin mensajes todavía.</p>`;
    } else {
      for (const m of rows) {
        const who = m.from_id === user.id ? "Tú" : friendName;
        messagesHtml += `<p><strong>${who}:</strong> ${m.body}</p>`;
      }
    }
  } else {
    messagesHtml = `<p style="opacity:0.7">Chat en la nube no disponible (falta cloudId).</p>`;
  }

  openSocialWindow(
    `Chat con ${friendName}`,
    `
      <div id="chatBox" style="
        height:140px;overflow-y:auto;background:rgba(255,255,255,0.08);
        padding:8px;border-radius:8px;margin-bottom:10px;
      ">
        ${messagesHtml}
      </div>
      <input id="chatInput" placeholder="Escribe un mensaje..." style="
        width:100%;padding:8px;box-sizing:border-box;border-radius:8px;
        border:0;margin-bottom:8px;
      ">
      <button id="sendChatBtn" style="
        width:100%;padding:8px;border:0;border-radius:8px;cursor:pointer;
      ">Enviar</button>
    `
  );

  const input = document.getElementById("chatInput") as HTMLInputElement;
  const box = document.getElementById("chatBox") as HTMLDivElement;
  const sendBtn = document.getElementById("sendChatBtn") as HTMLButtonElement;

  box.scrollTop = box.scrollHeight;

  async function doSend() {
    const text = input.value.trim();
    if (!text || !friendCloudId) return;

    await sendPrivateMessage(friendCloudId, text);
    box.innerHTML += `<p><strong>Tú:</strong> ${text}</p>`;
    input.value = "";
    box.scrollTop = box.scrollHeight;
  }

  sendBtn.onclick = () => {
    void doSend();
  };

  // Enter para enviar
  input.onkeydown = (e) => {
    e.stopPropagation();
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Enter") {
      e.preventDefault();
      void doSend();
    }
  };

  input.onkeyup = (e) => {
    e.stopPropagation();
    keys[e.key.toLowerCase()] = false;
  };

  // Realtime: mensajes nuevos del otro
  if (privateChatChannel) {
    supabase.removeChannel(privateChatChannel);
    privateChatChannel = null;
  }

  if (friendCloudId && user) {
    privateChatChannel = supabase
      .channel(`private-chat-${friendCloudId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "private_messages",
        },
        (payload) => {
          const row = payload.new as any;
          if (!row) return;

          // Solo mensajes de esta conversación
          const isThisChat =
            (row.from_id === user.id && row.to_id === friendCloudId) ||
            (row.from_id === friendCloudId && row.to_id === user.id);

          if (!isThisChat) return;

          // No duplicar los que acabas de enviar tú
          if (row.from_id === user.id) return;

          const who = friendName;
          box.innerHTML += `<p><strong>${who}:</strong> ${row.body}</p>`;
          box.scrollTop = box.scrollHeight;
        }
      )
      .subscribe();
  }

  setTimeout(() => input.focus(), 50);
}
requestsBtn.onclick = async () => {
  await loadFriendsFromCloud();
  const raceInvites = await loadRaceInvitesFromCloud();

  let html = "";

  if (friendRequests.length === 0 && raceInvites.length === 0) {
    html = "<p>No hay solicitudes pendientes.</p>";
  }

  // --- Amistades pendientes ---
  for (const request of friendRequests) {
    const fid = (request as any).friendshipId || request.id;
    html += `
  <div style="margin-bottom:12px;">
    <strong>${request.name}</strong><br>
    🟢 Solicitud de amistad<br><br>
    <button id="accept_${fid}">Aceptar</button>
    <button id="reject_${fid}">Rechazar</button>
  </div>`;
  }

  // --- Invitaciones de circuito ---
  for (const inv of raceInvites) {
    html += `
  <div style="margin-bottom:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.15);">
    <strong>🏁 ${inv.circuit_name}</strong><br>
    <span style="font-size:12px;color:#ccc;">De: ${inv.from_name} · Máx ${inv.max_players}</span><br><br>
    <button id="raceAccept_${inv.id}">Aceptar partida</button>
    <button id="raceReject_${inv.id}">Rechazar</button>
  </div>`;
  }

  openSocialWindow("Solicitudes", html);

  // --- Botones de amistad ---
  for (const request of friendRequests) {
    const fid = String((request as any).friendshipId || request.id);

    const a = document.getElementById(`accept_${fid}`) as HTMLButtonElement | null;
    const r = document.getElementById(`reject_${fid}`) as HTMLButtonElement | null;

    if (a) {
      a.onclick = async () => {
        a.disabled = true;
        await acceptFriendRequestCloud(fid);
        openSocialWindow(
          "Amistad",
          `<p>Aceptaste a <strong>${request.name}</strong>.</p>`
        );
        // Refrescar lista
        setTimeout(() => {
          void (requestsBtn as any).onclick?.();
        }, 400);
      };
    }

    if (r) {
      r.onclick = async () => {
        r.disabled = true;
        await rejectFriendRequestCloud(fid);
        openSocialWindow(
          "Solicitud",
          `<p>Rechazaste a <strong>${request.name}</strong>.</p>`
        );
      };
    }
  }

  // --- Botones de carrera ---
  for (const inv of raceInvites) {
    const a = document.getElementById(`raceAccept_${inv.id}`) as HTMLButtonElement | null;
    const r = document.getElementById(`raceReject_${inv.id}`) as HTMLButtonElement | null;

    if (a) {
      a.onclick = async () => {
        await respondRaceInvite(inv.id, true);
      };
    }
    if (r) {
      r.onclick = async () => {
        await respondRaceInvite(inv.id, false);
        openSocialWindow(
          "Invitación rechazada",
          `<p>Rechazaste la partida de ${inv.from_name}.</p>`
        );
      };
    }
  }
};

gpsBtn.onclick = () => {
  openSocialWindow(
    "GPS",
    `
      <p>Ingresa coordenadas:</p>

      <input id="gpsInput" placeholder="-12.120720, -77.028950" style="
        width:100%;
        padding:8px;
        box-sizing:border-box;
        border-radius:8px;
        border:0;
        margin-bottom:10px;
      ">

      <button id="gpsGoBtn" style="
        width:100%;
        padding:8px;
        border:0;
        border-radius:8px;
        cursor:pointer;
        font-weight:bold;
      ">
        Ir
      </button>
    `
  );

  setTimeout(() => {
    const input = document.getElementById("gpsInput") as HTMLInputElement;
    const btn = document.getElementById("gpsGoBtn") as HTMLButtonElement;

    function startGpsFromInput() {
      const value = input.value.trim();

      const parts = value.split(",").map((p) => Number(p.trim()));
      console.log("GPS input:", parts);

      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        alert("Formato incorrecto. Usa: latitud, longitud");
        return;
      }

      const lat = parts[0];
      const lon = parts[1];

      setGpsDestination(lon, lat);

      socialWindow.style.display = "none";

      console.log("GPS enviado a:", lat, lon);
    }

    btn.onclick = startGpsFromInput;

    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        startGpsFromInput();
      }
    };

    input.focus();
  }, 50);
};
missionsBtn.onclick = () => {

  openSocialWindow(
    "Misiones",
    `
      <button id="circuitBtn">
        Circuitos
      </button>

      <br><br>

      <button id="multiplayerCircuitBtn">
  🏁 Circuito Multijugador
</button>

<br><br>

      <button id="routeMissionBtn">
        Recorridos
      </button>

      <br><br>

      <button id="deliveryMissionBtn">
        Entrega y Recojo
      </button>
      <br><br>

<button id="medicineDeliveryMissionBtn">
  💊 Entrega Medicina
</button>
<br><br>

<button id="beverlyMansionMissionBtn">
  🏡 Encuentra las mansiones
</button>
    `
  );

  setTimeout(() => {
    const mpCircuitBtn = document.getElementById(
  "multiplayerCircuitBtn"
) as HTMLButtonElement | null;

if (mpCircuitBtn) {
  mpCircuitBtn.onclick = () => {
    openMultiplayerCircuitMenu();
  };
}
    const medicineMissionBtn =
  document.getElementById(
    "medicineDeliveryMissionBtn"
  ) as HTMLButtonElement | null;

if (medicineMissionBtn) {
  const beverlyMansionBtn = document.getElementById(
  "beverlyMansionMissionBtn"
) as HTMLButtonElement | null;

if (beverlyMansionBtn) {
  if (currentMapName !== "beverly-hills") {
    beverlyMansionBtn.style.opacity = "0.55";
    beverlyMansionBtn.title = "Disponible únicamente en Beverly Hills";
  }

  beverlyMansionBtn.onclick = () => {
    if (currentMapName !== "beverly-hills") {
      socialWindow.style.display = "none";
      showMissionMessage(
        "Encuentra las mansiones solo está disponible en Beverly Hills.",
        5000
      );
      return;
    }

    socialWindow.style.display = "none";
    startBeverlyMansionMission();
  };
}
  // Visualmente indicamos si está disponible.
  if (currentMapName !== "manhattan") {
    medicineMissionBtn.style.opacity = "0.55";
    medicineMissionBtn.title =
      "Disponible únicamente en Manhattan";
  }

  medicineMissionBtn.onclick = () => {
    if (currentMapName !== "manhattan") {
      socialWindow.style.display = "none";

      showMissionMessage(
        "Entrega Medicina solo está disponible en Manhattan.",
        5000
      );

      return;
    }

    socialWindow.style.display = "none";

    startMedicineDeliveryMission();
  };
}
    const deliveryBtn =
  document.getElementById("deliveryMissionBtn");

if (deliveryBtn) {
  deliveryBtn.onclick = () => {
    socialWindow.style.display = "none";
    startDeliveryAndPickupMission();
  };
}
    const routeBtn =
  document.getElementById("routeMissionBtn");

if (routeBtn) {
  routeBtn.onclick = () => {
    openSocialWindow(
      "Recorridos",
      `
        <button id="barrioMedicoRouteBtn">
  Barrio Médico
</button>

<br><br>

<button id="petitThouarsRouteBtn">
  Petit Thouars
</button>

<br><br>

<button id="maleconReservaRouteBtn">
  Circuito de Playas
</button>
<br><br>

<button id="puenteAmistadRouteBtn">
  Puente de la Amistad
</button>
      `
    );

    setTimeout(() => {
      const barrioBtn =
        document.getElementById("barrioMedicoRouteBtn");

      if (!barrioBtn) return;

      barrioBtn.onclick = () => {
        socialWindow.style.display = "none";

        startRouteMission(
          routeMissionConfigs.barrioMedico
        );
      };
      const petitBtn =
    document.getElementById("petitThouarsRouteBtn");

if (petitBtn) {

    petitBtn.onclick = () => {

        socialWindow.style.display = "none";

        startRouteMission(
            routeMissionConfigs.petitThouars
        );

    };

}
const maleconBtn =
    document.getElementById("maleconReservaRouteBtn");

if (maleconBtn) {

    maleconBtn.onclick = () => {

        socialWindow.style.display = "none";

        startRouteMission(
            routeMissionConfigs.maleconReserva
        );

    };

}
const puenteBtn =
    document.getElementById("puenteAmistadRouteBtn");

if (puenteBtn) {

    puenteBtn.onclick = () => {

        socialWindow.style.display = "none";

        startRouteMission(
            routeMissionConfigs.puenteAmistad
        );

    };

}
    }, 50);
  };
}

    const btn =
      document.getElementById("circuitBtn");

    if (!btn) return;

    btn.onclick = () => {

      openSocialWindow(
  "Circuitos",
  `
    <button id="josePardoRaceBtn">
      Av. Jose Pardo
    </button>

    <br><br>

    <button id="diagonalRaceBtn">
      Av. Andrés Avellino Cáceres
    </button>
    <br><br>

<button id="plazaBolognesiRaceBtn">
  Plaza Bolognesi
</button>
<br><br>

<button id="urbLosJazminesRaceBtn">
  Urb. Los Jazmines
</button>
  `
);

      setTimeout(() => {

        const raceBtn =
          document.getElementById("josePardoRaceBtn");

        if (!raceBtn) return;

        raceBtn.onclick = () => {
  socialWindow.style.display = "none";
  startRace(raceConfigs.josePardo);
  };
const diagonalBtn =
  document.getElementById("diagonalRaceBtn");
  const plazaBolognesiBtn =
  document.getElementById("plazaBolognesiRaceBtn");

if (plazaBolognesiBtn) {
  plazaBolognesiBtn.onclick = () => {
    socialWindow.style.display = "none";
    startRace(raceConfigs.plazaBolognesi);
  };
  const urbLosJazminesBtn =
  document.getElementById("urbLosJazminesRaceBtn");

if (urbLosJazminesBtn) {
  urbLosJazminesBtn.onclick = () => {
    socialWindow.style.display = "none";
    startRace(raceConfigs.urbLosJazmines);
  };
}
}

if (diagonalBtn) {
  diagonalBtn.onclick = () => {
    socialWindow.style.display = "none";
    startRace(raceConfigs.diagonal);
  };
}

      },50);

    };

  },50);
};

controlsBtn.onclick = () => {
  openSocialWindow(
    "Controles",
    `
    <div style="font-size:13px; line-height:1.45; max-height:420px; overflow-y:auto; padding-right:4px;">

      <div style="color:#7ec8ff; font-weight:bold; margin:4px 0 8px;">🎮 Movimiento</div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">W / ↑</span>
        <span>Adelante</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">S / ↓</span>
        <span>Atrás</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">A / ←</span>
        <span>Izquierda</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">D / →</span>
        <span>Derecha</span>
      </div>

      <div style="color:#7ec8ff; font-weight:bold; margin:4px 0 8px;">🚗 Vehículo</div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">F</span>
        <span>Entrar / salir del auto</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">R</span>
        <span>Encender / apagar motor</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">Espacio</span>
        <span>Freno de mano</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">L</span>
        <span>Luces del auto (ciclo)</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">C</span>
        <span>Cambiar cámara del auto</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">Q</span>
        <span>Bajar marcha (manual)</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">E</span>
        <span>Subir marcha (manual)</span>
      </div>

      <div style="color:#7ec8ff; font-weight:bold; margin:4px 0 8px;">🧍 A pie</div>
      <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">L</span>
        <span>Linterna</span>
      </div>

      <div style="color:#7ec8ff; font-weight:bold; margin:4px 0 8px;">🗺️ Misiones y mapa</div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">3</span>
        <span>Cancelar misión activa</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:5px;">
        <span style="color:#aaa;">M</span>
        <span>Expandir / reducir minimapa</span>
      </div>
      
    </div>
    `
  );
};
profileBtn.onclick = () => {
  const username =
    localStorage.getItem("niuwd_session_user") ||
    localStorage.getItem("niuwd_username") ||
    "Invitado";

  const cityLabel =
    currentMapName === "manhattan"
      ? "Manhattan"
      : currentMapName === "beverly-hills"
        ? "Beverly Hills"
        : currentMapName === "miraflores"
          ? "Miraflores"
          : currentMapName;

  openSocialWindow(
    "Perfil",
    `
      <p>Usuario: <strong>${username}</strong></p>
      <p>Ciudad: ${cityLabel}</p>
      <p>Estado: En línea</p>
    `
  );
};
logoutBtn.onclick = () => {
  openSocialWindow(
    "Cerrar sesión",
    `
      <p>¿Seguro que quieres cerrar sesión?</p>
      <button id="confirmLogoutBtn" style="
        width:100%;
        padding:10px;
        border:0;
        border-radius:8px;
        cursor:pointer;
        font-weight:bold;
        background:#c44;
        color:white;
        margin-top:8px;
      ">
        Sí, cerrar sesión
      </button>
    `
  );

  setTimeout(() => {
    const btn = document.getElementById(
      "confirmLogoutBtn"
    ) as HTMLButtonElement | null;

    if (!btn) return;

    btn.onclick = () => {
      localStorage.removeItem("niuwd_session_user");
      // opcional: no borrar monedas/gasolina/amigos del usuario
      location.reload(); // vuelve a la pantalla de auth
    };
  }, 50);
};

transmissionBtn.innerText = "Caja: Automática";
transmissionBtn.style.position = "fixed";
transmissionBtn.style.right = "18px";
transmissionBtn.style.bottom = "135px";
transmissionBtn.style.padding = "10px 14px";
transmissionBtn.style.borderRadius = "10px";
transmissionBtn.style.border = "0";
transmissionBtn.style.zIndex = "90";
transmissionBtn.style.fontFamily = "Arial";
transmissionBtn.style.cursor = "pointer";

document.body.appendChild(transmissionBtn);
transmissionBtn.style.display = "none";

transmissionBtn.onclick = () => {
  transmissionMode = transmissionMode === "auto" ? "manual" : "auto";

  transmissionBtn.innerText =
    transmissionMode === "auto"
      ? "Caja: Automática"
      : "Caja: Manual";
};
// Guardar progreso en la nube cada 30 segundos
setInterval(() => {
  void syncProfileToCloud();
}, 30000);

// Al cerrar o recargar la pestaña
window.addEventListener("beforeunload", () => {
  void syncProfileToCloud();
});
// Render
engine.runRenderLoop(() => {
  publishMyPresence();
  scene.render();
});

window.addEventListener("resize", () => engine.resize());