import { Camera } from "../camera/camera";
import { Light } from "../lights/light";
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
    const render_promises = this.objects.map((object) => object.render(this));
    await Promise.all(render_promises);
  };
}

export { Scene };
