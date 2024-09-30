"use strict";
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
exports.Light = void 0;
const gl_matrix_1 = require("gl-matrix");
const scene_object_1 = require("../scene_object/scene_object");
class Light extends scene_object_1.SceneObject {
    constructor(_a) {
        var { color = gl_matrix_1.vec3.fromValues(1.0, 1.0, 1.0), intensity = 1.0 } = _a, super_args = __rest(_a, ["color", "intensity"]);
        super(super_args);
        this.get_uniform_data = () => {
            return {
                position: [...this.position, 0.0],
                color: this.color,
            };
        };
        this.color = gl_matrix_1.vec4.fromValues(color[0], color[1], color[2], intensity);
    }
}
exports.Light = Light;
//# sourceMappingURL=light.js.map