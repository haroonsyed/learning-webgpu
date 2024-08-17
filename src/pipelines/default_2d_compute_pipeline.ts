import { ComputeObject } from "../compute/compute_object";
import { globals } from "../globals";
import { Scene } from "../scene/scene";
import { get_shader, PipeLine } from "./pipeline_manager";

class Default2DComputePipeLine extends PipeLine {
  static pipeline_key: string = "default_2d_compute";

  // Necessary to construct asynchonously
  protected static async construct_pipeline(shader_path: string) {
    const shader = await get_shader(shader_path);
    const { device, presentation_format } = globals;

    const module = device.createShaderModule({
      code: shader,
    });

    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: {
        module,
        entryPoint: "main",
      },
    });

    return new Default2DComputePipeLine(
      Default2DComputePipeLine.pipeline_label,
      shader_path,
      pipeline
    );
  }

  async render(scene: Scene): Promise<void> {
    // Get relevant scene objects
    const relevant_compute_objects = scene.objects.filter(
      (object) =>
        PipeLine.get_pipeline_key(
          object.shader_path ?? "",
          object.pipeline.pipeline_label ?? ""
        ) === this.pipeline_key
    );

    if (relevant_compute_objects.length === 0) {
      return;
    }

    globals.compute_pass = globals.command_encoder.beginComputePass();
    globals.compute_pass.setPipeline(this.gpu_pipeline as GPUComputePipeline);

    const default_bindgroup_descriptor: GPUBindGroupDescriptor = {
      layout: this.gpu_pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: globals.texture_view, // This needs to be recreated every frame
        },
      ],
    };
    globals.compute_pass.setBindGroup(
      0,
      globals.device.createBindGroup(default_bindgroup_descriptor)
    );

    relevant_compute_objects.forEach((obj) => {
      const compute_obj = obj as ComputeObject;
      globals.compute_pass.dispatchWorkgroups(
        compute_obj.workgroup_size[0],
        compute_obj.workgroup_size[1],
        compute_obj.workgroup_size[2]
      );
    });

    globals.compute_pass.end();
    return;
  }
}

export { Default2DComputePipeLine };
