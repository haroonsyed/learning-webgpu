import { globals } from "../globals";

const textures: { [key: string]: GPUTexture } = {};
let empty_texture = undefined as unknown as GPUTexture;

const get_default_texture = () => {
  if (empty_texture === undefined) {
    empty_texture = globals.device.createTexture({
      size: [1, 1],
      format: globals.presentation_format,
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
  }

  return empty_texture;
};

const load_texture = async (texture_path: string | undefined) => {
  if (texture_path === undefined || texture_path === "") {
    return get_default_texture();
  }

  if (textures[texture_path]) {
    return textures[texture_path];
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

  // Upload local texture data to gpu
  globals.device.queue.copyExternalImageToTexture(
    { source: texture_data },
    { texture: texture_gpu },
    [texture_data.width, texture_data.height]
  );

  textures[texture_path] = texture_gpu;
  return texture_gpu;
};

export { load_texture, get_default_texture };
