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
exports.ShaderManager = void 0;
class ShaderManager {
    constructor() {
        this.shaders = new Map(); // shader_name -> shader
        this.get_shader = (shader_path) => __awaiter(this, void 0, void 0, function* () {
            if (!this.shaders.has(shader_path)) {
                const response = yield fetch(shader_path);
                this.shaders.set(shader_path, yield response.text());
            }
            return this.shaders.get(shader_path);
        });
        this.get_registered_shader = (shader_path) => {
            return this.shaders.get(shader_path);
        };
    }
}
exports.ShaderManager = ShaderManager;
//# sourceMappingURL=shader_manager.js.map