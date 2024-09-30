import { Camera } from "../camera/camera";
import { ComputeObject } from "../compute/compute_object";
import { Light } from "../lights/light";
import { SceneObject } from "./scene_object";

interface RegisteredTypes {
  [key: string]: typeof SceneObject;
}

const registered_scene_object_types: RegisteredTypes = {
  SceneObject,
  Light,
  Camera,
  ComputeObject,
};

export { registered_scene_object_types };
