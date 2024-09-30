import { vec3, vec4 } from "gl-matrix";
import { SceneObject, SceneObjectConstructionParams } from "../scene_object/scene_object";
type LightConstructionParams = {
    color?: vec3;
    intensity?: number;
} & SceneObjectConstructionParams;
declare class Light extends SceneObject {
    color: vec4;
    constructor({ color, intensity, ...super_args }: LightConstructionParams);
    get_uniform_data: () => {
        position: number[];
        color: vec4;
    };
}
export { Light };
