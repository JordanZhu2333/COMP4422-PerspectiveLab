// @ts-check
import { IndexedMesh } from "./IndexedMesh.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { Texture } from "./Texture.js";
import { clearFrame } from "./context.js";
import { collectRenderables } from "../scene/SceneGraph.js";
import { roomPalette } from "../scene/colors.js";
import { vertexSource as solidVertexSource, fragmentSource as solidFragmentSource } from "../shaders/solidColor.js";
import { vertexSource as textureVertexSource, fragmentSource as textureFragmentSource } from "../shaders/texture.js";
import { vertexSource as flatVertexSource, fragmentSource as flatFragmentSource } from "../shaders/flatColor.js";

/** Own GPU resources and draw each renderable object using its world matrix. */
export class SceneRenderer {
    /** @param {WebGL2RenderingContext} gl
     * @param {import("../types.js").SceneObject} root Scene graph root.
     * @param {Record<string, Texture>} [imageTextures] Image-based textures to merge in.
     */
    constructor(gl, root, imageTextures = {}) {
        this.gl = gl;
        this.objects = collectRenderables(root);
        // Three shaders: flat color, solid face coloring, and texturing.
        this.flatShader = new ShaderProgram(gl, flatVertexSource, flatFragmentSource);
        this.solidShader = new ShaderProgram(gl, solidVertexSource, solidFragmentSource);
        this.textureShader = new ShaderProgram(gl, textureVertexSource, textureFragmentSource);
        // Named textures; each object selects one via its material, defaulting to "checker".
        /** @type {Record<string, Texture>} */
        this.textures = {
            checker: Texture.createCheckerboard(gl),
            brick: Texture.createBrick(gl),
            stripes: Texture.createStripes(gl),
            ...imageTextures,
        };
        for (const object of this.objects) {
            if (object.material !== null && !(object.material in this.textures)) {
                throw new Error(`Unknown material: ${object.material}`);
            }
        }
        /** @type {Map<import("../types.js").Geometry, IndexedMesh>} */
        this.meshes = new Map();
        for (const { geometry } of this.objects) {
            if (!this.meshes.has(geometry)) {
                this.meshes.set(geometry, new IndexedMesh(gl, geometry));
            }
        }
    }

    /** @param {import("../camera/PerspectiveCamera.js").PerspectiveCamera} camera */
    draw(camera) {
        const vp = camera.getProjectionMatrix().multiply(camera.getViewMatrix());
        clearFrame(this.gl, ...roomPalette.background, 1);
        for (const object of this.objects) {
            const mesh = this.meshes.get(object.geometry);
            if (object.color && !object.material) {
                this.flatShader.use();
                this.flatShader.setMatrix4("uMVP", vp.multiply(object.world).data);
                this.flatShader.setVec4("uColor", [object.color[0], object.color[1], object.color[2], 1]);
            } else if (object.geometry.uvs) {
                this.textureShader.use();
                this.textureShader.setMatrix4("uMVP", vp.multiply(object.world).data);
                this.textures[object.material ?? "checker"].bind(0);
                this.textureShader.setInt("uTexture", 0);
                this.textureShader.setInt("uTintEnabled", object.color ? 1 : 0);
                const tint = object.color ?? [1, 1, 1];
                this.textureShader.setVec4("uTint", [tint[0], tint[1], tint[2], 1]);
            } else {
                this.solidShader.use();
                this.solidShader.setMatrix4("uMVP", vp.multiply(object.world).data);
            }
            mesh?.draw();
        }
    }

    dispose() {
        for (const mesh of this.meshes.values()) mesh.dispose();
        this.flatShader.dispose();
        this.solidShader.dispose();
        this.textureShader.dispose();
        for (const texture of Object.values(this.textures)) texture.dispose();
    }
}
