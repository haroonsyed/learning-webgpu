import { PipeLine } from "./pipeline";

class PipeLineManager {
  registered_pipelines = new Map<string, PipeLine>(); // pipeline key (ex: shader_name + pipeline_label) -> pipeline

  register_pipeline = (pipeline: PipeLine) => {
    this.registered_pipelines.set(pipeline.pipeline_key, pipeline);
  };

  get_registered_pipeline = (pipeline_key: string) => {
    return this.registered_pipelines.get(pipeline_key);
  };
}

export { PipeLineManager };
