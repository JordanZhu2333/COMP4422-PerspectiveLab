// @ts-check
import { Texture } from "../rendering/Texture.js";

/** Load image-based textures and return them keyed by material name. */
export async function loadImageTextures(gl) {
    return {
        wood: await Texture.loadTexture(gl, new URL("../../assets/textures/raw_wooden_floor_01_diff_1k.jpg", import.meta.url)),
        fabric: await Texture.loadTexture(gl, new URL("../../assets/textures/fabric.jpg", import.meta.url)),
        marble: await Texture.loadTexture(gl, new URL("../../assets/textures/Pink_Marble.jpg", import.meta.url)),
        cloth: await Texture.loadTexture(gl, new URL("../../assets/textures/Material-9-A_Diffuse.jpg", import.meta.url)),
        marbleGray: await Texture.loadTexture(gl, new URL("../../assets/textures/Pink_Marble_processed.jpg", import.meta.url)),
        fabricGray: await Texture.loadTexture(gl, new URL("../../assets/textures/fabric_processed.jpg", import.meta.url)),
    };
}
