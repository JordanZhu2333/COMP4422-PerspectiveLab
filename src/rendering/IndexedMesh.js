// @ts-check

/**
 * Manage GPU buffers and draw an indexed mesh.
 * Attribute 0 holds packed vec3 positions; Uint16 indices define triangles.
 * Transforms and shaders are supplied by the renderer, allowing a mesh to be reused.
 */
export class IndexedMesh {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Float32Array} positions Packed x, y, z coordinates.
     * @param {Uint16Array} indices Three vertex indices per triangle.
     */
    constructor(gl, positions, indices) {
        const vao = gl.createVertexArray();
        const vertexBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();

        if (!vao || !vertexBuffer || !indexBuffer) {
            gl.deleteVertexArray(vao);
            gl.deleteBuffer(vertexBuffer);
            gl.deleteBuffer(indexBuffer);
            throw new Error("Unable to create mesh vertex array or buffers.");
        }

        this.gl = gl;
        this.vao = vao;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.indexCount = indices.length;

        // Bind the VAO to record attribute setup and the index buffer binding.
        gl.bindVertexArray(vao);

        // Upload positions and configure attribute 0 to read three floats per vertex.
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // The index buffer binding is stored in the current VAO.
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Unbind the VAO while preserving its index buffer binding.
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    /** Draw using the active shader program and its current uniforms. */
    draw() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    /** Release GPU resources when the mesh is no longer needed. */
    dispose() {
        this.gl.deleteVertexArray(this.vao);
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
    }
}
