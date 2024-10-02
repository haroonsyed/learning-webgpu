// Uniforms
struct LightUniformData{
  position: vec4<f32>, // Includes type in the w channel (unused)
  color: vec4<f32>, // Includes intensity in the alpha channel
};
struct Uniforms {
  diffuse_strength: f32,
  specular_strength: f32,
  normal_strength: f32,
  light_count: f32,
  view: mat4x4<f32>,
  projection: mat4x4<f32>,
  lights: array<LightUniformData, 10>,
};

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

// Vertex Shader
struct VertexOutput {
  @builtin(position) clip_position : vec4<f32>,
  @location(0) world_position: vec4<f32>,
  @location(1) tex_coord : vec4<f32>,
  @location(2) normal : vec4<f32>,
};

@group(0) @binding(5) var<storage, read> model_transforms: array<mat4x4<f32>>;


@vertex
fn vs_main(@location(0) pos: vec4<f32>, @location(1) uv_coord: vec4<f32>, @location(2) normal: vec4<f32>, @builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {  
  var output: VertexOutput;

  // /// ================
  // //  SANITY CHECK
  // /// ================
  // const tri_points = array(
  //   vec2(0.0, 1),
  //   vec2(-1, -1),
  //   vec2(1, -1)
  // );

  // const tri_colors = array(
  //   vec4(1.0, 0.0, 0.0, 1.0),
  //   vec4(0.0, 1.0, 0.0, 1.0),
  //   vec4(0.0, 0.0, 1.0, 1.0)
  // );

  // output.clip_position = vec4<f32>(tri_points[vertexIndex], 0.0, 1.0);
  // output.world_position = tri_colors[vertexIndex];
  // return output;
  // /// ================
  // //  SANITY CHECK
  // /// ================
  
  output.clip_position = uniforms.projection * uniforms.view * model_transforms[instanceIndex] * pos;
  output.world_position = (model_transforms[instanceIndex] * pos);
  output.tex_coord = uv_coord;
  output.normal = (model_transforms[instanceIndex] * normal); // Should I do TBN?
  return output;
}

// Fragment Shader
@group(0) @binding(1) var my_sampler: sampler;
@group(0) @binding(2) var diffuse_texture: texture_2d<f32>;
@group(0) @binding(3) var specular_texture: texture_2d<f32>;
@group(0) @binding(4) var normal_texture: texture_2d<f32>;

@fragment
fn fs_main(@location(0) world_position: vec4<f32>, @location(1) tex_coord: vec4<f32>, @location(2) raw_normal: vec4<f32>) -> @location(0) vec4<f32> {

  // /// ================
  // //  SANITY CHECK
  // /// ================
  // return world_position;
  // /// ================
  // //  SANITY CHECK
  // /// ================

  // Move default and configurable items like ambient strength to uniforms
  const ambient_strength: f32 = 0.1;

  var diffuse_texture: vec3<f32> = select(textureSample(diffuse_texture, my_sampler, tex_coord.xy), vec4<f32>(1.0, 0.1, 0.1, 1.0), uniforms.diffuse_strength == 0.0).xyz;
  var specular_texture: vec3<f32> = textureSample(specular_texture, my_sampler, tex_coord.xy).xyz;
  var normal_texture: vec3<f32> = textureSample(normal_texture, my_sampler, tex_coord.xy).xyz;

  // Adjust normal
  var normal = normalize(raw_normal.xyz);
  // if(uniforms.normal_strength != 0.0){
  //   normal = normal_texture.xyz * 2.0 - 1.0; // Convert from [0, 1] to [-1, 1]
  //   normal = normalize(normal);
  // }

  var out_color: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);
  // Iterate through the lights
  for (var i=0; i< i32(uniforms.light_count) ; i++) {
    var light = uniforms.lights[0];
    var light_position = light.position.xyz;
    var light_color = light.color.rgb;
    var light_intensity = light.color.a;

    // var to_light = normalize(light_position - world_position.xyz);
    // var view_dir = normalize(world_position.xyz);
    // var reflect_dir = normalize((-view_dir) + to_light);

    // var specular_strength_final = select(0.0, uniforms.specular_strength, dot(normal, to_light) > 0.0);

    // var diffuse_strength = max(dot(normal, to_light), 0.0);
    // var phong_exp = 1.0;
    // var specular_strength = pow(max(dot(normal, reflect_dir), 0.0), phong_exp);

    // var specular_color = select(light_color * specular_texture, vec3<f32>(1.0, 1.0, 1.0), specular_strength_final == 0.0);

    // var distance = length(light_position - world_position.xyz);
    // var attenuation = 1.0 / (distance * distance);
    // light_intensity *= attenuation;

    // out_color += light_intensity * ( (ambient_strength + diffuse_strength) * diffuse_texture * light_color + specular_strength * specular_color);
  
    var to_light = normalize(light_position - world_position.xyz);
    // var diffuse_strength = max(dot(normal, to_light), 0.0);
    var diffuse_strength = 1.0;
    out_color += light_intensity * ( (ambient_strength + diffuse_strength) * diffuse_texture ) * light_color;
  }

  return vec4<f32>(out_color, 1.0);
}
