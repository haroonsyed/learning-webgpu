import { ComputeObject } from "../compute/compute_object";
import { Scene } from "../scene/scene";
import { SystemCore } from "../system/system_core";
import { PipeLine } from "./pipeline";

class Default2DComputePipeLine extends PipeLine {
  static get_pipeline_label(): string {
    return "default_2d_compute";
  }

  // Necessary to construct asynchonously
  static async construct_pipeline(shader_path: string, scene: Scene) {
    const shader = await scene.shader_manager.get_shader(shader_path);
    const { device } = SystemCore;

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

    return new Default2DComputePipeLine(shader_path, pipeline);
  }

  async render(scene: Scene): Promise<void> {
    const pipeline_key = Default2DComputePipeLine.get_pipeline_key(
      this.shader_path
    );

    // Get relevant scene objects
    const relevant_compute_objects = scene.objects.filter(
      (object) => object.pipeline_key === pipeline_key
    );

    if (relevant_compute_objects.length === 0 || !scene.texture_view) {
      return;
    }

    const compute_pass = SystemCore.command_encoder.beginComputePass();
    compute_pass.setPipeline(this.gpu_pipeline as GPUComputePipeline);

    const default_bindgroup_descriptor: GPUBindGroupDescriptor = {
      layout: this.gpu_pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: scene.texture_view,
        },
      ],
    };
    compute_pass.setBindGroup(
      0,
      SystemCore.device.createBindGroup(default_bindgroup_descriptor)
    );

    relevant_compute_objects.forEach((obj) => {
      const compute_obj = obj as ComputeObject;
      compute_pass.dispatchWorkgroups(
        compute_obj.workgroup_size[0],
        compute_obj.workgroup_size[1],
        compute_obj.workgroup_size[2]
      );
    });

    compute_pass.end();
    return;
  }
}

export { Default2DComputePipeLine };
