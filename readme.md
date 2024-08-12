# Learning WebGPU

I already have experience with opengl, cuda. I want to start learning more about webassembly and webgpu so I can run these applications cross platform.
I have a couple projects in mind to do with these technologies, but I want to create an engine to build them with.

Ikik I could use a preexisting engine, but I think these exercises are fun and the unexpected challenges that come with building something like this always teach me something.

## Getting Started

1. You're going to need nodejs
2. Most updated browsers now support webgpu
3. Run `npm run build` and then open `dist/index.html` in the browser
4. If you want a clean slate to work from, see commit #1933e4c9147dd946c3866bfecd2b7c9e3d44d327

## Notes

- Works the same as opengl where you have vertex shaders and fragment shaders
- Screenspace is (-1, -1) at bottom left to (1,1) at top left

The general flow

1. Get the canvas, device, adapter
2. A commandEncoder will be used to build queue of instructions
3. You create a renderpass for the commandEncoder
4. Inside the renderpass is a pipeline with the vertx and fragment shader for your select vertices
5. Execute the command in the commandEncoder queue

### Shaders

Use the wgsl programming language
Seems to have a similar syntax to rust
Vertex shaders are interpolated like opengl

### Specifying Geometry

Create a buffer and add the data.
Then specify the format/stride/offset of the vertices.
Then render, making sure that shader has the location of the buffers aligned properly.
