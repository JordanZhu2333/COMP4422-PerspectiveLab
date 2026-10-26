// @ts-check
import { Texture } from "../rendering/Texture.js";

/** Load image-based textures and return them keyed by material name. */
export async function loadImageTextures(gl) {
    return {
        wood: await Texture.loadTexture(gl, new URL("../../assets/textures/raw_wooden_floor_01_diff_1k.jpg", import.meta.url)),
        fabric: await Texture.loadTexture(gl, new URL("../../assets/textures/Fabric085_1K-JPG_Color.jpg", import.meta.url)),
    };
}
