export const vsCube = `#version 300 es
precision highp float;
precision highp int;

uniform mat4 u_MVP;

in vec3 position;
in vec3 color;

out vec3 a_Color;

void main()
{
    vec4 pos = u_MVP * vec4(position, 1.0);
    gl_Position = pos;
    a_Color = color;
}`;
