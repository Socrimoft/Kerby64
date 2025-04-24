import { ComputeShader, Constants, DataBuffer, DrawWrapper, Engine, StorageBuffer, UniformBuffer, Vector3, WebGPUDataBuffer, WebGPUDrawContext, WebGPUEngine } from "@babylonjs/core";
import chunkComputeShader from "./chunkCompute.wgsl";
import { Block, BlockType, blockTypeCount, blockTypeList } from "../../world/block";

export class ChunkCompute extends ComputeShader {
    private engine: WebGPUEngine;

    private chunkSize: Vector3;

    private uniforms: UniformBuffer;
    private chunkBuffer: StorageBuffer;
    public vertexBuffer: StorageBuffer;
    public indexBuffer: StorageBuffer;
    public counterBuffer: StorageBuffer;
    private dispatchParamsBuffer: StorageBuffer;
    // private indirectDrawBuffer: StorageBuffer;

    private workGroupSize: Vector3 = new Vector3(8, 8, 1);

    constructor(engine: WebGPUEngine, chunkSize: Vector3) {
        super("chunkCompute", engine, { computeSource: chunkComputeShader }, {
            bindingsMapping:
            {
                "uniforms": { group: 0, binding: 0 },
                "chunkBuffer": { group: 0, binding: 1 },
                "vertexBuffer": { group: 0, binding: 2 },
                "indexBuffer": { group: 0, binding: 3 },
                "counterBuffer": { group: 0, binding: 4 },
                // "indirectArgsBuffer": { group: 0, binding: 5 },
            }
        });
        this.engine = engine;
        this.chunkSize = chunkSize;

        this.uniforms = new UniformBuffer(engine);
        this.uniforms.addUniform("chunkSize", [...this.chunkSize.asArray(), blockTypeCount]);
        this.uniforms.update();

        this.chunkBuffer = new StorageBuffer(engine, chunkSize.x * chunkSize.y * chunkSize.z * 4, Constants.BUFFER_CREATIONFLAG_READWRITE);

        const facesCount = chunkSize.x * chunkSize.y * chunkSize.z * 6;
        this.vertexBuffer = new StorageBuffer(engine, facesCount * 4 * (4 + 4 + 2 + 2) * 4, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_READWRITE); // faces * vertex * struct size * float
        this.indexBuffer = new StorageBuffer(engine, facesCount * 2 * 3 * 4, Constants.BUFFER_CREATIONFLAG_INDEX | Constants.BUFFER_CREATIONFLAG_READWRITE); // faces * fragment * vertex * u32
        this.counterBuffer = new StorageBuffer(engine, 4, Constants.BUFFER_CREATIONFLAG_READWRITE); // u32

        this.dispatchParamsBuffer = new StorageBuffer(engine, 3 * 4, Constants.BUFFER_CREATIONFLAG_INDIRECT | Constants.BUFFER_CREATIONFLAG_READWRITE);
        this.dispatchParamsBuffer.update(new Uint32Array([this.chunkSize.x / this.workGroupSize.x, this.chunkSize.y / this.workGroupSize.y, this.chunkSize.z / this.workGroupSize.z]));

        // this.indirectDrawBuffer = new StorageBuffer(engine, 5 * 4, Constants.BUFFER_CREATIONFLAG_STORAGE | Constants.BUFFER_CREATIONFLAG_INDIRECT);

        // magouille mais rapide
        // console.log(drawWrapper);
        // const drawContext: WebGPUDrawContext = drawWrapper?.drawContext as WebGPUDrawContext;
        // const gpuBuffer = this.indirectDrawBuffer.getBuffer().underlyingResource as GPUBuffer;
        // drawContext.indirectDrawBuffer = gpuBuffer;

        this.setUniformBuffer("uniforms", this.uniforms);
        this.setStorageBuffer("chunkBuffer", this.chunkBuffer);
        this.setStorageBuffer("vertexBuffer", this.vertexBuffer);
        this.setStorageBuffer("indexBuffer", this.indexBuffer);
        this.setStorageBuffer("counterBuffer", this.counterBuffer);
        // this.setStorageBuffer("indirectDrawBuffer", this.indirectDrawBuffer);
    }

    public updateGeometry(blocks: Uint32Array, position?: Vector3): void {
        if (position)
            this.uniforms.updateVector3("chunkPos", position);
        this.chunkBuffer.update(blocks);
        // this.counterBuffer.update(new Uint32Array([0]), 0, 4);

        // let blockIndex = 0 + 2 * this.chunkSize.x + 15 * this.chunkSize.x * this.chunkSize.y;
        // console.log(blocks[blockIndex]);

        this.dispatchIndirect(this.dispatchParamsBuffer);
        // await this.dispatchWhenReady(this.chunkSize.x / this.workGroupSize.x, this.chunkSize.y / this.workGroupSize.y, this.chunkSize.z / this.workGroupSize.z);

        // TODO: indirect drawing if possible
    }

    // magouille
    public waitForReady(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isReady()) {
                resolve();
            }
            else {
                const checkReady = () => {
                    if (this.isReady()) {
                        this.engine.onEndFrameObservable.removeCallback(checkReady);
                        resolve();
                    }
                };
                this.engine.onEndFrameObservable.add(checkReady);
            }
        });
    }
}
