// @ts-check

/**
 * Generate an indexed box of the given size with per-face UVs and normals.
 * Each face maps one texture tile per world unit, so the texture density stays
 * uniform instead of stretching on non-square faces (REPEAT wrapping repeats it).
 * @param {number} width Size along the X axis.
 * @param {number} height Size along the Y axis.
 * @param {number} depth Size along the Z axis.
 */
export function createBoxGeometry(width, height, depth) {
    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;
    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    // Six faces: an outward normal plus four corners in counter-clockwise order
    // when viewed from outside. Each face's UVs span its own width and height.
    const faces = [
        // +z (front): width x height
        { normal: [0, 0, 1], corners: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]], uv: [[0, 0], [width, 0], [width, height], [0, height]] },
        // -z (back): width x height
        { normal: [0, 0, -1], corners: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]], uv: [[0, 0], [width, 0], [width, height], [0, height]] },
        // +x (right): depth x height
        { normal: [1, 0, 0], corners: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]], uv: [[0, 0], [depth, 0], [depth, height], [0, height]] },
        // -x (left): depth x height
        { normal: [-1, 0, 0], corners: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]], uv: [[0, 0], [depth, 0], [depth, height], [0, height]] },
        // +y (top): width x depth
        { normal: [0, 1, 0], corners: [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]], uv: [[0, 0], [width, 0], [width, depth], [0, depth]] },
        // -y (bottom): width x depth
        { normal: [0, -1, 0], corners: [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]], uv: [[0, 0], [width, 0], [width, depth], [0, depth]] },
    ];

    for (const face of faces) {
        const base = positions.length / 3;
        for (let corner = 0; corner < 4; corner++) {
            positions.push(...face.corners[corner]);
            normals.push(...face.normal);
            uvs.push(...face.uv[corner]);
        }
        // Split the face into two triangles while keeping the outward winding.
        indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    return {
        positions: new Float32Array(positions),
        indices: new Uint16Array(indices),
        uvs: new Float32Array(uvs),
        normals: new Float32Array(normals),
    };
}
