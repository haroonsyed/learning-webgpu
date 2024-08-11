import render_triangle from "./pipelines/triangle";
import render_square from "./pipelines/square";
import { globals } from "./globals";
import { config } from "./config";
import render_cube from "./pipelines/cube_hardcoded";

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
  const presentationFormat = navigator.gpu?.getPreferredCanvasFormat();
  context?.configure({
    device,
    format: presentationFormat,
  });

  // Set globals
  globals.adapter = adapter;
  globals.device = device;
  globals.canvas = canvas;
  globals.context = context;
  globals.presentation_format = presentationFormat;
  globals.command_encoder = device.createCommandEncoder();
  globals.texture_view = context.getCurrentTexture().createView();
  globals.depth_view = device
    .createTexture({
      size: {
        width: canvas.width,
        height: canvas.height,
        depthOrArrayLayers: 1,
      },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    .createView();
};

const update = async () => {
  console.log(
    "Calculating Physics, Queuing rendering commands for this frame..."
  );
  // render_triangle();
  await render_cube();
};

const wait_for_frame_end = async () => {
  const target_frame_time = 1000 / config.target_fps;
  const frame_time = performance.now() - globals.current_frame_start;
  const sleep_time = target_frame_time - frame_time;
  await new Promise((resolve) => setTimeout(resolve, sleep_time));
};

const quit_pressed = () => {
  return globals.key_state.get("q");
};

const main = async () => {
  await init_engine();
  const {
    device,
    texture_view: textureView,
    command_encoder: commandEncoder,
  } = globals;

  // while (!quit_pressed()) {
  globals.current_frame_start = performance.now();
  globals.command_encoder = device.createCommandEncoder();
  globals.render_pass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
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
  const commandBuffer = commandEncoder.finish();
  device.queue.submit([commandBuffer]);
  await wait_for_frame_end();
  globals.current_frame++;
  // }

  console.log("Game loop ended");
};

document.addEventListener("DOMContentLoaded", main);
window.addEventListener("keydown", (e) => {
  globals.key_state.set(e.key, true);
});
window.addEventListener("keyup", (e) => {
  globals.key_state.set(e.key, false);
});
