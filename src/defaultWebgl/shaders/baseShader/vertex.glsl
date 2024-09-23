// Using ShaderMaterial -> no need to redefine position, projectionMatrix, etc...
// * Attributes
// attribute vec3 position;

// * uniforms
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// * custom uniforms
// uniform float uTime;
// uniform vec2 uMouse;


// * Varyings
varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // * Sending varyings to fragment shader
    // * uv being already declared as we use ShaderMaterial
    vUv = uv;

}