const ACCESS_PASSWORD = "niudwdemo";

const enteredPassword = prompt("Ingrese contraseña:");

if (enteredPassword !== ACCESS_PASSWORD) {
  document.body.innerHTML = `
    <div style="
      width:100vw;
      height:100vh;
      background:black;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Arial;
      font-size:28px;
    ">
      Acceso denegado
    </div>
  `;

  throw new Error("Acceso denegado");
}
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";

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

window.addEventListener("click", () => canvas.focus());

// Engine + Scene
const engine = new BABYLON.Engine(canvas, false);
engine.setHardwareScalingLevel(0.7);
const scene = new BABYLON.Scene(engine);
scene.skipPointerMovePicking = true;
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
function mat(name: string, color: BABYLON.Color3) {
  const m = new BABYLON.StandardMaterial(name, scene);
  m.diffuseColor = color;
  return m;
}

const baseMat = mat("baseMat", new BABYLON.Color3(0.68, 0.68, 0.64));
const streetMat = mat("streetMat", new BABYLON.Color3(0.07, 0.07, 0.07));
const curbMat = mat("curbMat", new BABYLON.Color3(0.82, 0.82, 0.78));
const lineMat = mat("lineMat", new BABYLON.Color3(1, 1, 1));
const parkMat = mat("parkMat", new BABYLON.Color3(0.05, 0.48, 0.12));
const grassMat = mat("grassMat", new BABYLON.Color3(0.12, 0.55, 0.16));
const avatarMat = mat("avatarMat", new BABYLON.Color3(0.1, 0.45, 1));
const skinMat = mat("skinMat", new BABYLON.Color3(0.9, 0.72, 0.55));
const treeMat = mat("treeMat", new BABYLON.Color3(0.04, 0.32, 0.08));
const trunkMat = mat("trunkMat", new BABYLON.Color3(0.35, 0.18, 0.08));

// Base
const base = BABYLON.MeshBuilder.CreateGround(
  "base",
  { width: 2500, height: 2600 },
  scene
);
base.material = baseMat;

// Centro aproximado Parque Kennedy
let centerLon = -77.0301;
let centerLat = -12.1219;
let currentMapName = "miraflores";
let salesBoothAura: BABYLON.Mesh;
let centrixAura: BABYLON.Mesh;
let centrixWebOpened = false;
let insideOlivarMap = false;
const activeMapMeshes: BABYLON.AbstractMesh[] = [];

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
};

const roadSegments: RoadSegment[] = [];
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
const ACTIVE_CHUNK_RADIUS = 0;

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

  const reference = inCar ? car.position : player.position;

  for (const mesh of cullableMeshes) {
    const dist = BABYLON.Vector3.Distance(reference, mesh.position);
    mesh.setEnabled(dist < visibleDistance);
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
  streetName?: string
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
  if (points.length < 3) return;

  const positions: number[] = [];
  const indices: number[] = [];

  let cx = 0;
  let cz = 0;

  for (const p of points) {
    cx += p.x;
    cz += p.z;
  }

  cx /= points.length;
  cz /= points.length;

  positions.push(cx, y, cz);

  for (const p of points) {
    positions.push(p.x, y, p.z);
  }

  for (let i = 1; i < points.length; i++) {
    indices.push(0, i, i + 1);
  }

  indices.push(0, points.length, 1);

  const mesh = new BABYLON.Mesh(name, scene);
  const vertexData = new BABYLON.VertexData();

  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.applyToMesh(mesh);

  mesh.material = material;
}

function getGroups(geometry: any): any[] {
  if (!geometry) return [];

  if (geometry.type === "LineString") return [geometry.coordinates];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();

  return [];
}

