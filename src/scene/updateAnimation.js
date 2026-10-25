// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";

/**
 * Recompute each object's model matrix from its base transform and animation.
 * "spin" rotates around the world Y axis; "bob" translates vertically.
 * @param {import("./createCollisionScene.js").SceneObject[]} objects
 * @param {number} elapsedSeconds Seconds since the animation started.
 */
export function updateAnimation(objects, elapsedSeconds) {
    for (const object of objects) {
        const animation = object.animation;
        let position = object.basePosition;
        let yaw = object.baseYaw;
        if (animation?.type === "spin") {
            yaw += elapsedSeconds * animation.speed;
        } else if (animation?.type === "bob") {
            position = new Vec3(
                object.basePosition.x,
                object.basePosition.y + Math.sin(elapsedSeconds * animation.speed) * (animation.amplitude ?? 0),
                object.basePosition.z,
            );
        }
        object.model = Mat4.trs(position, new Vec3(0, yaw, 0), object.baseScale);
    }
}
