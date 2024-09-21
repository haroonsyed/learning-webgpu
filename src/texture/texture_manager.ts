import { globals } from "../globals";
import { SystemCore } from "../system/system_core";

class TextureManager {
  textures: { [key: string]: GPUTexture };
  empty_texture: GPUTexture;

  constructor() {
    this.textures = {};
    this.empty_texture = this.get_default_texture();
  }

  get_default_texture() {
    return SystemCore.device.createTexture({
      size: [1, 1],
      format: globals.presentation_format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
  }

  async load_texture(texture_path: string | undefined) {
    if (texture_path === undefined || texture_path === "") {
      return this.empty_texture;
    }

    if (this.textures[texture_path]) {
      return this.textures[texture_path];
    }

    // Load the texture
    const response = await fetch(texture_path);
    const texture_blob = await response.blob();
    const texture_data = await createImageBitmap(texture_blob, {
      colorSpaceConversion: "none",
    });

    // Create gpu texture
    const texture_gpu = globals.device.createTexture({
      label: texture_path,
      format: globals.presentation_format,
      size: [texture_data.width, texture_data.height],
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Upload local texture data to gpu texture
    globals.device.queue.copyExternalImageToTexture(
      { source: texture_data },
      { texture: texture_gpu },
      [texture_data.width, texture_data.height]
    );

    this.textures[texture_path] = texture_gpu;
    return texture_gpu;
  }
}

export { TextureManager };
