// @ts-check

/**
 * Find the canvas and create a WebGL2 context.
 * @param {string} canvasId ID of the canvas element.
 * @returns {WebGL2RenderingContext}
 */
export function createWebGL2Context(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Canvas not found: ${canvasId}`);
    }

    const gl = canvas.getContext("webgl2");
    if (!gl) {
        throw new Error("Unable to create a WebGL2 context.");
    }
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clearDepth(1.0);
    return gl;
}

/**
 * Set the viewport and clear color and depth before drawing a frame.
 * Use drawing buffer dimensions; canvas layout is handled separately.
 * @param {WebGL2RenderingContext} gl
 * @param {number} r Red component in [0, 1].
 * @param {number} g Green component in [0, 1].
 * @param {number} b Blue component in [0, 1].
 * @param {number} [a=1] Opacity in [0, 1].
 */
export function clearFrame(gl, r, g, b, a = 1) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(r, g, b, a);
    gl.clear(
        gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT
    );
}
