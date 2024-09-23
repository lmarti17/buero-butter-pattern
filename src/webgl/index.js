/**
 * Modules
 *
 */

import { CreateHomeScene } from "./HomeScene";

/**
 * * DOM elements
 */
// const canvasDOM = document.querySelector(".webgl-canvas");
const wrapperDOM = document.getElementById("home");

/**
 * * Base Configuration
 */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//  Debugging UI

new CreateHomeScene(wrapperDOM);
