import { Scene } from "../scene/scene";
import { SystemConfig } from "./system_config";
import { SystemInputHandler } from "./system_input";

// I only intend on having one system, so this class will be static.
// Simplifies access, and may have performance benefits.
class SystemCore {
  static scenes: Scene[] = [];
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
    SystemCore.system_input = new SystemInputHandler();

    // For now we have one scene
    SystemCore.scenes.push(new Scene(SystemCore.config.start_scene));

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

    // Update scenes
    await Promise.all(this.scenes.map((scene) => scene.frame_start()));

    SystemCore.device.queue.submit([SystemCore.command_encoder.finish()]); // Submit render commands to GPU
    requestAnimationFrame(() => SystemCore.event_loop());
    this.system_input.reset();
  }
}

export { SystemCore };
