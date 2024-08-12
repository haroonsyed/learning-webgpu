import { mat4, vec4 } from "gl-matrix";

type LightUniformData = {
  position: vec4; // Includes type in the w channel (unused)
  color: vec4; // Includes intensity in the alpha channel
};

type UniformData = {
  model_matrix: mat4;
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
  light_count: GLfloat;
  unused_0: GLfloat; // Padding for alignment
  unused_1: GLfloat; // Padding for alignment
  unused_2: GLfloat; // Padding for alignment
};

const UNIFORM_DATA_SIZE = 4 * 4 + 4 * 4 + 4 * 4 + 10 * 4 * 2 + 1 + 3;

export { UniformData, LightUniformData, UNIFORM_DATA_SIZE };
