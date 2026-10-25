// @ts-check

export const vertexSource = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;

uniform mat4 uMVP;

// Pass model-space positions to the fragment shader to derive face normals.
out vec3 vModelPosition;

void main() {
    gl_Position = uMVP * vec4(aPosition, 1.0);
    vModelPosition = aPosition;
}
`;

export const fragmentSource = `#version 300 es
precision highp float;

// Interpolated model-space position.
in vec3 vModelPosition;

out vec4 outColor;

void main() {
    // Position derivatives along the screen axes.
    vec3 dx = dFdx(vModelPosition);
    vec3 dy = dFdy(vModelPosition);

    // The cross product of the surface tangents gives a face normal.
    vec3 normal = normalize(cross(dx, dy));

    // Use the mesh winding to orient the normal consistently.
    if (!gl_FrontFacing) {
        normal = -normal;
    }

    // Map normal components from [-1, 1] to [0, 1] for RGB.
    vec3 color = normal * 0.5 + vec3(0.5);

    outColor = vec4(color, 1.0);
}
`;
