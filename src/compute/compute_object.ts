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
    const scene_width = params.scene.canvas?.width || 1;
    const scene_height = params.scene.canvas?.height || 1;
    this.workgroup_size = [
      this.parse_workgroup_size(
        params.workgroup_size[0],
        scene_width,
        scene_height
      ),
      this.parse_workgroup_size(
        params.workgroup_size[1],
        scene_width,
        scene_height
      ),
      this.parse_workgroup_size(
        params.workgroup_size[2],
        scene_width,
        scene_height
      ),
    ];
  }

  parse_workgroup_size = (
    dimension: string | number,
    canvas_width: number,
    canvas_height: number
  ) => {
    if (typeof dimension === "string") {
      switch (dimension) {
        case "canvas_width":
          return canvas_width;
        case "canvas_height":
          return canvas_height;
        default:
          return 1;
      }
    } else {
      return dimension;
    }
  };
}

export { ComputeObject };
