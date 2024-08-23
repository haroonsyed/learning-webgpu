import { Camera } from "../camera/camera";
import { Light } from "../lights/light";
import { PipeLine } from "../pipelines/pipeline_manager";
import { SceneObject } from "../scene_object/scene_object";

class Scene {
  lights: Light[];
  camera: Camera;
  objects: SceneObject[];

  constructor() {
    this.lights = [];
    this.camera = new Camera("-1", "camera");
    this.objects = [];
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
