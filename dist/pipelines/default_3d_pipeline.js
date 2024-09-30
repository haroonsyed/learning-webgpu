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
exports.Default3DPipeLine = void 0;
const gpu_util_1 = require("../util/gpu_util");
const system_core_1 = require("../system/system_core");
const pipeline_1 = require("./pipeline");
const DEFAULT_3D_UNIFORM_DATA_SIZE_FLOAT = 4 + 4 * 4 + 4 * 4 + 10 * 4 * 2;
const bind_group_layout_descriptor = {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform",
            },
        },
        {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: {},
        },
        {
            // Diffuse texture
            binding: 2,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {},
        },
        {
            // Specular texture
            binding: 3,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {},
        },
        {
            // Normal texture
            binding: 4,
            visibility: GPUShaderStage.FRAGMENT,
            texture: {},
        },
        {
            // Model transforms
            binding: 5,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
                type: "read-only-storage",
            },
        },
    ],
};
class Default3DPipeLine extends pipeline_1.PipeLine {
    static get_pipeline_label() {
        return "default_3d";
    }
    // Necessary to construct asynchonously
    static construct_pipeline(shader_path, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shader_manager } = scene;
            const shader = yield shader_manager.get_shader(shader_path);
            // Get globals
            const { device } = system_core_1.SystemCore;
            const { presentation_format } = scene;
            // Compile shaders used in this pipeline
            const module = device.createShaderModule({
                code: shader,
            });
            const bind_group_layout = device.createBindGroupLayout(bind_group_layout_descriptor);
            const pipeline = device.createRenderPipeline({
                label: "default_3d",
                layout: device.createPipelineLayout({
                    bindGroupLayouts: [bind_group_layout], // group 0, binding 0
                }),
                vertex: {
                    module: module,
                    buffers: [
                        {
                            arrayStride: 16 * 3,
                            attributes: [
                                {
                                    shaderLocation: 0, // Position
                                    offset: 0,
                                    format: "float32x4",
                                },
                                {
                                    shaderLocation: 1, // UV
                                    offset: 16,
                                    format: "float32x4",
                                },
                                {
                                    shaderLocation: 2, // Normal
                                    offset: 32,
                                    format: "float32x4",
                                },
                            ],
                        },
                    ],
                },
                fragment: {
                    module: module,
                    targets: [
                        {
                            format: presentation_format,
                        },
                    ],
                },
                primitive: {
                    topology: "triangle-list",
                },
                depthStencil: {
                    format: "depth24plus",
                    depthWriteEnabled: true,
                    depthCompare: "less",
                },
            });
            const default_3d_pipeline = new Default3DPipeLine(shader_path, pipeline);
            default_3d_pipeline.uniform_buffer = (0, gpu_util_1.create_gpu_buffer)(new Float32Array(DEFAULT_3D_UNIFORM_DATA_SIZE_FLOAT), GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
            return default_3d_pipeline;
        });
    }
    render(scene) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { device, command_encoder } = system_core_1.SystemCore;
            const { texture_manager, texture_view, depth_texture_view } = scene;
            const pipeline_key = Default3DPipeLine.get_pipeline_key(this.shader_path);
            // Get relevant scene objects
            // Potentially slow to filter objects this way
            // Change to store objects in scene structured by pipeline key (and more filters like texture)
            const relevant_scene_objects = scene.objects.filter((object) => object.pipeline_key === pipeline_key);
            if (relevant_scene_objects.length === 0 ||
                !texture_view ||
                !depth_texture_view) {
                return;
            }
            const render_pass = command_encoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: texture_view,
                        clearValue: [0.0, 0.0, 0.0, 1],
                        loadOp: "clear",
                        storeOp: "store",
                    },
                ],
                depthStencilAttachment: {
                    view: depth_texture_view,
                    depthClearValue: 1.0,
                    stencilClearValue: 0,
                    depthLoadOp: "clear",
                    depthStoreOp: "store",
                },
            });
            render_pass.setPipeline(this.gpu_pipeline);
            // Get textures
            // For now I will render with same texture
            // I will need to solve this with bindless textures, 2d array, dynamically creating an atlas etc.
            const object_0 = relevant_scene_objects[0];
            const has_texture_diffuse = object_0.has_texture_diffuse() ? 1.0 : 0.0;
            const has_texture_specular = object_0.has_texture_specular() ? 1.0 : 0.0;
            const has_texture_normal = object_0.has_texture_normal() ? 1.0 : 0.0;
            const texture_diffuse = yield texture_manager.load_texture(object_0.texture_diffuse);
            const texture_specular = yield texture_manager.load_texture(object_0.texture_specular);
            const texture_normal = yield texture_manager.load_texture(object_0.texture_normal);
            // Setup the model transforms
            const model_transforms = new Float32Array(relevant_scene_objects.flatMap((obj) => [...obj.get_model_matrix()]));
            const needed_model_transform_size = relevant_scene_objects.length * 16 * 4;
            const current_model_transforms_size = (_b = (_a = this.model_transforms) === null || _a === void 0 ? void 0 : _a.size) !== null && _b !== void 0 ? _b : 0;
            // Be careful, could lead to a mem leak. Maybe add a 1/2 buffer reduction.
            if (needed_model_transform_size > current_model_transforms_size) {
                (_c = this.model_transforms) === null || _c === void 0 ? void 0 : _c.destroy();
                this.model_transforms = (0, gpu_util_1.create_gpu_buffer)(model_transforms, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
            }
            else {
                // Just write the data
                device.queue.writeBuffer(this.model_transforms, 0, model_transforms);
            }
            // Setup the uniform data
            const uniform_data = new Float32Array([
                has_texture_diffuse,
                has_texture_specular,
                has_texture_normal,
                scene.lights.length,
                ...scene.camera.get_view_matrix(),
                ...scene.camera.get_projection_matrix(),
                ...scene.lights.reduce((acc, light) => acc.concat([...light.position, 0.0, ...light.color]), []),
            ]);
            device.queue.writeBuffer(this.uniform_buffer, 0, uniform_data);
            // Setup bindgroup
            const bindgroup_descriptor = {
                layout: this.gpu_pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.uniform_buffer,
                            offset: 0,
                            size: this.uniform_buffer.size,
                        },
                    },
                    {
                        binding: 1,
                        resource: device.createSampler({}),
                    },
                    {
                        // Diffuse texture
                        binding: 2,
                        resource: texture_diffuse.createView(),
                    },
                    {
                        // Specular texture
                        binding: 3,
                        resource: texture_specular.createView(),
                    },
                    {
                        // Normal texture
                        binding: 4,
                        resource: texture_normal.createView(),
                    },
                    {
                        // Model transforms
                        binding: 5,
                        resource: {
                            buffer: this.model_transforms,
                            offset: 0,
                            size: this.model_transforms.size,
                        },
                    },
                ],
            };
            render_pass.setBindGroup(0, device.createBindGroup(bindgroup_descriptor)); // Is this expensive?
            // Render each object
            const { vertex_data_gpu, indices_gpu, index_count } = yield object_0.get_model_data();
            render_pass.setVertexBuffer(0, vertex_data_gpu);
            render_pass.setIndexBuffer(indices_gpu, "uint32");
            render_pass.drawIndexed(index_count, relevant_scene_objects.length, 0, 0, 0);
            render_pass.end();
        });
    }
}
exports.Default3DPipeLine = Default3DPipeLine;
//# sourceMappingURL=default_3d_pipeline.js.map