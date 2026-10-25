// @ts-check

/** @typedef {{ x: number, y: number, z: number }} XYZ */

/**
 * A three-dimensional vector or position.
 * Components are mutable; arithmetic returns new vectors or numbers without changing inputs.
 * This JavaScript class is independent of the GLSL vec3 type.
 */
export class Vec3 {
    /**
     * @param {number} [x=0]
     * @param {number} [y=0]
     * @param {number} [z=0]
     */
    constructor(x = 0, y = 0, z = 0) {
        if (![x, y, z].every(Number.isFinite)) {
            throw new TypeError("Vec3 components must be finite numbers.");
        }
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /** Copy components from a Vec3 or a plain {x,y,z} object.
     * @param {XYZ} value
     * @returns {Vec3}
     */
    static from(value) {
        return new Vec3(value.x, value.y, value.z);
    }

    /** Add vectors, or add a displacement to a position.
     * @param {XYZ} other
     * @returns {Vec3}
     */
    add(other) {
        return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    /** Return this - other; subtracting positions gives a displacement.
     * @param {XYZ} other
     * @returns {Vec3}
     */
    subtract(other) {
        return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    /** Multiply each component by a scalar.
     * @param {number} scalar
     * @returns {Vec3}
     */
    scale(scalar) {
        return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    /** Dot product; a unit direction gives the component along that direction.
     * @param {XYZ} other
     * @returns {number}
     */
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    /** Cross product this x other, following the right-hand rule.
     * @param {XYZ} other
     * @returns {Vec3}
     */
    cross(other) {
        return new Vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    /** @returns {number} Euclidean vector length. */
    length() {
        return Math.hypot(this.x, this.y, this.z);
    }

    /** Return a unit vector in the same direction; the zero vector cannot be normalized.
     * @returns {Vec3}
     */
    normalized() {
        const length = this.length();
        if (length === 0 || !Number.isFinite(length)) {
            throw new RangeError("Normalization requires a finite positive vector length.");
        }
        return new Vec3(this.x / length, this.y / length, this.z / length);
    }
}
