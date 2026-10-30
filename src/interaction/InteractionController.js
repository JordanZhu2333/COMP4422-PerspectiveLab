// @ts-check

// M3 (interaction): center-crosshair pick-and-scale controller.
// State machine: idle -> hover -> holding -> idle (Space grabs / releases).
// Fill in the TODO(M3) bodies below. See M3_HANDOFF.md for the full plan.

/** @typedef {import("../types.js").SceneObject} SceneObject */
/** @typedef {import("../camera/PerspectiveCamera.js").PerspectiveCamera} PerspectiveCamera */

export class InteractionController {
    /**
     * @param {PerspectiveCamera} camera
     * @param {SceneObject} root Scene graph root.
     * @param {import("../input/MouseLook.js").MouseLook} mouse
     *   Notes 6.3 passes `mouse`, but selection is Space-key driven; add a
     *   Keyboard reference here (or use window listeners) if you need it.
     * @param {import("../physics/CollisionWorld.js").CollisionWorld} world For ray-vs-triangle distance.
     */
    constructor(camera, root, mouse, world) {
        this.camera = camera;
        this.root = root;
        this.mouse = mouse;
        this.world = world;
        /** @type {SceneObject | null} Object currently under the center crosshair. */
        this.hovered = null;
        /** @type {SceneObject | null} Object currently grabbed and being scaled. */
        this.held = null;
        // TODO(M3): also track grabScale, grabDistance, savedAnimation, etc.
    }

    /**
     * Run once per frame after the camera controller has updated.
     * @param {number} deltaSeconds
     */
    update(deltaSeconds) {
        // TODO(M3):
        //   1. cast a center ray each frame -> set this.hovered (pick());
        //   2. on Space grab: freeze animation, remember grabScale/grabDistance;
        //   3. while holding: write basePosition (follow aim) and
        //      baseScale = grabScale * (d / d0);
        //   4. on Space release: restore animation, keep final baseScale/basePosition.
        throw new Error("M3: InteractionController.update not implemented.");
    }
}
