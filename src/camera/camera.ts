import { mat4, vec3 } from "gl-matrix";
import { SceneObject } from "../types/SceneObject";

class Camera extends SceneObject {
  up: vec3 = vec3.fromValues(0.0, 1.0, 0.0);
  look_at_target: vec3 = vec3.create();

  constructor(
    id: string,
    name: string,
    position: vec3 = vec3.fromValues(2.0, 2.0, 4.0)
  ) {
    super(id, name, "", position);
    this.look_at(vec3.fromValues(0.0, 0.0, 0.0));
  }

  look_at = (target: vec3) => {
    this.look_at_target = target;
  };

  get_view_matrix = () => {
    const view = mat4.create();
    mat4.translate(view, view, this.position);
    mat4.lookAt(view, this.position, this.look_at_target, this.up);
    return view;
  };

  get_projection_matrix = (aspect?: number) => {
    if (!aspect) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      aspect = width / height;
    }

    const projection = mat4.create();
    mat4.perspective(projection, Math.PI / 4, aspect, 0.1, 100.0);
    return projection;
  };
}

export { Camera };
