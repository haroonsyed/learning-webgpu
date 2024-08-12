// Uniforms
struct LightUniformData{
  position: vec4<f32>, // Includes type in the w channel (unused)
  color: vec4<f32>, // Includes intensity in the alpha channel
}
struct Uniforms {
  model: mat4x4<f32>,
  diffuse_present: f32,
  specular_present: f32,
  normal_present: f32,
  light_count: u32,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
  lights: array<LightUniformData, 10>,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

// Vertex Shader
struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) tex_coord : vec4<f32>
};

@vertex
fn vs_main(@location(0) pos: vec4<f32>, @location(1) normal: vec4<f32>, @location(2) uv_coord: vec4<f32>, @builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.clip_position = uniforms.projection * uniforms.view * uniforms.model * pos;
  
  output.tex_coord = uv_coord;
  return output;
}

// Fragment Shader
@group(0) @binding(1) var my_sampler: sampler;
@group(0) @binding(2) var diffuse_texture: texture_2d<f32>;
@group(0) @binding(3) var specular_texture: texture_2d<f32>;
@group(0) @binding(4) var normal_texture: texture_2d<f32>;

@fragment
fn fs_main(@location(0) tex_coord: vec4<f32>) -> @location(0) vec4<f32> {
  return textureSample(diffuse_texture, my_sampler, tex_coord.xy);
}
