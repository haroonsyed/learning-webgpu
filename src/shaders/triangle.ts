const triangle_shader_code = `
// Vertex Shader
struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) color : vec4<f32>
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  const tri_points = array(
    vec2(0.0, 1),
    vec2(-1, -1),
    vec2(1, -1)
  );

  const tri_colors = array(
    vec4(1.0, 0.0, 0.0, 1.0),
    vec4(0.0, 1.0, 0.0, 1.0),
    vec4(0.0, 0.0, 1.0, 1.0)
  );

  var output: VertexOutput;
  output.clip_position = vec4<f32>(tri_points[vertexIndex], 0.0, 1.0);
  output.color = tri_colors[vertexIndex];
  return output;
}

// Fragment Shader
@fragment
fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
  return color; // Return color already interpolated from vertex shader
}
`;

export default triangle_shader_code;
