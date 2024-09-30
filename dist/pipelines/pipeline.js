"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipeLine = void 0;
class PipeLine {
    constructor(shader_path, gpu_pipeline, priority = 0) {
        this.shader_path = shader_path;
        this.order = priority;
        this.gpu_pipeline = gpu_pipeline;
    }
    static get_pipeline_key(shader_path) {
        return `${shader_path}+${this.get_pipeline_label()}`;
    }
    static get_pipeline_label() {
        throw new Error("Please return a unique label for your pipeline from get_pipeline_label");
    }
    // So this is interesting because it is abstract (workaround via error) and static. Not something possible in java lol.
    //
    // Why static?
    //  This is a builder for actual implementations and gives you the instance.
    //
    // Why not just a constructor/inheritance?
    // Because constructors cannot be async, so I have to use a static async function to build the pipeline.
    //  The alternative is to have the constructor of derived class call the async function with a flag that the pipeline is ready...but I don't want to check flags.
    //
    // Why abstract?
    // I want this abstract because every pipeline will have a unique layout and construction requirements, so I have to defer the implementation.
    // Still thinking of a better way to do this...trickiest part of the code rn
    //
    static construct_pipeline(shader_path, scene) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Please implement logic for creating your pipeline, make sure to call super() so the pipeline is registered.");
        });
    }
}
exports.PipeLine = PipeLine;
//# sourceMappingURL=pipeline.js.map