import { globals } from "../globals";
import { load_model, models } from "../model/model_loader";
import { mat4, vec3 } from "gl-matrix";

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

  update = () => {};
  render = async (uniform_buffer: GPUBuffer) => {
    if (this.model === undefined || this.model === "") {
      return;
    }

    const model_matrix = this.get_model_matrix();
    globals.device.queue.writeBuffer(
      uniform_buffer,
      0,
      Float32Array.from(model_matrix)
    );

    // assumes default pipeline is bound
    const { render_pass } = globals;
    const {
      vertex_data_gpu,
      normal_data_gpu,
      uv_data_gpu,
      vertex_indices_gpu,
      normal_indices_gpu,
      uv_indices_gpu,
      index_count,
    } = await this.get_model_data();
    render_pass.setVertexBuffer(0, vertex_data_gpu);
    render_pass.setVertexBuffer(1, normal_data_gpu);
    render_pass.setVertexBuffer(2, uv_data_gpu);
    render_pass.setIndexBuffer(vertex_indices_gpu, "uint32");
    render_pass.drawIndexed(index_count, 1, 0, 0, 0);
  };
}

export { SceneObject };
