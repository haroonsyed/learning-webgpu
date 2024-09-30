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
exports.TextureManager = void 0;
const system_core_1 = require("../system/system_core");
class TextureManager {
    constructor() {
        this.textures = {};
        this.empty_texture = this.get_default_texture();
    }
    get_default_texture() {
        return system_core_1.SystemCore.device.createTexture({
            size: [1, 1],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }
    load_texture(texture_path_1) {
        return __awaiter(this, arguments, void 0, function* (texture_path, format = "rgba8unorm") {
            if (texture_path === undefined || texture_path === "") {
                return this.empty_texture;
            }
            if (this.textures[texture_path]) {
                return this.textures[texture_path];
            }
            // Load the texture
            const response = yield fetch(texture_path);
            const texture_blob = yield response.blob();
            const texture_data = yield createImageBitmap(texture_blob, {
                colorSpaceConversion: "none",
            });
            // Create gpu texture
            const texture_gpu = system_core_1.SystemCore.device.createTexture({
                label: texture_path,
                format: format,
                size: [texture_data.width, texture_data.height],
                usage: GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            // Upload local texture data to gpu texture
            system_core_1.SystemCore.device.queue.copyExternalImageToTexture({ source: texture_data }, { texture: texture_gpu }, [texture_data.width, texture_data.height]);
            this.textures[texture_path] = texture_gpu;
            return texture_gpu;
        });
    }
}
exports.TextureManager = TextureManager;
//# sourceMappingURL=texture_manager.js.map