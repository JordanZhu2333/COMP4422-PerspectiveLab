// @ts-check
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createSphereGeometry } from "../geometry/sphere.js";
import { createSceneObject, addObject } from "../scenegraph/SceneGraph.js";
import { hexToRgb } from "../util/color.js";

/** @typedef {import("../types.js").Geometry} Geometry */
/** @typedef {import("../types.js").Animation} Animation */
/** @typedef {import("../types.js").SceneObject} SceneObject */

/** Load OBJ assets; rendering and collision share geometry and world matrices. */
export async function loadCollisionScene() {
    const [box, pyramid] = await Promise.all([
        loadOBJ(new URL("../../assets/models/box.obj", import.meta.url)),
        loadOBJ(new URL("../../assets/models/pyramid.obj", import.meta.url)),
    ]);
    return createCollisionScene(box, pyramid);
}

/** Build the scene graph and the initial camera pose.
 * @param {Geometry} box @param {Geometry} pyramid
 */
export function createCollisionScene(box, pyramid) {
    const root = createSceneObject("root", null, [0, 0, 0], [1, 1, 1]);
    /** @param {string} name @param {Geometry} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {Animation | null} [animation]
     * @param {string | null} [material] @param {[number, number, number] | null} [color]
     * @param {SceneObject} [parent]
     */
    function add(name, geometry, position, scale, yaw = 0, animation = null, material = null, color = null, parent = root) {
        return addObject(parent, name, geometry, position, scale, yaw, animation, material, color);
    }
    add("Sphere", createSphereGeometry(), [-3.2, 1, 0], [1, 1, 1], 0, { type: "spin", speed: 0.8 });
    add("Pyramid", pyramid, [0, 1, 0], [2, 2, 2], Math.PI / 6, { type: "spin", speed: -0.6 });
    add("Cube", box, [3.2, 1, 0], [2, 2, 2], Math.PI / 6, { type: "bob", speed: 2, amplitude: 0.5 });
    return {
        root,
        spawn: new Vec3(0, 3, 8),
        target: new Vec3(0, 1, 0),
        background: hexToRgb("#131c26"),
        lights: [], // M1 collision scene has no lighting.
    };
}
