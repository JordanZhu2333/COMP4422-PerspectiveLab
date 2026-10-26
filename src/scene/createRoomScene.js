// @ts-check
import { Mat4 } from "../math/Mat4.js";
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createBoxGeometry } from "../geometry/box.js";
import { createSphereGeometry } from "../geometry/sphere.js";

/** @typedef {import("./createCollisionScene.js").SceneObject} SceneObject */
/** @typedef {import("../loaders/OBJLoader.js").Geometry} Geometry */

/** Load the chess pawn OBJ and build the superliminal room. */
export async function loadRoomScene() {
    const pawn = await loadOBJ(new URL("../../assets/models/chess_pawn.obj", import.meta.url));
    return createRoomScene(pawn);
}

/** Build a closed room for the superliminal perspective effect and its initial camera pose.
 * @param {Geometry} pawn Loaded chess pawn geometry.
 */
export function createRoomScene(pawn) {
    /** @type {SceneObject[]} */
    const objects = [];
    /** @param {string} name @param {Geometry} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {string} [material]
     * @param {[number, number, number]} [color]
     */
    function add(name, geometry, position, scale, yaw = 0, material = null, color = null) {
        const basePosition = new Vec3(position[0], position[1], position[2]);
        const baseScale = new Vec3(scale[0], scale[1], scale[2]);
        objects.push({ name, geometry,
            basePosition, baseYaw: yaw, baseScale, animation: null, material, color,
            model: Mat4.trs(basePosition, new Vec3(0, yaw, 0), baseScale),
        });
    }
    // Room shell: floor, ceiling, and four walls.
    add("Ground", createBoxGeometry(), [0, -0.5, 0], [16, 1, 16], 0, null, [0.50, 0.64, 0.53]);
    add("Ceiling", createBoxGeometry(), [0, 8.5, 0], [16, 1, 16], 0, null, [0.827, 0.827, 0.827]);
    add("BackWall", createBoxGeometry(), [0, 4, -8], [16, 8, 0.5], 0, null, [0.961, 0.902, 0.784]);
    add("FrontWall", createBoxGeometry(), [0, 4, 8], [16, 8, 0.5], 0, null, [0.961, 0.902, 0.784]);
    add("LeftWall", createBoxGeometry(), [-8, 4, 0], [0.5, 8, 16], 0, null, [0.961, 0.902, 0.784]);
    add("RightWall", createBoxGeometry(), [8, 4, 0], [0.5, 8, 16], 0, null, [0.961, 0.902, 0.784]);
    // Room edges: silver trim lines separating the six faces.
    add("CornerBL", createBoxGeometry(), [-7.75, 4, -7.75], [0.12, 8, 0.12], 0, null, [0.75, 0.75, 0.78]);
    add("CornerBR", createBoxGeometry(), [7.75, 4, -7.75], [0.12, 8, 0.12], 0, null, [0.75, 0.75, 0.78]);
    add("CornerFL", createBoxGeometry(), [-7.75, 4, 7.75], [0.12, 8, 0.12], 0, null, [0.75, 0.75, 0.78]);
    add("CornerFR", createBoxGeometry(), [7.75, 4, 7.75], [0.12, 8, 0.12], 0, null, [0.75, 0.75, 0.78]);
    add("TopBack", createBoxGeometry(), [0, 7.92, -7.75], [16, 0.15, 0.08], 0, null, [0.75, 0.75, 0.78]);
    add("TopFront", createBoxGeometry(), [0, 7.92, 7.75], [16, 0.15, 0.08], 0, null, [0.75, 0.75, 0.78]);
    add("TopLeft", createBoxGeometry(), [-7.75, 7.92, 0], [0.08, 0.15, 16], 0, null, [0.75, 0.75, 0.78]);
    add("TopRight", createBoxGeometry(), [7.75, 7.92, 0], [0.08, 0.15, 16], 0, null, [0.75, 0.75, 0.78]);
    add("SkirtBack", createBoxGeometry(), [0, 0.075, -7.75], [16, 0.15, 0.05], 0, null, [0.75, 0.75, 0.78]);
    add("SkirtFront", createBoxGeometry(), [0, 0.075, 7.75], [16, 0.15, 0.05], 0, null, [0.75, 0.75, 0.78]);
    add("SkirtLeft", createBoxGeometry(), [-7.75, 0.075, 0], [0.05, 0.15, 16], 0, null, [0.75, 0.75, 0.78]);
    add("SkirtRight", createBoxGeometry(), [7.75, 0.075, 0], [0.05, 0.15, 16], 0, null, [0.75, 0.75, 0.78]);
    // Chess table: base, pillar, tabletop, board, and a pawn.
    add("Base", createBoxGeometry(), [0, 0.15, -3], [3, 0.3, 3], 0, "brick");
    add("Pillar", createBoxGeometry(), [0, 1.05, -3], [0.5, 1.5, 0.5], 0, "brick");
    add("Tabletop", createBoxGeometry(), [0, 1.9, -3], [3.5, 0.2, 3.5], 0, "brick");
    add("Board", createBoxGeometry(), [0, 2.025, -3], [3.2, 0.05, 3.2], 0, "checker");
    add("Pawn", pawn, [0, 2.05, -3], [1.5, 1.5, 1.5], 0, null, [1, 0.7, 0.75]);
    // Pickable props for the perspective illusion.
    add("Crate1", createBoxGeometry(), [-3, 0.5, -2], [2, 1, 2], 0, "fabric");
    add("Crate2", createBoxGeometry(), [2, 0.5, 1], [1, 1, 1], 0, "stripes");
    add("Ball", createSphereGeometry(), [0, 0.5, 3], [1, 1, 1], 0, "checker");
    return {
        objects,
        spawn: new Vec3(0, 2, 5),
        target: new Vec3(0, 1.5, -3),
    };
}
