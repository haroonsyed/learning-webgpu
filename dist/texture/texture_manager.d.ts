declare class TextureManager {
    textures: {
        [key: string]: GPUTexture;
    };
    empty_texture: GPUTexture;
    constructor();
    get_default_texture(): GPUTexture;
    load_texture(texture_path: string | undefined, format?: GPUTextureFormat): Promise<GPUTexture>;
}
export { TextureManager };
//# sourceMappingURL=texture_manager.d.ts.map