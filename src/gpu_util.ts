import { globals } from "./globals";

// Create a GPU buffer from an array of data, exact (+- padding) size
const create_gpu_buffer = (
  data: Float32Array,
  usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
) => {
  const { device } = globals;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export { create_gpu_buffer };
