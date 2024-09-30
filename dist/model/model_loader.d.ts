declare const models: {
    [key: string]: ModelData;
};
type ModelData = {
    vertex_data_gpu: GPUBuffer;
    indices_gpu: GPUBuffer;
    index_count: number;
};
declare const load_model: (model_path: string | undefined) => Promise<void>;
export { load_model, models };
//# sourceMappingURL=model_loader.d.ts.map