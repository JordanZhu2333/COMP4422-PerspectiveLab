// @ts-check

/** Generate an indexed unit sphere from latitude rings and longitude segments. */
export function createSphereGeometry() {
    const segments = 16;
    const latitudeSteps = 8;
    const positions = [0, 1, 0]; // One vertex at the north pole.
    const uvs = [0.5, 0];         // The north pole collapses to a single UV point.
    const normals = [0, 1, 0];    // Unit sphere: the normal equals the position.
    const indices = [];

    // Build latitude rings without duplicating seam vertices.
    for (let latitude = 1; latitude < latitudeSteps; latitude++) {
        const phi = Math.PI * latitude / latitudeSteps;
        const v = phi / Math.PI;
        for (let longitude = 0; longitude < segments; longitude++) {
            const theta = 2 * Math.PI * longitude / segments;
            const u = theta / (2 * Math.PI);
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);
            positions.push(x, y, z);
            uvs.push(u, v);
            normals.push(x, y, z); // Unit sphere: the normal equals the position.
        }
    }
    const southPole = positions.length / 3;
    positions.push(0, -1, 0);
    uvs.push(0.5, 1);
    normals.push(0, -1, 0);

    for (let longitude = 0; longitude < segments; longitude++) {
        const next = (longitude + 1) % segments;
        // Connect the north pole to the first ring with outward winding.
        indices.push(0, 1 + next, 1 + longitude);

        // Split each quad between adjacent rings into two triangles.
        for (let ring = 0; ring < latitudeSteps - 2; ring++) {
            const a = 1 + ring * segments + longitude;
            const b = 1 + ring * segments + next;
            const c = a + segments;
            const d = b + segments;
            indices.push(a, b, c, b, d, c);
        }

        // Connect the last ring to the south pole without degenerate triangles.
        const lastRing = 1 + (latitudeSteps - 2) * segments;
        indices.push(southPole, lastRing + longitude, lastRing + next);
    }
    return {
        positions: new Float32Array(positions),
        indices: new Uint16Array(indices),
        uvs: new Float32Array(uvs),
        normals: new Float32Array(normals),
    };
}
