// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createSphereGeometry } from "../geometry/sphere.js";

/** @typedef {import("../loaders/OBJLoader.js").Geometry} Geometry */
/** @typedef {{ type: "spin" | "bob", speed: number, amplitude?: number }} Animation */
/** @typedef {{ name: string, geometry: Geometry, model: Mat4, basePosition: Vec3, baseYaw: number, baseScale: Vec3, animation: Animation | null, material: string | null }} SceneObject */

/** Load OBJ assets; rendering and collision share geometry and model matrices. */
export async function loadCollisionScene() {
    const [box, pyramid] = await Promise.all([
        loadOBJ(new URL("../../assets/models/box.obj", import.meta.url)),
        loadOBJ(new URL("../../assets/models/pyramid.obj", import.meta.url)),
    ]);
    return createCollisionScene(box, pyramid);
}

/** Build the scene objects and the initial camera pose.
 * @param {Geometry} box @param {Geometry} pyramid
 */
export function createCollisionScene(box, pyramid) {
    /** @type {SceneObject[]} */
    const objects = [];
    /** @param {string} name @param {Geometry} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {Animation} [animation]
     * @param {string} [material]
     */
    function add(name, geometry, position, scale, yaw = 0, animation = null, material = null) {
        const basePosition = new Vec3(position[0], position[1], position[2]);
        const baseScale = new Vec3(scale[0], scale[1], scale[2]);
        objects.push({ name, geometry,
            basePosition, baseYaw: yaw, baseScale, animation, material,
            model: Mat4.trs(basePosition, new Vec3(0, yaw, 0), baseScale),
        });
    }
    add("Sphere", createSphereGeometry(), [-3.2, 1, 0], [1, 1, 1], 0, { type: "spin", speed: 0.8 });
    add("Pyramid", pyramid, [0, 1, 0], [2, 2, 2], Math.PI / 6, { type: "spin", speed: -0.6 });
    add("Cube", box, [3.2, 1, 0], [2, 2, 2], Math.PI / 6, { type: "bob", speed: 2, amplitude: 0.5 });
    return {
        objects,
        spawn: new Vec3(0, 3, 8),
        target: new Vec3(0, 1, 0),
    };
}
