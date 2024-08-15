const registered_pipelines = new Map<string, PipeLine>(); // shader_name + pipeline_label -> pipeline

const registered_pipeline_constructors = new Map<
  string,
  (shader_path: string, shader: string) => PipeLine
>(); // pipeline_construct(shader)=> pipeline
const shaders = new Map<string, string>(); // shader_name -> shader

const get_shader = async (shader_path: string) => {
  if (!shaders.has(shader_path)) {
    const response = await fetch(shader_path);
    shaders.set(shader_path, await response.text());
  }

  return shaders.get(shader_path)!;
};

const get_pipeline_key = (shader_path: string, pipeline_label: string) => {
  return `${shader_path}_${pipeline_label}`;
};

const get_registered_pipeline = async (
  shader_path?: string,
  pipeline_label?: string
) => {
  if (!shader_path || !pipeline_label) {
    return undefined;
  }

  const pipeline_key = get_pipeline_key(shader_path, pipeline_label);

  if (!registered_pipelines.has(pipeline_key)) {
    const shader = await get_shader(shader_path);
    const pipeline_constructor =
      registered_pipeline_constructors.get(pipeline_label);
    if (!pipeline_constructor) {
      return undefined;
    }

    registered_pipelines.set(
      pipeline_key,
      pipeline_constructor(shader_path, shader)
    );
  }

  return registered_pipelines.get(pipeline_key);
};

const register_pipeline_constructor = (
  pipeline_label: string,
  constructor: (shader_path: string, shader: string) => PipeLine
) => {
  registered_pipeline_constructors.set(pipeline_label, constructor);
};

class PipeLine {
  pipeline_label: string;
  shader: string;
  gpu_pipeline: GPURenderPipeline;
  default_bindgroup_descriptor: GPUBindGroupDescriptor;
  pipeline_key: string;

  constructor(
    pipeline_label: string,
    shader: string,
    pipeline: GPURenderPipeline,
    default_bindgroup_descriptor: GPUBindGroupDescriptor
  ) {
    this.pipeline_label = pipeline_label;
    this.shader = shader;
    this.pipeline_key = get_pipeline_key(shader, pipeline_label);
    this.gpu_pipeline = pipeline;
    this.default_bindgroup_descriptor = default_bindgroup_descriptor;
  }
}

export { PipeLine, register_pipeline_constructor, get_registered_pipeline };
