// @ts-check

/**
 * Manage a GPU texture: upload an image or canvas, configure sampling, and
 * bind it to a texture unit for a sampler uniform.
 *
 * Power-of-two images use mipmaps and repeat wrapping; non-power-of-two images
 * fall back to clamped, non-mipmapped sampling so the texture stays complete.
 */
export class Texture {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {TexImageSource} image A loaded image, canvas, or offscreen canvas.
     */
    constructor(gl, image) {
        this.gl = gl;
        this.texture = gl.createTexture();
        if (!this.texture) {
            throw new Error("Unable to create texture.");
        }

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Flip image rows so the image's top edge maps to texture v = 0.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Mipmaps require power-of-two dimensions; clamp non-power-of-two images.
        const powerOfTwo = isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
        if (powerOfTwo) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /** Bind this texture to a texture unit before drawing with its sampler. */
    bind(unit = 0) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    /** Release GPU resources when the texture is no longer needed. */
    dispose() {
        this.gl.deleteTexture(this.texture);
    }

    /**
     * Generate a black-and-white checkerboard texture entirely in code.
     * Useful as a placeholder that makes UV mapping errors easy to see.
     * @param {WebGL2RenderingContext} gl
     * @param {number} [size=256] Width and height in pixels (power of two).
     * @param {number} [cells=8] Checkerboard cells per side.
     * @returns {Texture}
     */
    static createCheckerboard(gl, size = 256, cells = 8) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create a 2D canvas context.");
        }
        const cellSize = size / cells;
        for (let y = 0; y < cells; y++) {
            for (let x = 0; x < cells; x++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#ffffff" : "#1a1a1a";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        return new Texture(gl, canvas);
    }
}

/**
 * @param {number} value
 * @returns {boolean} True when value is a power of two, including 1.
 */
function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0;
}
