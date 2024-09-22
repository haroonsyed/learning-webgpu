import { Scene } from "../scene/scene";

abstract class PipeLine {
  shader_path: string;
  gpu_pipeline: GPURenderPipeline | GPUComputePipeline;
  order: number;

  constructor(
    shader_path: string,
    gpu_pipeline: GPURenderPipeline | GPUComputePipeline,
    priority: number = 0
  ) {
    this.shader_path = shader_path;
    this.order = priority;
    this.gpu_pipeline = gpu_pipeline;
  }

  static get_pipeline_key(shader_path: string): string {
    return `${shader_path}+${this.get_pipeline_label()}`;
  }

  static get_pipeline_label(): string {
    throw new Error(
      "Please return a unique label for your pipeline from get_pipeline_label"
    );
  }

  // So this is interesting because it is abstract (workaround via error) and static. Not something possible in java lol.
  //
  // Why static?
  //  This is a builder for actual implementations and gives you the instance.
  //
  // Why not just a constructor/inheritance?
  // Because constructors cannot be async, so I have to use a static async function to build the pipeline.
  //  The alternative is to have the constructor of derived class call the async function with a flag that the pipeline is ready...but I don't want to check flags.
  //
  // Why abstract?
  // I want this abstract because every pipeline will have a unique layout and construction requirements, so I have to defer the implementation.
  // Still thinking of a better way to do this...trickiest part of the code rn
  //
  static async construct_pipeline(
    shader_path: string,
    scene: Scene
  ): Promise<PipeLine> {
    throw new Error(
      "Please implement logic for creating your pipeline, make sure to call super() so the pipeline is registered."
    );
  }

  // A pipeline can take whatever data it needs from the scene and render internally.
  // The reason it isn't per object is because the pipeline will add all objects to a vbo and render them all at once.
  abstract render(scene: Scene): Promise<void>;
}

export { PipeLine };
