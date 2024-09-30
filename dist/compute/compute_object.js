"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeObject = void 0;
const scene_object_1 = require("../scene_object/scene_object");
class ComputeObject extends scene_object_1.SceneObject {
    constructor(params) {
        var _a, _b;
        super(params);
        this.parse_workgroup_size = (dimension, canvas_width, canvas_height) => {
            if (typeof dimension === "string") {
                switch (dimension) {
                    case "canvas_width":
                        return canvas_width;
                    case "canvas_height":
                        return canvas_height;
                    default:
                        return 1;
                }
            }
            else {
                return dimension;
            }
        };
        const scene_width = ((_a = params.scene.canvas) === null || _a === void 0 ? void 0 : _a.width) || 1;
        const scene_height = ((_b = params.scene.canvas) === null || _b === void 0 ? void 0 : _b.height) || 1;
        this.workgroup_size = [
            this.parse_workgroup_size(params.workgroup_size[0], scene_width, scene_height),
            this.parse_workgroup_size(params.workgroup_size[1], scene_width, scene_height),
            this.parse_workgroup_size(params.workgroup_size[2], scene_width, scene_height),
        ];
    }
}
exports.ComputeObject = ComputeObject;
//# sourceMappingURL=compute_object.js.map