import triangle_shader_code from "../shaders/triangle.wgsl";

const triangle_pipeline = (
  renderPass: GPURenderPassEncoder,
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
) => {
  const module = device.createShaderModule({ code: triangle_shader_code });
  renderPass.setPipeline(
    device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module,
      },
      fragment: {
        module,
        targets: [{ format: presentationFormat }],
      },
    })
  );
  renderPass.draw(3, 1, 0, 0);
};

export default triangle_pipeline;
