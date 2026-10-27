// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */

/**
 * Recompute each object's local matrix from its base transform and animation,
 * walking the scene graph. "spin" rotates around the local Y axis; "bob" moves
 * vertically. World matrices are derived separately by SceneGraph.updateWorld.
 * @param {SceneObject} node
 * @param {number} elapsedSeconds Seconds since the animation started.
 */
export function updateAnimation(node, elapsedSeconds) {
    const animation = node.animation;
    let position = node.basePosition;
    let yaw = node.baseYaw;
    if (animation?.type === "spin") {
        yaw += elapsedSeconds * animation.speed;
    } else if (animation?.type === "bob") {
        position = new Vec3(
            node.basePosition.x,
            node.basePosition.y + Math.sin(elapsedSeconds * animation.speed) * (animation.amplitude ?? 0),
            node.basePosition.z,
        );
    }
    node.local = Mat4.trs(position, new Vec3(0, yaw, 0), node.baseScale);
    for (const child of node.children) {
        updateAnimation(child, elapsedSeconds);
    }
}
