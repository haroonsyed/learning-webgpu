"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.models = exports.load_model = void 0;
const gl_matrix_1 = require("gl-matrix");
const gpu_util_1 = require("../util/gpu_util");
const models = {};
exports.models = models;
const load_model = (model_path) => __awaiter(void 0, void 0, void 0, function* () {
    if (!model_path) {
        return;
    }
    if (models[model_path]) {
        return;
    }
    console.log("Loading model", model_path);
    // Fetch model
    const response = yield fetch(model_path);
    const model = yield response.text();
    // Track the attributes of the model
    const positions = [];
    const normals = [];
    const uvs = [];
    // These are the final vertices making up the faces in obj file
    const vertices_before_indexed = [];
    // Parse data from obj file
    let max_position = gl_matrix_1.vec4.create();
    let min_position = gl_matrix_1.vec4.create();
    model.split("\n").forEach((line) => {
        const split_line = line.split(" ");
        const type = split_line[0];
        if (type === "v") {
            const position = gl_matrix_1.vec4.fromValues(parseFloat(split_line[1]), parseFloat(split_line[2]), parseFloat(split_line[3]), 1.0);
            max_position[0] = Math.max(max_position[0], position[0]);
            max_position[1] = Math.max(max_position[1], position[1]);
            max_position[2] = Math.max(max_position[2], position[2]);
            min_position[0] = Math.min(min_position[0], position[0]);
            min_position[1] = Math.min(min_position[1], position[1]);
            min_position[2] = Math.min(min_position[2], position[2]);
            positions.push(position);
        }
        else if (type === "vn") {
            const normal = gl_matrix_1.vec4.fromValues(parseFloat(split_line[1]), parseFloat(split_line[2]), parseFloat(split_line[3]), 0.0);
            normals.push(normal);
        }
        else if (type === "vt") {
            const uv = gl_matrix_1.vec4.fromValues(parseFloat(split_line[1]), parseFloat(split_line[2]), 0.0, 0.0);
            uvs.push(uv);
        }
        else if (type === "f") {
            vertices_before_indexed.push(split_line[1]);
            vertices_before_indexed.push(split_line[2]);
            vertices_before_indexed.push(split_line[3]);
        }
    });
    // Recenter the model
    const center_x = min_position[0] + (max_position[0] - min_position[0]) / 2;
    const center_y = min_position[1] + (max_position[1] - min_position[1]) / 2;
    const center_z = min_position[2] + (max_position[2] - min_position[2]) / 2;
    // // Subtract the center from each position
    // positions.forEach((position) => {
    //   position[0] -= center_x;
    //   position[1] -= center_y;
    //   position[2] -= center_z;
    // });
    // Build up the indexed vertices
    const indices = [];
    const vertex_map = new Map(); // number is the size at time of insertion
    let vertex_data = [];
    vertices_before_indexed.forEach((vertex) => {
        if (!vertex_map.has(vertex)) {
            const attributes = vertex.split("/").filter((v) => v !== ""); // Handle when double slashes are used
            const position_index = parseInt(attributes[0]) - 1;
            const uv_index = parseInt(attributes[1]) - 1;
            const normal_index = parseInt(attributes[2]) - 1;
            vertex_data.push(positions[position_index]);
            vertex_data.push(uvs[uv_index] || gl_matrix_1.vec4.create());
            vertex_data.push(normals[normal_index] || gl_matrix_1.vec4.create());
            const index = vertex_map.size;
            vertex_map.set(vertex, index);
        }
        indices.push(vertex_map.get(vertex));
    });
    // Potentially slow
    const vertex_data_array = vertex_data.flatMap((v) => [...v]);
    const vertex_data_gpu = (0, gpu_util_1.create_gpu_buffer)(new Float32Array(vertex_data_array));
    const indices_gpu = (0, gpu_util_1.create_gpu_buffer)(new Int32Array(indices), GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
    const index_count = indices.length;
    const result = {
        vertex_data_gpu,
        indices_gpu,
        index_count,
    };
    models[model_path] = result;
});
exports.load_model = load_model;
//# sourceMappingURL=model_loader.js.map