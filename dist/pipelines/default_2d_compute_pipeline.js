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
exports.Default2DComputePipeLine = void 0;
const system_core_1 = require("../system/system_core");
const pipeline_1 = require("./pipeline");
class Default2DComputePipeLine extends pipeline_1.PipeLine {
    static get_pipeline_label() {
        return "default_2d_compute";
    }
    // Necessary to construct asynchonously
    static construct_pipeline(shader_path, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            const shader = yield scene.shader_manager.get_shader(shader_path);
            const { device } = system_core_1.SystemCore;
            const module = device.createShaderModule({
                code: shader,
            });
            const pipeline = device.createComputePipeline({
                layout: "auto",
                compute: {
                    module,
                    entryPoint: "main",
                },
            });
            return new Default2DComputePipeLine(shader_path, pipeline);
        });
    }
    render(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline_key = Default2DComputePipeLine.get_pipeline_key(this.shader_path);
            // Get relevant scene objects
            const relevant_compute_objects = scene.objects.filter((object) => object.pipeline_key === pipeline_key);
            if (relevant_compute_objects.length === 0 || !scene.texture_view) {
                return;
            }
            const compute_pass = system_core_1.SystemCore.command_encoder.beginComputePass();
            compute_pass.setPipeline(this.gpu_pipeline);
            const default_bindgroup_descriptor = {
                layout: this.gpu_pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: scene.texture_view,
                    },
                ],
            };
            compute_pass.setBindGroup(0, system_core_1.SystemCore.device.createBindGroup(default_bindgroup_descriptor));
            relevant_compute_objects.forEach((obj) => {
                const compute_obj = obj;
                compute_pass.dispatchWorkgroups(compute_obj.workgroup_size[0], compute_obj.workgroup_size[1], compute_obj.workgroup_size[2]);
            });
            compute_pass.end();
            return;
        });
    }
}
exports.Default2DComputePipeLine = Default2DComputePipeLine;
//# sourceMappingURL=default_2d_compute_pipeline.js.map