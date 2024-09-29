import { vec3, vec4 } from "gl-matrix";
import {
  SceneObject,
  SceneObjectConstructionParams,
} from "../scene_object/scene_object";

type LightConstructionParams = {
  color?: vec3;
  intensity?: number;
} & SceneObjectConstructionParams;

class Light extends SceneObject {
  color: vec4;

  constructor({
    color = vec3.fromValues(1.0, 1.0, 1.0),
    intensity = 1.0,
    ...super_args
  }: LightConstructionParams) {
    super(super_args);
    this.color = vec4.fromValues(color[0], color[1], color[2], intensity);
  }

  get_uniform_data = () => {
    return {
      position: [...this.position, 0.0],
      color: this.color,
    };
  };
}

export { Light };
