import { vec4 } from "gl-matrix";
import { Camera } from "../camera/camera";
import { globals } from "../globals";
import { create_gpu_buffer } from "../gpu_util";
import { Light } from "../lights/light";
import get_default_pipeline from "../pipelines/default_pipeline";
import { SceneObject } from "../scene_object/scene_object";
import { UNIFORM_DATA_SIZE } from "./uniform_data";
import { get_default_texture, load_texture } from "../texture/texture_loader";

class Scene {
  lights: Light[];
  camera: Camera;
  objects: SceneObject[];
  uniform_buffer: GPUBuffer;
  default_pipeline: GPURenderPipeline | undefined = undefined;
  default_bindgroup_descriptor: GPUBindGroupDescriptor | undefined = undefined;

  constructor() {
    this.lights = [];
    this.camera = new Camera("-1", "camera");
    this.objects = [];

    const uniform_data_buffer = new Float32Array(UNIFORM_DATA_SIZE);
    this.uniform_buffer = create_gpu_buffer(
      uniform_data_buffer,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    );

    get_default_pipeline(this.uniform_buffer).then((pipeline) => {
      this.default_pipeline = pipeline;

      this.default_bindgroup_descriptor = {
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: this.uniform_buffer,
              offset: 0,
              size: this.uniform_buffer.size,
            },
          },
          {
            binding: 1,
            resource: globals.device.createSampler({}),
          },
          {
            // Diffuse texture
            binding: 2,
            resource: get_default_texture().createView(),
          },
          {
            // Specular texture
            binding: 3,
            resource: get_default_texture().createView(),
          },
          {
            // Normal texture
            binding: 4,
            resource: get_default_texture().createView(),
          },
        ],
      };
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

    // Copy light count into the uniform data array
    uniform_data[19] = light_count;

    // Copy matrices into the uniform data array
    uniform_data.set(view_matrix, 20);
    uniform_data.set(projection_matrix, 36);

    // Copy light data into the uniform data array
    for (let i = 0; i < light_count; i++) {
      const light_offset = 52 + i * 8;
      uniform_data.set(this.lights[i].position, light_offset);
      uniform_data.set(this.lights[i].color, light_offset + 4);
    }

    // Copy to gpu buffer
    const non_object_specific_size_floats = 16 + 3;
    globals.device.queue.writeBuffer(
      this.uniform_buffer,
      non_object_specific_size_floats * 4,
      uniform_data,
      non_object_specific_size_floats,
      UNIFORM_DATA_SIZE - non_object_specific_size_floats
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
    if (!this.default_pipeline || !this.default_bindgroup_descriptor) {
      console.log("Scene still initializing...");
      return;
    }

    this.update_uniform_data();
    render_pass.setPipeline(this.default_pipeline);

    const render_promises = this.objects.map((object) =>
      object.render(this.default_bindgroup_descriptor!)
    );
    await Promise.all(render_promises);
  };
}

export { Scene };
