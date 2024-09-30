import { Scene } from "../scene/scene";
import { SystemConfigType } from "./system_config";
import { SystemInputHandler } from "./system_input";
declare class SystemCore {
    static scenes: Scene[];
    static config: SystemConfigType;
    static adapter: GPUAdapter;
    static device: GPUDevice;
    static command_encoder: GPUCommandEncoder;
    static system_input: SystemInputHandler;
    static start(): Promise<void>;
    static init_webgpu(): Promise<void>;
    static event_loop(): Promise<void>;
}
export { SystemCore };
