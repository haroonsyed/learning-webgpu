import { Camera } from "../camera/camera";
import { Light } from "../lights/light";
import { PipeLineManager } from "../pipelines/pipeline_manager";
import { ShaderManager } from "../pipelines/shader_manager";
import { SceneObject } from "../scene_object/scene_object";
import { GameEventSystem } from "../system/event_system";
import { TextureManager } from "../texture/texture_manager";
declare class Scene {
    active: boolean;
    current_frame: number;
    event_system: GameEventSystem;
    texture_manager: TextureManager;
    pipeline_manager: PipeLineManager;
    shader_manager: ShaderManager;
    canvas?: HTMLCanvasElement;
    texture_view?: GPUTextureView;
    depth_texture_view?: GPUTextureView;
    presentation_format: GPUTextureFormat;
    lights: Light[];
    camera: Camera;
    objects: SceneObject[];
    constructor(scene_path?: string, canvas_id?: string);
    load_scene: (scene_path: string, scene: Scene) => Promise<void>;
    resize_scene: () => void;
    add_light: (light: Light) => void;
    add_object: (object: SceneObject) => void;
    frame_start: () => Promise<void>;
    frame_end: () => Promise<void>;
    update: () => Promise<void>;
    render: () => Promise<void>;
}
export { Scene };
