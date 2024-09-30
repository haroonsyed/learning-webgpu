import { Scene } from "../scene/scene";
import { PipeLine } from "./pipeline";
declare class Default2DComputePipeLine extends PipeLine {
    static get_pipeline_label(): string;
    static construct_pipeline(shader_path: string, scene: Scene): Promise<Default2DComputePipeLine>;
    render(scene: Scene): Promise<void>;
}
export { Default2DComputePipeLine };
