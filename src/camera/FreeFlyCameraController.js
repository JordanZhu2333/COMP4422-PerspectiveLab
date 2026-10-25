// @ts-check
import { Vec3 } from "../math/Vec3.js";

/** Free flight: WASD movement, Q/E vertical movement, mouse drag or arrow keys to look. */
export class FreeFlyCameraController {
    /**
     * @param {import("./PerspectiveCamera.js").PerspectiveCamera} camera
     * @param {{isDown:(code:string)=>boolean}} keyboard
     * @param {{consumeDelta:()=>{x:number,y:number}}} mouse
     * @param {import("../physics/CollisionWorld.js").CollisionWorld} world
     */
    constructor(camera, keyboard, mouse, world) {
        this.camera = camera;
        this.keyboard = keyboard;
        this.mouse = mouse;
        this.world = world;
        this.radius = 0.3;
        this.halfHeight = 0.5;
        this.speed = 3;
        this.mouseSensitivity = 0.003;
        const forward = camera.target.subtract(camera.position).normalized();
        this.yaw = Math.atan2(forward.x, -forward.z);
        this.pitch = Math.asin(forward.y);
        this.spawn = Vec3.from(camera.position);
        this.spawnYaw = this.yaw;
        this.spawnPitch = this.pitch;
        this.lastMove = { position: Vec3.from(camera.position), blockedBy: /** @type {string[]} */ ([]), triangleTests: 0 };
    }

    /** @param {number} deltaSeconds */
    update(deltaSeconds) {
        if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) throw new RangeError("Delta time must be finite and nonnegative.");
        const key = this.keyboard;
        const mouse = this.mouse.consumeDelta();
        this.yaw += mouse.x * this.mouseSensitivity
            + (Number(key.isDown("ArrowRight")) - Number(key.isDown("ArrowLeft"))) * deltaSeconds * 1.4;
        this.pitch -= mouse.y * this.mouseSensitivity;
        this.pitch += (Number(key.isDown("ArrowUp")) - Number(key.isDown("ArrowDown"))) * deltaSeconds * 1.4;
        this.pitch = Math.max(-Math.PI / 2 + 0.02, Math.min(Math.PI / 2 - 0.02, this.pitch));
        const forward = this.getForward();
        const right = new Vec3(Math.cos(this.yaw), 0, Math.sin(this.yaw));
        const direction = forward.scale(Number(key.isDown("KeyW")) - Number(key.isDown("KeyS")))
            .add(right.scale(Number(key.isDown("KeyD")) - Number(key.isDown("KeyA"))))
            .add(new Vec3(0, Number(key.isDown("KeyE")) - Number(key.isDown("KeyQ")), 0));
        const boost = key.isDown("ShiftLeft") || key.isDown("ShiftRight") ? 2 : 1;
        const movement = direction.length() > 1e-8
            ? direction.normalized().scale(this.speed * boost * deltaSeconds) : new Vec3();
        this.lastMove = this.world.moveCylinder(this.camera.position, movement, this.radius, this.halfHeight);
        this.camera.position = this.lastMove.position;
        this.camera.target = this.camera.position.add(forward);
    }

    getForward() {
        const cp = Math.cos(this.pitch);
        return new Vec3(Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
    }

    reset() {
        this.camera.position = Vec3.from(this.spawn);
        this.yaw = this.spawnYaw;
        this.pitch = this.spawnPitch;
        this.mouse.consumeDelta();
        this.camera.target = this.camera.position.add(this.getForward());
        this.lastMove = { position: Vec3.from(this.spawn), blockedBy: [], triangleTests: 0 };
    }
}
