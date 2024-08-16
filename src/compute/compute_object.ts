import { globals } from "../globals";
import { Scene } from "../scene/scene";
import {
  SceneObject,
  SceneObjectConstructionParams,
} from "../scene_object/scene_object";

type ComputeObjectConstructionParams = SceneObjectConstructionParams & {
  compute_shader: string;
  compute_pipeline: string;
  workgroup_size: [number, number, number];
};

class ComputeObject extends SceneObject {
  workgroup_size: [number, number, number];

  constructor({
    id,
    name,
    compute_shader,
    compute_pipeline,
    workgroup_size,
  }: ComputeObjectConstructionParams) {
    super({
      id,
      name,
      model: "",
    });
    this.shader_path = compute_shader;
    this.pipeline_label = compute_pipeline;
    this.workgroup_size = workgroup_size;
  }

  set_bind_group = async (default_descriptor: GPUBindGroupDescriptor) => {
    this.bind_group = globals.device.createBindGroup({
      ...default_descriptor,
    });

    const { compute_pass } = globals;
    compute_pass.setBindGroup(0, this.bind_group);
  };

  render = async (scene: Scene) => {
    // Perform computations
    const pipeline = await this.get_pipeline();
    if (!pipeline) {
      return;
    }

    globals.compute_pass = globals.command_encoder.beginComputePass();
    globals.compute_pass.setPipeline(
      pipeline.gpu_pipeline as GPUComputePipeline
    );

    const descriptor = pipeline.default_bindgroup_descriptor;
    await this.set_bind_group(descriptor);

    globals.compute_pass.dispatchWorkgroups(
      this.workgroup_size[0],
      this.workgroup_size[1],
      this.workgroup_size[2]
    );
    globals.compute_pass.end();
  };
}

export { ComputeObject };
