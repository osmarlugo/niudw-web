import * as BABYLON from "@babylonjs/core";
import type { ProjectContext } from "./types";

export function createHouses(ctx: ProjectContext) {
  const { scene, root, createBox, materials } = ctx;

  const colors = [
    new BABYLON.Color3(0.82, 0.72, 0.58),
    new BABYLON.Color3(0.72, 0.79, 0.78),
    new BABYLON.Color3(0.86, 0.64, 0.48),
    new BABYLON.Color3(0.75, 0.69, 0.84),
  ];

  const createHouse = (index: number, model: number, x: number, z: number, rotationY: number) => {
    const houseRoot = new BABYLON.TransformNode(`olivarHouse_${index}`, scene);
    houseRoot.position.set(x, 0, z);
    houseRoot.rotation.y = rotationY;
    houseRoot.parent = root;

    const facade = new BABYLON.StandardMaterial(`houseFacade_${index}`, scene);
    facade.diffuseColor = colors[model];
    facade.specularColor = new BABYLON.Color3(0.08, 0.08, 0.08);

    const glass = new BABYLON.StandardMaterial(`houseGlass_${index}`, scene);
    glass.diffuseColor = new BABYLON.Color3(0.06, 0.22, 0.36);
    glass.emissiveColor = new BABYLON.Color3(0.01, 0.045, 0.07);
    glass.specularColor = new BABYLON.Color3(0.55, 0.65, 0.75);
    glass.alpha = 0.82;
    glass.needDepthPrePass = true;

    const width = model === 2 ? 17 : 19;
    const upperShift = model === 1 ? -2.2 : 2.0;
    const upperWidth = model === 3 ? 11 : 14;

    createBox(`houseBody_${index}`, width, 5.0, 14.5, new BABYLON.Vector3(0, 2.5, 0), facade, houseRoot);
    createBox(`houseUpper_${index}`, upperWidth, 3.5, 10.8,
      new BABYLON.Vector3(upperShift, 6.65, 0.6), materials.white, houseRoot);
    createBox(`houseRoof_${index}`, upperWidth + 1.1, 0.42, 11.8,
      new BABYLON.Vector3(upperShift, 8.62, 0.6), materials.dark, houseRoot);

    // Garaje real, puerta principal y jardín frontal.
    createBox(`garage_${index}`, 6.7, 3.0, 0.28,
      new BABYLON.Vector3(-5.0, 1.65, -7.38), materials.garage, houseRoot);
    createBox(`door_${index}`, 2.2, 3.35, 0.26,
      new BABYLON.Vector3(0.2, 1.75, -7.45), materials.wood, houseRoot);

    for (const wx of [4.0, 6.7]) {
      createBox(`window_${index}`, 2.1, 2.0, 0.18,
        new BABYLON.Vector3(wx, 3.0, -7.48), glass, houseRoot);
    }
    for (const wx of [-3.5, 0, 3.5]) {
      createBox(`upperWindow_${index}`, 2.25, 1.65, 0.18,
        new BABYLON.Vector3(upperShift + wx * 0.7, 6.65, -4.88), glass, houseRoot);
    }

    createBox(`driveway_${index}`, 7.4, 0.08, 10,
      new BABYLON.Vector3(-5.0, 0.30, -12.1), materials.stone, houseRoot);
    createBox(`garden_${index}`, 8, 0.10, 6,
      new BABYLON.Vector3(5.0, 0.29, -10.2), materials.grass, houseRoot);
    createBox(`hedge_${index}`, 8, 0.85, 0.8,
      new BABYLON.Vector3(5.0, 0.5, -13.0), materials.hedge, houseRoot);

    // Luz visual sin crear 48 PointLight reales.
    createBox(`porchLamp_${index}`, 0.34, 0.34, 0.16,
      new BABYLON.Vector3(0.2, 3.1, -7.62), materials.warm, houseRoot);
  };

  const rows = [-132, -100, -66, -34, 14, 78];
  let index = 1;
  for (const z of rows) {
    for (const x of [-145, -98, 98, 145]) {
      const rotation = x < 0 ? -Math.PI / 2 : Math.PI / 2;
      createHouse(index, (index - 1) % 4, x, z, rotation);
      index++;
    }
  }

  // Segunda franja: casas cercanas a la avenida principal.
// Todas deben mirar hacia el centro, donde está la avenida X = 0.
for (const z of rows) {
  for (const x of [-70, -42, 42, 70]) {
    if (z >= 78) {
      continue;
    }

    /*
     * La fachada de cada casa está orientada
     * originalmente hacia su eje local Z negativo.
     *
     * Casas ubicadas a la izquierda:
     * deben mirar hacia la derecha, hacia X = 0.
     *
     * Casas ubicadas a la derecha:
     * deben mirar hacia la izquierda, hacia X = 0.
     */
    const rotation =
      x < 0
        ? -Math.PI / 2
        : Math.PI / 2;

    createHouse(
      index,
      (index - 1) % 4,
      x,
      z,
      rotation
    );

    index++;
  }
}
}
