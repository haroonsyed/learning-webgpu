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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneObject = void 0;
const model_loader_1 = require("../model/model_loader");
const gl_matrix_1 = require("gl-matrix");
class SceneObject {
    constructor({ id, name, scene, model = "", shader_path = "", pipeline, position = gl_matrix_1.vec3.create(), velocity = gl_matrix_1.vec3.create(), rotation = gl_matrix_1.vec3.create(), scale = gl_matrix_1.vec3.fromValues(1.0, 1.0, 1.0), texture_diffuse = undefined, texture_specular = undefined, texture_normal = undefined, texture_emissive = undefined, }) {
        this.get_model_matrix = () => {
            // Note these operations appear in reverse order because they are right multiplied
            const model_matrix = gl_matrix_1.mat4.create();
            gl_matrix_1.mat4.translate(model_matrix, model_matrix, this.position);
            gl_matrix_1.mat4.rotateX(model_matrix, model_matrix, this.rotation[0]);
            gl_matrix_1.mat4.rotateY(model_matrix, model_matrix, this.rotation[1]);
            gl_matrix_1.mat4.rotateZ(model_matrix, model_matrix, this.rotation[2]);
            gl_matrix_1.mat4.scale(model_matrix, model_matrix, this.scale);
            return model_matrix;
        };
        this.get_model_data = () => __awaiter(this, void 0, void 0, function* () {
            yield (0, model_loader_1.load_model)(this.model);
            return model_loader_1.models[this.model];
        });
        this.has_texture_diffuse = () => {
            return this.texture_diffuse !== undefined && this.texture_diffuse !== "";
        };
        this.has_texture_specular = () => {
            return this.texture_specular !== undefined && this.texture_specular !== "";
        };
        this.has_texture_normal = () => {
            return this.texture_normal !== undefined && this.texture_normal !== "";
        };
        this.has_texture_emissive = () => {
            return this.texture_emissive !== undefined && this.texture_emissive !== "";
        };
        this.update = (scene) => __awaiter(this, void 0, void 0, function* () { });
        this.remove_from_scene = (scene) => {
            scene.objects = scene.objects.filter((object) => object !== this);
        };
        this.id = id;
        this.name = name;
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.scale = scale;
        this.model = model;
        this.texture_diffuse = texture_diffuse;
        this.texture_specular = texture_specular;
        this.texture_normal = texture_normal;
        this.texture_emissive = texture_emissive;
        this.shader_path = shader_path;
        this.pipeline = pipeline;
        this.pipeline_key = (pipeline === null || pipeline === void 0 ? void 0 : pipeline.get_pipeline_key(shader_path)) || "";
    }
}
exports.SceneObject = SceneObject;
//# sourceMappingURL=scene_object.js.map