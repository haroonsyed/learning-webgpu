import triangle_shader_code from "./shaders/triangle.wgsl";

const check_webgpu_support = async () => {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();

  console.log("Device: ", device);
  if (!device) {
    alert("WebGPU not supported");
    throw new Error("WebGPU not supported");
  }
};

const create_module_pipeline = (
  device: GPUDevice,
  presentationFormat: GPUTextureFormat,
  code: string,
  entry_vs: string | undefined = undefined,
  entry_fs: string | undefined = undefined
) => {
  const module = device.createShaderModule({ code });
  return device.createRenderPipeline({
    layout: "auto",
    vertex: {
      entryPoint: entry_vs,
      module,
    },
    fragment: {
      entryPoint: entry_fs,
      module,
      targets: [{ format: presentationFormat }],
    },
  });
};

const main = async () => {
  console.log("Running main");
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

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: [0.0, 0.0, 0.0, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(
    create_module_pipeline(device, presentationFormat, triangle_shader_code)
  );
  renderPass.draw(3, 1, 0, 0);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

document.addEventListener("DOMContentLoaded", main);
