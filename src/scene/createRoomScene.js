// @ts-check
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createBoxGeometry } from "../geometry/box.js";
import { createSphereGeometry } from "../geometry/sphere.js";
import { createSceneObject, addObject } from "./SceneGraph.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */
/** @typedef {import("../types.js").Geometry} Geometry */

/** Load the chess pawn OBJ and build the superliminal room. */
export async function loadRoomScene() {
    const pawn = await loadOBJ(new URL("../../assets/models/chess_pawn.obj", import.meta.url));
    return createRoomScene(pawn);
}

/** Build a closed room for the superliminal perspective effect and its initial camera pose.
 * @param {Geometry} pawn Loaded chess pawn geometry.
 */
export function createRoomScene(pawn) {
    // The root holds the whole scene. The room shell hangs directly off it; the
    // chess table forms a small subtree so its pieces inherit the table's transform.
    const root = createSceneObject("root", null, [0, 0, 0], [1, 1, 1]);
    /** @param {string} name @param {Geometry | null} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {string | null} [material]
     * @param {[number, number, number] | null} [color] @param {SceneObject} [parent]
     */
    function add(name, geometry, position, scale, yaw = 0, material = null, color = null, parent = root) {
        return addObject(parent, name, geometry, position, scale, yaw, null, material, color);
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
    // Chess table: one group node holds its five pieces as children. The pieces
    // stay siblings (not nested under one another) because the tabletop and board
    // carry non-uniform scales that would distort a child's position.
    const table = add("Table", null, [0, 0, -3], [1, 1, 1]);
    add("Base", createBoxGeometry(), [0, 0.15, 0], [3, 0.3, 3], 0, "brick", null, table);
    add("Pillar", createBoxGeometry(), [0, 1.05, 0], [0.5, 1.5, 0.5], 0, "brick", null, table);
    add("Tabletop", createBoxGeometry(), [0, 1.9, 0], [3.5, 0.2, 3.5], 0, "brick", null, table);
    add("Board", createBoxGeometry(), [0, 2.025, 0], [3.2, 0.05, 3.2], 0, "checker", null, table);
    add("Pawn", pawn, [0, 2.05, 0], [1.5, 1.5, 1.5], 0, null, [1, 0.7, 0.75], table);
    // Pickable props for the perspective illusion.
    add("Crate1", createBoxGeometry(), [-3, 0.5, -2], [2, 1, 2], 0, "fabric");
    add("Crate2", createBoxGeometry(), [2, 0.5, 1], [1, 1, 1], 0, "stripes");
    add("Ball", createSphereGeometry(), [0, 0.5, 3], [1, 1, 1], 0, "checker");
    return {
        root,
        spawn: new Vec3(0, 2, 5),
        target: new Vec3(0, 1.5, -3),
    };
}
