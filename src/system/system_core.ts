import { Scene } from "../scene/scene";
import { EventEnum } from "./event_enums";
import { GameEventSystem } from "./event_system";
import { SystemConfig } from "./system_config";
import { SystemInputHandler } from "./system_input";

// I only intend on having one system, so this class will be static.
// Simplifies access, and may have performance benefits.
class SystemCore {
  static scene: Scene;
  static config: SystemConfig;

  static canvas: HTMLCanvasElement;
  static adapter: GPUAdapter;
  static device: GPUDevice;
  static context: GPUCanvasContext;
  static presentation_format: GPUTextureFormat;
  static command_encoder: GPUCommandEncoder;

  static event_system: GameEventSystem = new GameEventSystem();
  static system_input: SystemInputHandler;
  static current_frame: number;
  static running: boolean = true;

  static async start() {
    // Init WebGPU
    await SystemCore.init_webgpu();

    // Init external listeners (convert these to just call on event system)
    window.addEventListener("resize", () => {
      SystemCore.canvas.width = window.innerWidth;
      SystemCore.canvas.height = window.innerHeight;
    });

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

    // Internal Listener
    SystemCore.event_system.subscribe(
      EventEnum.EVENT_KEY_PRESS,
      async (system_input: SystemInputHandler) => {
        if (system_input.key_press.has("q")) {
          await SystemCore.stop();
        }
      }
    );

    // Kick off event loop
    console.log("SystemCore initialized, starting event loop...");
    await SystemCore.event_system.publish(EventEnum.EVENT_GAME_START); // Let subsystems initialize themselves
    SystemCore.event_loop();
  }

  static async init_webgpu() {
    // Init Canvas
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Get device
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!adapter || !device) {
      alert("WebGPU not supported");
      throw new Error("WebGPU not supported");
    }

    // Get context
    const context = canvas?.getContext("webgpu") as unknown as GPUCanvasContext; // Weird type bug going on rn
    const presentation_format = "rgba8unorm";
    context?.configure({
      device,
      format: presentation_format,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING,
    });

    // Set system variables
    SystemCore.canvas = canvas;
    SystemCore.adapter = adapter;
    SystemCore.device = device;
    SystemCore.context = context;
    SystemCore.presentation_format = presentation_format;
    SystemCore.command_encoder = SystemCore.device.createCommandEncoder();
  }

  static async stop() {
    SystemCore.running = false;
    await SystemCore.event_system.publish(EventEnum.EVENT_GAME_END);
    console.log("Engine stopped.");
  }

  static async event_loop() {
    if (!SystemCore.running) return;
    // console.log("Frame: ", SystemCore.current_frame);

    await SystemCore.event_system.publish(EventEnum.EVENT_LOOP_START);
    SystemCore.current_frame++;
    await SystemCore.event_system.publish(EventEnum.EVENT_LOOP_END);
    requestAnimationFrame(() => SystemCore.event_loop());
  }
}

export { SystemCore };
