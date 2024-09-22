import { vec3 } from "gl-matrix";
import { Camera } from "../camera/camera";
import { ComputeObject } from "../compute/compute_object";
import { Light } from "../lights/light";
import { Default2DComputePipeLine } from "../pipelines/default_2d_compute_pipeline";
import { Default3DPipeLine } from "../pipelines/default_3d_pipeline";
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
  current_frame: number = 0;

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
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.resize_scene();

    if (!this.canvas) {
      alert("Canvas not found");
      throw new Error("Canvas not found");
    }

    const context = this.canvas.getContext(
      "webgpu"
    ) as unknown as GPUCanvasContext;
    if (!context) {
      alert("WebGPU not supported");
      throw new Error("WebGPU not supported");
    }

    context.configure({
      device: SystemCore.device,
      format: this.presentation_format,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING, // Added storage binding for direct output for compute shaders
    });

    // Init scene from file...

    // TEST COMPUTE SCENE
    // const compute_obj = new ComputeObject({
    //   id: "0",
    //   name: "compute",
    //   workgroup_size: [this.canvas?.width ?? 1, this.canvas?.height ?? 1, 1],
    //   pipeline: Default2DComputePipeLine,
    //   shader_path: "compute_shaders/compute_test.wgsl",
    // });
    // this.add_object(compute_obj);

    // TEST 3D SCENE
    // const num_objects = 1000;
    // const radius = 60;
    // for (let i = 0; i < num_objects; i++) {
    //   const angle = (i / num_objects) * 10 * Math.PI; // Calculate the angle for each object
    //   const x = (i / num_objects) * radius * Math.cos(angle); // Calculate the x coordinate
    //   const z = (i / num_objects) * radius * Math.sin(angle); // Calculate the z coordinate

    //   this.add_object(
    //     new SceneObject({
    //       id: i.toString(),
    //       name: "cube",
    //       model: "models/cube.obj",
    //       shader_path: "shaders/default_3d.wgsl",
    //       pipeline: Default3DPipeLine,
    //       texture_diffuse: "textures/dirt/dirt.jpg",
    //       position: vec3.fromValues(x, 0, z),
    //       rotation: vec3.fromValues(i * 0.238, i * 0.3, i * 0.66),
    //       scale: vec3.fromValues(0.1, 0.1, 0.1),
    //     })
    //   );
    // }
    // this.add_light(new Light("0", "light", [0.0, 0.0, 0.0], [1.0, 1.0, 1.0]));
    // this.camera.position = vec3.fromValues(2.0, 200.0, 4.0);
    // this.camera.look_at(vec3.fromValues(0.0, 0.0, 0.0));

    // Register listeners
    window.addEventListener("resize", this.resize_scene);
    this.event_system.subscribe(EventEnum.SCENE_FRAME_START, this.update);
    this.event_system.subscribe(EventEnum.SCENE_UPDATE_END, this.render);
    this.event_system.subscribe(EventEnum.SCENE_RENDER_END, this.frame_end);
  }

  resize_scene = () => {
    const rect = this.canvas?.getBoundingClientRect();
    if (this.canvas && rect) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;

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
    }
  };

  add_light = (light: Light) => {
    this.lights.push(light);
  };

  add_object = (object: SceneObject) => {
    this.objects.push(object);

    if (object.pipeline) {
      this.pipeline_manager.register_pipeline(
        object.pipeline,
        object.shader_path,
        this
      );
    }
  };

  frame_start = async () => {
    if (!this.active) {
      return;
    }

    const context = this.canvas?.getContext(
      "webgpu"
    ) as unknown as GPUCanvasContext;
    if (!context) {
      return;
    }

    // Initialize render textures for this frame
    this.texture_view = context.getCurrentTexture().createView();

    await this.event_system.publish(EventEnum.SCENE_FRAME_START);
  };

  frame_end = async () => {
    this.current_frame++;

    await this.event_system.publish(EventEnum.SCENE_FRAME_END);
  };

  update = async () => {
    if (SystemCore.system_input.key_press.get("q") || !this.active) {
      this.active = false;
      console.log("Ending scene...");
      // TODO: Should probably publish something about scene end
      return;
    }

    await this.event_system.publish(EventEnum.SCENE_UPDATE_START);

    const update_promises = [...this.objects, ...this.lights, this.camera].map(
      (object) => object.update(this)
    );
    await Promise.all(update_promises);

    await this.event_system.publish(EventEnum.SCENE_UPDATE_END);
  };

  render = async () => {
    await this.event_system.publish(EventEnum.SCENE_RENDER_START);

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

    await this.event_system.publish(EventEnum.SCENE_RENDER_END);
  };
}

export { Scene };
