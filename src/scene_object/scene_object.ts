import { globals } from "../globals";
import { load_model, models } from "../model/model_loader";
import { mat4, vec3 } from "gl-matrix";
import { load_texture } from "../texture/texture_loader";

class SceneObject {
  id: string;
  name: string;
  model: string;
  position: vec3;
  velocity: vec3;
  rotation: vec3;
  scale: vec3;
  texture_diffuse: string | undefined;
  texture_specular: string | undefined;
  texture_normal: string | undefined;
  texture_emissive: string | undefined;
  bind_group: GPUBindGroup | undefined;

  constructor(
    id: string,
    name: string,
    model: string,
    position: vec3 = vec3.create(),
    velocity: vec3 = vec3.create(),
    rotation: vec3 = vec3.create(),
    scale = vec3.fromValues(1.0, 1.0, 1.0),
    texture_diffuse: string | undefined = undefined,
    texture_specular: string | undefined = undefined,
    texture_normal: string | undefined = undefined,
    texture_emissive: string | undefined = undefined
  ) {
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
  }

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
  render = async (descriptor: GPUBindGroupDescriptor) => {
    if (this.model === undefined || this.model === "") {
      return;
    }

    // Grab relevant data from the descriptor
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
