class SystemConfig {
  target_frame_rate: number = 60;
  start_scene: string = "scene_0";

  constructor() {
    console.log("SystemConfig constructor");
  }
}

export { SystemConfig };
