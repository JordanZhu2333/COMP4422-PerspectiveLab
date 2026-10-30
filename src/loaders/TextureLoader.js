// @ts-check
import { Texture } from "../rendering/Texture.js";

/** Load image-based textures and return them keyed by material name. */
export async function loadImageTextures(gl) {
    return {
        fabric: await Texture.loadTexture(gl, new URL("../../assets/textures/fabric.jpg", import.meta.url)),
        marble: await Texture.loadTexture(gl, new URL("../../assets/textures/marble.jpg", import.meta.url)),
        metal: await Texture.loadTexture(gl, new URL("../../assets/textures/metal.jpg", import.meta.url)),
        wood: await Texture.loadTexture(gl, new URL("../../assets/textures/wood.jpg", import.meta.url)),
    };
}
