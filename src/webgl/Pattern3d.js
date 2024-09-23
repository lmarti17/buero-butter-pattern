import * as THREE from "three";
// const glsl = require("glslify");

export default class Pattern3D {
  constructor(scene, camera, textureLoadedCallback, wrapperSize, target) {
    this.scene = scene;
    this.camera = camera;
    this.target = target;
    console.log(this.target);

    this.wrapperSize = wrapperSize;

    const img = document.createElement("img");
    img.onload = function () {
      console.log("IMG loaded");
    };

    console.log(img);
    // GEOMETRY
    const { width, height } = this.getPlaneSize();

    this.geometry = new THREE.PlaneGeometry(width, height, 2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;

void main(){
    vec3 pos = position.xyz;
    gl_Position =
        projectionMatrix * 
        modelViewMatrix * 
         vec4(pos, 1.0);
    vUv = uv;
}`,
      fragmentShader: `uniform vec2 u_resolution;
uniform sampler2D u_texture;
uniform vec2 u_textureFactor;
uniform float u_wrapperRatio;
// RGB
uniform vec2 u_rgbPosition;
uniform vec2 u_rgbVelocity;
varying vec2 vUv;


vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
    // return uvs * factor - factor /2. + 0.5;
    vec2 resultUv = uvs;
    
    if(factor.x > factor.y) {
        resultUv.x = uvs.x * factor.x - factor.x / 2. + 0.5 ;
        resultUv.y = uvs.y * factor.y - factor.y /2. + 0.5 * (1. + 1. - factor.y);
    } else {
        resultUv.x = uvs.x * factor.x - factor.x /2. + 0.5 * factor.x;
        resultUv.y = uvs.y * factor.y - factor.y /2. + 0.5; 
    }    
    
    return resultUv;
}

void main(){
    // On THREE 102 The image is has Y backwards
    // vec2 flipedUV = vec2(vUv.x,1.-vUv.y);

    vec2 normalizedRgbPos = u_rgbPosition / u_resolution;
    normalizedRgbPos.y = 1. - normalizedRgbPos.y; 
    
    vec2 vel = u_rgbVelocity;
    float dist = distance(normalizedRgbPos + vel  / u_resolution, vUv.xy);
    float ratio = clamp(1.0 - dist * 6., 0., 1.);
    vec4 tex1 = vec4(1.);
    vec2 uv = vUv;

    uv.x -= sin(uv.y) * ratio / 45. * (vel.x + vel.y) / 7.;
    uv.y -= sin(uv.x) * ratio / 45. * (vel.x + vel.y) / 7.;

    // tex1 = texture2D(u_texture, uv);
    tex1 = texture2D(u_texture, centeredAspectRatio(uv, u_textureFactor));
    gl_FragColor = tex1;
}`,
      uniforms: {
        u_texture: {
          value: "",
        },
        u_textureFactor: {
          value: new THREE.Vector2(1, 1),
        },
        u_resolution: {
          value: new THREE.Vector2(wrapperSize.width, wrapperSize.height),
        },
        u_rgbPosition: {
          value: new THREE.Vector2(
            wrapperSize.width / 2,
            wrapperSize.height / 2
          ),
        },
        u_wrapperRatio: {
          value: wrapperSize.width / wrapperSize.height,
        },
        u_rgbVelocity: {
          value: new THREE.Vector2(0, 0),
        },
      },
    });

    // Load pattern texture and create mesh
    const loader = new THREE.TextureLoader();

    loader.load(
      new URL("../assets/pattern.png", import.meta.url),
      (texture) => {
        console.log(texture);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        this.material.uniforms.u_texture.value = texture;
        this.surface = new THREE.Mesh(this.geometry, this.material);

        this.surface.name = "surface";
        this.calculateAspectRatioFactor(texture);
        this.scene.add(this.surface);

        // event listeners (callback mousemove and viewport resize)
        this.currentTexture = texture;
        window.addEventListener("resize", () =>
          this.calculateAspectRatioFactor(this.currentTexture)
        );
        textureLoadedCallback();
      }
    );
  }

  updateSize = (newWrapperSize, newTarget) => {
    this.wrapperSize = newWrapperSize;

    if (this.surface) {
      this.surface.material.uniforms.u_resolution.value = new THREE.Vector2(
        this.wrapperSize.width,
        this.wrapperSize.height
      );
    }

    // If viewport target switches, load new texture
    if (this.target !== newTarget) {
      this.target = newTarget;
      this.currentTexture = this.textures.find(
        (item) => item.target === this.target
      ).texture;
      if (this.currentTexture) {
        this.surface.material.uniforms.u_texture.value = this.currentTexture;
      }
    }

    if (this.surface?.material?.uniforms) {
      this.surface.material.uniforms.u_wrapperRatio.value =
        this.wrapperSize.width / this.wrapperSize.height;
      this.calculateAspectRatioFactor(this.currentTexture);
    }
  };

  getViewSize = () => {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const viewSize = Math.abs(
      this.camera.position.z * Math.tan(fovInRadians / 2) * 2
    );

    return viewSize;
  };

  getPlaneSize = () => {
    const viewSize = this.getViewSize();

    return {
      width: viewSize * (this.wrapperSize.width / this.wrapperSize.height),
      height: viewSize,
    };
  };

  calculateAspectRatioFactor = (texture) => {
    const plane = this.getPlaneSize();
    const rectRatio = plane.width / plane.height;
    const imageRatio = texture.image.width / texture.image.height;

    let factorX = 1;
    let factorY = 1;
    if (rectRatio > imageRatio) {
      factorX = 1;
      factorY = (1 / rectRatio) * imageRatio;
    } else {
      factorX = (1 * rectRatio) / imageRatio;
      factorY = 1;
    }

    this.factor = new THREE.Vector2(factorX, factorY);
    this.surface.material.uniforms.u_textureFactor.value = this.factor;
    this.surface.material.uniforms.u_textureFactor.needsUpdate = true;
  };

  updateRgbEffect = ({ position, velocity }) => {
    this.surface.material.uniforms.u_rgbPosition.value = new THREE.Vector2(
      position.x,
      position.y
    );
    this.surface.material.uniforms.u_rgbVelocity.value = new THREE.Vector2(
      velocity.x,
      velocity.y
    );
  };
}
