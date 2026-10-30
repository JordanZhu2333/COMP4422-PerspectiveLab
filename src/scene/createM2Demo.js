// @ts-check
import { Vec3 } from "../math/Vec3.js";
import { loadOBJ } from "../loaders/OBJLoader.js";
import { createBoxGeometry } from "../geometry/box.js";
import { createSphereGeometry } from "../geometry/sphere.js";
import { createSceneObject, addObject } from "../scenegraph/SceneGraph.js";
import { hexToRgb } from "../util/color.js";

/** @typedef {import("../types.js").SceneObject} SceneObject */
/** @typedef {import("../types.js").Geometry} Geometry */
/** @typedef {import("../types.js").Animation} Animation */

/** Load the chess pawn OBJ and build the M2 material/animation showcase. */
export async function loadM2DemoScene() {
    const pawn = await loadOBJ(new URL("../../assets/models/chess_pawn.obj", import.meta.url));
    return createM2DemoScene(pawn);
}

/** Build the M2 demo: four grayscale materials across shapes, plus procedural and flat rows.
 * The grid stands vertically (on the X-Y wall plane) instead of lying on a floor.
 * @param {Geometry} pawn Loaded chess pawn geometry.
 */
export function createM2DemoScene(pawn) {
    const root = createSceneObject("root", null, [0, 0, 0], [1, 1, 1]);
    /** @param {string} name @param {Geometry | null} geometry @param {number[]} position
     * @param {number[]} scale @param {number} [yaw] @param {Animation | null} [animation]
     * @param {string | null} [material] @param {[number, number, number] | null} [color]
     */
    function add(name, geometry, position, scale, yaw = 0, animation = null, material = null, color = null) {
        return addObject(root, name, geometry, position, scale, yaw, animation, material, color);
    }

    const cube = createBoxGeometry(1.5, 1.5, 1.5); // both cubes share the same size
    const sphere = createSphereGeometry();

    // Each material row keeps two tint colors appropriate to that material.
    const fabricColors = [hexToRgb("#e5829d"), hexToRgb("#5f8fd6")];     // pink, blue
    const marbleColors = [hexToRgb("#e38fd8"), hexToRgb("#9a938a")];     // green, purple
    const metalColors = [hexToRgb("#d4af37"), hexToRgb("#c9c9c9")];     // gold, silver
    const woodColors = [hexToRgb("#8b5a2b"), hexToRgb("#d2b48c")];      // brown, tan
    const pawnColors = [hexToRgb("#dfdaa3"), hexToRgb("#efaaa5")];      // beige, salmon

    // Row 1: procedural checker + brick (no animation).
    add("Row1-checker", cube, [-1.5, 10, 0], [1, 1, 1], 0, null, "checker", null);
    add("Row1-brick", cube, [1.5, 10, 0], [1, 1, 1], 0, null, "brick", null);

    // Row 2: fabric — spin.
    add("Row2-cube1", cube, [-3, 6, 0], [1, 1, 1], 0, { type: "spin", speed: 1.5 }, "fabric", fabricColors[0]);
    add("Row2-cube2", cube, [0, 6, 0], [1, 1, 1], 0, { type: "spin", speed: 1.5 }, "fabric", fabricColors[1]);
    add("Row2-sphere", sphere, [3, 6, 0], [1.2, 1.2, 1.2], 0, { type: "spin", speed: 1.5 }, "fabric", fabricColors[1]);

    // Row 3: marble — bob.
    add("Row3-cube1", cube, [-3, 2, 0], [1, 1, 1], 0, { type: "bob", speed: 2, amplitude: 0.4 }, "marble", marbleColors[0]);
    add("Row3-cube2", cube, [0, 2, 0], [1, 1, 1], 0, { type: "bob", speed: 2, amplitude: 0.4 }, "marble", marbleColors[1]);
    add("Row3-sphere", sphere, [3, 2, 0], [1.2, 1.2, 1.2], 0, { type: "bob", speed: 2, amplitude: 0.4 }, "marble", marbleColors[1]);

    // Row 4: metal — float.
    add("Row4-cube1", cube, [-3, -2, 0], [1, 1, 1], 0, { type: "float", speed: 1.5, amplitude: 0.4 }, "metal", metalColors[0]);
    add("Row4-cube2", cube, [0, -2, 0], [1, 1, 1], 0, { type: "float", speed: 1.5, amplitude: 0.4 }, "metal", metalColors[1]);
    add("Row4-sphere", sphere, [3, -2, 0], [1.2, 1.2, 1.2], 0, { type: "float", speed: 1.5, amplitude: 0.4 }, "metal", metalColors[1]);

    // Row 5: wood — pulse.
    add("Row5-cube1", cube, [-3, -6, 0], [1, 1, 1], 0, { type: "pulse", speed: 2.5, amount: 0.15 }, "wood", woodColors[0]);
    add("Row5-cube2", cube, [0, -6, 0], [1, 1, 1], 0, { type: "pulse", speed: 2.5, amount: 0.15 }, "wood", woodColors[1]);
    add("Row5-sphere", sphere, [3, -6, 0], [1.2, 1.2, 1.2], 0, { type: "pulse", speed: 2.5, amount: 0.15 }, "wood", woodColors[1]);

    // Row 6: two pawns with flat colors (no animation).
    add("Row6-pawn1", pawn, [-1.5, -10, 0], [1.5, 1.5, 1.5], 0, null, null, pawnColors[0]);
    add("Row6-pawn2", pawn, [1.5, -10, 0], [1.5, 1.5, 1.5], 0, null, null, pawnColors[1]);

    return {
        root,
        spawn: new Vec3(0, 0, 22),
        target: new Vec3(0, 0, 0),
        background: hexToRgb("#131c26"),
        lights: [], // M2 demo has no lighting yet.
    };
}
