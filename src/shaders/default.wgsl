// Uniforms
struct LightUniformData{
  position: vec4<f32>, // Includes type in the w channel (unused)
  color: vec4<f32>, // Includes intensity in the alpha channel
}
struct Uniforms {
  model: mat4x4<f32>,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
  lights: array<LightUniformData, 10>,
  light_count: u32,
  unused_0: u32,
  unused_1: u32,
  unused_2: u32,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

// Vertex Shader
struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) vertex_color : vec4<f32>
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>, @location(1) normal: vec4<f32>, @location(2) uv_coord: vec4<f32>, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.clip_position = uniforms.projection * uniforms.view * uniforms.model * pos;

  const colors = array(
    vec4<f32>(0.0, 0.0, 1.0, 1.0), // front - blue
    vec4<f32>(1.0, 0.0, 0.0, 1.0), // right - red
    vec4<f32>(1.0, 1.0, 0.0, 1.0), // back - yellow
    vec4<f32>(0.0, 1.0, 1.0, 1.0), // left - aqua
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // top - green
    vec4<f32>(1.0, 0.0, 1.0, 1.0),  // bottom - fuchsia
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // top - green
    vec4<f32>(1.0, 0.0, 1.0, 1.0),  // bottom - fuchsia
    vec4<f32>(0.0, 0.0, 1.0, 1.0), // front - blue
    vec4<f32>(1.0, 0.0, 0.0, 1.0), // right - red
    vec4<f32>(1.0, 1.0, 0.0, 1.0), // back - yellow
    vec4<f32>(0.0, 1.0, 1.0, 1.0), // left - aqua
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // top - green
    vec4<f32>(1.0, 0.0, 1.0, 1.0),  // bottom - fuchsia
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // top - green
    vec4<f32>(1.0, 0.0, 1.0, 1.0),  // bottom - fuchsia
  );
  
  output.vertex_color = colors[vertexIndex % 8];
  return output;
}

// Fragment Shader
@fragment
fn fs_main(@location(0) vertex_color: vec4<f32>) -> @location(0) vec4<f32> {
  return vertex_color; // Return color already interpolated from vertex shader
}
