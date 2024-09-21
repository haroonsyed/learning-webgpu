import { Scene } from "../scene/scene";

abstract class PipeLine {
  shader_path: string;
  gpu_pipeline: GPURenderPipeline | GPUComputePipeline;
  pipeline_key: string;
  order: number;

  constructor(
    shader_path: string,
    gpu_pipeline: GPURenderPipeline | GPUComputePipeline,
    priority: number = 0
  ) {
    this.shader_path = shader_path;
    this.order = priority;
    this.gpu_pipeline = gpu_pipeline;
    this.pipeline_key = `${shader_path}+${this.constructor.name}`;
  }

  // A pipeline can take whatever data it needs from the scene and render internally.
  // The reason it isn't per object is because the pipeline will add all objects to a vbo and render them all at once.
  abstract render(scene: Scene): Promise<void>;
}

export { PipeLine };
