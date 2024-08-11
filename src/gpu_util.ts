const check_webgpu_support = async () => {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();

  console.log("Device: ", device);
  if (!device) {
    alert("WebGPU not supported");
    throw new Error("WebGPU not supported");
  }
};

// Expand this further with geometry, textures etc
// const create_module_pipeline = (
//   device: GPUDevice,
//   presentationFormat: GPUTextureFormat,
//   code: string,
//   entry_vs: string | undefined = undefined,
//   entry_fs: string | undefined = undefined
// ) => {
//   const module = device.createShaderModule({ code });
//   return device.createRenderPipeline({
//     layout: "auto",
//     vertex: {
//       entryPoint: entry_vs,
//       module,
//     },
//     fragment: {
//       entryPoint: entry_fs,
//       module,
//       targets: [{ format: presentationFormat }],
//     },
//   });
// };

const init_gpu = async () => {
  let canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  await check_webgpu_support();

  const adapter = await navigator.gpu!.requestAdapter();
  const device = await adapter!.requestDevice();
  const context = canvas?.getContext("webgpu") as unknown as GPUCanvasContext; // Weird type bug going on rn
  const presentationFormat = navigator.gpu?.getPreferredCanvasFormat();

  context?.configure({
    device,
    format: presentationFormat,
  });

  return { device, canvas, context, presentationFormat };
};

// Create a GPU buffer from an array of data, exact (+- padding) size
const create_gpu_buffer = (
  device: GPUDevice,
  data: Float32Array,
  usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage,
    mappedAtCreation: true,
  });
  new Float32Array(buffer.getMappedRange()).set(data);
  buffer.unmap();
  return buffer;
};

export { check_webgpu_support, init_gpu, create_gpu_buffer };
