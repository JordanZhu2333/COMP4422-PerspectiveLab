// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */
/** @typedef {import("../types.js").Geometry} Geometry */
/** @typedef {import("../types.js").Animation} Animation */
/** @typedef {import("../types.js").Renderable} Renderable */

/**
 * Create a scene object with a local transform derived from its base transform.
 * The object starts detached; link it into a tree with addChild or addObject.
 * @param {string} name
 * @param {Geometry | null} geometry Null for a group node that only organizes children.
 * @param {number[]} position
 * @param {number[]} scale
 * @param {number} [yaw]
 * @param {Animation | null} [animation]
 * @param {string | null} [material]
 * @param {[number, number, number] | null} [color]
 * @returns {SceneObject}
 */
export function createSceneObject(name, geometry, position, scale, yaw = 0, animation = null, material = null, color = null) {
    const basePosition = new Vec3(position[0], position[1], position[2]);
    const baseScale = new Vec3(scale[0], scale[1], scale[2]);
    return {
        name, geometry,
        parent: null,
        children: [],
        basePosition,
        baseYaw: yaw,
        baseScale,
        animation,
        material,
        color,
        local: Mat4.trs(basePosition, new Vec3(0, yaw, 0), baseScale),
        world: new Mat4(),
    };
}

/**
 * Attach a child under a parent, linking both directions.
 * @param {SceneObject} parent
 * @param {SceneObject} child
 * @returns {SceneObject} The child, for chaining.
 */
export function addChild(parent, child) {
    parent.children.push(child);
    child.parent = parent;
    return child;
}

/**
 * Create an object and attach it under a parent in one step.
 * @param {SceneObject} parent
 * @param {string} name
 * @param {Geometry | null} geometry
 * @param {number[]} position
 * @param {number[]} scale
 * @param {number} [yaw]
 * @param {Animation | null} [animation]
 * @param {string | null} [material]
 * @param {[number, number, number] | null} [color]
 * @returns {SceneObject}
 */
export function addObject(parent, name, geometry, position, scale, yaw = 0, animation = null, material = null, color = null) {
    return addChild(parent, createSceneObject(name, geometry, position, scale, yaw, animation, material, color));
}

/**
 * Fill every node's world matrix from the root down: world = parentWorld * local.
 * Call after updating local transforms and before rendering or collision.
 * @param {SceneObject} node
 * @param {Mat4} [parentWorld]
 */
export function updateWorld(node, parentWorld = Mat4.identity()) {
    node.world = parentWorld.multiply(node.local);
    for (const child of node.children) {
        updateWorld(child, node.world);
    }
}

/**
 * Collect nodes that carry geometry into a flat list for rendering and collision.
 * @param {SceneObject} node
 * @param {Renderable[]} [out]
 * @returns {Renderable[]}
 */
export function collectRenderables(node, out = []) {
    if (node.geometry) {
        out.push(/** @type {Renderable} */ (node));
    }
    for (const child of node.children) collectRenderables(child, out);
    return out;
}
