import { globals } from "../globals";
import { PipeLine } from "./pipeline_manager";

const pipeline_label = "default_2d_compute";

const construct_2d_compute_pipeline = (shader_path: string, shader: string) => {
  // Get globals
  const { device, presentation_format } = globals;

  // Compile shaders used in this pipeline
  const module = device.createShaderModule({
    code: shader,
  });

  const pipeline = device.createComputePipeline({
    label: pipeline_label,
    layout: "auto",
    compute: {
      module,
      entryPoint: "main",
    },
  });

  const default_bindgroup_descriptor: GPUBindGroupDescriptor = {
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: globals.texture_view, // This needs to be recreated every frame
      },
    ],
  };

  return new PipeLine(
    pipeline_label,
    shader_path,
    pipeline,
    default_bindgroup_descriptor
  );
};

export { construct_2d_compute_pipeline, pipeline_label };
