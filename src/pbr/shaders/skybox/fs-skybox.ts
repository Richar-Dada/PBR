export const fsSkybox = `#version 300 es
precision mediump float;
            
in highp vec3 texCoord;
uniform samplerCube uCubemap;
            
out vec4 finalColor;
void main(void){
     finalColor = texture(uCubemap, texCoord);
}`;
