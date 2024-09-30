import { Scene } from "../scene/scene";
declare abstract class PipeLine {
    shader_path: string;
    gpu_pipeline: GPURenderPipeline | GPUComputePipeline;
    order: number;
    constructor(shader_path: string, gpu_pipeline: GPURenderPipeline | GPUComputePipeline, priority?: number);
    static get_pipeline_key(shader_path: string): string;
    static get_pipeline_label(): string;
    static construct_pipeline(shader_path: string, scene: Scene): Promise<PipeLine>;
    abstract render(scene: Scene): Promise<void>;
}
export { PipeLine };
//# sourceMappingURL=pipeline.d.ts.map