// @ts-check

/** @typedef {import("../math/Vec3.js").XYZ} XYZ */
/** @typedef {{x:number, z:number}} Point2 */

/**
 * Intersect an upright cylinder with a triangle; center is the midpoint and halfHeight is half the height.
 * Clip the triangle between the caps, then check its XZ projection against the disk.
 * Algorithm reference: https://www.geometrictools.com/Documentation/IntersectionTriangleCylinder.pdf
 * @param {XYZ} center
 * @param {number} radius
 * @param {number} halfHeight
 * @param {XYZ} a
 * @param {XYZ} b
 * @param {XYZ} c
 * @returns {boolean}
 */
export function intersectsCylinderTriangle(center, radius, halfHeight, a, b, c) {
    return intersectsAxisSweep(center, { x: 0, y: 0, z: 0 }, radius, halfHeight, a, b, c);
}

/**
 * Check the full cylinder sweep along one axis, including intermediate positions.
 * A vertical sweep forms a taller cylinder.
 * For a horizontal sweep, compare the clipped XZ polygon with a swept disk.
 * CollisionWorld moves one axis at a time. All inputs are in world space.
 * @param {XYZ} center
 * @param {XYZ} delta
 * @param {number} radius
 * @param {number} halfHeight
 * @param {XYZ} a
 * @param {XYZ} b
 * @param {XYZ} c
 * @returns {boolean}
 */
export function intersectsAxisSweep(center, delta, radius, halfHeight, a, b, c) {
    if (delta.y !== 0 && (delta.x !== 0 || delta.z !== 0)) {
        throw new RangeError("Horizontal and vertical sweeps must be handled separately.");
    }
    const bottom = Math.min(center.y, center.y + delta.y) - halfHeight;
    const top = Math.max(center.y, center.y + delta.y) + halfHeight;
    let polygon = clipHeight([a, b, c], bottom, true);
    polygon = clipHeight(polygon, top, false);
    if (polygon.length === 0) return false;

    const end = { x: center.x + delta.x, z: center.z + delta.z };
    if (insidePolygon(center, polygon) || insidePolygon(end, polygon)) return true;
    const radiusSquared = radius * radius;
    for (let i = 0; i < polygon.length; i++) {
        const p = polygon[i];
        const q = polygon[(i + 1) % polygon.length];
        if (segmentDistanceSquared(center, end, p, q) <= radiusSquared) return true;
    }
    return false;
}

/** Sutherland-Hodgman clipping against a horizontal plane.
 * @param {XYZ[]} polygon
 * @param {number} height
 * @param {boolean} keepAbove
 * @returns {XYZ[]}
 */
function clipHeight(polygon, height, keepAbove) {
    /** @type {XYZ[]} */
    const result = [];
    if (polygon.length === 0) return result;
    let previous = polygon[polygon.length - 1];
    let previousInside = keepAbove ? previous.y >= height : previous.y <= height;
    for (const current of polygon) {
        const currentInside = keepAbove ? current.y >= height : current.y <= height;
        if (previousInside !== currentInside) {
            const t = (height - previous.y) / (current.y - previous.y);
            result.push({
                x: previous.x + (current.x - previous.x) * t,
                y: height,
                z: previous.z + (current.z - previous.z) * t,
            });
        }
        if (currentInside) result.push(current);
        previous = current;
        previousInside = currentInside;
    }
    return result;
}

/** Use crossing parity for point containment; edge distances handle degenerate polygons.
 * @param {Point2} point
 * @param {XYZ[]} polygon
 */
function insidePolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i];
        const b = polygon[j];
        if ((a.z > point.z) !== (b.z > point.z)
            && point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z) + a.x) {
            inside = !inside;
        }
    }
    return inside;
}

/** @param {Point2} p @param {Point2} a @param {Point2} b */
function pointSegmentDistanceSquared(p, a, b) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const lengthSquared = dx * dx + dz * dz;
    const t = lengthSquared === 0 ? 0
        : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / lengthSquared));
    const x = p.x - a.x - t * dx;
    const z = p.z - a.z - t * dz;
    return x * x + z * z;
}

/** @param {Point2} a @param {Point2} b @param {Point2} c */
function orientation(a, b, c) {
    return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}

/** Squared distance between XZ segments, including crossing, collinear, and zero-length cases.
 * @param {Point2} a @param {Point2} b @param {Point2} c @param {Point2} d
 */
function segmentDistanceSquared(a, b, c, d) {
    const abC = orientation(a, b, c);
    const abD = orientation(a, b, d);
    const cdA = orientation(c, d, a);
    const cdB = orientation(c, d, b);
    const straddles = abC * abD <= 0 && cdA * cdB <= 0;
    const intervalsOverlap = Math.max(Math.min(a.x, b.x), Math.min(c.x, d.x))
            <= Math.min(Math.max(a.x, b.x), Math.max(c.x, d.x))
        && Math.max(Math.min(a.z, b.z), Math.min(c.z, d.z))
            <= Math.min(Math.max(a.z, b.z), Math.max(c.z, d.z));
    if (straddles && intervalsOverlap) return 0;
    return Math.min(
        pointSegmentDistanceSquared(a, c, d), pointSegmentDistanceSquared(b, c, d),
        pointSegmentDistanceSquared(c, a, b), pointSegmentDistanceSquared(d, a, b)
    );
}
