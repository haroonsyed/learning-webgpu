import { Camera } from "../camera/camera";
import { ComputeObject } from "../compute/compute_object";
import { Light } from "../lights/light";
import { SceneObject } from "../scene_object/scene_object";

const registered_types = {
  SceneObject,
  Light,
  Camera,
  ComputeObject,
};

export { registered_types };
