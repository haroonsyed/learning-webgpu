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
}

export { SceneObject };
