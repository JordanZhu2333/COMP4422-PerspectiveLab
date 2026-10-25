// @ts-check

/** Generate an indexed unit box (side length 1) with per-face UVs and normals. */
export function createBoxGeometry() {
    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    // Six faces: an outward normal plus four corners in counter-clockwise order
    // when viewed from outside. Every face maps onto the full [0, 1] UV square.
    const faces = [
        // +z (front)
        { normal: [0, 0, 1], corners: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
        // -z (back)
        { normal: [0, 0, -1], corners: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
        // +x (right)
        { normal: [1, 0, 0], corners: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
        // -x (left)
        { normal: [-1, 0, 0], corners: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
        // +y (top)
        { normal: [0, 1, 0], corners: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
        // -y (bottom)
        { normal: [0, -1, 0], corners: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
    ];

    // Corner UVs, indexed in the same counter-clockwise order.
    const faceUVs = [[0, 0], [1, 0], [1, 1], [0, 1]];

    for (const face of faces) {
        const base = positions.length / 3;
        for (let corner = 0; corner < 4; corner++) {
            positions.push(...face.corners[corner]);
            normals.push(...face.normal);
            uvs.push(...faceUVs[corner]);
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
