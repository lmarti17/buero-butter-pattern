/**
 * Modules
 *
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";

import particleVertexShader from "./shaders/particleShader/vertex.glsl";
import particleFragmentShader from "./shaders/particleShader/fragment.glsl";

/**
 * * DOM elements
 */
const canvasDOM = document.querySelector(".webgl-canvas");

/**
 * * Base Configuration
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//  Debugging UI

const gui = new GUI();

const parameters = {
  backgroundColor: 0xfafafa,
  count: 10000,
};

gui
  .addColor(parameters, "backgroundColor")
  .name("Background Color")
  .onChange(() => {
    renderer.setClearColor(parameters.backgroundColor);
  });
gui
  .add(parameters, "count")
  .name("Particles Count")
  .min(1000)
  .max(500000)
  .step(1000);

/**
 * * Creating scene
 *
 */

const scene = new THREE.Scene();

/**
 * * Camera
 */

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  10
);
camera.position.z = 5;

const controls = new OrbitControls(camera, canvasDOM);

scene.add(camera);

/**
 * * Renderer
 */

const renderer = new THREE.WebGLRenderer({
  canvas: canvasDOM,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor(new THREE.Color(parameters.backgroundColor));
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);
renderer.render(scene, camera);

/**
 * * Events
 */

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // updating camera aspect
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // updating renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("mousemove", ({ clientX, clientY }) => {
  mesh.material.uniforms.uMouse.x = clientX / sizes.width;
  mesh.material.uniforms.uMouse.y = 1 - clientY / sizes.height;
});

/**
 * Geometry
 */
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array(parameters.count * 3);
const scales = new Float32Array(parameters.count);

for (let i = 0; i < parameters.count; i++) {
  const i3 = i * 3;

  positions[i3] = (Math.random() - 0.5) * 2;
  positions[i3 + 1] = (Math.random() - 0.5) * 2;
  positions[i3 + 2] = (Math.random() - 0.5) * 2;

  // Scale
  scales[i] = Math.random();
}

geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
/**
 * ? Meshes
 */

const mesh = new THREE.Points(
  geometry,
  new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSize: { value: 30 * renderer.getPixelRatio() },
    },
    // For particles
    depthWrite: false,
    // blending: THREE.AdditiveBlending,
    vertexColors: true,
  })
);

scene.add(mesh);

/**
 * * Tick function
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Updating uniforms
  mesh.material.uniforms.uTime.value = elapsedTime;

  // updating orbit controls
  controls.update();

  // render scene
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

window.requestAnimationFrame(tick);
