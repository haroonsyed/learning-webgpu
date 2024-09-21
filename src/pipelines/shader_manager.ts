class ShaderManager {
  shaders = new Map<string, string>(); // shader_name -> shader

  get_shader = async (shader_path: string) => {
    if (!this.shaders.has(shader_path)) {
      const response = await fetch(shader_path);
      this.shaders.set(shader_path, await response.text());
    }

    return this.shaders.get(shader_path)!;
  };

  get_registered_shader = (shader_path: string) => {
    return this.shaders.get(shader_path);
  };
}

export { ShaderManager };
