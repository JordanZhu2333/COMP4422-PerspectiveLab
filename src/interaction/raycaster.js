// @ts-check

// M3 (interaction): screen-to-world ray casting and picking.
// Fill in the TODO(M3) bodies below. See M3_HANDOFF.md for the full plan.

/** @typedef {import("../camera/PerspectiveCamera.js").PerspectiveCamera} PerspectiveCamera */
/** @typedef {import("../math/Vec3.js").Vec3} Vec3 */

/**
 * Build a world-space ray through a screen-space pixel.
 * @param {PerspectiveCamera} camera
 * @param {number} screenX CSS pixel X (0 at left).
 * @param {number} screenY CSS pixel Y (0 at top).
 * @param {number} width Canvas drawing buffer width.
 * @param {number} height Canvas drawing buffer height.
 * @returns {{ origin: Vec3, direction: Vec3 }}
 */
export function screenToRay(camera, screenX, screenY, width, height) {
    // TODO(M3): unproject the pixel using the inverse view-projection (from
    // camera.getViewMatrix() and getProjectionMatrix()), then return the
    // camera position as origin and a normalized direction.
    throw new Error("M3: raycaster.screenToRay not implemented.");
}

/**
 * Nearest intersection of a ray with a bounding sphere, or null.
 * @param {Vec3} origin Ray origin in world space.
 * @param {Vec3} direction Normalized ray direction.
 * @param {Vec3} center Sphere center in world space.
 * @param {number} radius Sphere radius.
 * @returns {number | null} Distance along the ray, or null if no hit.
 */
export function intersectSphere(origin, direction, center, radius) {
    // TODO(M3): solve the quadratic |origin + t*direction - center|^2 = radius^2.
    throw new Error("M3: raycaster.intersectSphere not implemented.");
}

/**
 * Cast a ray from the camera through the screen center and return the closest
 * pickable object (interactable === true and bounds sphere hit).
 * @param {PerspectiveCamera} camera
 * @param {number} width Canvas drawing buffer width.
 * @param {number} height Canvas drawing buffer height.
 * @param {import("../types.js").SceneObject} root Scene graph root.
 * @returns {import("../types.js").SceneObject | null}
 */
export function pick(camera, width, height, root) {
    // TODO(M3): use screenToRay at the center pixel, walk the tree (collectRenderables),
    // test each object's bounds sphere with intersectSphere, and return the
    // nearest interactable hit.
    throw new Error("M3: raycaster.pick not implemented.");
}
