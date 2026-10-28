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
uniform vec4 uTint;
uniform bool uTintEnabled;

out vec4 outColor;

void main() {
    vec4 tex = texture(uTexture, vTexCoord);
    if (uTintEnabled) {
        // Grayscale texture -> tint: remap the texture's brightness onto the
        // tint's dark->bright range so mid-gray stays a saturated tint instead
        // of a half-brightened one (which looked washed out).
        float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
        vec3 dark = uTint.rgb * 0.25;
        vec3 bright = uTint.rgb * 1.0;
        outColor = vec4(mix(dark, bright, gray), 1.0);
    } else {
        outColor = tex * uTint;
    }
}
`;
