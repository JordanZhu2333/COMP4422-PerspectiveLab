// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";

/** @typedef {import("../math/Vec3.js").XYZ} XYZ */
/**
 * @typedef {Object} CameraOptions
 * @property {XYZ} [position] Camera position in world space.
 * @property {XYZ} [target] World-space target of the camera.
 * @property {XYZ} [up] Reference up direction, defaulting to world +Y.
 * @property {number} [fovY] Vertical field of view in radians.
 * @property {number} [aspect] Canvas drawing buffer width/height.
 * @property {number} [near] Near clipping distance.
 * @property {number} [far] Far clipping distance.
 */

/**
 * Stores perspective camera parameters and builds view and projection matrices.
 * Each matrix getter uses the current parameters.
 * Vec3 and Mat4 validate their inputs.
 */
export class PerspectiveCamera {
    /** @param {CameraOptions} [options] */
    constructor({
        position = new Vec3(0, 0, 3),
        target = new Vec3(),
        up = new Vec3(0, 1, 0),
        fovY = Math.PI / 3,
        aspect = 1,
        near = 0.1,
        far = 100,
    } = {}) {
        // Copy the inputs to avoid sharing mutable vectors with the caller.
        this.position = Vec3.from(position);
        this.target = Vec3.from(target);
        this.up = Vec3.from(up);
        this.fovY = fovY;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    /** @returns {Mat4} View matrix: world space to view space. */
    getViewMatrix() {
        return Mat4.lookAt(this.position, this.target, this.up);
    }

    /** @returns {Mat4} Projection matrix: view space to clip space. */
    getProjectionMatrix() {
        return Mat4.perspective(this.fovY, this.aspect, this.near, this.far);
    }
}
