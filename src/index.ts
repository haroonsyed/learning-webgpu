import { init_gpu } from "./gpu_util";
import render_triangle from "./pipelines/triangle";
import render_square from "./pipelines/square";

const main = async () => {
  console.log("Running main");

  const { device, context, presentationFormat } = await init_gpu();

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: [0.0, 0.0, 0.0, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  // render_triangle(renderPass, device, presentationFormat);
  render_square(renderPass, device, presentationFormat);
  renderPass.end();

  const commandBuffer = commandEncoder.finish();
  device.queue.submit([commandBuffer]);
};

document.addEventListener("DOMContentLoaded", main);
