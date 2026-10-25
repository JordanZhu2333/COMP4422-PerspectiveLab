// @ts-check
import { IndexedMesh } from "./IndexedMesh.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { Texture } from "./Texture.js";
import { clearFrame } from "./context.js";
import { vertexSource as solidVertexSource, fragmentSource as solidFragmentSource } from "../shaders/solidColor.js";
import { vertexSource as textureVertexSource, fragmentSource as textureFragmentSource } from "../shaders/texture.js";

/** Own GPU resources while sharing each object's model matrix with collision. */
export class SceneRenderer {
    /** @param {WebGL2RenderingContext} gl
     * @param {import("../scene/createCollisionScene.js").SceneObject[]} objects
     */
    constructor(gl, objects) {
        this.gl = gl;
        this.objects = objects;
        // Two shaders: solid face coloring for meshes without UVs, texturing for those with them.
        this.solidShader = new ShaderProgram(gl, solidVertexSource, solidFragmentSource);
        this.textureShader = new ShaderProgram(gl, textureVertexSource, textureFragmentSource);
        // Named textures; each object selects one via its material, defaulting to "checker".
        /** @type {Record<string, Texture>} */
        this.textures = {
            checker: Texture.createCheckerboard(gl),
            brick: Texture.createBrick(gl),
            stripes: Texture.createStripes(gl),
        };
        for (const object of objects) {
            if (object.material !== null && !(object.material in this.textures)) {
                throw new Error(`Unknown material: ${object.material}`);
            }
        }
        /** @type {Map<import("../loaders/OBJLoader.js").Geometry, IndexedMesh>} */
        this.meshes = new Map();
        for (const { geometry } of objects) {
            if (!this.meshes.has(geometry)) {
                this.meshes.set(geometry, new IndexedMesh(gl, geometry));
            }
        }
    }

    /** @param {import("../camera/PerspectiveCamera.js").PerspectiveCamera} camera */
    draw(camera) {
        const vp = camera.getProjectionMatrix().multiply(camera.getViewMatrix());
        clearFrame(this.gl, 0.075, 0.11, 0.15, 1);
        for (const object of this.objects) {
            const mesh = this.meshes.get(object.geometry);
            if (object.geometry.uvs) {
                this.textureShader.use();
                this.textureShader.setMatrix4("uMVP", vp.multiply(object.model).data);
                this.textures[object.material ?? "checker"].bind(0);
                this.textureShader.setInt("uTexture", 0);
            } else {
                this.solidShader.use();
                this.solidShader.setMatrix4("uMVP", vp.multiply(object.model).data);
            }
            mesh?.draw();
        }
    }

    dispose() {
        for (const mesh of this.meshes.values()) mesh.dispose();
        this.solidShader.dispose();
        this.textureShader.dispose();
        for (const texture of Object.values(this.textures)) texture.dispose();
    }
}
