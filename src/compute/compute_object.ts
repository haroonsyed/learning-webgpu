import { PipeLine } from "../pipelines/pipeline_manager";
import {
  SceneObject,
  SceneObjectConstructionParams,
} from "../scene_object/scene_object";

type ComputeObjectConstructionParams = SceneObjectConstructionParams & {
  workgroup_size: [number, number, number];
};

class ComputeObject extends SceneObject {
  workgroup_size: [number, number, number];

  constructor(params: ComputeObjectConstructionParams) {
    super(params);
    this.workgroup_size = params.workgroup_size;
  }
}

export { ComputeObject };
