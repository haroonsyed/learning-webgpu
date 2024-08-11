import { create_gpu_buffer } from "../gpu_util";

const models: { [key: string]: ModelData } = {};

type ModelData = {
  vertex_data_gpu: GPUBuffer;
  normal_data_gpu: GPUBuffer;
  uv_data_gpu: GPUBuffer;
  vertex_indices_gpu: GPUBuffer;
  normal_indices_gpu: GPUBuffer;
  uv_indices_gpu: GPUBuffer;
  index_count: number;
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
  const vertices_indices: number[] = [];
  const normals_indices: number[] = [];
  const uvs_indices: number[] = [];

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
    } else if (type === "f") {
      const vertex1 = split_line[1].split("/");
      const vertex2 = split_line[2].split("/");
      const vertex3 = split_line[3].split("/");

      vertices_indices.push(parseInt(vertex1[0]) - 1);
      vertices_indices.push(parseInt(vertex2[0]) - 1);
      vertices_indices.push(parseInt(vertex3[0]) - 1);

      uvs_indices.push(parseInt(vertex1[1]) - 1);
      uvs_indices.push(parseInt(vertex2[1]) - 1);
      uvs_indices.push(parseInt(vertex3[1]) - 1);

      normals_indices.push(parseInt(vertex1[2]) - 1);
      normals_indices.push(parseInt(vertex2[2]) - 1);
      normals_indices.push(parseInt(vertex3[2]) - 1);
    }
  });

  const vertexData = new Float32Array(vertices);
  const normalData = new Float32Array(normals);
  const uvData = new Float32Array(uvs);
  const vertex_indices = new Uint32Array(vertices_indices);
  const normal_indices = new Uint32Array(normals_indices);
  const uv_indices = new Uint32Array(uvs_indices);

  const vertex_data_gpu = create_gpu_buffer(vertexData);
  const normal_data_gpu = create_gpu_buffer(normalData);
  const uv_data_gpu = create_gpu_buffer(uvData);
  const vertex_indices_gpu = create_gpu_buffer(
    vertex_indices,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  );
  const normal_indices_gpu = create_gpu_buffer(
    normal_indices,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  );
  const uv_indices_gpu = create_gpu_buffer(
    uv_indices,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  );

  const index_count = vertex_indices.length;

  const result = {
    vertex_data_gpu,
    normal_data_gpu,
    uv_data_gpu,
    vertex_indices_gpu,
    normal_indices_gpu,
    uv_indices_gpu,
    index_count,
  };

  models[model_path] = result;
};

export { load_model, models };
