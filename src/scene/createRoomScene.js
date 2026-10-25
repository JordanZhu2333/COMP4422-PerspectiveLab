// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { createBoxGeometry } from "../geometry/box.js";
import { createSphereGeometry } from "../geometry/sphere.js";

/** @typedef {import("./createCollisionScene.js").SceneObject} SceneObject */
/** @typedef {import("../loaders/OBJLoader.js").Geometry} Geometry */

/** Build a closed room for the superliminal perspective effect and its initial camera pose. */
export function createRoomScene() {
    /** @type {SceneObject[]} */
    const objects = [];
    /** @param {string} name @param {Geometry} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {string} [material]
     */
    function add(name, geometry, position, scale, yaw = 0, material = null) {
        const basePosition = new Vec3(position[0], position[1], position[2]);
        const baseScale = new Vec3(scale[0], scale[1], scale[2]);
        objects.push({ name, geometry,
            basePosition, baseYaw: yaw, baseScale, animation: null, material,
            model: Mat4.trs(basePosition, new Vec3(0, yaw, 0), baseScale),
        });
    }
    // Room shell: floor, ceiling, and four walls.
    add("Ground", createBoxGeometry(), [0, -0.5, 0], [16, 1, 16], 0, "checker");
    add("Ceiling", createBoxGeometry(), [0, 8.5, 0], [16, 1, 16], 0, "brick");
    add("BackWall", createBoxGeometry(), [0, 4, -8], [16, 8, 0.5], 0, "brick");
    add("FrontWall", createBoxGeometry(), [0, 4, 8], [16, 8, 0.5], 0, "brick");
    add("LeftWall", createBoxGeometry(), [-8, 4, 0], [0.5, 8, 16], 0, "brick");
    add("RightWall", createBoxGeometry(), [8, 4, 0], [0.5, 8, 16], 0, "brick");
    // Pickable props for the perspective illusion.
    add("Crate1", createBoxGeometry(), [-3, 0.5, -2], [2, 1, 2], 0, "stripes");
    add("Crate2", createBoxGeometry(), [2, 0.5, 1], [1, 1, 1], 0, "stripes");
    add("Ball", createSphereGeometry(), [0, 0.5, 3], [1, 1, 1], 0, "checker");
    return {
        objects,
        spawn: new Vec3(0, 2, 5),
        target: new Vec3(0, 1.5, -3),
    };
}
