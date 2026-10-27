// @ts-check

/**
 * Manage a GPU texture: upload an image or canvas, configure sampling, and
 * bind it to a texture unit for a sampler uniform.
 *
 * WebGL2 supports mipmaps and repeat wrapping at any dimensions, so every
 * texture uses linear mipmap sampling with REPEAT wrapping.
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

        // WebGL2 supports mipmaps and repeat wrapping at any dimensions,
        // including non-power-of-two images.
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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
                ctx.fillStyle = (x + y) % 2 === 0 ? "#ffffff" : "#e7bdc1";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
        return new Texture(gl, canvas);
    }

    /**
     * Generate a brick texture entirely in code.
     * @param {WebGL2RenderingContext} gl
     * @param {number} [size=256] Width and height in pixels (power of two).
     * @returns {Texture}
     */
    static createBrick(gl, size = 256) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create a 2D canvas context.");
        }
        const rows = 4;
        const columns = 4;
        const brickHeight = size / rows;
        const brickWidth = size / columns;
        // Fill each brick with a slightly varying shade to suggest depth.
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? "#b5651d" : "#a0522d";
                ctx.fillRect(col * brickWidth, row * brickHeight, brickWidth, brickHeight);
            }
        }
        // Draw mortar lines: horizontal courses and staggered vertical joints.
        ctx.strokeStyle = "#e8e0d0";
        ctx.lineWidth = 3;
        for (let row = 0; row <= rows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * brickHeight);
            ctx.lineTo(size, row * brickHeight);
            ctx.stroke();
        }
        for (let row = 0; row < rows; row++) {
            const offset = (row % 2) * (brickWidth / 2);
            for (let col = 0; col <= columns; col++) {
                const x = (col * brickWidth + offset) % size;
                ctx.beginPath();
                ctx.moveTo(x, row * brickHeight);
                ctx.lineTo(x, (row + 1) * brickHeight);
                ctx.stroke();
            }
        }
        return new Texture(gl, canvas);
    }

    /**
     * Generate a striped texture entirely in code.
     * @param {WebGL2RenderingContext} gl
     * @param {number} [size=256] Width and height in pixels (power of two).
     * @param {number} [stripes=8] Stripe count.
     * @returns {Texture}
     */
    static createStripes(gl, size = 256, stripes = 8) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to create a 2D canvas context.");
        }
        const stripeWidth = size / stripes;
        for (let i = 0; i < stripes; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#2e6f9e" : "#f0f0f0";
            ctx.fillRect(i * stripeWidth, 0, stripeWidth, size);
        }
        return new Texture(gl, canvas);
    }

    /**
     * Load a texture from an image file, awaiting the image decode.
     * @param {WebGL2RenderingContext} gl
     * @param {string | URL} url Image file URL.
     * @returns {Promise<Texture>}
     */
    static async loadTexture(gl, url) {
        const image = new Image();
        image.src = url instanceof URL ? url.href : url;
        await image.decode();
        return new Texture(gl, image);
    }
}
