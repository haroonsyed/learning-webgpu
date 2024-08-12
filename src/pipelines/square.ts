import { create_gpu_buffer } from "../gpu_util";
import square_shader_code from "../shaders/square.wgsl";
import { globals } from "../globals";

const square_pipeline = () => {
  const {
    device,
    render_pass: renderPass,
    presentation_format: presentationFormat,
  } = globals;

  // Remember everything is in triangles
  const vertexData = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  ]);

  const colorData = new Float32Array([
    1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1,
  ]);

  const vertexBuffer = create_gpu_buffer(vertexData);
  const colorBuffer = create_gpu_buffer(colorData);
  const module = device.createShaderModule({ code: square_shader_code });

  renderPass.setPipeline(
    device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: module,
        buffers: [
          {
            arrayStride: 2 * 4,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x2",
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
            format: presentationFormat,
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
    })
  );
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.setVertexBuffer(1, colorBuffer);
  renderPass.draw(6, 1, 0, 0);
};

export default square_pipeline;
