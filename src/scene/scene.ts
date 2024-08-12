import { vec4 } from "gl-matrix";
import { Camera } from "../camera/camera";
import { globals } from "../globals";
import { create_gpu_buffer } from "../gpu_util";
import { Light } from "../lights/light";
import set_default_pipeline from "../pipelines/default_pipeline";
import { SceneObject } from "../scene_object/scene_object";
import { UNIFORM_DATA_SIZE } from "./uniform_data";

class Scene {
  lights: Light[];
  camera: Camera;
  objects: SceneObject[];
  uniform_buffer: GPUBuffer;
  default_pipeline: GPURenderPipeline | undefined = undefined;
  default_bind_group: GPUBindGroup | undefined = undefined;

  constructor() {
    this.lights = [];
    this.camera = new Camera("-1", "camera");
    this.objects = [];

    const uniform_data_buffer = new Float32Array(UNIFORM_DATA_SIZE);
    this.uniform_buffer = create_gpu_buffer(
      uniform_data_buffer,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    );

    set_default_pipeline(this.uniform_buffer).then((result) => {
      this.default_pipeline = result.pipeline;
      this.default_bind_group = result.bind_group;
    });
  }

  add_light = (light: Light) => {
    this.lights.push(light);
  };

  add_object = (object: SceneObject) => {
    this.objects.push(object);
  };

  update_uniform_data = () => {
    const view_matrix = this.camera.get_view_matrix();
    const projection_matrix = this.camera.get_projection_matrix();
    const light_count = this.lights.length;

    // Create a Float32Array to hold the uniform data
    const uniform_data = new Float32Array(UNIFORM_DATA_SIZE);

    // Copy matrices into the uniform data array
    uniform_data.set(view_matrix, 16);
    uniform_data.set(projection_matrix, 32);

    if (globals.current_frame == 2) {
      console.log(uniform_data);
    }

    // Copy light data into the uniform data array
    for (let i = 0; i < light_count; i++) {
      const light_offset = 48 + i * 8;
      uniform_data.set(this.lights[i].position, light_offset);
      uniform_data.set(this.lights[i].color, light_offset + 4);
    }

    // Copy light count into the uniform data array
    uniform_data[48 + light_count * 8] = light_count;

    // Copy to gpu buffer
    globals.device.queue.writeBuffer(
      this.uniform_buffer,
      16 * 4,
      uniform_data,
      16,
      UNIFORM_DATA_SIZE - 16
    );
  };

  update = async () => {
    console.log(
      "Calculating Physics, Queuing rendering commands for this frame..."
    );

    this.objects.forEach((object) => object.update());
    this.lights.forEach((light) => light.update());
    this.camera.update();
  };

  render = async () => {
    const { render_pass } = globals;
    if (!this.default_pipeline || !this.default_bind_group) {
      console.log("Scene still initializing...");
      return;
    }

    this.update_uniform_data();
    render_pass.setPipeline(this.default_pipeline);
    render_pass.setBindGroup(0, this.default_bind_group);

    const render_promises = this.objects.map((object) =>
      object.render(this.uniform_buffer)
    );
    await Promise.all(render_promises);
  };
}

export { Scene };
