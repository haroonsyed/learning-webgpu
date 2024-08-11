import { Camera } from "./camera/camera";

type SceneGlobals = {
  texture_view: GPUTextureView;
  depth_view: GPUTextureView;
  command_encoder: GPUCommandEncoder;
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  presentation_format: GPUTextureFormat;
  render_pass: GPURenderPassEncoder;
  key_state: Map<string, boolean>;
  current_frame: number;
  current_frame_start: number;
  camera: Camera;
};

let globals: SceneGlobals = {
  texture_view: {} as GPUTextureView,
  depth_view: {} as GPUTextureView,
  command_encoder: {} as GPUCommandEncoder,
  adapter: {} as GPUAdapter,
  device: {} as GPUDevice,
  canvas: {} as HTMLCanvasElement,
  context: {} as GPUCanvasContext,
  presentation_format: "bgra8unorm" as GPUTextureFormat,
  render_pass: {} as GPURenderPassEncoder,
  key_state: new Map<string, boolean>(),
  current_frame: 0,
  current_frame_start: 0,
  camera: new Camera("-1", "camera"),
};
export { globals };
