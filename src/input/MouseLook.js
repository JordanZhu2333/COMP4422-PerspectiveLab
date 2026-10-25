// @ts-check

/** Collect pixel deltas during a left-button drag; the controller applies camera rotation. */
export class MouseLook {
    /** @param {HTMLCanvasElement} canvas */
    constructor(canvas) {
        this.canvas = canvas;
        this.dx = 0;
        this.dy = 0;
        /** @type {number | null} */
        this.pointerId = null;
        this.lastX = 0;
        this.lastY = 0;
        /** @param {PointerEvent} event */
        this.handleDown = (event) => {
            if (event.button !== 0) return;
            canvas.focus({ preventScroll: true });
            canvas.setPointerCapture(event.pointerId);
            this.pointerId = event.pointerId;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
            canvas.classList.add("looking");
            event.preventDefault();
        };
        /** @param {PointerEvent} event */
        this.handleMove = (event) => {
            if (event.pointerId !== this.pointerId) return;
            this.dx += event.clientX - this.lastX;
            this.dy += event.clientY - this.lastY;
            this.lastX = event.clientX;
            this.lastY = event.clientY;
        };
        this.handleEnd = () => {
            if (this.pointerId !== null && canvas.hasPointerCapture(this.pointerId)) {
                canvas.releasePointerCapture(this.pointerId);
            }
            this.pointerId = null;
            canvas.classList.remove("looking");
        };
        canvas.addEventListener("pointerdown", this.handleDown);
        canvas.addEventListener("pointermove", this.handleMove);
        canvas.addEventListener("pointerup", this.handleEnd);
        canvas.addEventListener("pointercancel", this.handleEnd);
        canvas.addEventListener("lostpointercapture", this.handleEnd);
        window.addEventListener("blur", this.handleEnd);
    }

    consumeDelta() {
        const result = { x: this.dx, y: this.dy };
        this.dx = this.dy = 0;
        return result;
    }

    dispose() {
        this.handleEnd();
        this.canvas.removeEventListener("pointerdown", this.handleDown);
        this.canvas.removeEventListener("pointermove", this.handleMove);
        this.canvas.removeEventListener("pointerup", this.handleEnd);
        this.canvas.removeEventListener("pointercancel", this.handleEnd);
        this.canvas.removeEventListener("lostpointercapture", this.handleEnd);
        window.removeEventListener("blur", this.handleEnd);
    }
}
