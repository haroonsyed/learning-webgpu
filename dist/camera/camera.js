"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera = void 0;
const gl_matrix_1 = require("gl-matrix");
const scene_object_1 = require("../scene_object/scene_object");
const system_core_1 = require("../system/system_core");
var CameraMovementMode;
(function (CameraMovementMode) {
    CameraMovementMode[CameraMovementMode["ROTATE_ORIGIN"] = 0] = "ROTATE_ORIGIN";
    CameraMovementMode[CameraMovementMode["FREE"] = 1] = "FREE";
    CameraMovementMode[CameraMovementMode["FIXED"] = 2] = "FIXED";
})(CameraMovementMode || (CameraMovementMode = {}));
class Camera extends scene_object_1.SceneObject {
    constructor(_a) {
        var { look_at_target } = _a, super_args = __rest(_a, ["look_at_target"]);
        super(super_args);
        this.up = gl_matrix_1.vec3.fromValues(0.0, 1.0, 0.0);
        this.look_at_target = gl_matrix_1.vec3.create();
        this.movement_mode = CameraMovementMode.ROTATE_ORIGIN;
        this.rotation_speed = 1e-2;
        this.movement_speed = 1e-2;
        this.mouse_sensitivity = 1e-3;
        this.look_at = (target) => {
            this.look_at_target = target;
        };
        this.get_camera_forward = () => {
            return gl_matrix_1.vec3.normalize(gl_matrix_1.vec3.create(), gl_matrix_1.vec3.subtract(gl_matrix_1.vec3.create(), this.look_at_target, this.position));
        };
        this.get_camera_right = () => {
            return gl_matrix_1.vec3.normalize(gl_matrix_1.vec3.create(), gl_matrix_1.vec3.cross(gl_matrix_1.vec3.create(), this.get_camera_forward(), this.up));
        };
        this.get_view_matrix = () => {
            const view = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.translate(view, view, this.position);
            gl_matrix_1.mat4.lookAt(view, this.position, this.look_at_target, this.up);
            return view;
        };
        this.get_projection_matrix = (aspect) => {
            if (!aspect) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                aspect = width / height;
            }
            const projection = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.perspective(projection, Math.PI / 4, aspect, 0.1, 1000.0);
            return projection;
        };
        this.update = (scene) => __awaiter(this, void 0, void 0, function* () {
            const { key_press, key_state, mouse_state } = system_core_1.SystemCore.system_input;
            const { canvas } = scene;
            if (key_press.get("`")) {
                console.log("toggling camera mode");
                if (this.movement_mode === CameraMovementMode.ROTATE_ORIGIN) {
                    // Enable pointer lock
                    this.movement_mode = CameraMovementMode.FREE;
                    canvas === null || canvas === void 0 ? void 0 : canvas.requestPointerLock();
                }
                else if (this.movement_mode === CameraMovementMode.FREE) {
                    // Disable pointer lock
                    document.exitPointerLock();
                    this.movement_mode = CameraMovementMode.FIXED;
                }
                else if (this.movement_mode === CameraMovementMode.FIXED) {
                    this.movement_mode = CameraMovementMode.ROTATE_ORIGIN;
                }
            }
            if (this.movement_mode === CameraMovementMode.ROTATE_ORIGIN) {
                if (key_state.get("a") || key_state.get("d")) {
                    const frame_rotation_speed = key_state.get("a")
                        ? this.rotation_speed
                        : -this.rotation_speed;
                    const rotation_matrix = gl_matrix_1.mat4.create();
                    gl_matrix_1.mat4.translate(rotation_matrix, rotation_matrix, this.look_at_target);
                    gl_matrix_1.mat4.rotateY(rotation_matrix, rotation_matrix, frame_rotation_speed);
                    gl_matrix_1.mat4.translate(rotation_matrix, rotation_matrix, gl_matrix_1.vec3.negate(gl_matrix_1.vec3.create(), this.look_at_target));
                    gl_matrix_1.vec3.transformMat4(this.position, this.position, rotation_matrix);
                }
            }
            else if (this.movement_mode === CameraMovementMode.FREE) {
                if (mouse_state.dx || mouse_state.dy) {
                    const camera_forward = this.get_camera_forward();
                    const camera_right = this.get_camera_right();
                    const dx = mouse_state.dx * this.mouse_sensitivity;
                    const dy = mouse_state.dy * this.mouse_sensitivity;
                    const rotation_matrix = gl_matrix_1.mat4.create();
                    gl_matrix_1.mat4.rotate(rotation_matrix, rotation_matrix, -dx, this.up);
                    gl_matrix_1.mat4.rotate(rotation_matrix, rotation_matrix, -dy, camera_right);
                    gl_matrix_1.vec3.transformMat4(this.position, this.position, rotation_matrix);
                    const new_camera_forward = this.get_camera_forward();
                    const new_camera_right = this.get_camera_right();
                    gl_matrix_1.vec3.add(this.look_at_target, this.position, new_camera_forward);
                }
                if (key_state.get("w") || key_state.get("s")) {
                    const frame_translation_speed = key_state.get("w")
                        ? this.movement_speed
                        : -this.movement_speed;
                    const forward = this.get_camera_forward();
                    gl_matrix_1.vec3.scale(forward, forward, frame_translation_speed);
                    gl_matrix_1.vec3.add(this.position, this.position, forward);
                    gl_matrix_1.vec3.add(this.look_at_target, this.look_at_target, forward);
                }
                if (key_state.get("a") || key_state.get("d")) {
                    const frame_translation_speed = key_state.get("a")
                        ? -this.movement_speed
                        : this.movement_speed;
                    const right = this.get_camera_right();
                    gl_matrix_1.vec3.scale(right, right, frame_translation_speed);
                    gl_matrix_1.vec3.add(this.position, this.position, right);
                    gl_matrix_1.vec3.add(this.look_at_target, this.look_at_target, right);
                }
            }
            else if (this.movement_mode === CameraMovementMode.FIXED) {
            }
        });
        this.look_at(look_at_target || gl_matrix_1.vec3.create());
    }
}
exports.Camera = Camera;
//# sourceMappingURL=camera.js.map