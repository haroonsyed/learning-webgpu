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
exports.SystemCore = void 0;
const scene_1 = require("../scene/scene");
const system_input_1 = require("./system_input");
// I only intend on having one system, so this class will be static.
// Simplifies access, and may have performance benefits.
class SystemCore {
    static start() {
        return __awaiter(this, void 0, void 0, function* () {
            // Init WebGPU
            yield SystemCore.init_webgpu();
            // Setup core systems
            const config_path = "./system_core_config.json";
            SystemCore.config = yield (yield fetch(config_path)).json();
            SystemCore.system_input = new system_input_1.SystemInputHandler();
            // For now we have one scene
            SystemCore.scenes.push(new scene_1.Scene(SystemCore.config.start_scene));
            // Kick off event loop
            console.log("SystemCore initialized, starting event loop...");
            SystemCore.event_loop();
        });
    }
    static init_webgpu() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Get device
            const adapter = yield ((_a = navigator.gpu) === null || _a === void 0 ? void 0 : _a.requestAdapter());
            const device = yield (adapter === null || adapter === void 0 ? void 0 : adapter.requestDevice());
            if (!adapter || !device) {
                alert("WebGPU not supported");
                throw new Error("WebGPU not supported");
            }
            // Set system variables
            SystemCore.adapter = adapter;
            SystemCore.device = device;
        });
    }
    static event_loop() {
        return __awaiter(this, void 0, void 0, function* () {
            SystemCore.command_encoder = SystemCore.device.createCommandEncoder(); // Reset command encoder
            // Update scenes
            yield Promise.all(this.scenes.map((scene) => scene.frame_start()));
            SystemCore.device.queue.submit([SystemCore.command_encoder.finish()]); // Submit render commands to GPU
            requestAnimationFrame(() => SystemCore.event_loop());
            this.system_input.reset();
        });
    }
}
exports.SystemCore = SystemCore;
SystemCore.scenes = [];
//# sourceMappingURL=system_core.js.map