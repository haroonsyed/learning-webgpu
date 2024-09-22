import { Scene } from "../scene/scene";
import { PipeLine } from "./pipeline";

class PipeLineManager {
  registered_pipelines = new Map<string, PipeLine>(); // pipeline key (ex: shader_name + pipeline_label) -> pipeline

  register_pipeline = (
    pipeline: typeof PipeLine,
    shader_path: string,
    scene: Scene
  ) => {
    const pipeline_key = pipeline.get_pipeline_key(shader_path);
    if (this.registered_pipelines.has(pipeline_key)) {
      return;
    }

    pipeline.construct_pipeline(shader_path, scene).then((pipeline) => {
      this.registered_pipelines.set(pipeline_key, pipeline);
    });
  };

  get_registered_pipeline = (pipeline_key: string) => {
    return this.registered_pipelines.get(pipeline_key);
  };
}

export { PipeLineManager };
