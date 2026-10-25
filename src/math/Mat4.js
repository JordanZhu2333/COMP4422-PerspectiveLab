// @ts-check
import { Vec3 } from "./Vec3.js";
import { Vec4 } from "./Vec4.js";

/** @typedef {import("./Vec3.js").XYZ} XYZ */

/**
 * A 4x4 matrix using column vectors and column-major storage: data[column * 4 + row].
 *
 * Array indices arranged as a mathematical matrix:
 *   0   4   8  12
 *   1   5   9  13
 *   2   6  10  14
 *   3   7  11  15
 *
 * a.multiply(b) returns A * B, applying B first. Operations return new objects.
 * Right-handed rotations use radians; the camera faces -Z and NDC depth spans [-1, 1].
 */
export class Mat4 {
    /**
     * Create an identity matrix by default, or copy 16 column-major elements.
     * @param {ArrayLike<number>} [data]
     */
    constructor(data) {
        if (data !== undefined) {
            if (data.length !== 16) {
                throw new RangeError("Mat4 requires exactly 16 column-major elements.");
            }
            this.data = new Float32Array(data);
            return;
        }

        this.data = new Float32Array(16);
        this.data[0] = 1;
        this.data[5] = 1;
        this.data[10] = 1;
        this.data[15] = 1;
    }

