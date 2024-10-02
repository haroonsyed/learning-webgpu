@group(0) @binding(0) var tex: texture_storage_2d<rgba8unorm, write>;
@compute @workgroup_size(1, 1, 1) fn main(
  @builtin(workgroup_id) workgroup_id : vec3<u32>,
  @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
  @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
  @builtin(local_invocation_index) local_invocation_index: u32,
  @builtin(num_workgroups) num_workgroups: vec3<u32>
) {

  let percent_threads_x = f32(global_invocation_id.x) / f32(num_workgroups.x);
  let percent_threads_y = f32(global_invocation_id.y) / f32(num_workgroups.y);

  let color = vec4<f32>(percent_threads_x, percent_threads_y, percent_threads_x * percent_threads_y, 1.0);
  textureStore(tex, global_invocation_id.xy, color);
}