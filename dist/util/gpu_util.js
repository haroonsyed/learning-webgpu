"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_gpu_buffer = void 0;
const system_core_1 = require("../system/system_core");
// Create a GPU buffer from an array of data, exact (+- padding) size
const create_gpu_buffer = (data, usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST) => {
    const { device } = system_core_1.SystemCore;
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage,
        mappedAtCreation: true,
    });
    const mappedRange = buffer.getMappedRange();
    new Uint8Array(mappedRange).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    buffer.unmap();
    return buffer;
};
exports.create_gpu_buffer = create_gpu_buffer;
//# sourceMappingURL=gpu_util.js.map