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

  // Init listeners
  window.addEventListener("keydown", (e) => {
    globals.key_state.set(e.key, true);
  });
  window.addEventListener("keyup", (e) => {
    globals.key_state.set(e.key, false);
  });
  window.addEventListener("keypress", (e) => {
    globals.key_press.set(e.key, true);
  });
  window.addEventListener("resize", () => {
    globals.canvas.width = window.innerWidth;
    globals.canvas.height = window.innerHeight;
  });
  window.addEventListener("mousemove", (e) => {
    globals.mouse_state.dx = e.movementX;
    globals.mouse_state.dy = e.movementY;
    globals.mouse_state.x = e.x;
    globals.mouse_state.y = e.y;
  });
  window.addEventListener("mousedown", (e) => {
    if (e.button === 0) {
      globals.mouse_state.left = true;
    } else if (e.button === 1) {
      globals.mouse_state.middle = true;
    } else if (e.button === 2) {
      globals.mouse_state.right = true;
    }
  });
  window.addEventListener("mouseup", (e) => {
    if (e.button === 0) {
      globals.mouse_state.left = false;
    } else if (e.button === 1) {
      globals.mouse_state.middle = false;
    } else if (e.button === 2) {
      globals.mouse_state.right = false;
    }
  });
  window.addEventListener("click", (e) => {
    if (e.button === 0) {
      globals.mouse_state.left_click = true;
    } else if (e.button === 1) {
      globals.mouse_state.middle_click = true;
    } else if (e.button === 2) {
      globals.mouse_state.right_click = true;
    }
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
  globals.camera.update_camera();
  globals.key_press.clear();
  globals.mouse_state.dx = 0;
  globals.mouse_state.dy = 0;
  globals.mouse_state.left_click = false;
  globals.mouse_state.right_click = false;
  globals.mouse_state.middle_click = false;
};

const render = async () => {
  await render_cube_loaded();
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
  await render();
  globals.render_pass.end();
  globals.device.queue.submit([globals.command_encoder.finish()]);
  globals.current_frame++;
};

const quit_pressed = () => {
  return globals.key_state.get("q");
};

const game_loop = async () => {
  await update();
  await render_frame();

  if (quit_pressed()) {
    console.log("Game loop ended");
  } else {
    requestAnimationFrame(game_loop);
  }
};

const main = async () => {
  await init_engine();

  game_loop();
};

document.addEventListener("DOMContentLoaded", main);
