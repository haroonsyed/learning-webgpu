import { Scene } from "../scene/scene";
import { PipeLine } from "./pipeline";
declare class Default3DPipeLine extends PipeLine {
    model_transforms: GPUBuffer | undefined;
    uniform_buffer: GPUBuffer | undefined;
    static get_pipeline_label(): string;
    static construct_pipeline(shader_path: string, scene: Scene): Promise<Default3DPipeLine>;
    render(scene: Scene): Promise<void>;
}
export { Default3DPipeLine };
