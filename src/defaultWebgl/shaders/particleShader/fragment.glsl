
// * Varying
// varying vec3 vColor;

void main(){
  
  // * Since each vertex is a full plane
  // * we don't have access to a varying UV.
  // * but we use instead the vec2(gl_PointCoord) which is the same

  // Final Color
  vec3 color = vec3(gl_PointCoord.xy, gl_PointCoord.x + gl_PointCoord.y);
  
  gl_FragColor = vec4(color, 1.0);
}