// @ts-check

// Shared type contracts for the whole project. No runtime values live here;
// the `export {}` below only marks this file as an ES module so other files can
// reference these typedefs via `import("../types.js").Name`.

/** @typedef {import("./math/Mat4.js").Mat4} Mat4 */
/** @typedef {import("./math/Vec3.js").Vec3} Vec3 */

/** @typedef {{ positions: Float32Array, indices: Uint16Array, uvs?: Float32Array, normals?: Float32Array }} Geometry */

/** @typedef {{ type: "spin" | "bob" | "float" | "pulse", speed: number, amplitude?: number, amount?: number }} Animation */

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
 * @property {[number, number, number] | null} specular Specular highlight color; null lets the renderer use a default.
 * @property {number} shininess Blinn-Phong shininess exponent.
 * @property {boolean} interactable Whether the interaction system can pick this object.
 * @property {number | null} bounds World-space bounding-sphere radius for picking and overlap avoidance.
 */

/** @typedef {SceneObject & { geometry: Geometry }} Renderable */

/** A point light for Blinn-Phong shading: position, color, and intensity.
 * @typedef {Object} Light
 * @property {Vec3} position World-space position of the light.
 * @property {[number, number, number]} color Linear RGB color of the light.
 * @property {number} intensity Scalar brightness multiplier.
 */

/** @typedef {{ root: SceneObject, spawn: Vec3, target: Vec3, lights: Light[], background: [number, number, number] }} Scene */

export {};
