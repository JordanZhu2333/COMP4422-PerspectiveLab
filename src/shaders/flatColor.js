// @ts-check

export const vertexSource = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 uMVP;

void main() {
    gl_Position = uMVP * vec4(aPosition, 1.0);
}
`;

export const fragmentSource = `#version 300 es
precision highp float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
    outColor = uColor;
}
`;
