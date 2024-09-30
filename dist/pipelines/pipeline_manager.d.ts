import { Scene } from "../scene/scene";
import { PipeLine } from "./pipeline";
declare class PipeLineManager {
    registered_pipelines: Map<string, PipeLine>;
    register_pipeline: (pipeline: typeof PipeLine, shader_path: string, scene: Scene) => void;
    get_registered_pipeline: (pipeline_key: string) => PipeLine | undefined;
}
export { PipeLineManager };
//# sourceMappingURL=pipeline_manager.d.ts.map