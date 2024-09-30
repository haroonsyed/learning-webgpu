import { PipeLine } from "./pipeline";
interface RegisteredPipelineTypes {
    [key: string]: typeof PipeLine;
}
declare const registered_pipeline_types: RegisteredPipelineTypes;
export { registered_pipeline_types };
//# sourceMappingURL=registered_pipeline_types.d.ts.map