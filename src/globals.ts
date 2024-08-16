import { Scene } from "./scene/scene";

type MouseState = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  left: boolean;
  right: boolean;
  middle: boolean;
  left_click: boolean;
  right_click: boolean;
  middle_click: boolean;
};

type EngineGlobals = {
  texture_view: GPUTextureView;
  depth_view: GPUTextureView;
  command_encoder: GPUCommandEncoder;
  adapter: GPUAdapter;
  device: GPUDevice;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  presentation_format: GPUTextureFormat;
  render_pass: GPURenderPassEncoder;
  compute_pass: GPUComputePassEncoder;
  key_state: Map<string, boolean>;
  key_press: Map<string, boolean>;
  mouse_state: MouseState;
  current_frame: number;
  current_frame_start: number;
  scene: Scene;
};

let globals: EngineGlobals = {
  texture_view: {} as GPUTextureView,
  depth_view: {} as GPUTextureView,
  command_encoder: {} as GPUCommandEncoder,
  adapter: {} as GPUAdapter,
  device: {} as GPUDevice,
  canvas: {} as HTMLCanvasElement,
  context: {} as GPUCanvasContext,
  presentation_format: "rgba8unorm",
  render_pass: {} as GPURenderPassEncoder,
  compute_pass: {} as GPUComputePassEncoder,
  key_state: new Map<string, boolean>(),
  key_press: new Map<string, boolean>(),
  mouse_state: {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    left: false,
    right: false,
    middle: false,
    left_click: false,
    right_click: false,
    middle_click: false,
  },
  current_frame: 0,
  current_frame_start: 0,
  scene: {} as Scene,
};
export { globals };
