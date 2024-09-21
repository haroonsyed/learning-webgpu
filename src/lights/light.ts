import { vec3, vec4 } from "gl-matrix";
import { SceneObject } from "../scene_object/scene_object";

class Light extends SceneObject {
  color: vec4;

  constructor(
    id: string,
    name: string,
    position: vec3,
    color: vec3 = vec3.fromValues(1.0, 1.0, 1.0),
    intensity: number = 1.0
  ) {
    super({
      id,
      name,
      model: "",
      position,
    });
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
