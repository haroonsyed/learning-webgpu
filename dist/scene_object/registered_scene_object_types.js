"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registered_scene_object_types = void 0;
const camera_1 = require("../camera/camera");
const compute_object_1 = require("../compute/compute_object");
const light_1 = require("../lights/light");
const scene_object_1 = require("./scene_object");
const registered_scene_object_types = {
    SceneObject: scene_object_1.SceneObject,
    Light: light_1.Light,
    Camera: camera_1.Camera,
    ComputeObject: compute_object_1.ComputeObject,
};
exports.registered_scene_object_types = registered_scene_object_types;
//# sourceMappingURL=registered_scene_object_types.js.map