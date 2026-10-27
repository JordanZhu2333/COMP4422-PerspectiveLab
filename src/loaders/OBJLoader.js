// @ts-check

/** @typedef {import("../types.js").Geometry} Geometry */

/**
 * Parse OBJ text into position, UV, normal, and triangle index arrays without
 * network or GPU access. Read v, vt, and vn records plus triangular f records.
 * OBJ keeps separate index spaces for positions, texture coordinates, and normals,
 * so each face corner is expanded into a combined vertex and deduplicated by its
 * (v, vt, vn) tuple. UVs and normals are returned only when the file defines them.
 * Support positive and relative negative indices in v, v/vt, v//vn, and v/vt/vn forms.
 * Uint16 indices support up to 65535 output vertices.
 * @param {string} text
 * @returns {Geometry}
 */
export function parseOBJ(text) {
    /** @type {number[]} */
    const positions = [];
    /** @type {number[]} */
    const uvs = [];
    /** @type {number[]} */
    const normals = [];
    // Rebuilt, deduplicated vertex data in WebGL's parallel-array layout.
    /** @type {number[]} */
    const outPositions = [];
    /** @type {number[]} */
    const outUvs = [];
    /** @type {number[]} */
    const outNormals = [];
    /** @type {number[]} */
    const indices = [];
    /** @type {Map<string, number>} Map from a (v, vt, vn) tuple to its output vertex index. */
    const vertexMap = new Map();
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
            case "vt": {
                // Use the first two components (u, v); an optional w is ignored.
                if (values.length < 2 || values.length > 3) {
                    throw new Error(location + ": expected two or three texture coordinate components (vt u v [w]).");
                }
                const uv = values.slice(0, 2).map(Number);
                if (!uv.every(value => Number.isFinite(value) && Number.isFinite(Math.fround(value)))) {
                    throw new Error(location + ": texture coordinates must be finite Float32 values.");
                }
                uvs.push(...uv);
                break;
            }
            case "vn": {
                if (values.length !== 3) {
                    throw new Error(location + ": expected exactly three normal components (vn x y z).");
                }
                const normal = values.map(Number);
                if (!normal.every(value => Number.isFinite(value) && Number.isFinite(Math.fround(value)))) {
                    throw new Error(location + ": normal coordinates must be finite Float32 values.");
                }
                normals.push(...normal);
                break;
            }
            case "f": {
                if (values.length !== 3) {
                    throw new Error(location + ": only triangular faces are supported; triangulate the model before export.");
                }
                const vertexCount = positions.length / 3;
                const uvCount = uvs.length / 2;
                const normalCount = normals.length / 3;
                for (const token of values) {
                    // Accept v, v/vt, v//vn, and v/vt/vn; the middle slot may be empty
                    // only in the three-part v//vn form.
                    const parts = token.split("/");
                    const valid =
                        (parts.length === 1 && parts[0] !== "") ||
                        (parts.length === 2 && parts[0] !== "" && parts[1] !== "") ||
                        (parts.length === 3 && parts[0] !== "" && parts[2] !== "");
                    if (!valid) {
                        throw new Error(location + ": invalid face vertex: " + token);
                    }
                    const vIndex = resolveIndex(parts[0], vertexCount, "position", location);
                    const hasUV = parts.length >= 2 && parts[1] !== "";
                    const hasNormal = parts.length >= 3 && parts[2] !== "";
                    const vtIndex = hasUV ? resolveIndex(parts[1], uvCount, "texture coordinate", location) : -1;
                    const vnIndex = hasNormal ? resolveIndex(parts[2], normalCount, "normal", location) : -1;

                    // Reuse an existing vertex when the same (v, vt, vn) tuple recurs.
                    const key = vIndex + "/" + (hasUV ? vtIndex : "") + "/" + (hasNormal ? vnIndex : "");
                    let outIndex = vertexMap.get(key);
                    if (outIndex === undefined) {
                        outIndex = outPositions.length / 3;
                        if (outIndex >= 65535) {
                            throw new RangeError(location + ": Uint16 geometry supports at most 65535 output vertices.");
                        }
                        outPositions.push(positions[vIndex * 3], positions[vIndex * 3 + 1], positions[vIndex * 3 + 2]);
                        if (hasUV) outUvs.push(uvs[vtIndex * 2], uvs[vtIndex * 2 + 1]);
                        if (hasNormal) outNormals.push(normals[vnIndex * 3], normals[vnIndex * 3 + 1], normals[vnIndex * 3 + 2]);
                        vertexMap.set(key, outIndex);
                    }
                    indices.push(outIndex);
                }
                break;
            }
            // Materials and groups are not needed; skip them silently.
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
    // Reject partially-mapped meshes before they misalign the parallel arrays.
    if (outUvs.length !== 0 && outUvs.length !== outPositions.length) {
        throw new Error("Inconsistent OBJ: some face corners reference texture coordinates while others do not.");
    }
    if (outNormals.length !== 0 && outNormals.length !== outPositions.length) {
        throw new Error("Inconsistent OBJ: some face corners reference normals while others do not.");
    }
    /** @type {Geometry} */
    const geometry = {
        positions: new Float32Array(outPositions),
        indices: new Uint16Array(indices),
    };
    if (outUvs.length > 0) geometry.uvs = new Float32Array(outUvs);
    if (outNormals.length > 0) geometry.normals = new Float32Array(outNormals);
    return geometry;
}

/**
 * Resolve a 1-based or relative-negative OBJ index against a running element count.
 * Positive indices start at 1; -1 refers to the most recently declared element.
 * @param {string} raw Raw index token.
 * @param {number} count Number of elements declared so far.
 * @param {string} kind Attribute name for error messages.
 * @param {string} location OBJ line reference for error messages.
 * @returns {number} Zero-based index into the attribute array.
 */
function resolveIndex(raw, count, kind, location) {
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value === 0) {
        throw new Error(location + ": " + kind + " indices must be nonzero integers.");
    }
    const index = value > 0 ? value - 1 : count + value;
    if (index < 0 || index >= count) {
        throw new RangeError(location + ": " + kind + " index " + value + " is outside the declared " + kind + " range.");
    }
    return index;
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
