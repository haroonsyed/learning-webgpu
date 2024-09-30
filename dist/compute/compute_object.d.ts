import { SceneObject, SceneObjectConstructionParams } from "../scene_object/scene_object";
type ComputeObjectConstructionParams = SceneObjectConstructionParams & {
    workgroup_size: [number, number, number];
};
declare class ComputeObject extends SceneObject {
    workgroup_size: [number, number, number];
    constructor(params: ComputeObjectConstructionParams);
    parse_workgroup_size: (dimension: string | number, canvas_width: number, canvas_height: number) => number;
}
export { ComputeObject };
//# sourceMappingURL=compute_object.d.ts.map