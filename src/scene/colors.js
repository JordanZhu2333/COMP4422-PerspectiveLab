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

/** The room's color palette; hex strings are the source of truth for each color. */
export const roomPalette = {
    background: hexToRgb("#131C26"),
    ground: hexToRgb("#ba8e9f"),
    ceiling: hexToRgb("#a0aeb9"),
    wall: hexToRgb("#e7bdc1"),
    trim: hexToRgb("#efaaa5"),
    pawn: hexToRgb("#dfdaa3"),
};
