// @ts-check

/**
 * Manage GPU buffers and draw an indexed mesh.
 * Each vertex attribute in ATTRIBUTES is uploaded only when the geometry provides
 * it, so a mesh can hold positions alone or positions plus UVs and normals.
 * Transforms and shaders are supplied by the renderer, allowing a mesh to be reused.
 */
export class IndexedMesh {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {import("../loaders/OBJLoader.js").Geometry} geometry Vertex data and triangle indices.
     */
    constructor(gl, geometry) {
        const vao = gl.createVertexArray();
        const indexBuffer = gl.createBuffer();

        if (!vao || !indexBuffer) {
            gl.deleteVertexArray(vao);
            gl.deleteBuffer(indexBuffer);
            throw new Error("Unable to create mesh vertex array or buffers.");
        }

        this.gl = gl;
        this.vao = vao;
        this.indexBuffer = indexBuffer;
        this.indexCount = geometry.indices.length;
        /** @type {WebGLBuffer[]} */
        this.attributeBuffers = [];

        // Bind the VAO to record attribute setup and the index buffer binding.
        gl.bindVertexArray(vao);

        // Upload each attribute the geometry actually provides; skip missing ones.
        for (const attribute of ATTRIBUTES) {
            const data = geometry[attribute.key];
            if (!data) continue;
            const buffer = gl.createBuffer();
            if (!buffer) {
                throw new Error("Unable to create vertex attribute buffer.");
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            gl.vertexAttribPointer(attribute.location, attribute.size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attribute.location);
            this.attributeBuffers.push(buffer);
        }

        // The index buffer binding is stored in the current VAO.
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

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
        this.gl.deleteBuffer(this.indexBuffer);
        for (const buffer of this.attributeBuffers) this.gl.deleteBuffer(buffer);
    }
}

/**
 * Fixed vertex attribute layout. Locations must match the shader layout qualifiers.
 * @type {Array<{ name: string, location: number, size: number, key: "positions" | "uvs" | "normals" }>}
 */
const ATTRIBUTES = [
    { name: "aPosition", location: 0, size: 3, key: "positions" },
    { name: "aTexCoord", location: 1, size: 2, key: "uvs" },
    { name: "aNormal", location: 2, size: 3, key: "normals" },
];
