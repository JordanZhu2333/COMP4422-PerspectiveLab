// @ts-check
import { IndexedMesh } from "./IndexedMesh.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { clearFrame } from "./context.js";
import { vertexSource, fragmentSource } from "../shaders/solidColor.js";

/** Own GPU resources while sharing each object's model matrix with collision. */
export class SceneRenderer {
    /** @param {WebGL2RenderingContext} gl
     * @param {import("../scene/createCollisionScene.js").SceneObject[]} objects
     */
    constructor(gl, objects) {
        this.gl = gl;
        this.objects = objects;
        this.shader = new ShaderProgram(gl, vertexSource, fragmentSource);
        /** @type {Map<import("../loaders/OBJLoader.js").Geometry, IndexedMesh>} */
        this.meshes = new Map();
        for (const { geometry } of objects) {
            if (!this.meshes.has(geometry)) {
                this.meshes.set(geometry, new IndexedMesh(gl, geometry.positions, geometry.indices));
            }
        }
    }

    /** @param {import("../camera/PerspectiveCamera.js").PerspectiveCamera} camera */
    draw(camera) {
        const vp = camera.getProjectionMatrix().multiply(camera.getViewMatrix());
        clearFrame(this.gl, 0.075, 0.11, 0.15, 1);
        this.shader.use();
        for (const object of this.objects) {
            this.shader.setMatrix4("uMVP", vp.multiply(object.model).data);
            this.meshes.get(object.geometry)?.draw();
        }
    }

    dispose() {
        for (const mesh of this.meshes.values()) mesh.dispose();
        this.shader.dispose();
    }
}
