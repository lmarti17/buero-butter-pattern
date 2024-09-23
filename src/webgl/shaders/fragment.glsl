uniform vec2 u_resolution;
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
}