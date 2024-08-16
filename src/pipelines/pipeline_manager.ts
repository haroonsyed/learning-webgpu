import {
  pipeline_label as default_3d_label,
  construct_3d_pipeline,
} from "./default_3d_pipeline";

import {
  pipeline_label as default_2d_compute_pipeline_label,
  construct_2d_compute_pipeline,
} from "./default_2d_compute_pipeline";

// PIPELINE_CONSTRUCTORS is a map of pipeline_label -> constructor
const registered_pipeline_constructors = new Map<
  string,
  (shader_path: string, shader: string) => PipeLine
>([
  [default_3d_label, construct_3d_pipeline],
  [default_2d_compute_pipeline_label, construct_2d_compute_pipeline],
]);
const register_pipeline_constructor = (
  pipeline_label: string,
  constructor: (shader_path: string, shader: string) => PipeLine
) => {
  console.log("Registering pipeline constructor for ", pipeline_label);
  registered_pipeline_constructors.set(pipeline_label, constructor);
};

// SHADERS is a map of shader_name -> shader
const shaders = new Map<string, string>(); // shader_name -> shader
const get_shader = async (shader_path: string) => {
  if (!shaders.has(shader_path)) {
    const response = await fetch(shader_path);
    shaders.set(shader_path, await response.text());
  }

  return shaders.get(shader_path)!;
};

// PIPELINES is a map of shader_name + pipeline_label -> pipeline
const registered_pipelines = new Map<string, PipeLine>(); // shader_name + pipeline_label -> pipeline

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
      console.log("Could not find pipeline constructor for ", pipeline_label);
      console.log("Available constructors: ", registered_pipeline_constructors);
      return undefined;
    }

    // registered_pipelines.set(
    //   pipeline_key,
    //   pipeline_constructor(shader_path, shader)
    // );
    return pipeline_constructor(shader_path, shader);
  }

  return registered_pipelines.get(pipeline_key);
};

class PipeLine {
  pipeline_label: string;
  shader: string;
  gpu_pipeline: GPURenderPipeline | GPUComputePipeline;
  default_bindgroup_descriptor: GPUBindGroupDescriptor;
  pipeline_key: string;

  constructor(
    pipeline_label: string,
    shader: string,
    pipeline: GPURenderPipeline | GPUComputePipeline,
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
