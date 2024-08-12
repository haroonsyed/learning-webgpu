import default_shader_code from "../shaders/default.wgsl";
import { globals } from "../globals";

const get_default_pipeline = async (uniform_buffer: GPUBuffer) => {
  // Get globals
  const { device, render_pass, presentation_format } = globals;

  // Compile shaders used in this pipeline
  const module = device.createShaderModule({
    code: default_shader_code,
  });

  // Specify the buffer layout (for now just ubo)
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
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
    label: "default_pipeline",
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout], // group 0, binding 0
    }),
    vertex: {
      module: module,
      buffers: [
        {
          // Vertex buffer
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x3",
            },
          ],
        },
        {
          // Normal buffer
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 1,
              offset: 0,
              format: "float32x3",
            },
          ],
        },
        {
          // UV buffer
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 2,
              offset: 0,
              format: "float32x3",
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

  return pipeline;
};

export default get_default_pipeline;
