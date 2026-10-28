// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */

/**
 * Recompute each object's local matrix from its base transform and animation,
 * walking the scene graph. "spin" rotates around the local Y axis; "bob" moves
 * vertically; "float" combines a gentle bob with a slow spin; "pulse" breathes
 * the scale. World matrices are derived separately by SceneGraph.updateWorld.
 * @param {SceneObject} node
 * @param {number} elapsedSeconds Seconds since the animation started.
 */
export function updateAnimation(node, elapsedSeconds) {
    const animation = node.animation;
    let position = node.basePosition;
    let yaw = node.baseYaw;
    let scale = node.baseScale;
    if (animation?.type === "spin") {
        yaw += elapsedSeconds * animation.speed;
    } else if (animation?.type === "bob") {
        position = new Vec3(
            node.basePosition.x,
            node.basePosition.y + Math.sin(elapsedSeconds * animation.speed) * (animation.amplitude ?? 0),
            node.basePosition.z,
        );
    } else if (animation?.type === "float") {
        position = new Vec3(
            node.basePosition.x,
            node.basePosition.y + Math.sin(elapsedSeconds * animation.speed) * (animation.amplitude ?? 0),
            node.basePosition.z,
        );
        yaw += elapsedSeconds * animation.speed * 0.3;
    } else if (animation?.type === "pulse") {
        const factor = 1 + Math.sin(elapsedSeconds * animation.speed) * (animation.amount ?? 0);
        scale = new Vec3(node.baseScale.x * factor, node.baseScale.y * factor, node.baseScale.z * factor);
    }
    node.local = Mat4.trs(position, new Vec3(0, yaw, 0), scale);
    for (const child of node.children) {
        updateAnimation(child, elapsedSeconds);
    }
}
