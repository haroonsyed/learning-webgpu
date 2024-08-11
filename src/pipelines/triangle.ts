import triangle_shader_code from "../shaders/triangle.wgsl";
import { globals } from "../globals";

const triangle_pipeline = () => {
  const {
    device,
    render_pass: renderPass,
    presentation_format: presentationFormat,
  } = globals;

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
