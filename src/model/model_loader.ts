import { create_gpu_buffer } from "../gpu_util";

const models: { [key: string]: ModelData } = {};

type ModelData = {
  vertex_data_gpu: GPUBuffer;
  normal_data_gpu: GPUBuffer;
  uv_data_gpu: GPUBuffer;
  vertex_count: number;
  normal_count: number;
  uv_count: number;
};

const load_model = async (model_path: string | undefined) => {
  if (!model_path) {
    return;
  }

  if (models[model_path]) {
    return;
  }

  const response = await fetch(model_path);
  const model = await response.text();

  const delimited_model = model.split("\n");

  const vertices: GLfloat[] = [];
  const normals: GLfloat[] = [];
  const uvs: GLfloat[] = [];

  delimited_model.forEach((line) => {
    const split_line = line.split(" ");
    const type = split_line[0];

    if (type === "v") {
      vertices.push(parseFloat(split_line[1]));
      vertices.push(parseFloat(split_line[2]));
      vertices.push(parseFloat(split_line[3]));
    } else if (type === "vn") {
      normals.push(parseFloat(split_line[1]));
      normals.push(parseFloat(split_line[2]));
      normals.push(parseFloat(split_line[3]));
    } else if (type === "vt") {
      uvs.push(parseFloat(split_line[1]));
      uvs.push(parseFloat(split_line[2]));
    }
  });

  const vertexData = new Float32Array(vertices);
  const normalData = new Float32Array(normals);
  const uvData = new Float32Array(uvs);

  const vertex_data_gpu = create_gpu_buffer(vertexData);
  const normal_data_gpu = create_gpu_buffer(normalData);
  const uv_data_gpu = create_gpu_buffer(uvData);

  const vertex_count = vertices.length / 3;
  const normal_count = normals.length / 3;
  const uv_count = uvs.length / 2;

  const result = {
    vertex_data_gpu,
    normal_data_gpu,
    uv_data_gpu,
    vertex_count,
    normal_count,
    uv_count,
  };

  models[model_path] = result;
};

export { load_model, models };
