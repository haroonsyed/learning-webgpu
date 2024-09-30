declare class ShaderManager {
    shaders: Map<string, string>;
    get_shader: (shader_path: string) => Promise<string>;
    get_registered_shader: (shader_path: string) => string | undefined;
}
export { ShaderManager };
