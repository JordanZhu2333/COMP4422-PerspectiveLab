// @ts-check
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createBoxGeometry } from "../geometry/box.js";
import { createSphereGeometry } from "../geometry/sphere.js";
import { createSceneObject, addObject } from "./SceneGraph.js";
import { roomPalette } from "./colors.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */
/** @typedef {import("../types.js").Geometry} Geometry */
/** @typedef {import("../types.js").Animation} Animation */

/** Load the chess pawn OBJ and build the superliminal room. */
export async function loadRoomScene() {
    const [pawn, fireplace] = await Promise.all([
        loadOBJ(new URL("../../assets/models/chess_pawn.obj", import.meta.url)),
        loadOBJ(new URL("../../assets/models/fireplace.obj", import.meta.url)),
    ]);
    return createRoomScene(pawn, fireplace);
}

/** Build a closed room for the superliminal perspective effect and its initial camera pose.
 * @param {Geometry} pawn Loaded chess pawn geometry.
 * @param {Geometry} fireplace Loaded fireplace geometry.
 */
export function createRoomScene(pawn, fireplace) {
    // The root holds the whole scene. The room shell hangs directly off it; the
    // chess table forms a small subtree so its pieces inherit the table's transform.
    const root = createSceneObject("root", null, [0, 0, 0], [1, 1, 1]);
    /** @param {string} name @param {Geometry | null} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {Animation | null} [animation]
     * @param {string | null} [material] @param {[number, number, number] | null} [color] @param {SceneObject} [parent]
     */
    function add(name, geometry, position, scale, yaw = 0, animation = null, material = null, color = null, parent = root) {
        return addObject(parent, name, geometry, position, scale, yaw, animation, material, color);
    }
    // Room shell: floor and four walls.
    add("Ground", createBoxGeometry(16, 1, 16), [0, -0.5, 0], [1, 1, 1], 0, null, null, roomPalette.ground);
    add("BackWall", createBoxGeometry(16, 8, 0.5), [0, 4, -8], [1, 1, 1], 0, null, null, roomPalette.wall);
    add("FrontWall", createBoxGeometry(16, 8, 0.5), [0, 4, 8], [1, 1, 1], 0, null, null, roomPalette.wall);
    add("LeftWall", createBoxGeometry(0.5, 8, 16), [-8, 4, 0], [1, 1, 1], 0, null, null, roomPalette.wall);
    add("RightWall", createBoxGeometry(0.5, 8, 16), [8, 4, 0], [1, 1, 1], 0, null, null, roomPalette.wall);
    // Room edges: silver trim lines separating the six faces.
    add("CornerBL", createBoxGeometry(0.12, 8, 0.12), [-7.75, 4, -7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("CornerBR", createBoxGeometry(0.12, 8, 0.12), [7.75, 4, -7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("CornerFL", createBoxGeometry(0.12, 8, 0.12), [-7.75, 4, 7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("CornerFR", createBoxGeometry(0.12, 8, 0.12), [7.75, 4, 7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("TopBack", createBoxGeometry(16, 0.15, 0.08), [0, 7.92, -7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("TopFront", createBoxGeometry(16, 0.15, 0.08), [0, 7.92, 7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("TopLeft", createBoxGeometry(0.08, 0.15, 16), [-7.75, 7.92, 0], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("TopRight", createBoxGeometry(0.08, 0.15, 16), [7.75, 7.92, 0], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("SkirtBack", createBoxGeometry(16, 0.1, 0.05), [0, 0.05, -7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("SkirtFront", createBoxGeometry(16, 0.1, 0.05), [0, 0.05, 7.75], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("SkirtLeft", createBoxGeometry(0.05, 0.1, 16), [-7.75, 0.05, 0], [1, 1, 1], 0, null, null, roomPalette.trim);
    add("SkirtRight", createBoxGeometry(0.05, 0.1, 16), [7.75, 0.05, 0], [1, 1, 1], 0, null, null, roomPalette.trim);
    // Chess table: one group node holds its five pieces as children.
    const table = add("Table", null, [0, 0, -3], [1, 1, 1]);
    add("Base", createBoxGeometry(3, 0.3, 3), [0, 0.15, 0], [1, 1, 1], 0, null, "marbleGray", roomPalette.marblePink, table);
    add("Pillar", createBoxGeometry(0.5, 1.5, 0.5), [0, 1.05, 0], [1, 1, 1], 0, null, "marbleGray", roomPalette.marblePink, table);
    add("Tabletop", createBoxGeometry(3.5, 0.2, 3.5), [0, 1.9, 0], [1, 1, 1], 0, null, "marbleGray", roomPalette.marblePink, table);
    // Board: a unit top face maps the full 8x8 checker, then scales up to size.
    add("Board", createBoxGeometry(1, 0.05, 1), [0, 2.025, 0], [3.2, 1, 3.2], 0, null, "checker", null, table);
    add("Pawn", pawn, [0, 2.05, 0], [1.5, 1.5, 1.5], 0, { type: "spin", speed: 0.5 }, null, roomPalette.pawn, table);
    // Pickable props for the perspective illusion.
    add("Crate1", createBoxGeometry(2, 1, 2), [-3, 0.5, -2], [1, 1, 1], 0, { type: "pulse", speed: 2.5, amount: 0.03 }, "fabric");
    add("Crate2", createBoxGeometry(1, 1, 1), [2, 0.5, 1], [1, 1, 1], 0, { type: "pulse", speed: 2.5, amount: 0.03 }, "cloth");
    add("Ball", createSphereGeometry(), [0, 1, 3], [1, 1, 1], 0, { type: "float", speed: 1.5, amplitude: 0.2 }, "fabricGray", roomPalette.ballBlue);
    // Fireplace against the back wall.
    add("Fireplace", fireplace, [4, 0, -7.5], [1, 1, 1], 0, null, "marble");
    return {
        root,
        spawn: new Vec3(10, 12, 10),
        target: new Vec3(0, 0, -2),
    };
}
