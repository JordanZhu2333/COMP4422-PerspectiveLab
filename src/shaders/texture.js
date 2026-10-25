// @ts-check

export const vertexSource = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;

uniform mat4 uMVP;

// Pass texture coordinates to the fragment shader for sampling.
out vec2 vTexCoord;

void main() {
    gl_Position = uMVP * vec4(aPosition, 1.0);
    vTexCoord = aTexCoord;
}
`;

export const fragmentSource = `#version 300 es
precision highp float;

// Interpolated texture coordinates across the triangle.
in vec2 vTexCoord;

uniform sampler2D uTexture;

out vec4 outColor;

void main() {
    // Sample the texture at the interpolated UV coordinate.
    outColor = texture(uTexture, vTexCoord);
}
`;
