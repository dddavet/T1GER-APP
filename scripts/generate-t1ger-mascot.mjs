import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  Shape,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const OUTPUT_PATH = resolve('public/mascot/t1ger-head-v1.glb');

class NodeFileReader {
  result = null;
  error = null;
  onloadend = null;

  async readAsArrayBuffer(blob) {
    try {
      this.result = await blob.arrayBuffer();
    } catch (error) {
      this.error = error;
    }
    this.onloadend?.();
  }

  async readAsDataURL(blob) {
    try {
      const bytes = Buffer.from(await blob.arrayBuffer());
      this.result = `data:${blob.type};base64,${bytes.toString('base64')}`;
    } catch (error) {
      this.error = error;
    }
    this.onloadend?.();
  }
}

globalThis.FileReader = NodeFileReader;

const palette = {
  orange: '#FF8931',
  orangeShadow: '#D96C2F',
  cream: '#FFE2BA',
  ear: '#583D36',
  stripe: '#4C332E',
  nose: '#AD4E3C',
  eye: '#181B1D',
  highlight: '#FFF8E9',
  mouth: '#522F2E',
};

const matte = (color, roughness = 0.62) => new MeshStandardMaterial({
  color: new Color(color),
  roughness,
  metalness: 0,
});

const softClay = (color, roughness = 0.52) => new MeshPhysicalMaterial({
  color: new Color(color),
  roughness,
  metalness: 0,
  clearcoat: 0.04,
  clearcoatRoughness: 0.78,
  sheen: 0.025,
  sheenColor: new Color('#FFF1DA'),
});

const materials = {
  orange: softClay(palette.orange, 0.56),
  orangeShadow: softClay(palette.orangeShadow, 0.62),
  cream: softClay(palette.cream, 0.64),
  ear: softClay(palette.ear, 0.66),
  stripe: softClay(palette.stripe, 0.64),
  nose: softClay(palette.nose, 0.48),
  eye: new MeshPhysicalMaterial({
    color: new Color(palette.eye),
    roughness: 0.18,
    metalness: 0,
    clearcoat: 0.72,
    clearcoatRoughness: 0.16,
  }),
  highlight: matte(palette.highlight, 0.35),
  mouth: matte(palette.mouth, 0.6),
};

function addMesh(parent, name, geometry, material, {
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
} = {}) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createHeadGeometry() {
  const geometry = new SphereGeometry(1, 44, 32);
  const positions = geometry.attributes.position;

  for (let index = 0; index < positions.count; index += 1) {
    const originalX = positions.getX(index);
    const originalY = positions.getY(index);
    const originalZ = positions.getZ(index);
    const cheekFullness = 1 + (1 - originalY ** 2) * 0.03;
    const crownTaper = 1 - Math.max(originalY, 0) * 0.018;
    const x = originalX * 1.02 * cheekFullness * crownTaper;
    let y = originalY * 0.84;

    if (originalY < -0.72) {
      y = -0.635 + (originalY + 0.72) * 0.27;
    }

    const depthFullness = 0.71 + (1 - Math.abs(originalY)) * 0.018;
    const z = originalZ * depthFullness;
    positions.setXYZ(index, x, y, z);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function createRoundedTriangleGeometry(width, height, depth) {
  const shape = new Shape();
  shape.moveTo(-width * 0.5, height * 0.18);
  shape.quadraticCurveTo(-width * 0.52, height * 0.42, -width * 0.28, height * 0.48);
  shape.quadraticCurveTo(0, height * 0.55, width * 0.28, height * 0.48);
  shape.quadraticCurveTo(width * 0.52, height * 0.42, width * 0.5, height * 0.18);
  shape.quadraticCurveTo(width * 0.28, -height * 0.34, 0, -height * 0.52);
  shape.quadraticCurveTo(-width * 0.28, -height * 0.34, -width * 0.5, height * 0.18);

  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.026,
    bevelThickness: 0.026,
    curveSegments: 24,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

function createForeheadStripeGeometry(width, height, depth) {
  const shape = new Shape();
  shape.moveTo(-width * 0.5, height * 0.5);
  shape.quadraticCurveTo(0, height * 0.62, width * 0.5, height * 0.5);
  shape.lineTo(width * 0.36, -height * 0.18);
  shape.quadraticCurveTo(width * 0.2, -height * 0.5, 0, -height * 0.54);
  shape.quadraticCurveTo(-width * 0.2, -height * 0.5, -width * 0.36, -height * 0.18);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.008,
    bevelThickness: 0.006,
    curveSegments: 18,
  });
  geometry.center();
  return geometry;
}

function createSideStripeGeometry(width, height, depth, mirror = false) {
  const shape = new Shape();
  shape.moveTo(-width * 0.5, -height * 0.44);
  shape.lineTo(width * 0.18, -height * 0.32);
  shape.quadraticCurveTo(width * 0.46, -height * 0.18, width * 0.52, 0);
  shape.quadraticCurveTo(width * 0.46, height * 0.18, width * 0.18, height * 0.32);
  shape.lineTo(-width * 0.5, height * 0.44);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.007,
    bevelThickness: 0.006,
    curveSegments: 16,
  });
  geometry.center();
  if (mirror) {
    geometry.scale(-1, 1, 1);
    const indices = geometry.index;
    if (indices) {
      for (let index = 0; index < indices.count; index += 3) {
        const first = indices.getX(index);
        indices.setX(index, indices.getX(index + 1));
        indices.setX(index + 1, first);
      }
    }
    geometry.computeVertexNormals();
  }
  return geometry;
}

