import { mat4, vec4 } from "gl-matrix";
import { globals } from "../globals";
import { PipeLine, register_pipeline_constructor } from "./pipeline_manager";
import { create_gpu_buffer } from "../gpu_util";
import { get_default_texture } from "../texture/texture_loader";

const pipeline_label = "default_3d";

type Default3DLightUniformData = {
  position: vec4; // Includes type in the w channel (unused)
  color: vec4; // Includes intensity in the alpha channel
};

type Default3DUniformData = {
  model_matrix: mat4;
  diffuse_present: GLfloat;
  specular_present: GLfloat;
  normal_present: GLfloat;
  light_count: GLfloat;
  view_matrix: mat4;
  projection_matrix: mat4;
  lights: [
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData,
    Default3DLightUniformData
  ];
};

const DEFAULT_3D_UNIFORM_DATA_SIZE = 4 * 4 + 4 + 4 * 4 + 4 * 4 + 10 * 4 * 2;

const construct_3d_pipeline = (shader: string, shader_path: string) => {
  // Get globals
  const { device, presentation_format } = globals;

  // Compile shaders used in this pipeline
  const module = device.createShaderModule({
    code: shader,
  });

  // Specify the buffer layout (for now just ubo)
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        sampler: {},
      },
      {
        // Diffuse texture
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      {
        // Specular texture
        binding: 3,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
      {
        // Normal texture
        binding: 4,
        visibility: GPUShaderStage.FRAGMENT,
        texture: {},
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    label: "default_3d",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout], // group 0, binding 0
    }),
    vertex: {
      module: module,
      buffers: [
        {
          arrayStride: 16 * 3,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x4",
            },
            {
              shaderLocation: 1,
              offset: 16,
              format: "float32x4",
            },
            {
              shaderLocation: 2,
              offset: 32,
              format: "float32x4",
            },
          ],
        },
      ],
    },
    fragment: {
      module: module,
      targets: [
        {
          format: presentation_format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  const uniform_data_buffer = new Float32Array(DEFAULT_3D_UNIFORM_DATA_SIZE);
  const uniform_buffer = create_gpu_buffer(
    uniform_data_buffer,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  );

  const default_bindgroup_descriptor: GPUBindGroupDescriptor = {
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniform_buffer,
          offset: 0,
          size: uniform_buffer.size,
        },
      },
      {
        binding: 1,
        resource: globals.device.createSampler({}),
      },
      {
        // Diffuse texture
        binding: 2,
        resource: get_default_texture().createView(),
      },
      {
        // Specular texture
        binding: 3,
        resource: get_default_texture().createView(),
      },
      {
        // Normal texture
        binding: 4,
        resource: get_default_texture().createView(),
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

// MAKE SURE TO REGISTER YOUR PIPELINES TO MANAGER
register_pipeline_constructor(pipeline_label, construct_3d_pipeline);
export default construct_3d_pipeline;
