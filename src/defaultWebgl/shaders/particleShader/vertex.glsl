// No Need of declaring the color
// its already appended due to vertexColors: true in the ShaderMaterial
// attribute vec3 color;
// * Attributes
attribute float aScale;

// * custom uniforms
// uniform float uTime;
// uniform vec2 uMouse;
uniform float uSize;


// * Varyings
varying vec3 vColor;

void main()
{
  

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  
  /**
  * Size
  */
//   gl_PointSize = uSize * aScale;
  gl_PointSize = uSize * aScale;

  // * Size attenuation
  // using the size attenuation formula from the points.glsl.js vertex shader
  // from the THREE > src > renderer > shaders > ShaderLib > points.glsl.js
  // using the scale as 1.0 as we don't need "vertical scaling"
  gl_PointSize *= ( 1.0 / - viewPosition.z );

}