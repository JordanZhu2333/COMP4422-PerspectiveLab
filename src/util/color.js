// @ts-check

/**
 * Convert a "#RRGGBB" or "RRGGBB" hex color to a [r, g, b] 0-1 float array,
 * the format WebGL color uniforms expect.
 * @param {string} hex Hex color string, with or without a leading "#".
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
    const value = hex.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(value)) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    return [
        parseInt(value.slice(0, 2), 16) / 255,
        parseInt(value.slice(2, 4), 16) / 255,
        parseInt(value.slice(4, 6), 16) / 255,
    ];
}
