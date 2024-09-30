import { Default2DComputePipeLine } from "./default_2d_compute_pipeline";
import { Default3DPipeLine } from "./default_3d_pipeline";
import { PipeLine } from "./pipeline";

interface RegisteredPipelineTypes {
  [key: string]: typeof PipeLine;
}

const registered_pipeline_types: RegisteredPipelineTypes = {
  Default2DComputePipeLine,
  Default3DPipeLine,
};

export { registered_pipeline_types };