    /**
     * Return this * other. The element at (row, column) is:
     * C[row, column] = Σ A[row, k] * B[k, column]。
     * @param {Mat4} other
     * @returns {Mat4}
     */
    multiply(other) {
        const a = this.data;
        const b = other.data;
        const result = new Mat4();
        const c = result.data;

        for (let column = 0; column < 4; column++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row] * b[column * 4 + k];
                }
                c[column * 4 + row] = sum;
            }
        }
        return result;
    }

    /**
     * Return this * vector, preserving all four components without perspective division.
     * Use w=1 for points and w=0 for directions. Pass clip coordinates directly to gl_Position.
     * @param {Vec4} vector
     * @returns {Vec4}
     */
    transform(vector) {
        const m = this.data;
        const { x, y, z, w } = vector;
        return new Vec4(
            m[0] * x + m[4] * y + m[8] * z + m[12] * w,
            m[1] * x + m[5] * y + m[9] * z + m[13] * w,
            m[2] * x + m[6] * y + m[10] * z + m[14] * w,
            m[3] * x + m[7] * y + m[11] * z + m[15] * w
        );
    }

    /** @returns {Mat4} Identity matrix. */
    static identity() {
        return new Mat4();
    }

    /** @returns {Mat4} Zero matrix. */
    static zero() {
        const result = new Mat4();
        result.data.fill(0);
        return result;
    }

    /**
     * Translation occupies the last column, at indices 12, 13, and 14.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Mat4}
     */
    static translation(x, y, z) {
        requireFinite("translation", x, y, z);
        const result = new Mat4();
        result.data[12] = x;
        result.data[13] = y;
        result.data[14] = z;
        return result;
    }

    /**
     * A single argument scales all axes equally; zero and negative scales are allowed.
     * @param {number} x
     * @param {number} [y=x]
     * @param {number} [z=x]
     * @returns {Mat4}
     */
    static scaling(x, y = x, z = x) {
        requireFinite("scaling", x, y, z);
        const result = new Mat4();
        result.data[0] = x;
        result.data[5] = y;
        result.data[10] = z;
        return result;
    }

    /**
     * Right-handed rotation about +X: positive 90 degrees maps +Y to +Z.
     * @param {number} radians Angle in radians.
     * @returns {Mat4}
     */
    static rotationX(radians) {
        requireFinite("rotationX", radians);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const result = new Mat4();
        result.data[5] = c;
        result.data[6] = s;
        result.data[9] = -s;
        result.data[10] = c;
        return result;
    }

    /**
     * Right-handed rotation about +Y: positive 90 degrees maps +Z to +X.
     * @param {number} radians Angle in radians.
     * @returns {Mat4}
     */
    static rotationY(radians) {
        requireFinite("rotationY", radians);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const result = new Mat4();
        result.data[0] = c;
        result.data[2] = -s;
        result.data[8] = s;
        result.data[10] = c;
        return result;
    }

    /**
     * Right-handed rotation about +Z: positive 90 degrees maps +X to +Y.
     * @param {number} radians Angle in radians.
     * @returns {Mat4}
     */
    static rotationZ(radians) {
        requireFinite("rotationZ", radians);
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const result = new Mat4();
        result.data[0] = c;
        result.data[1] = s;
        result.data[4] = -s;
        result.data[5] = c;
        return result;
    }

    /**
     * Compose T * Rz * Ry * Rx * S.
     * Apply scale, X/Y/Z rotations, then translation.
     * @param {XYZ} position Translation.
     * @param {XYZ} rotation Rotation angles about each axis, in radians.
     * @param {XYZ} scale Scale along each axis.
     * @returns {Mat4}
     */
    static trs(position, rotation, scale) {
        return Mat4.translation(position.x, position.y, position.z)
            .multiply(Mat4.rotationZ(rotation.z))
            .multiply(Mat4.rotationY(rotation.y))
            .multiply(Mat4.rotationX(rotation.x))
            .multiply(Mat4.scaling(scale.x, scale.y, scale.z));
    }

    /**
     * Perspective projection for a right-handed view space facing -Z.
     * z=-near maps to NDC z=-1; z=-far maps to +1; clip.w=-view.z.
     * @param {number} fovY Vertical field of view in radians, in (0, PI).
     * @param {number} aspect Viewport width/height, greater than zero.
     * @param {number} near Near clipping distance, greater than zero.
     * @param {number} far Finite far clipping distance, greater than near.
     * @returns {Mat4}
     */
    static perspective(fovY, aspect, near, far) {
        requireFinite("perspective", fovY, aspect, near, far);
        if (fovY <= 0 || fovY >= Math.PI || aspect <= 0 || near <= 0 || far <= near) {
            throw new RangeError("perspective requires 0 < fovY < PI, aspect > 0, and 0 < near < far.");
        }

        const f = 1 / Math.tan(fovY / 2);
        const result = Mat4.zero();
        const m = result.data;
        m[0] = f / aspect;
        m[5] = f;
        m[10] = (far + near) / (near - far);
        m[11] = -1;
        m[14] = (2 * far * near) / (near - far);
        return result;
    }

    /**
     * Orthographic projection maps the bounds to NDC [-1, 1], with the same depth convention as perspective.
     * Clipping distances must satisfy 0 <= near < far.
     * @param {number} left
     * @param {number} right
     * @param {number} bottom
     * @param {number} top
     * @param {number} near
     * @param {number} far
     * @returns {Mat4}
     */
    static orthographic(left, right, bottom, top, near, far) {
        requireFinite("orthographic", left, right, bottom, top, near, far);
        if (right <= left || top <= bottom || near < 0 || far <= near) {
            throw new RangeError("orthographic requires left < right, bottom < top, and 0 <= near < far.");
        }

        const result = new Mat4();
        const m = result.data;
        m[0] = 2 / (right - left);
        m[5] = 2 / (top - bottom);
        m[10] = -2 / (far - near);
        m[12] = -(right + left) / (right - left);
        m[13] = -(top + bottom) / (top - bottom);
        m[14] = -(far + near) / (far - near);
        return result;
    }

    /**
     * Build the world-to-view matrix V.
     * Map eye to the origin and target onto the negative view-space Z axis.
     * up is a reference direction and must be nonzero and nonparallel to the view direction.
     * @param {XYZ} eye Camera position in world space.
     * @param {XYZ} target World-space target, distinct from eye.
     * @param {XYZ} [up] Defaults to world +Y.
     * @returns {Mat4}
     */
    static lookAt(eye, target, up = new Vec3(0, 1, 0)) {
        requireFinite("lookAt", eye.x, eye.y, eye.z, target.x, target.y, target.z, up.x, up.y, up.z);

        // Copy XYZ inputs into Vec3 instances for vector operations.
        const eyeVector = Vec3.from(eye);
        const backward = eyeVector.subtract(target);
        const referenceUp = Vec3.from(up);
        if (backward.length() === 0 || referenceUp.length() === 0) {
            throw new RangeError("lookAt requires distinct eye and target positions and a nonzero up vector.");
        }

        // Camera +Z points backward; right X = normalize(up x Z).
        const zAxis = backward.normalized();
        const right = referenceUp.normalized().cross(zAxis);
        if (right.length() <= 1e-8) {
            throw new RangeError("lookAt up must not be parallel or nearly parallel to the view direction.");
        }
        const xAxis = right.normalized();

        // The orthogonal up direction is Y = Z x X.
        const yAxis = zAxis.cross(xAxis);

        const result = new Mat4();
        const m = result.data;
        // Place basis vectors in matrix rows while keeping column-major array storage.
        m[0] = xAxis.x; m[4] = xAxis.y; m[8] = xAxis.z;
        m[1] = yAxis.x; m[5] = yAxis.y; m[9] = yAxis.z;
        m[2] = zAxis.x; m[6] = zAxis.y; m[10] = zAxis.z;
        m[12] = -xAxis.dot(eyeVector);
        m[13] = -yAxis.dot(eyeVector);
        m[14] = -zAxis.dot(eyeVector);
        return result;
    }
}

/**
 * Reject invalid parameters before NaN values enter the rendering pipeline.
 * @param {string} name
 * @param {...number} values
 */
function requireFinite(name, ...values) {
    if (!values.every(Number.isFinite)) {
        throw new TypeError(`${name} parameters must be finite numbers.`);
    }
}
