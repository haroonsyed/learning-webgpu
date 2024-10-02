const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "syed-webgpu-engine",
      formats: ["es"],
      fileName: (format) => `index.js`,
    },
    sourcemap: "inline",
  },
});
