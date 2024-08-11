import render_triangle from "./pipelines/triangle";
import render_square from "./pipelines/square";
import { globals } from "./globals";
import { config } from "./config";
import render_cube from "./pipelines/cube_hardcoded";
import render_cube_loaded from "./pipelines/cube_loaded";

const init_engine = async () => {
  // Init Canvas
  let canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get device
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  console.log("Device: ", device);
  if (!adapter || !device) {
    alert("WebGPU not supported");
    throw new Error("WebGPU not supported");
  }

  // Get context
  const context = canvas?.getContext("webgpu") as unknown as GPUCanvasContext; // Weird type bug going on rn
  const presentation_format = navigator.gpu.getPreferredCanvasFormat();
  context?.configure({
    device,
    format: presentation_format,
  });

  // Set globals
  globals.adapter = adapter;
  globals.device = device;
  globals.canvas = canvas;
  globals.context = context;
  globals.presentation_format = presentation_format;
  globals.command_encoder = device.createCommandEncoder();
  globals.texture_view.label = "Canvas Texture";
};

const update = async () => {
  console.log(
    "Calculating Physics, Queuing rendering commands for this frame..."
  );
  // render_triangle();
  // await render_cube();
  await render_cube_loaded();
};

const quit_pressed = () => {
  return globals.key_state.get("q");
};

const render_frame = async () => {
  globals.texture_view = globals.context.getCurrentTexture().createView();
  globals.depth_view = globals.device
    .createTexture({
      label: "Depth Texture",
      size: {
        width: globals.canvas.width,
        height: globals.canvas.height,
        depthOrArrayLayers: 1,
      },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    .createView();

  globals.current_frame_start = performance.now();
  globals.command_encoder = globals.device.createCommandEncoder();
  globals.render_pass = globals.command_encoder.beginRenderPass({
    colorAttachments: [
      {
        view: globals.texture_view,
        clearValue: [0.0, 0.0, 0.0, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: globals.depth_view,
      depthClearValue: 1.0,
      stencilClearValue: 0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  });
  await update();
  globals.render_pass.end();
  globals.device.queue.submit([globals.command_encoder.finish()]);
  globals.current_frame++;

  if (quit_pressed()) {
    console.log("Game loop ended");
  } else {
    requestAnimationFrame(render_frame);
  }
};

const main = async () => {
  await init_engine();

  render_frame();
};

document.addEventListener("DOMContentLoaded", main);
window.addEventListener("keydown", (e) => {
  globals.key_state.set(e.key, true);
});
window.addEventListener("keyup", (e) => {
  globals.key_state.set(e.key, false);
});
