"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeLineManager = void 0;
class PipeLineManager {
    constructor() {
        this.registered_pipelines = new Map(); // pipeline key (ex: shader_name + pipeline_label) -> pipeline
        this.register_pipeline = (pipeline, shader_path, scene) => {
            const pipeline_key = pipeline.get_pipeline_key(shader_path);
            if (this.registered_pipelines.has(pipeline_key)) {
                return;
            }
            pipeline.construct_pipeline(shader_path, scene).then((pipeline) => {
                this.registered_pipelines.set(pipeline_key, pipeline);
            });
        };
        this.get_registered_pipeline = (pipeline_key) => {
            return this.registered_pipelines.get(pipeline_key);
        };
    }
}
exports.PipeLineManager = PipeLineManager;
//# sourceMappingURL=pipeline_manager.js.map