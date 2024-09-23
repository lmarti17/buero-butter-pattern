precision mediump float;

// * Uniforms
// uniform float uTime;
// uniform vec2 vMouse;

// * Varyings
varying vec2 vUv;

void main()
{

    vec3 color = vec3(vUv, (vUv.x + vUv.y));

    gl_FragColor = vec4(color, 1.0);
}