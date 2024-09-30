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
exports.Scene = void 0;
const camera_1 = require("../camera/camera");
const light_1 = require("../lights/light");
const pipeline_manager_1 = require("../pipelines/pipeline_manager");
const shader_manager_1 = require("../pipelines/shader_manager");
const event_enums_1 = require("../system/event_enums");
const event_system_1 = require("../system/event_system");
const system_core_1 = require("../system/system_core");
const texture_manager_1 = require("../texture/texture_manager");
const registered_scene_object_types_1 = require("../scene_object/registered_scene_object_types");
const registered_pipeline_types_1 = require("../pipelines/registered_pipeline_types");
class Scene {
    // TODO: Load scene from file
    // A scene will have resource managers that will load/cache resources (textures, pipelines, shaders, models etc). Unloading a scene will unload all resources cleanly.
    // In other words, resource managers should not be static, rather classes that are instantiated per scene.
    constructor(scene_path = "", canvas_id = "canvas") {
        this.active = true;
        this.current_frame = 0;
        this.event_system = new event_system_1.GameEventSystem();
        this.texture_manager = new texture_manager_1.TextureManager();
        this.pipeline_manager = new pipeline_manager_1.PipeLineManager();
        this.shader_manager = new shader_manager_1.ShaderManager();
        this.presentation_format = "rgba8unorm"; // Change this if you want HDR or something else. I am sticking with this as its most supported.
        this.lights = [];
        this.camera = new camera_1.Camera({
            id: "-1",
            name: "camera",
            scene: this,
        });
        this.objects = [];
        this.load_scene = (scene_path, scene) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Loading scene from: ${scene_path}`);
            try {
                const response = yield fetch(scene_path);
                const scene_data = (yield response.json());
                // Init Canvas
                const canvas_id = scene_data.canvas || "canvas";
                this.canvas = document.getElementById(canvas_id);
                this.resize_scene();
                if (!this.canvas) {
                    alert("Canvas not found");
                    throw new Error("Canvas not found");
                }
                const context = this.canvas.getContext("webgpu");
                if (!context) {
                    alert("WebGPU not supported");
                    throw new Error("WebGPU not supported");
                }
                context.configure({
                    device: system_core_1.SystemCore.device,
                    format: this.presentation_format,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING, // Added storage binding for direct output for compute shaders
                });
                // Construct the scene objects
                const scene_objects_path = "objects";
                scene_data[scene_objects_path].forEach((object_data) => {
                    const { type, pipeline } = object_data, args = __rest(object_data, ["type", "pipeline"]);
                    const object_type = registered_scene_object_types_1.registered_scene_object_types[type];
                    if (object_type) {
                        // For now we treat lights, camera and object differently because of the way UBO is loaded.
                        // But in future it should be generic, and such distinction should be handled by the pipeline.
                        const object = new object_type(Object.assign(Object.assign({}, args), { scene: this, pipeline: pipeline && registered_pipeline_types_1.registered_pipeline_types[pipeline] }));
                        if (object instanceof camera_1.Camera) {
                            scene.camera = object;
                        }
                        else if (object instanceof light_1.Light) {
                            scene.add_light(object);
                        }
                        else {
                            scene.add_object(object);
                        }
                    }
                    else {
                        console.error(`Unrecognized object type: ${type}, did you add it to the registered types file?`);
                    }
                });
            }
            catch (error) {
                console.error(`Error loading scene: ${error}`);
            }
        });
        this.resize_scene = () => {
            var _a;
            const rect = (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            if (this.canvas && rect) {
                this.canvas.width = rect.width;
                this.canvas.height = rect.height;
                this.depth_texture_view = system_core_1.SystemCore.device
                    .createTexture({
                    label: "Depth Texture",
                    size: {
                        width: this.canvas.width,
                        height: this.canvas.height,
                        depthOrArrayLayers: 1,
                    },
                    format: "depth24plus",
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                })
                    .createView();
            }
        };
        this.add_light = (light) => {
            this.lights.push(light);
        };
        this.add_object = (object) => {
            this.objects.push(object);
            if (object.pipeline) {
                this.pipeline_manager.register_pipeline(object.pipeline, object.shader_path, this);
            }
        };
        this.frame_start = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.active) {
                return;
            }
            const context = (_a = this.canvas) === null || _a === void 0 ? void 0 : _a.getContext("webgpu");
            if (!context) {
                return;
            }
            // Initialize render textures for this frame
            this.texture_view = context.getCurrentTexture().createView();
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_FRAME_START);
        });
        this.frame_end = () => __awaiter(this, void 0, void 0, function* () {
            this.current_frame++;
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_FRAME_END);
        });
        this.update = () => __awaiter(this, void 0, void 0, function* () {
            if (system_core_1.SystemCore.system_input.key_press.get("q") || !this.active) {
                this.active = false;
                console.log("Ending scene...");
                // TODO: Should probably publish something about scene end
                return;
            }
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_UPDATE_START);
            const update_promises = [...this.objects, ...this.lights, this.camera].map((object) => object.update(this));
            yield Promise.all(update_promises);
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_UPDATE_END);
        });
        this.render = () => __awaiter(this, void 0, void 0, function* () {
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_RENDER_START);
            const unique_pipelines = Array.from(this.pipeline_manager.registered_pipelines.values());
            const ordered_pipelines = unique_pipelines.reduce((acc, pipeline) => {
                const order = pipeline.order;
                if (!acc.has(order)) {
                    acc.set(order, []);
                }
                acc.get(order).push(pipeline);
                return acc;
            }, new Map());
            const ordered_keys = Array.from(ordered_pipelines.keys()).sort();
            for (const key of ordered_keys) {
                const pipelines = ordered_pipelines.get(key);
                const render_promises = pipelines.map((pipeline) => pipeline.render(this));
                yield Promise.all(render_promises);
            }
            yield this.event_system.publish(event_enums_1.EventEnum.SCENE_RENDER_END);
        });
        // Init scene from file...
        this.load_scene(scene_path, this).then(() => {
            // Register listeners
            window.addEventListener("resize", this.resize_scene);
            this.event_system.subscribe(event_enums_1.EventEnum.SCENE_FRAME_START, this.update);
            this.event_system.subscribe(event_enums_1.EventEnum.SCENE_UPDATE_END, this.render);
            this.event_system.subscribe(event_enums_1.EventEnum.SCENE_RENDER_END, this.frame_end);
        });
    }
}
exports.Scene = Scene;
//# sourceMappingURL=scene.js.map