// @ts-check

export class Keyboard {
    /** @param {Window | HTMLElement} [target] When a canvas is supplied, it receives key presses only while focused. */
    constructor(target = window) {
        this.target = target;
        /** @type {Set<string>} */
        this.pressedKeys = new Set();

        /** @param {KeyboardEvent} event */
        this.handleKeyDown = (event) => {
            this.pressedKeys.add(event.code);
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
                event.preventDefault();
            }
        };

        /** @param {KeyboardEvent} event */
        this.handleKeyUp = (event) => {
            this.pressedKeys.delete(event.code);
        };

        this.handleBlur = () => {
            this.pressedKeys.clear();
        };

        target.addEventListener("keydown", /** @type {EventListener} */ (this.handleKeyDown));
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("blur", this.handleBlur);
        target.addEventListener("blur", this.handleBlur);
    }

    /** @param {string} code */
    isDown(code) {
        return this.pressedKeys.has(code);
    }

    dispose() {
        this.target.removeEventListener("keydown", /** @type {EventListener} */ (this.handleKeyDown));
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("blur", this.handleBlur);
        this.target.removeEventListener("blur", this.handleBlur);

        this.pressedKeys.clear();
    }
}
