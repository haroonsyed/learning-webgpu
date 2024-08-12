import cube_shader_code from "../shaders/cube.wgsl";
import { globals } from "../globals";
import { SceneObject } from "../types/SceneObject";
import { create_gpu_buffer } from "../gpu_util";
import { mat4 } from "gl-matrix";
import { config } from "../config";

const render_cube = async () => {
  const { device, render_pass, presentation_format, camera } = globals;

  const cube = new SceneObject("0", "cube", "models/cube.obj");
  const {
    vertex_data_gpu,
    normal_data_gpu,
    uv_data_gpu,
    vertex_indices_gpu,
    normal_indices_gpu,
    uv_indices_gpu,
    index_count,
  } = await cube.get_model_data();

  const colors = new Float32Array([
    // front - blue
    0, 0, 1, 0, 0, 0, 1, 0,

    // right - red
    1, 0, 0, 0, 1, 0, 0, 0,

    //back - yellow
    1, 1, 0, 0, 1, 1, 0, 0,

    //left - aqua
    0, 1, 1, 0, 0, 1, 1, 0,

    // top - green
    0, 1, 0, 0, 0, 1, 0, 0,

    // bottom - fuchsia
    1, 0, 1, 0, 1, 0, 1, 0,
  ]);
  const color_buffer = create_gpu_buffer(colors);

  const module = device.createShaderModule({ code: cube_shader_code });
  const model_matrix = cube.get_model_matrix();
  const view_matrix = camera.get_view_matrix();
  const projection_matrix = camera.get_projection_matrix();

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const pipeline_layout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout], // group 0
  });

  const pipeline = device.createRenderPipeline({
    layout: pipeline_layout,
    vertex: {
      module: module,
      buffers: [
        {
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
          arrayStride: 4 * 4,
          attributes: [
            {
              shaderLocation: 1,
              offset: 0,
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

  const uniform_data = new Float32Array([
    ...model_matrix,
    ...view_matrix,
    ...projection_matrix,
  ]);

  const uniform_buffer = create_gpu_buffer(
    uniform_data,
    GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  );
  const uniform_bind_group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniform_buffer,
          offset: 0,
          size: uniform_buffer.size,
        },
      },
    ],
  });

  render_pass.setPipeline(pipeline);
  render_pass.setBindGroup(0, uniform_bind_group);
  render_pass.setVertexBuffer(0, vertex_data_gpu);
  render_pass.setVertexBuffer(1, color_buffer);
  render_pass.setIndexBuffer(vertex_indices_gpu, "uint32");
  render_pass.drawIndexed(index_count, 1, 0, 0, 0);
};

export default render_cube;
