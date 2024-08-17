import { Scene } from "../scene/scene";

// SHADERS is a map of shader_name -> shader
const shaders = new Map<string, string>(); // shader_name -> shader
const get_shader = async (shader_path: string) => {
  if (!shaders.has(shader_path)) {
    const response = await fetch(shader_path);
    shaders.set(shader_path, await response.text());
  }

  return shaders.get(shader_path)!;
};

const registered_pipelines = new Map<string, PipeLine>(); // shader_name + pipeline_label -> pipeline

abstract class PipeLine {
  static pipeline_label: string = "default";
  shader_path: string;
  gpu_pipeline: GPURenderPipeline | GPUComputePipeline;
  pipeline_key: string;
  order: number;

  constructor(
    pipeline_label: string,
    shader_path: string,
    pipeline: GPURenderPipeline | GPUComputePipeline,
    priority: number = 0
  ) {
    this.shader_path = shader_path;
    this.pipeline_key = PipeLine.get_pipeline_key(shader_path, pipeline_label);
    this.gpu_pipeline = pipeline;
    this.order = priority;

    // Register this pipeline
    registered_pipelines.set(this.pipeline_key, this);
  }

  static get_pipeline_key = (shader_path: string, pipeline_label: string) => {
    return `${shader_path}_${pipeline_label}`;
  };

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
  //  This is only possible because of
  //
  // Why protected?
  // I need the get_pipeline function to call this so it can check cached pipelines before constructing a new one. So I don't want general consumers to see this.
  protected static async construct_pipeline(
    shader_path: string
  ): Promise<PipeLine> {
    throw new Error(
      "Please implement logic for creating your pipeline, make sure to call super() so the pipeline is registered."
    );
  }

  static async get_pipeline(pipeline: typeof PipeLine, shader_path: string) {
    // Check if pipeline is cached
    if (PipeLine.get_registered_pipeline(shader_path, pipeline.name)) {
      return PipeLine.get_registered_pipeline(shader_path, pipeline.name);
    }

    // Else construct the pipeline
    const pipeline_instance = await pipeline.construct_pipeline(shader_path);
    return pipeline_instance;
  }

  static get_registered_pipeline = (
    shader_path: string,
    pipeline_label: string
  ) => {
    return registered_pipelines.get(
      PipeLine.get_pipeline_key(shader_path, pipeline_label)
    );
  };

  // A pipeline can take whatever data it needs from the scene and render internally.
  // The reason it isn't per object is because the pipeline will add all objects to a vbo and render them all at once.
  abstract render(scene: Scene): Promise<void>;
}

export { PipeLine, get_shader };
