import { Camera } from "../camera/camera";
import { Light } from "../lights/light";
import { PipeLine } from "../pipelines/pipeline";
import { PipeLineManager } from "../pipelines/pipeline_manager";
import { ShaderManager } from "../pipelines/shader_manager";
import { SceneObject } from "../scene_object/scene_object";
import { EventEnum } from "../system/event_enums";
import { GameEventSystem } from "../system/event_system";
import { SystemCore } from "../system/system_core";
import { TextureManager } from "../texture/texture_manager";

class Scene {
  active: boolean = true;

  event_system: GameEventSystem = new GameEventSystem();
  texture_manager: TextureManager = new TextureManager();
  pipeline_manager: PipeLineManager = new PipeLineManager();
  shader_manager: ShaderManager = new ShaderManager();

  canvas?: HTMLCanvasElement;
  texture_view?: GPUTextureView;
  depth_texture_view?: GPUTextureView;

  presentation_format: GPUTextureFormat = "rgba8unorm"; // Change this if you want HDR or something else. I am sticking with this as its most supported.

  lights: Light[] = [];
  camera: Camera = new Camera("-1", "camera");
  objects: SceneObject[] = [];

  // TODO: Load scene from file
  // A scene will have resource managers that will load/cache resources (textures, pipelines, shaders, models etc). Unloading a scene will unload all resources cleanly.
  // In other words, resource managers should not be static, rather classes that are instantiated per scene.
  constructor(scene_path: string = "", canvas_id: string = "canvas") {
    // Init Canvas
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!canvas) {
      alert("Canvas not found");
      throw new Error("Canvas not found");
    }

    canvas.getContext("webgpu")?.configure({
      device: SystemCore.device,
      format: this.presentation_format,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING, // Added storage binding for direct output for compute shaders
    });

    // Init scene from file...

    // Register listeners
    this.event_system.subscribe(EventEnum.SCENE_FRAME_START, this.update);
    this.event_system.subscribe(EventEnum.SCENE_UPDATE_END, this.render);
    this.event_system.subscribe(EventEnum.SCENE_RENDER_END, this.advance_frame);
    this.event_system.subscribe(EventEnum.SCENE_FRAME_END, this.frame_end);
  }

  async advance_frame() {
    await this.frame_start();
  }

  add_light = (light: Light) => {
    this.lights.push(light);
  };

  add_object = (object: SceneObject) => {
    this.objects.push(object);

    // this.pipeline_manager.register_pipeline(???);
  };

  frame_start = async () => {
    const context = this.canvas?.getContext("webgpu");
    if (!context) {
      return;
    }

    // Initialize render textures for this frame
    this.texture_view = context?.getCurrentTexture().createView();
    this.depth_texture_view = SystemCore.device
      .createTexture({
        label: "Depth Texture",
        size: {
          width: this.canvas!.width,
          height: this.canvas!.height,
          depthOrArrayLayers: 1,
        },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      })
      .createView();

    this.event_system.publish(EventEnum.SCENE_FRAME_START);
  };

  frame_end = async () => {
    // Cleanup
    this.texture_view = undefined;
    this.depth_texture_view = undefined;

    this.event_system.publish(EventEnum.SCENE_FRAME_END);
  };

  update = async () => {
    if (SystemCore.system_input.key_press.get("q") || !this.active) {
      this.active = false;
      // TODO: Should probably publish something about scene end
      return;
    }

    this.event_system.publish(EventEnum.SCENE_UPDATE_START);
    console.log(
      "Calculating Physics, Queuing rendering commands for this frame..."
    );

    const update_promises = [...this.objects, ...this.lights, this.camera].map(
      (object) => object.update(this)
    );
    await Promise.all(update_promises);

    this.event_system.publish(EventEnum.SCENE_UPDATE_END);
  };

  render = async () => {
    this.event_system.publish(EventEnum.SCENE_RENDER_START);

    const unique_pipelines = Array.from(
      this.pipeline_manager.registered_pipelines.values()
    );

    const ordered_pipelines = unique_pipelines.reduce((acc, pipeline) => {
      const order = pipeline.order;
      if (!acc.has(order)) {
        acc.set(order, []);
      }
      acc.get(order)!.push(pipeline);
      return acc;
    }, new Map() as Map<number, PipeLine[]>);

    const ordered_keys = Array.from(ordered_pipelines.keys()).sort();
    for (const key of ordered_keys) {
      const pipelines = ordered_pipelines.get(key)!;
      const render_promises = pipelines.map((pipeline) =>
        pipeline.render(this)
      );
      await Promise.all(render_promises);
    }

    this.event_system.publish(EventEnum.SCENE_RENDER_END);
  };
}

export { Scene };
