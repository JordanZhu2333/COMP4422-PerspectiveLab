// @ts-check

/** Compile GLSL, link a program, and upload uniforms. */
export class ShaderProgram {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {string} vertexSource Vertex shader source.
     * @param {string} fragmentSource Fragment shader source.
     */
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = createProgram(gl, vertexSource, fragmentSource);

        // Cache uniform locations for subsequent draw calls.
        /** @type {Map<string, WebGLUniformLocation>} */
        this.uniformLocations = new Map();
    }

    /** Activate this program before uploading uniforms or drawing. */
    use() {
        this.gl.useProgram(this.program);
    }

    /**
     * Resolve and cache a uniform location, throwing when the uniform is inactive.
     * @param {string} name GLSL uniform name.
     * @returns {WebGLUniformLocation}
     */
    getUniformLocation(name) {
        let location = this.uniformLocations.get(name);
        if (location === undefined) {
            const found = this.gl.getUniformLocation(this.program, name);
            if (found === null) {
                throw new Error(`Active uniform not found: ${name}`);
            }
            location = found;
            this.uniformLocations.set(name, location);
        }
        return location;
    }

    /**
     * Upload a column-major 4x4 matrix after calling use().
     * Accept the underlying array without depending on the Mat4 implementation.
     * @param {string} name GLSL uniform name, such as uMVP.
     * @param {Float32Array} data 16 column-major matrix elements.
     */
    setMatrix4(name, data) {
        this.gl.uniformMatrix4fv(this.getUniformLocation(name), false, data);
    }

    /**
     * Upload an integer uniform (such as a sampler's texture unit) after calling use().
     * @param {string} name GLSL uniform name, such as uTexture.
     * @param {number} value Integer value.
     */
    setInt(name, value) {
        this.gl.uniform1i(this.getUniformLocation(name), value);
    }

    /** Release resources when the program is no longer needed. */
    dispose() {
        this.gl.deleteProgram(this.program);
        this.uniformLocations.clear();
    }
}

/**
 * Internal shader compilation helper.
 * @param {WebGL2RenderingContext} gl
 * @param {number} type
 * @param {string} source
 * @returns {WebGLShader}
 */
function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) {
        throw new Error("Unable to create shader.");
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || "Shader compilation failed.");
    }
    return shader;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexSource
 * @param {string} fragmentSource
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    /** @type {WebGLShader | null} */
    let fragmentShader = null;
    /** @type {WebGLProgram | null} */
    let program = null;

    try {
        fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        program = gl.createProgram();
        if (!program) {
            throw new Error("Unable to create shader program.");
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program) || "Shader program linking failed.");
        }

        // The linked program retains executable code, so the shaders can be detached.
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        return program;
    } catch (error) {
        gl.deleteProgram(program);
        throw error;
    } finally {
        // Release temporary shaders whether linking succeeds or fails.
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
    }
}
