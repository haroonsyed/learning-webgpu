// Vertex Shader
struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) vertex_color : vec4<f32>
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>, @location(1) color: vec4<f32>) -> VertexOutput {
  var output: VertexOutput;
  output.clip_position = pos;
  output.vertex_color = color;
  return output;
}

// Fragment Shader
@fragment
fn fs_main(@location(0) vertex_color: vec4<f32>) -> @location(0) vec4<f32> {
  return vertex_color; // Return color already interpolated from vertex shader
}