function createTree(x: number, z: number) {
  // Árboles desactivados para optimizar meshes
  return;
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
const maxForwardSpeed = 0.45;
const maxReverseSpeed = -0.18;
const acceleration = 0.012;
const braking = 0.068;

// baja lentamente la velocidad cuando no aceleras ni frenas
const friction = 0.995;

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
  cullingFrame++;

if (cullingFrame % 15 === 0) {
  updateChunks();
}
  cullingFrame++;

if (cullingFrame % 10 === 0) {
  updateMapVisibility();
  updateCulling();
}

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

    if (["w", "a", "s", "d", "f", " ", "m", "1", "t"].includes(key)) {
  e.preventDefault();
}

    keys[key] = true;
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
  keys[e.key.toLowerCase()] = false;
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

  collider.position = new BABYLON.Vector3(
    pos.x,
    1,
    pos.z
  );

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
    {
      width: 0.7,
      height: 0.9,
      depth: 0.35,
    },
    scene
  );

  body.position = new BABYLON.Vector3(0, 0.75, 0);
  body.material = bodyMat;
  body.parent = root;

  const leftArm = BABYLON.MeshBuilder.CreateBox(
    `${name}_leftArm`,
    {
      width: 0.22,
      height: 0.75,
      depth: 0.22,
    },
    scene
  );

  leftArm.position = new BABYLON.Vector3(-0.55, 0.55, 0);
  leftArm.material = bodyMat;
  leftArm.parent = root;

  const rightArm = BABYLON.MeshBuilder.CreateBox(
    `${name}_rightArm`,
    {
      width: 0.22,
      height: 0.75,
      depth: 0.22,
    },
    scene
  );

  rightArm.position = new BABYLON.Vector3(0.55, 0.55, 0);
  rightArm.material = bodyMat;
  rightArm.parent = root;

  const leftLeg = BABYLON.MeshBuilder.CreateBox(
    `${name}_leftLeg`,
    {
      width: 0.25,
      height: 0.8,
      depth: 0.25,
    },
    scene
  );

  leftLeg.position = new BABYLON.Vector3(-0.22, -0.25, 0);
  leftLeg.material = bodyMat;
  leftLeg.parent = root;

  const rightLeg = BABYLON.MeshBuilder.CreateBox(
    `${name}_rightLeg`,
    {
      width: 0.25,
      height: 0.8,
      depth: 0.25,
    },
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
function createNiuStoreAtLonLat(
  name: string,
  lon: number,
  lat: number,
  type: "pizza" | "cafe" | "farmacia",
  color: BABYLON.Color3
) {
  const pos = lonLatToWorld(lon, lat);

  const storeMat = mat(name + "_mat", color);
  const signMat = mat(name + "_sign_mat", new BABYLON.Color3(1, 1, 1));

  const store = BABYLON.MeshBuilder.CreateBox(
    name,
    { width: 7, height: 5, depth: 7 },
    scene
  );
  store.position = new BABYLON.Vector3(pos.x, 2.5, pos.z);
  store.material = storeMat;
  registerCullable(store);

  const sign = BABYLON.MeshBuilder.CreatePlane(
    name + "_sign",
    { width: 7, height: 1.6 },
    scene
  );
  sign.position = new BABYLON.Vector3(pos.x, 5.7, pos.z + 3.6);
  sign.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  sign.material = signMat;
  registerCullable(sign);

  const texture = new BABYLON.DynamicTexture(
    name + "_texture",
    { width: 512, height: 128 },
    scene,
    true
  );

  const ctx = texture.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "black";
  ctx.font = "bold 42px Arial";
  ctx.textAlign = "center";
  ctx.fillText(name, 256, 58);
  ctx.font = "28px Arial";
  ctx.fillText(type.toUpperCase(), 256, 100);
  texture.update();

  signMat.diffuseTexture = texture;
}
function createBuildingBetweenCoords(
  name: string,
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  height: number,
  color: BABYLON.Color3,
  signText?: string
) {
  const p1 = lonLatToWorld(lon1, lat1);
  const p2 = lonLatToWorld(lon2, lat2);

  const centerX = (p1.x + p2.x) / 2;
  const centerZ = (p1.z + p2.z) / 2;

  const width = Math.max(8, Math.abs(p2.x - p1.x));
  const depth = Math.max(8, Math.abs(p2.z - p1.z));

  const buildingMat = mat(name + "_mat", color);

  const building = BABYLON.MeshBuilder.CreateBox(
    name,
    { width, height, depth },
    scene
  );

  building.position = new BABYLON.Vector3(centerX, height / 2, centerZ);
  building.material = buildingMat;

    // Texto visible del edificio
  if (signText) {
    const texture = new BABYLON.DynamicTexture(
      name + "_text_texture",
      { width: 1024, height: 256 },
      scene,
      true
    );

    const ctx = texture.getContext() as CanvasRenderingContext2D;

    ctx.fillStyle = "#0636A8";
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 1004, 236);

    ctx.fillStyle = "white";
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(signText, 512, 128);

    texture.update();

    const signMat = new BABYLON.StandardMaterial(name + "_text_mat", scene);
    signMat.diffuseTexture = texture;
    signMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    signMat.backFaceCulling = false;

    const sign = BABYLON.MeshBuilder.CreatePlane(
      name + "_text_panel",
      {
        width: Math.max(10, width * 0.95),
        height: 3,
      },
      scene
    );

    sign.position = new BABYLON.Vector3(
      centerX,
      height - 3,
      centerZ + depth / 2 + 0.35
    );

    // Para que siempre se vea
    sign.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    sign.material = signMat;
  }

  return building;
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
    { width: 0.35, height: 0.25, depth: 2.2 },
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
  leftTip.position = new BABYLON.Vector3(-0.35, 0, -1.6);
  leftTip.rotation.y = -0.7;
  leftTip.material = arrowMat;
  leftTip.parent = gpsArrow;

  const rightTip = BABYLON.MeshBuilder.CreateBox(
    "gpsArrowRightTip",
    { width: 0.3, height: 0.25, depth: 1 },
    scene
  );
  rightTip.position = new BABYLON.Vector3(0.35, 0, -1.6);
  rightTip.rotation.y = 0.7;
  rightTip.material = arrowMat;
  rightTip.parent = gpsArrow;

  gpsArrow.setEnabled(false);
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

  chunks.clear();

  mapMeshes.length = 0;
  cullableMeshes.length = 0;

  bots.length = 0;

  // Limpia referencias
  salesBoothAura = undefined as any;
  pickupAura = undefined as any;
  deliveryAura = undefined as any;
  gpsArrow = undefined as any;

  missionStage = "inactive";

  inCar = false;
  carVelocity = 0;
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
async function loadCarModel(
  fileName: string,
  position: BABYLON.Vector3
) {
  car = BABYLON.MeshBuilder.CreateBox(
    "carCollider",
    { width: 2.8, height: 1.4, depth: 4.4 },
    scene
  );

  car.position = position.clone();
  car.position.y = 0.18;
  car.isVisible = false;

  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "/models/",
      fileName,
      scene
    );

    const carRoot = new BABYLON.TransformNode("importedCarRoot", scene);
    carRoot.parent = car;

    for (const mesh of result.meshes) {
      if (mesh instanceof BABYLON.Mesh) {
        mesh.parent = carRoot;
        mesh.setEnabled(true);
      }
    }

    // AJUSTES DEL MODELO
    carRoot.position = new BABYLON.Vector3(0, 0, 0);
    carRoot.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

    // Si mira al revés, cambia esto a 0 o Math.PI
    carRoot.rotation.y = Math.PI;

    console.log("Auto GLB cargado correctamente:", fileName);
  } catch (error) {
    console.error("No se pudo cargar el auto GLB:", error);

    // Auto rojo de emergencia para saber que el collider existe
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
async function loadMap(fileName = "miraflores-28-julio.geojson") {
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

          createRoad(a, b, width, props.name);
        }
      }
    }

    // Areas verdes
    if (
      props.leisure === "park" ||
      props.landuse === "grass" ||
      props.landuse === "recreation_ground" ||
      props.natural === "wood"
    ) {
      const groups = getGroups(geometry);

      for (const group of groups) {
        const points = group.map((c: any) => lonLatToWorld(c[0], c[1]));
        createPolygon("green_area", points, parkMat, 0.09);
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

        const buildingHeight = 8 + Math.random() * 18;

        const building = BABYLON.MeshBuilder.CreateBox(
          "osmBuilding",
          { width: 10, height: buildingHeight, depth: 10 },
          scene
        );

        building.position = new BABYLON.Vector3(cx, buildingHeight / 2, cz);
        building.material = mat(
          "osmBuildingMat",
          new BABYLON.Color3(0.55, 0.55, 0.58)
        );

        activeMapMeshes.push(building);
        registerChunkMesh(building);
        registerCullable(building);
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

  if (currentMapName === "san-isidro") {
    const olivarStart = lonLatToWorld(
  -77.03473479514317,
  -12.102597081696757
);

const roadStart = getNearestRoadPoint(olivarStart);

createAvatar(roadStart.add(new BABYLON.Vector3(2, 0.67, 0)));
createMiniCooper(roadStart);

    player.position.y = 0.85;
    car.position.y = 0.18;

    camera.target = player.position;
    return;
  }

  const extraGrass = BABYLON.MeshBuilder.CreateGround(
    "extraGrass",
    { width: 70, height: 55 },
    scene
  );
  extraGrass.position = new BABYLON.Vector3(0, 0.025, 0);
  extraGrass.material = grassMat;

  createModernOrangeBuildingAtLonLat(
  -77.02146205441015,
  -12.12989534544568
);
createWebAuraAtLonLat(
  -77.02146205441015,
  -12.12989534544568,
  "https://eeinmobiliaria.com/proyectos/centrix-28/"
);
  createBuildingAtLonLat(-77.0295696736476, -12.119484577023385, 10, 18, 8, new BABYLON.Color3(0.2, 0.4, 1));
  createBuildingAtLonLat(-77.0298, -12.1223, 8, 10, 8, new BABYLON.Color3(0.8, 0.8, 0.75));
  createBuildingAtLonLat(-77.0312, -12.1212, 12, 25, 10, new BABYLON.Color3(0.55, 0.55, 0.6));

  createNiuStoreAtLonLat("NIU Pizza", -77.02977281610482, -12.120082363841565, "pizza", new BABYLON.Color3(0.8, 0.25, 0.15));
  createNiuStoreAtLonLat("NIU Cafe", -77.02880596014136, -12.119718784948773, "cafe", new BABYLON.Color3(0.45, 0.28, 0.12));
  createNiuStoreAtLonLat("NIU Farma", -77.0303213209358, -12.120736804602746, "farmacia", new BABYLON.Color3(0.1, 0.55, 0.35));
  createNiuStoreAtLonLat("NIU Market", -77.03044217794249, -12.119294608937542, "cafe", new BABYLON.Color3(0.2, 0.35, 0.75));
  createNiuStoreAtLonLat("NIU Express", -77.03018496946504, -12.11931884758435, "pizza", new BABYLON.Color3(0.75, 0.55, 0.2));

  createBuildingBetweenCoords(
    "niuWdBuilding",
    -77.02886031373137,
    -12.120414902995638,
    -77.02888713582045,
    -12.12101019132289,
    22,
    new BABYLON.Color3(0.05, 0.22, 0.8),
    "Niu WD"
  );

  createStopSignAtLonLat(-77.03021739565928, -12.120788109052642);

  createStreetSignBetweenCoords(
    "Av. Diagonal",
    -77.02941749930515,
    -12.119699686253044,
    -77.02927991625387,
    -12.119805535265524
  );

  createSalesBoothAtLonLat(
    -77.02878209374222,
    -12.118881789293624
  );

  createCentrixBillboardAtLonLat(
  -77.02158113338712,
  -12.129906426232017
);
  createAvatar(new BABYLON.Vector3(0, 1, 20));

await loadCarModel(
  "miniCooper.glb",
  new BABYLON.Vector3(4, 0.18, 20)
);

createMissionSystem();

  createBotAtLonLat("bot1", -77.0305, -12.1218, new BABYLON.Color3(0.8, 0.2, 0.2));
  createBotWalkingBetweenCoords("botDiagonal1", -77.0300918818036, -12.120575144534602, -77.02944005390489, -12.119730558889549, new BABYLON.Color3(1, 0.4, 0.1));
  createBotAtLonLat("bot2", -77.0298, -12.1222, new BABYLON.Color3(0.2, 0.8, 0.2));
  createBotAtLonLat("bot3", -77.0310, -12.1212, new BABYLON.Color3(0.2, 0.4, 1));

  if (!isOnRoad(car.position) && roadSegments.length > 0) {
    const first = roadSegments[0];
    car.position = first.a.clone();
    car.position.y = 0.18;
    player.position = first.a.add(new BABYLON.Vector3(3, 1, 0));
  }

  camera.target = player.position;
}
function createSalesBoothAtLonLat(lon: number, lat: number) {
  const pos = lonLatToWorld(lon, lat);

  const boothMat = mat("salesBoothMat", new BABYLON.Color3(0.95, 0.85, 0.45));

  const booth = BABYLON.MeshBuilder.CreateBox(
    "salesBooth",
    { width: 6, height: 4, depth: 6 },
    scene
  );

  booth.position = new BABYLON.Vector3(pos.x, 2, pos.z);
  booth.material = boothMat;

  const signTexture = new BABYLON.DynamicTexture(
    "salesBoothTexture",
    { width: 512, height: 128 },
    scene,
    true
  );

  const ctx = signTexture.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = "#0B2FA5";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "white";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PROYECTO", 256, 50);
  ctx.fillText("EL OLIVAR", 256, 95);
  signTexture.update();

  const signMat = new BABYLON.StandardMaterial("salesBoothSignMat", scene);
  signMat.diffuseTexture = signTexture;
  signMat.emissiveColor = new BABYLON.Color3(1, 1, 1);

  const sign = BABYLON.MeshBuilder.CreatePlane(
    "salesBoothSign",
    { width: 6, height: 1.6 },
    scene
  );

  sign.position = new BABYLON.Vector3(pos.x, 4.5, pos.z + 3.1);
  sign.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  sign.material = signMat;

  activeMapMeshes.push(booth, sign);
  registerCullable(booth);
  registerCullable(sign);
  // Aura rosa de acceso
const auraMat = new BABYLON.StandardMaterial(
  "salesAuraMat",
  scene
);

auraMat.diffuseColor = new BABYLON.Color3(1, 0.15, 0.75);
auraMat.emissiveColor = new BABYLON.Color3(1, 0.15, 0.75);
auraMat.alpha = 0.55;

salesBoothAura = BABYLON.MeshBuilder.CreateCylinder(
  "salesBoothAura",
  {
    diameter: 9,
    height: 0.3,
  },
  scene
);

salesBoothAura.position = new BABYLON.Vector3(
  pos.x,
  0.15,
  pos.z
);

salesBoothAura.material = auraMat;

registerCullable(salesBoothAura);
registerChunkMesh(salesBoothAura);
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

loadMap();
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
async function travelToSanIsidro() {
  insideOlivarMap = true;
  currentMapName = "san-isidro";

  clearCurrentMap();

  centerLon = -77.0360;
  centerLat = -12.0998;

  await loadMap("san-isidro-olivar.geojson");

  carVelocity = 0;
  inCar = false;

  console.log("Mapa Olivar cargado limpio");
}

function updateMission() {
  if (!car || !gpsArrow || !pickupAura || !deliveryAura) return;
  if (missionStage === "inactive") return;

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

    console.log("Pedido entregado");
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

cullingFrame++;

if (cullingFrame % 20 === 0) {
  updateChunks();
  updateMapVisibility();
  updateCulling();
}

drawMinimap();
updateMission();
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
// Entrada automática al mapa Olivar
if (
  currentMapName === "miraflores" &&
  salesBoothAura &&
  !insideOlivarMap
) {
  const dx = player.position.x - salesBoothAura.position.x;
  const dz = player.position.z - salesBoothAura.position.z;

  const dist = Math.sqrt(dx * dx + dz * dz);

  // animación aura
  salesBoothAura.rotation.y += 0.03;

  const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.08;
  salesBoothAura.scaling.x = pulse;
  salesBoothAura.scaling.z = pulse;

  if (dist < 5) {
    insideOlivarMap = true;
    travelToSanIsidro();
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
// ACELERACIÓN
// =========================

if (keys["w"]) {
  carVelocity += acceleration;
}

if (keys["s"]) {
  carVelocity -= braking;
}
// Freno de mano con barra espaciadora
if (keys[" "]) {
  carVelocity *= 0.65;

  if (Math.abs(carVelocity) < 0.03) {
    carVelocity = 0;
  }
}

// fricción suave: se detiene solo después de unos segundos
if (!keys["w"] && !keys["s"]) {
  carVelocity *= friction;
}

// límites
if (carVelocity > maxForwardSpeed) {
  carVelocity = maxForwardSpeed;
}

if (carVelocity < maxReverseSpeed) {
  carVelocity = maxReverseSpeed;
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

const cameraDistance = 10;
const cameraHeight = 4;

const desiredCameraPosition =
  car.position
    .subtract(forward.scale(cameraDistance))
    .add(new BABYLON.Vector3(0, cameraHeight, 0));

camera.target = BABYLON.Vector3.Lerp(
  camera.target as BABYLON.Vector3,
  car.position,
  0.12
);

camera.position = BABYLON.Vector3.Lerp(
  camera.position,
  desiredCameraPosition,
  0.08
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
// FPS en pantalla
const fpsText = document.createElement("div");
fpsText.style.position = "fixed";
fpsText.style.top = "10px";
fpsText.style.left = "10px";
fpsText.style.color = "white";
fpsText.style.background = "rgba(0,0,0,0.5)";
fpsText.style.padding = "8px";
fpsText.style.borderRadius = "8px";
fpsText.style.zIndex = "20";
fpsText.style.fontFamily = "Arial";
document.body.appendChild(fpsText);

scene.onBeforeRenderObservable.add(() => {
  fpsText.innerText = `FPS: ${engine.getFps().toFixed(0)}`;
});
const statsText = document.createElement("div");
statsText.style.position = "fixed";
statsText.style.top = "10px";
statsText.style.left = "10px";
statsText.style.color = "white";
statsText.style.background = "rgba(0,0,0,0.6)";
statsText.style.padding = "8px";
statsText.style.zIndex = "50";
statsText.style.fontFamily = "Arial";
document.body.appendChild(statsText);

scene.onBeforeRenderObservable.add(() => {
  statsText.innerText =
    `FPS: ${engine.getFps().toFixed(0)} | Meshes: ${scene.meshes.length}`;
});
// Render
engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());