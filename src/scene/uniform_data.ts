import { mat4, vec4 } from "gl-matrix";

type LightUniformData = {
  position: vec4; // Includes type in the w channel (unused)
  color: vec4; // Includes intensity in the alpha channel
};

type UniformData = {
  model_matrix: mat4;
  diffuse_present: GLfloat;
  specular_present: GLfloat;
  normal_present: GLfloat;
  light_count: GLfloat;
  view_matrix: mat4;
  projection_matrix: mat4;
  lights: [
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData,
    LightUniformData
  ];
};

const UNIFORM_DATA_SIZE = 4 * 4 + 4 + 4 * 4 + 4 * 4 + 10 * 4 * 2;

export { UniformData, LightUniformData, UNIFORM_DATA_SIZE };
