// @ts-check

/** @typedef {{ positions: Float32Array, indices: Uint16Array }} Geometry */

/**
 * Parse OBJ text into position and triangle index arrays without network or GPU access.
 * Read v x y z and triangular f records; skip UVs, normals, materials, and groups.
 * Support positive and relative negative indices in v, v/vt, v//vn, and v/vt/vn forms.
 * Uint16 indices support up to 65535 position vertices.
 * @param {string} text
 * @returns {Geometry}
 */
export function parseOBJ(text) {
    /** @type {number[]} */
    const positions = [];
    /** @type {number[]} */
    const indices = [];
    const lines = text.split(/\r\n|\n|\r/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        // Strip comments and surrounding whitespace, then split into tokens.
        const line = lines[lineIndex].split("#")[0].trim();
        if (line === "") {
            continue;
        }
        const [keyword, ...values] = line.split(/\s+/);
        const location = "OBJ line " + (lineIndex + 1);

        switch (keyword) {
            case "v": {
                if (values.length !== 3) {
                    throw new Error(location + ": expected exactly three position components (v x y z).");
                }
                const vertex = values.map(Number);
                if (!vertex.every(value => Number.isFinite(value) && Number.isFinite(Math.fround(value)))) {
                    throw new Error(location + ": vertex coordinates must be finite Float32 values.");
                }
                // WebGL2 reserves index 65535 for primitive restart; valid indices are 0..65534.
                if (positions.length / 3 >= 65535) {
                    throw new RangeError(location + ": Uint16 geometry supports at most 65535 position vertices.");
                }
                positions.push(...vertex);
                break;
            }
            case "f": {
                if (values.length !== 3) {
                    throw new Error(location + ": only triangular faces are supported; triangulate the model before export.");
                }
                const vertexCount = positions.length / 3;
                for (const token of values) {
                    // Accept the four common face vertex formats and extract only the position index.
                    if (!/^[+-]?\d+(?:\/[+-]?\d+|\/(?:[+-]?\d+)?\/[+-]?\d+)?$/.test(token)) {
                        throw new Error(location + ": invalid face vertex: " + token);
                    }
                    const objIndex = Number(token.split("/")[0]);
                    if (!Number.isSafeInteger(objIndex) || objIndex === 0) {
                        throw new Error(location + ": OBJ vertex indices must be nonzero integers.");
                    }
                    // Positive indices start at 1; -1 refers to the most recently declared vertex.
                    const index = objIndex > 0 ? objIndex - 1 : vertexCount + objIndex;
                    if (index < 0 || index >= vertexCount) {
                        throw new RangeError(location + ": vertex index " + objIndex + " is outside the declared vertex range.");
                    }
                    indices.push(index);
                }
                break;
            }
            // Only positions are used; the fragment shader derives face normals.
            case "vt":
            case "vn":
            case "o":
            case "g":
            case "s":
            case "mtllib":
            case "usemtl":
                break;
            default:
                throw new Error(location + ": unsupported OBJ directive: " + keyword);
        }
    }

    if (indices.length === 0) {
        throw new Error("OBJ contains no drawable triangles.");
    }
    return {
        positions: new Float32Array(positions),
        indices: new Uint16Array(indices),
    };
}

/**
 * Fetch an OBJ file and parse it during initialization, outside the render loop.
 * The caller awaits the returned geometry.
 * @param {string | URL} url
 * @returns {Promise<Geometry>}
 */
export async function loadOBJ(url) {
    const response = await fetch(url);
    // Check HTTP status because fetch does not throw for HTTP errors.
    if (!response.ok) {
        throw new Error("Failed to load OBJ: " + url + " (HTTP " + response.status + ").");
    }
    const text = await response.text();
    return parseOBJ(text);
}
