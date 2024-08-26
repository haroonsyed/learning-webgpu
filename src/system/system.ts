import { Scene } from "../scene/scene";
import { EventEnum } from "./event_enums";
import { GameEventSystem } from "./event_system";
import { SystemConfig } from "./system_config";
import { SystemInputHandler } from "./system_input";

// I only intend on having one system, so this class will be static.
// Simplifies access, and may have performance benefits.
class System {
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
    await System.init_webgpu();

    // Init external listeners (convert these to just call on event system)
    window.addEventListener("resize", () => {
      System.canvas.width = window.innerWidth;
      System.canvas.height = window.innerHeight;
    });

    // Setup core systems
    System.config = new SystemConfig();
    System.scene = new Scene(System.config.start_scene);
    System.system_input = new SystemInputHandler();
    System.current_frame = 0;

    // Internal Listener
    System.event_system.subscribe(
      EventEnum.EVENT_KEY_PRESS,
      async (system_input: SystemInputHandler) => {
        if (system_input.key_press.has("q")) {
          await System.stop();
        }
      }
    );

    // Kick off event loop
    System.event_loop();
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
    System.canvas = canvas;
    System.adapter = adapter;
    System.device = device;
    System.context = context;
    System.presentation_format = presentation_format;
    System.command_encoder = System.device.createCommandEncoder();
  }

  static async stop() {
    System.running = false;
    await System.event_system.publish(EventEnum.EVENT_GAME_END);
    console.log("Engine stopped.");
  }

  static async event_loop() {
    if (!System.running) return;
    // console.log("Frame: ", System.current_frame);

    await System.event_system.publish(EventEnum.EVENT_LOOP_START);
    System.current_frame++;
    await System.event_system.publish(EventEnum.EVENT_LOOP_END);
    requestAnimationFrame(() => System.event_loop());
    // Replace the below with event loop style code. SHould have a pub/sub system with async callbacks and await Promise.all() for subbed events.
    // A scene will have resource managers that will load/cache resources (textures, pipelines, shaders, models etc). Unloading a scene will unload all resources cleanly.
    // System.scene.update();
    // System.scene.render();
    // System.current_frame++;
    // requestAnimationFrame(() => System.event_loop());
  }
}

export { System };
