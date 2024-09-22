import { load_model, models } from "../model/model_loader";
import { mat4, vec3 } from "gl-matrix";
import { Scene } from "../scene/scene";
import { PipeLine } from "../pipelines/pipeline";

type SceneObjectConstructionParams = {
  id: string;
  name: string;
  model?: string;
  shader_path?: string;
  pipeline?: typeof PipeLine;
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
  shader_path: string;
  pipeline: typeof PipeLine | undefined;
  pipeline_key: string;
  texture_diffuse: string | undefined;
  texture_specular: string | undefined;
  texture_normal: string | undefined;
  texture_emissive: string | undefined;

  constructor({
    id,
    name,
    model = "",
    shader_path = "",
    pipeline,
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

    this.pipeline = pipeline;
    this.pipeline_key = pipeline?.get_pipeline_key(shader_path) || "";
  }

  get_model_matrix = () => {
    // Note these operations appear in reverse order because they are right multiplied
    const model_matrix = mat4.create();
    mat4.translate(model_matrix, model_matrix, this.position);
    mat4.rotateX(model_matrix, model_matrix, this.rotation[0]);
    mat4.rotateY(model_matrix, model_matrix, this.rotation[1]);
    mat4.rotateZ(model_matrix, model_matrix, this.rotation[2]);
    mat4.scale(model_matrix, model_matrix, this.scale);
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

  update = async (scene: Scene) => {};
  remove_from_scene = (scene: Scene) => {
    scene.objects = scene.objects.filter((object) => object !== this);
  };
}

export { SceneObject, SceneObjectConstructionParams };