function addCurve(parent, name, points, radius, material, segments = 22) {
  const curve = points.length === 3
    ? new QuadraticBezierCurve3(...points.map(point => new Vector3(...point)))
    : new CatmullRomCurve3(points.map(point => new Vector3(...point)));
  return addMesh(parent, name, new TubeGeometry(curve, segments, radius, 6, false), material);
}

function buildEye(parent, side) {
  const sign = side === 'left' ? -1 : 1;
  const eyeGroup = new Group();
  eyeGroup.name = `${side}Eye`;
  eyeGroup.position.set(sign * 0.285, 0.07, 0.69);
  parent.add(eyeGroup);

  addMesh(
    eyeGroup,
    `${side}EyeCore`,
    new CapsuleGeometry(0.095, 0.14, 8, 20),
    materials.eye,
    { scale: [0.92, 1, 0.62] },
  );

  addMesh(
    eyeGroup,
    `${side}EyeHighlight`,
    new SphereGeometry(0.028, 14, 12),
    materials.highlight,
    { position: [-0.036, 0.08, 0.072], scale: [1, 1.08, 0.45] },
  );

  return eyeGroup;
}

function buildEar(parent, side) {
  const sign = side === 'left' ? -1 : 1;
  const ear = new Group();
  ear.name = `${side}Ear`;
  ear.position.set(sign * 0.67, 0.66, -0.1);
  ear.rotation.z = sign * -0.06;
  parent.add(ear);

  addMesh(ear, `${side}EarOuter`, new SphereGeometry(1, 28, 20), materials.ear, {
    scale: [0.33, 0.34, 0.2],
  });
  addMesh(ear, `${side}EarInner`, new SphereGeometry(1, 24, 18), materials.cream, {
    position: [sign * -0.006, 0.005, 0.135],
    scale: [0.19, 0.205, 0.075],
  });
  return ear;
}

