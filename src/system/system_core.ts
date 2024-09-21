import { Scene } from "../scene/scene";
import { EventEnum } from "./event_enums";
import { SystemConfig } from "./system_config";
import { SystemInputHandler } from "./system_input";

// I only intend on having one system, so this class will be static.
// Simplifies access, and may have performance benefits.
class SystemCore {
  static scene: Scene;
  static config: SystemConfig;

  static adapter: GPUAdapter;
  static device: GPUDevice;
  static command_encoder: GPUCommandEncoder;

  static system_input: SystemInputHandler;

  static async start() {
    // Init WebGPU
    await SystemCore.init_webgpu();

    // Setup core systems
    SystemCore.config = new SystemConfig(); // Load from file later
    SystemCore.scene = new Scene(SystemCore.config.start_scene);

    // TEMP SCENE INIT
    // const compute_obj = new ComputeObject({
    //   id: "0",
    //   name: "compute",
    //   workgroup_size: [SystemCore.canvas.width, SystemCore.canvas.height, 1],
    //   pipeline: Default2DComputePipeLine,
    //   shader_path: "compute_shaders/compute.wgsl",
    // });
    // SystemCore.scene.add_object(compute_obj);

    // SystemCore.system_input = new SystemInputHandler();
    // SystemCore.current_frame = 0;

    // Kick off event loop
    console.log("SystemCore initialized, starting event loop...");
    SystemCore.event_loop();
  }

  static async init_webgpu() {
    // Get device
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!adapter || !device) {
      alert("WebGPU not supported");
      throw new Error("WebGPU not supported");
    }

    // Set system variables
    SystemCore.adapter = adapter;
    SystemCore.device = device;
  }

  static async event_loop() {
    SystemCore.command_encoder = SystemCore.device.createCommandEncoder(); // Reset command encoder
    this.system_input.reset();
    SystemCore.device.queue.submit([SystemCore.command_encoder.finish()]); // Submit render commands to GPU
    requestAnimationFrame(() => SystemCore.event_loop());
  }
}

export { SystemCore };
