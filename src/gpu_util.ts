import { globals } from "./globals";

// Create a GPU buffer from an array of data, exact (+- padding) size
const create_gpu_buffer = <T extends ArrayBufferView>(
  data: T,
  usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
) => {
  const { device } = globals;
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  });
  const mappedRange = buffer.getMappedRange();
  new Uint8Array(mappedRange).set(
    new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  );
  buffer.unmap();
  return buffer;
};

export { create_gpu_buffer };