function buildMascot() {
  const root = new Group();
  root.name = 'T1GER_Mascot_Root';
  root.userData = {
    asset: 'T1GER head mascot',
    version: 1,
    style: 'soft-clay consumer learning character',
    generatedBy: 'scripts/generate-t1ger-mascot.mjs',
  };

  const face = new Group();
  face.name = 'T1GER_Face';
  root.add(face);

  buildEar(face, 'left');
  buildEar(face, 'right');
  addMesh(face, 'Head', createHeadGeometry(), materials.orange);

  const topStripeSpecs = [
    { x: -0.22, y: 0.55, z: 0.55, width: 0.125, height: 0.28, rotation: -0.12 },
    { x: 0, y: 0.565, z: 0.555, width: 0.145, height: 0.32, rotation: 0 },
    { x: 0.22, y: 0.55, z: 0.55, width: 0.125, height: 0.28, rotation: 0.12 },
  ];

  topStripeSpecs.forEach((stripe, index) => {
    addMesh(
      face,
      `ForeheadStripe${index + 1}`,
      new CapsuleGeometry(stripe.width * 0.5, stripe.height - stripe.width, 6, 16),
      materials.stripe,
      {
        position: [stripe.x, stripe.y, stripe.z],
        rotation: [0, 0, stripe.rotation],
        scale: [1, 1, 0.3],
      },
    );
  });

  const sideStripeSpecs = [
    { y: 0.06, rotationZ: 0.06, width: 0.33, height: 0.12 },
    { y: -0.15, rotationZ: -0.04, width: 0.29, height: 0.105 },
  ];

  for (const side of ['left', 'right']) {
    const sign = side === 'left' ? -1 : 1;
    sideStripeSpecs.forEach((stripe, index) => {
      addMesh(
        face,
        `${side}CheekStripe${index + 1}`,
        createSideStripeGeometry(stripe.width, stripe.height, 0.012, side === 'right'),
        materials.stripe,
        {
          position: [sign * 0.755, stripe.y, 0.49],
          rotation: [0, sign * 0.32, sign * stripe.rotationZ],
        },
      );
    });
  }

  const leftEye = buildEye(face, 'left');
  const rightEye = buildEye(face, 'right');

  const browGeometry = new CapsuleGeometry(0.036, 0.13, 8, 16);
  addMesh(face, 'leftBrow', browGeometry, materials.stripe, {
    position: [-0.29, 0.35, 0.62],
    rotation: [0, 0, Math.PI / 2 - 0.045],
    scale: [1, 1, 0.64],
  });
  addMesh(face, 'rightBrow', browGeometry, materials.stripe, {
    position: [0.29, 0.35, 0.62],
    rotation: [0, 0, Math.PI / 2 + 0.045],
    scale: [1, 1, 0.64],
  });

  addMesh(face, 'leftMuzzle', new SphereGeometry(1, 30, 22), materials.cream, {
    position: [-0.195, -0.235, 0.61],
    rotation: [0.03, 0.08, -0.02],
    scale: [0.35, 0.25, 0.18],
  });
  addMesh(face, 'rightMuzzle', new SphereGeometry(1, 30, 22), materials.cream, {
    position: [0.195, -0.235, 0.61],
    rotation: [0.03, -0.08, 0.02],
    scale: [0.35, 0.25, 0.18],
  });

  addMesh(face, 'Nose', createRoundedTriangleGeometry(0.29, 0.23, 0.09), materials.nose, {
    position: [0, -0.115, 0.77],
    rotation: [-0.045, 0, 0],
  });

  addCurve(face, 'MouthCenter', [
    [0, -0.205, 0.79],
    [0.002, -0.29, 0.792],
    [0, -0.355, 0.785],
  ], 0.009, materials.mouth, 14);
  addCurve(face, 'Smile', [
    [0.01, -0.36, 0.785],
    [0.14, -0.455, 0.782],
    [0.295, -0.37, 0.735],
  ], 0.013, materials.mouth, 20);

  const whiskers = [
    { y: -0.2, endY: -0.17, length: 0.39 },
    { y: -0.29, endY: -0.3, length: 0.42 },
    { y: -0.37, endY: -0.43, length: 0.36 },
  ];

  for (const side of ['left', 'right']) {
    const sign = side === 'left' ? -1 : 1;
    whiskers.forEach((whisker, index) => {
      addCurve(face, `${side}Whisker${index + 1}`, [
        [sign * 0.34, whisker.y, 0.72],
        [sign * 0.55, whisker.y + (whisker.endY - whisker.y) * 0.4, 0.67],
        [sign * (0.34 + whisker.length), whisker.endY, 0.53],
      ], 0.011, materials.mouth, 16);
    });
  }

  leftEye.userData.role = 'expression-eye';
  rightEye.userData.role = 'expression-eye';
  root.rotation.x = MathUtils.degToRad(-1.5);
  return root;
}

async function main() {
  const mascot = buildMascot();
  mascot.updateMatrixWorld(true);

  let vertices = 0;
  let triangles = 0;
  mascot.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const positionCount = object.geometry.attributes.position?.count ?? 0;
    vertices += positionCount;
    triangles += object.geometry.index
      ? object.geometry.index.count / 3
      : positionCount / 3;
  });

  const exporter = new GLTFExporter();
  const arrayBuffer = await exporter.parseAsync(mascot, {
    binary: true,
    onlyVisible: true,
    trs: true,
    maxTextureSize: 1024,
  });

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, Buffer.from(arrayBuffer));
  console.log(`Wrote ${OUTPUT_PATH} (${Buffer.byteLength(Buffer.from(arrayBuffer))} bytes, ${Math.round(vertices)} vertices, ${Math.round(triangles)} triangles)`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
