"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemInputHandler = void 0;
class SystemInputHandler {
    constructor() {
        this.key_state = new Map();
        this.key_press = new Map();
        this.mouse_state = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            left: false,
            right: false,
            middle: false,
            left_click: false,
            right_click: false,
            middle_click: false,
        };
        // Init external listeners
        window.addEventListener("keydown", (e) => {
            this.key_state.set(e.key, true);
        });
        window.addEventListener("keyup", (e) => {
            this.key_state.set(e.key, false);
        });
        window.addEventListener("keypress", (e) => {
            this.key_press.set(e.key, true);
        });
        window.addEventListener("mousemove", (e) => {
            this.mouse_state.dx = e.movementX;
            this.mouse_state.dy = e.movementY;
            this.mouse_state.x = e.x;
            this.mouse_state.y = e.y;
        });
        window.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                this.mouse_state.left = true;
            }
            else if (e.button === 1) {
                this.mouse_state.middle = true;
            }
            else if (e.button === 2) {
                this.mouse_state.right = true;
            }
        });
        window.addEventListener("mouseup", (e) => {
            if (e.button === 0) {
                this.mouse_state.left = false;
            }
            else if (e.button === 1) {
                this.mouse_state.middle = false;
            }
            else if (e.button === 2) {
                this.mouse_state.right = false;
            }
        });
        window.addEventListener("click", (e) => {
            if (e.button === 0) {
                this.mouse_state.left_click = true;
            }
            else if (e.button === 1) {
                this.mouse_state.middle_click = true;
            }
            else if (e.button === 2) {
                this.mouse_state.right_click = true;
            }
        });
    }
    reset() {
        this.key_state.clear();
        this.key_press.clear();
        this.mouse_state = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            left: false,
            right: false,
            middle: false,
            left_click: false,
            right_click: false,
            middle_click: false,
        };
    }
}
exports.SystemInputHandler = SystemInputHandler;
//# sourceMappingURL=system_input.js.map