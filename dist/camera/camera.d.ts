import { mat4, vec3 } from "gl-matrix";
import { SceneObject, SceneObjectConstructionParams } from "../scene_object/scene_object";
import { Scene } from "../scene/scene";
declare enum CameraMovementMode {
    ROTATE_ORIGIN = 0,
    FREE = 1,
    FIXED = 2
}
type CameraConstructionParams = {
    look_at_target?: vec3;
} & SceneObjectConstructionParams;
declare class Camera extends SceneObject {
    up: vec3;
    look_at_target: vec3;
    movement_mode: CameraMovementMode;
    rotation_speed: number;
    movement_speed: number;
    mouse_sensitivity: number;
    constructor({ look_at_target, ...super_args }: CameraConstructionParams);
    look_at: (target: vec3) => void;
    get_camera_forward: () => vec3;
    get_camera_right: () => vec3;
    get_view_matrix: () => mat4;
    get_projection_matrix: (aspect?: number) => mat4;
    update: (scene: Scene) => Promise<void>;
}
export { Camera };
