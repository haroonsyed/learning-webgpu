import { Camera } from "../camera/camera";
import { Light } from "../lights/light";
import { PipeLine } from "../pipelines/pipeline_manager";
import { SceneObject } from "../scene_object/scene_object";
import { EventEnum } from "../system/event_enums";
import { SystemCore } from "../system/system_core";

class Scene {
  lights: Light[];
  camera: Camera;
  objects: SceneObject[];

  // TODO: Load scene from file
  // A scene will have resource managers that will load/cache resources (textures, pipelines, shaders, models etc). Unloading a scene will unload all resources cleanly.
  // In other words, resource managers should not be static, rather classes that are instantiated per scene.
  constructor(scene_path: string = "") {
    this.lights = [];
    this.camera = new Camera("-1", "camera");
    this.objects = [];

    // Register listeners
    SystemCore.event_system.subscribe(EventEnum.EVENT_LOOP_START, async () => {
      await this.update();
      SystemCore.event_system.publish(EventEnum.SCENE_UPDATE_END);
    });

    SystemCore.event_system.subscribe(EventEnum.SCENE_UPDATE_END, async () => {
      await this.render();
      SystemCore.event_system.publish(EventEnum.SCENE_RENDER_END);
    });
  }

  add_light = (light: Light) => {
    this.lights.push(light);
  };

  add_object = (object: SceneObject) => {
    this.objects.push(object);
  };

  update = async () => {
    console.log(
      "Calculating Physics, Queuing rendering commands for this frame..."
    );

    const update_promises = [...this.objects, ...this.lights, this.camera].map(
      (object) => object.update(this)
    );
    await Promise.all(update_promises);
  };

  render = async () => {
    // Might be slow to get unique pipelines this way.
    let unique_pipeline_keys = new Set(
      this.objects.map((object) => object.get_pipeline_key())
    );

    const unique_pipelines = Array.from(unique_pipeline_keys)
      .map((pipeline_key) => PipeLine.get_registered_pipeline(pipeline_key))
      .filter((pipeline) => pipeline !== undefined) as PipeLine[];

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
  };
}

export { Scene };
