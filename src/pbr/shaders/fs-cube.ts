export const fsCube = `#version 300 es
precision highp float;
precision highp int;

in vec3 a_Color;

out vec4 color;

void main()
{
    color = vec4(a_Color, 1.0);
}`;
