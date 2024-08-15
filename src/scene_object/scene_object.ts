import { globals } from "../globals";
import { load_model, models } from "../model/model_loader";
import { mat4, vec3 } from "gl-matrix";
import { load_texture } from "../texture/texture_loader";
import { Scene } from "../scene/scene";
import {
  get_registered_pipeline,
  PipeLine,
} from "../pipelines/pipeline_manager";

type SceneObjectConstructionParams = {
  id: string;
  name: string;
  model: string;
  shader_path?: string;
  pipeline_label?: string;
  position?: vec3;
  velocity?: vec3;
  rotation?: vec3;
  scale?: vec3;
  texture_diffuse?: string;
  texture_specular?: string;
  texture_normal?: string;
  texture_emissive?: string;
};

class SceneObject {
  id: string;
  name: string;
  model: string;
  position: vec3;
  velocity: vec3;
  rotation: vec3;
  scale: vec3;
  shader_path: string | undefined;
  pipeline_label: string | undefined;
  texture_diffuse: string | undefined;
  texture_specular: string | undefined;
  texture_normal: string | undefined;
  texture_emissive: string | undefined;
  bind_group: GPUBindGroup | undefined;

  constructor({
    id,
    name,
    model,
    shader_path = undefined,
    pipeline_label = undefined,
    position = vec3.create(),
    velocity = vec3.create(),
    rotation = vec3.create(),
    scale = vec3.fromValues(1.0, 1.0, 1.0),
    texture_diffuse = undefined,
    texture_specular = undefined,
    texture_normal = undefined,
    texture_emissive = undefined,
  }: SceneObjectConstructionParams) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.velocity = velocity;
    this.rotation = rotation;
    this.scale = scale;
    this.model = model;
    this.texture_diffuse = texture_diffuse;
    this.texture_specular = texture_specular;
    this.texture_normal = texture_normal;
    this.texture_emissive = texture_emissive;
    this.shader_path = shader_path;
    this.pipeline_label = pipeline_label;
  }

  get_pipeline = async () => {
    if (this.shader_path === undefined || this.pipeline_label === undefined) {
      return undefined;
    }

    return get_registered_pipeline(this.shader_path!, this.pipeline_label!);
  };

  get_model_matrix = () => {
    const model_matrix = mat4.create();
    mat4.rotateX(model_matrix, model_matrix, this.rotation[0]);
    mat4.rotateY(model_matrix, model_matrix, this.rotation[1]);
    mat4.rotateZ(model_matrix, model_matrix, this.rotation[2]);
    mat4.scale(model_matrix, model_matrix, this.scale);
    mat4.translate(model_matrix, model_matrix, this.position);
    return model_matrix;
  };

  get_model_data = async () => {
    await load_model(this.model);
    return models[this.model];
  };

  has_texture_diffuse = () => {
    return this.texture_diffuse !== undefined && this.texture_diffuse !== "";
  };

  has_texture_specular = () => {
    return this.texture_specular !== undefined && this.texture_specular !== "";
  };

  has_texture_normal = () => {
    return this.texture_normal !== undefined && this.texture_normal !== "";
  };

  has_texture_emissive = () => {
    return this.texture_emissive !== undefined && this.texture_emissive !== "";
  };

  set_bind_group = async (default_descriptor: GPUBindGroupDescriptor) => {
    if (this.bind_group === undefined) {
      // For each texture, create a bind group entry
      const desciptor_entries =
        default_descriptor.entries as Array<GPUBindGroupEntry>;
      const uniform_buffer_descriptor = desciptor_entries[0];
      const sampler_descriptor = desciptor_entries[1];
      const diffuse_texture = await load_texture(this.texture_diffuse);
      const specular_texture = await load_texture(this.texture_specular);
      const normal_texture = await load_texture(this.texture_normal);

      this.bind_group = globals.device.createBindGroup({
        ...default_descriptor,
        entries: [
          uniform_buffer_descriptor,
          sampler_descriptor,
          {
            binding: 2,
            resource: diffuse_texture.createView(),
          },
          {
            binding: 3,
            resource: specular_texture.createView(),
          },
          {
            binding: 4,
            resource: normal_texture.createView(),
          },
        ],
      });
    }

    globals.render_pass.setBindGroup(0, this.bind_group!);
  };

  update = () => {
    // Rotate the object relative to current rotation
    this.rotation[1] += 0.001;
  };

  update_uniform_data = (scene: Scene, pipeline: PipeLine) => {
    const uniform_buffer = (
      pipeline?.default_bindgroup_descriptor.entries as any
    )[0].buffer as GPUBuffer;
    const UNIFORM_DATA_SIZE = uniform_buffer.size;

    const view_matrix = scene.camera.get_view_matrix();
    const projection_matrix = scene.camera.get_projection_matrix();
    const light_count = scene.lights.length;

    // Create a Float32Array to hold the uniform data
    const uniform_data = new Float32Array(UNIFORM_DATA_SIZE / 4); // 4 bytes per float

    // Copy light count into the uniform data array
    uniform_data[19] = light_count;

    // Copy matrices into the uniform data array
    uniform_data.set(view_matrix, 20);
    uniform_data.set(projection_matrix, 36);

    // Copy light data into the uniform data array
    for (let i = 0; i < light_count; i++) {
      const light_offset = 52 + i * 8;
      uniform_data.set(scene.lights[i].position, light_offset);
      uniform_data.set(scene.lights[i].color, light_offset + 4);
    }

    // Copy to gpu buffer
    const non_object_specific_size_floats = 16 + 3;
    globals.device.queue.writeBuffer(
      uniform_buffer,
      non_object_specific_size_floats * 4,
      uniform_data,
      non_object_specific_size_floats,
      UNIFORM_DATA_SIZE - non_object_specific_size_floats
    );
  };

  render = async (scene: Scene) => {
    const pipeline = await this.get_pipeline();

    if (
      this.model === undefined ||
      this.model === "" ||
      pipeline === undefined
    ) {
      return;
    }

    // Bind the pipeline
    globals.render_pass.setPipeline(pipeline.gpu_pipeline);

    // EVERYTHING BELOW SHOULD BE MOVED TO PIPELINE IN A .RENDER() METHOD. SceneObject need not worry about buffer formats, etc.

    // Update uniform data
    this.update_uniform_data(scene, pipeline);

    // Grab relevant data from the descriptor
    const descriptor = pipeline.default_bindgroup_descriptor;
    const desciptor_entries = descriptor.entries as Array<GPUBindGroupEntry>;
    const uniform_buffer_resource = desciptor_entries[0]
      .resource as GPUBufferBinding;
    const uniform_buffer = uniform_buffer_resource.buffer;

    // Set the bind group
    await this.set_bind_group(descriptor);

    // Update uniform data
    const model_matrix = this.get_model_matrix();
    globals.device.queue.writeBuffer(
      uniform_buffer,
      0,
      Float32Array.from([
        ...model_matrix,
        this.has_texture_diffuse() ? 1.0 : 0.0,
        this.has_texture_specular() ? 1.0 : 0.0,
        this.has_texture_normal() ? 1.0 : 0.0,
      ])
    );

    // Render the object
    const { render_pass } = globals;
    const { vertex_data_gpu, indices_gpu, index_count } =
      await this.get_model_data();
    render_pass.setVertexBuffer(0, vertex_data_gpu);
    render_pass.setIndexBuffer(indices_gpu, "uint32");
    render_pass.drawIndexed(index_count, 1, 0, 0, 0);
  };
}

export { SceneObject };
