/**
 * Modules
 *
 */
import { GUI } from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import baseFragmentShader from "./shaders/baseShader/fragment.glsl";
import baseVertexShader from "./shaders/baseShader/vertex.glsl";

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
  backgroundColor: 0x303030,
};

gui
  .addColor(parameters, "backgroundColor")
  .name("Background Color")
  .onChange(() => {
    renderer.setClearColor(parameters.backgroundColor);
  });

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
 * ? Meshes
 */

const mesh = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 32, 32),
  new THREE.ShaderMaterial({
    vertexShader: baseVertexShader,
    fragmentShader: baseFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    },
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
