import { vec4 } from "gl-matrix";
import { create_gpu_buffer } from "../gpu_util";

const models: { [key: string]: ModelData } = {};

type ModelData = {
  vertex_data_gpu: GPUBuffer;
  indices_gpu: GPUBuffer;
  index_count: number;
};

const load_model = async (model_path: string | undefined) => {
  if (!model_path) {
    return;
  }

  if (models[model_path]) {
    return;
  }
  console.log("Loading model", model_path);

  // Fetch model
  const response = await fetch(model_path);
  const model = await response.text();

  // Track the attributes of the model
  const positions: vec4[] = [];
  const normals: vec4[] = [];
  const uvs: vec4[] = [];

  // These are the final vertices making up the faces in obj file
  const vertices_before_indexed: string[] = [];

  // Parse data from obj file
  let max_position = vec4.create();
  model.split("\n").forEach((line) => {
    const split_line = line.split(" ");
    const type = split_line[0];

    if (type === "v") {
      const position = vec4.fromValues(
        parseFloat(split_line[1]),
        parseFloat(split_line[2]),
        parseFloat(split_line[3]),
        1.0
      );

      max_position =
        vec4.length(position) > vec4.length(max_position)
          ? position
          : max_position;
      positions.push(position);
    } else if (type === "vn") {
      const normal = vec4.fromValues(
        parseFloat(split_line[1]),
        parseFloat(split_line[2]),
        parseFloat(split_line[3]),
        0.0
      );

      normals.push(normal);
    } else if (type === "vt") {
      const uv = vec4.fromValues(
        parseFloat(split_line[1]),
        parseFloat(split_line[2]),
        0.0,
        0.0
      );

      uvs.push(uv);
    } else if (type === "f") {
      vertices_before_indexed.push(split_line[1]);
      vertices_before_indexed.push(split_line[2]);
      vertices_before_indexed.push(split_line[3]);
    }
  });

  // Build up the indexed vertices
  const indices: GLint[] = [];
  const vertex_map = new Map<string, GLint>(); // number is the size at time of insertion
  let vertex_data: vec4[] = [];

  vertices_before_indexed.forEach((vertex) => {
    if (!vertex_map.has(vertex)) {
      const attributes = vertex.split("/").filter((v) => v !== ""); // Handle when double slashes are used
      const position_index = parseInt(attributes[0]) - 1;
      const uv_index = parseInt(attributes[1]) - 1;
      const normal_index = parseInt(attributes[2]) - 1;

      vertex_data.push(positions[position_index]);
      vertex_data.push(uvs[uv_index] || vec4.create());
      vertex_data.push(normals[normal_index] || vec4.create());

      const index: GLint = vertex_map.size;
      vertex_map.set(vertex, index);
    }

    indices.push(vertex_map.get(vertex)!);
  });

  // Potentially slow
  const vertex_data_array = vertex_data.flatMap((v) => [...v]);

  const vertex_data_gpu = create_gpu_buffer(
    new Float32Array(vertex_data_array)
  );
  const indices_gpu = create_gpu_buffer(
    new Int32Array(indices),
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  );

  const index_count = indices.length;
  const result = {
    vertex_data_gpu,
    indices_gpu,
    index_count,
  };

  models[model_path] = result;
};

export { load_model, models };
