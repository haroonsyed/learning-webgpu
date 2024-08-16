import { mat4, vec3 } from "gl-matrix";
import { SceneObject } from "../scene_object/scene_object";
import { globals } from "../globals";
import { Scene } from "../scene/scene";

enum CameraMovementMode {
  ROTATE_ORIGIN,
  FREE,
  FIXED,
}

class Camera extends SceneObject {
  up: vec3 = vec3.fromValues(0.0, 1.0, 0.0);
  look_at_target: vec3 = vec3.create();
  movement_mode: CameraMovementMode = CameraMovementMode.ROTATE_ORIGIN;
  rotation_speed: number = 1e-2;
  movement_speed: number = 1e-2;
  mouse_sensitivity: number = 1e-3;

  constructor(
    id: string,
    name: string,
    position: vec3 = vec3.fromValues(2.0, 2.0, 4.0)
  ) {
    super({
      id,
      name,
      model: "",
      position,
    });
    this.look_at(vec3.fromValues(0.0, 0.0, 0.0));
  }

  look_at = (target: vec3) => {
    this.look_at_target = target;
  };

  get_camera_forward = () => {
    return vec3.normalize(
      vec3.create(),
      vec3.subtract(vec3.create(), this.look_at_target, this.position)
    );
  };

  get_camera_right = () => {
    return vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), this.get_camera_forward(), this.up)
    );
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
    mat4.perspective(projection, Math.PI / 4, aspect, 0.1, 1000.0);
    return projection;
  };

  update = async (scene: Scene) => {
    if (globals.key_press.get("`")) {
      console.log("toggling camera mode");
      if (this.movement_mode === CameraMovementMode.ROTATE_ORIGIN) {
        // Enable pointer lock
        this.movement_mode = CameraMovementMode.FREE;
        // document.body.requestPointerLock();
        globals.canvas.requestPointerLock();
      } else if (this.movement_mode === CameraMovementMode.FREE) {
        // Disable pointer lock
        document.exitPointerLock();
        this.movement_mode = CameraMovementMode.FIXED;
      } else if (this.movement_mode === CameraMovementMode.FIXED) {
        this.movement_mode = CameraMovementMode.ROTATE_ORIGIN;
      }
    }

    if (this.movement_mode === CameraMovementMode.ROTATE_ORIGIN) {
      if (globals.key_state.get("a") || globals.key_state.get("d")) {
        const frame_rotation_speed = globals.key_state.get("a")
          ? this.rotation_speed
          : -this.rotation_speed;
        const rotation_matrix = mat4.create();
        mat4.translate(rotation_matrix, rotation_matrix, this.look_at_target);
        mat4.rotateY(rotation_matrix, rotation_matrix, frame_rotation_speed);
        mat4.translate(
          rotation_matrix,
          rotation_matrix,
          vec3.negate(vec3.create(), this.look_at_target)
        );

        vec3.transformMat4(this.position, this.position, rotation_matrix);
      }
    } else if (this.movement_mode === CameraMovementMode.FREE) {
      if (globals.mouse_state.dx || globals.mouse_state.dy) {
        const camera_forward = this.get_camera_forward();
        const camera_right = this.get_camera_right();
        const dx = globals.mouse_state.dx * this.mouse_sensitivity;
        const dy = globals.mouse_state.dy * this.mouse_sensitivity;

        const rotation_matrix = mat4.create();
        mat4.rotate(rotation_matrix, rotation_matrix, -dx, this.up);
        mat4.rotate(rotation_matrix, rotation_matrix, -dy, camera_right);

        vec3.transformMat4(this.position, this.position, rotation_matrix);

        const new_camera_forward = this.get_camera_forward();
        const new_camera_right = this.get_camera_right();

        vec3.add(this.look_at_target, this.position, new_camera_forward);
      }

      if (globals.key_state.get("w") || globals.key_state.get("s")) {
        const frame_translation_speed = globals.key_state.get("w")
          ? this.movement_speed
          : -this.movement_speed;
        const forward = this.get_camera_forward();
        vec3.scale(forward, forward, frame_translation_speed);
        vec3.add(this.position, this.position, forward);
        vec3.add(this.look_at_target, this.look_at_target, forward);
      }

      if (globals.key_state.get("a") || globals.key_state.get("d")) {
        const frame_translation_speed = globals.key_state.get("a")
          ? -this.movement_speed
          : this.movement_speed;
        const right = this.get_camera_right();
        vec3.scale(right, right, frame_translation_speed);
        vec3.add(this.position, this.position, right);
        vec3.add(this.look_at_target, this.look_at_target, right);
      }
    } else if (this.movement_mode === CameraMovementMode.FIXED) {
    }
  };
}

export { Camera };
