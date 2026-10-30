// @ts-check
import { Vec3 } from "../math/Vec3.js";

/** @typedef {import("../types.js").Animation} Animation */

/**
 * Apply an animation to a base transform and return the effective transform.
 * Pure: reads base* and time, never mutates them. "spin" rotates around the
 * local Y axis; "bob" moves vertically; "float" combines a gentle bob with a
 * slow spin; "pulse" breathes the scale.
 * @param {Animation} animation
 * @param {Vec3} basePosition
 * @param {number} baseYaw
 * @param {Vec3} baseScale
 * @param {number} timeSeconds
 * @returns {{ position: Vec3, yaw: number, scale: Vec3 }}
 */
export function applyAnimation(animation, basePosition, baseYaw, baseScale, timeSeconds) {
    let position = basePosition;
    let yaw = baseYaw;
    let scale = baseScale;
    if (animation.type === "spin") {
        yaw += timeSeconds * animation.speed;
    } else if (animation.type === "bob") {
        position = new Vec3(
            basePosition.x,
            basePosition.y + Math.sin(timeSeconds * animation.speed) * (animation.amplitude ?? 0),
            basePosition.z,
        );
    } else if (animation.type === "float") {
        position = new Vec3(
            basePosition.x,
            basePosition.y + Math.sin(timeSeconds * animation.speed) * (animation.amplitude ?? 0),
            basePosition.z,
        );
        yaw += timeSeconds * animation.speed * 0.3;
    } else if (animation.type === "pulse") {
        const factor = 1 + Math.sin(timeSeconds * animation.speed) * (animation.amount ?? 0);
        scale = new Vec3(baseScale.x * factor, baseScale.y * factor, baseScale.z * factor);
    }
    return { position, yaw, scale };
}
