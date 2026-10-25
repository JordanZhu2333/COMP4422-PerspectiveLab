// @ts-check

/** Generate an indexed unit sphere from latitude rings and longitude segments. */
export function createSphereGeometry() {
    const segments = 16;
    const latitudeSteps = 8;
    const positions = [0, 1, 0]; // One vertex at the north pole.
    const indices = [];

    // Build latitude rings without duplicating seam vertices.
    for (let latitude = 1; latitude < latitudeSteps; latitude++) {
        const phi = Math.PI * latitude / latitudeSteps;
        for (let longitude = 0; longitude < segments; longitude++) {
            const theta = 2 * Math.PI * longitude / segments;
            positions.push(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
        }
    }
    const southPole = positions.length / 3;
    positions.push(0, -1, 0);

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
    };
}
