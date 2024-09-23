import * as THREE from "three";
import Pattern3d from "./Pattern3d";
import { getViewportTarget } from "./helpers";
import reach from "./helpers/reach";

export class CreateHomeScene {
  constructor(wrapper) {
    // this.orbitControls = require('three/examples/jsm/controls/OrbitControls').OrbitControls
    this.wrapper = wrapper;
    this.wrapperSize = wrapper.getBoundingClientRect();

    this.follower = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    };

    this.init();
  }

  init = () => {
    this.scene = new THREE.Scene();

    // CAMERA
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.wrapperSize.width / this.wrapperSize.height,
      0.1,
      10
    );
    this.camera.position.z = 5;

    this.pattern3d = new Pattern3d(
      this.scene,
      this.camera,
      () => {
        window.addEventListener("mousemove", this.handleMouse);
      },
      this.wrapperSize,
      getViewportTarget()
    );

    // INITIATE RENDERER
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.wrapperSize.width, this.wrapperSize.height);

    // APPEND THE CANVAS IN THE DOM
    this.wrapper.appendChild(this.renderer.domElement);

    window.addEventListener("resize", this.handleResize);

    // START ANIMATION
    this.animate();
  };

  // animation loop
  animate = () => {
    this.render();
    requestAnimationFrame(this.animate);
  };

  // RENDER function
  render = () => {
    this.renderer.render(this.scene, this.camera);
  };

  handleMouse = (ev) => {
    if (this.followerSpring) {
      this.followerSpring.stop();
      this.followerSpring = null;
    }

    this.followerSpring = reach({
      from: {
        x: this.follower.x,
        y: this.follower.y,
      },
      to: {
        x: ev.clientX,
        y: ev.clientY,
      },
      velocity: {
        x: this.follower.vx,
        y: this.follower.vy,
      },
      stiffness: 800,
      damping: 4,
      mass: 0.1,
    }).start({
      update: (position) => {
        const velocity = {
          x: position.x - this.follower.x,
          y: position.y - this.follower.y,
        };
        this.pattern3d.updateRgbEffect({
          position,
          velocity,
        });
        this.follower = {
          x: position.x,
          y: position.y,
          vx: velocity.x,
          vy: velocity.y,
        };
      },
      complete: () => {
        this.pattern3d.updateRgbEffect({
          position: this.follower,
          velocity: {
            x: 0,
            y: 0,
          },
        });
        this.follower.vx = 0;
        this.follower.vy = 0;
      },
    });
  };

  handleResize = () => {
    this.wrapperSize = this.wrapper.getBoundingClientRect();
    this.camera.aspect = this.wrapperSize.width / this.wrapperSize.height;

    this.renderer.setSize(this.wrapperSize.width, this.wrapperSize.height);

    const newTarget = getViewportTarget();
    if (newTarget === "mobile" || newTarget === "tablet") {
      this.renderer.dispose();
    } else {
      this.pattern3d.updateSize(this.wrapperSize, newTarget);
    }
  };
}
