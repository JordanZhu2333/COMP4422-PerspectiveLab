// @ts-check

// Shared type contracts for the whole project. No runtime values live here;
// the `export {}` below only marks this file as an ES module so other files can
// reference these typedefs via `import("../types.js").Name`.

/** @typedef {import("./math/Mat4.js").Mat4} Mat4 */
/** @typedef {import("./math/Vec3.js").Vec3} Vec3 */

/** @typedef {{ positions: Float32Array, indices: Uint16Array, uvs?: Float32Array, normals?: Float32Array }} Geometry */

/** @typedef {{ type: "spin" | "bob", speed: number, amplitude?: number }} Animation */

/**
 * A node in the scene graph. Every object keeps a local transform relative to
 * its parent; the world matrix is derived by walking the tree (SceneGraph.js).
 * Group nodes carry a null geometry and exist only to organize their children.
 * @typedef {Object} SceneObject
 * @property {string} name
 * @property {SceneObject | null} parent
 * @property {SceneObject[]} children
 * @property {Vec3} basePosition
 * @property {number} baseYaw
 * @property {Vec3} baseScale
 * @property {Animation | null} animation
 * @property {Mat4} local
 * @property {Mat4} world
 * @property {Geometry | null} geometry
 * @property {string | null} material
 * @property {[number, number, number] | null} color
 */

/** @typedef {SceneObject & { geometry: Geometry }} Renderable */

/** @typedef {{ root: SceneObject, spawn: Vec3, target: Vec3 }} Scene */

export {};
