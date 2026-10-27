// @ts-check
import { Vec3 } from "../math/Vec3.js";
import { Vec4 } from "../math/Vec4.js";
import { intersectsAxisSweep } from "./cylinderTriangle.js";
import { collectRenderables } from "../scene/SceneGraph.js";

/** @typedef {import("../math/Vec3.js").XYZ} XYZ */
/** @typedef {import("../types.js").Renderable} Renderable */
/** @typedef {{name:string, a:Vec3, b:Vec3, c:Vec3}} WorldTriangle */

/** Check all triangles directly, without bounding volumes or an external physics library. */
export class CollisionWorld {
    /** @param {import("../types.js").SceneObject} root Scene graph root. */
    constructor(root) {
        /** @type {Renderable[]} */
        this.colliders = collectRenderables(root);
        /** @type {WorldTriangle[]} */
        this.triangles = [];
        this.triangleTests = 0;
        this.skin = 0.002;
        this.rebuild();
    }

    /** Cache world-space triangles; call again after changing a world matrix or geometry. */
    rebuild() {
        this.triangles = [];
        for (const { name, geometry, world } of this.colliders) {
            const m = world.data;
            if (m[3] !== 0 || m[7] !== 0 || m[11] !== 0 || m[15] !== 1) {
                throw new RangeError("Collision requires an affine world matrix M.");
            }
            const { positions, indices } = geometry;
            const vertices = [];
            for (let i = 0; i < positions.length; i += 3) {
                const p = world.transform(new Vec4(positions[i], positions[i + 1], positions[i + 2], 1));
                vertices.push(new Vec3(p.x, p.y, p.z));
            }
            for (let i = 0; i < indices.length; i += 3) {
                this.triangles.push({ name,
                    a: vertices[indices[i]], b: vertices[indices[i + 1]], c: vertices[indices[i + 2]],
                });
            }
        }
    }

    /** @param {XYZ} center @param {XYZ} delta @param {number} radius @param {number} halfHeight */
    firstSweepHit(center, delta, radius, halfHeight) {
        for (const triangle of this.triangles) {
            this.triangleTests++;
            if (intersectsAxisSweep(center, delta, radius, halfHeight,
                triangle.a, triangle.b, triangle.c)) return triangle.name;
        }
        return null;
    }

    /**
     * Move an upright cylinder from a valid position without surface overlap.
     * Check the full sweep on each axis and bisect a blocked move to find a safe position.
     * Process short X/Z/Y steps for basic sliding, without automatic climbing or gravity.
     * @param {XYZ} start Cylinder center, also the camera position in this demo.
     * @param {XYZ} displacement Desired world-space displacement for this frame.
     * @param {number} radius
     * @param {number} halfHeight
     */
    moveCylinder(start, displacement, radius, halfHeight) {
        if (!Number.isFinite(radius) || !Number.isFinite(halfHeight)
            || radius <= 0 || halfHeight <= 0) throw new RangeError("Cylinder dimensions must be finite positive numbers.");
        let position = Vec3.from(start);
        const delta = Vec3.from(displacement);
        this.triangleTests = 0;
        /** @type {Set<string>} */
        const blockedBy = new Set();
        const steps = Math.max(1, Math.ceil(delta.length() / 0.15));
        const step = delta.scale(1 / steps);
        const r = radius + this.skin;
        const h = halfHeight + this.skin;

        for (let i = 0; i < steps; i++) {
            for (const axis of /** @type {const} */ (["x", "z", "y"])) {
                if (step[axis] === 0) continue;
                const axisMove = new Vec3();
                axisMove[axis] = step[axis];
                let hit = this.firstSweepHit(position, axisMove, r, h);
                if (hit === null) {
                    position = position.add(axisMove);
                    continue;
                }
                let safe = 0;
                let blocked = 1;
                for (let iteration = 0; iteration < 12; iteration++) {
                    const middle = (safe + blocked) / 2;
                    const middleHit = this.firstSweepHit(position, axisMove.scale(middle), r, h);
                    if (middleHit === null) safe = middle;
                    else { blocked = middle; hit = middleHit; }
                }
                position = position.add(axisMove.scale(safe));
                blockedBy.add(hit);
            }
        }
        return { position, blockedBy: [...blockedBy], triangleTests: this.triangleTests };
    }
}
