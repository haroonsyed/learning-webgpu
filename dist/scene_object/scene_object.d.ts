import { mat4, vec3 } from "gl-matrix";
import { Scene } from "../scene/scene";
import { PipeLine } from "../pipelines/pipeline";
type SceneObjectConstructionParams = {
    id: string;
    name: string;
    scene: Scene;
    model?: string;
    shader_path?: string;
    pipeline?: typeof PipeLine;
    position?: vec3;
    velocity?: vec3;
    rotation?: vec3;
    scale?: vec3;
    texture_diffuse?: string;
    texture_specular?: string;
    texture_normal?: string;
    texture_emissive?: string;
};
declare class SceneObject {
    id: string;
    name: string;
    model: string;
    position: vec3;
    velocity: vec3;
    rotation: vec3;
    scale: vec3;
    shader_path: string;
    pipeline: typeof PipeLine | undefined;
    pipeline_key: string;
    texture_diffuse: string | undefined;
    texture_specular: string | undefined;
    texture_normal: string | undefined;
    texture_emissive: string | undefined;
    constructor({ id, name, scene, model, shader_path, pipeline, position, velocity, rotation, scale, texture_diffuse, texture_specular, texture_normal, texture_emissive, }: SceneObjectConstructionParams);
    get_model_matrix: () => mat4;
    get_model_data: () => Promise<{
        vertex_data_gpu: GPUBuffer;
        indices_gpu: GPUBuffer;
        index_count: number;
    }>;
    has_texture_diffuse: () => boolean;
    has_texture_specular: () => boolean;
    has_texture_normal: () => boolean;
    has_texture_emissive: () => boolean;
    update: (scene: Scene) => Promise<void>;
    remove_from_scene: (scene: Scene) => void;
}
export { SceneObject, SceneObjectConstructionParams };
