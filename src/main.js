// @ts-check
import { PerspectiveCamera } from "./camera/PerspectiveCamera.js";
import { FreeFlyCameraController } from "./camera/FreeFlyCameraController.js";
import { createWebGL2Context } from "./rendering/context.js";
import { SceneRenderer } from "./rendering/SceneRenderer.js";
import { CollisionWorld } from "./physics/CollisionWorld.js";
import { loadCollisionScene } from "./scene/createCollisionScene.js";
import { Keyboard } from "./input/Keyboard.js";
import { MouseLook } from "./input/MouseLook.js";

// 1. Load OBJ assets and create rendering resources and world-space collision triangles.
const canvas = document.getElementById("glCanvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Scene canvas is missing.");
const controls = document.getElementById("controls");
if (!(controls instanceof HTMLElement)) throw new Error("Controls element is missing.");
const scene = await loadCollisionScene();
const gl = createWebGL2Context("glCanvas");
const renderer = new SceneRenderer(gl, scene.objects);
const world = new CollisionWorld(scene.objects);

// 2. The camera stores viewing parameters; the controller handles input and collision.
const camera = new PerspectiveCamera({ position: scene.spawn, target: scene.target, near: 0.06, far: 100 });
const keyboard = new Keyboard(canvas);
const mouse = new MouseLook(canvas);
const controller = new FreeFlyCameraController(camera, keyboard, mouse, world);

// Resize with the window, leaving space for the controls below.
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = Math.max(1, window.innerHeight - controls.offsetHeight);
    camera.aspect = canvas.width / canvas.height;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/** @type {number | null} */
let previousTime = null;

// 3. Update the camera and render each frame. Movement has no gravity.
/** @param {number} timeMs */
function render(timeMs) {
    const deltaSeconds = previousTime === null ? 0 : Math.min((timeMs - previousTime) / 1000, 0.05);
    previousTime = timeMs;
    controller.update(deltaSeconds);
    renderer.draw(camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
