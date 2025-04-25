import { Color4, DynamicTexture, Engine, InstancedMesh, Logger, Mesh, MeshBuilder, Nullable, Texture, TransformNode, Vector3, Vector4, VertexBuffer, VertexData } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Chunk } from "./chunk";
import { ToonMaterial } from "../materials/toonMaterial";
import blocks from "./blocks.json";
import vertexs from "./vertexData.json"; // 24 * kindsize
import vertexs2 from "./vertexData2d.json"; // 16 * kindsize

export { blocks };
export const notaBlockList = Object.keys(blocks.notABlock) as (keyof typeof blocks.notABlock)[];
export const blockList = { ...blocks.sediment, ...blocks.wood, ...blocks.ore, ...blocks.other } as const;
export const blockTypeList = ["air", ...Object.keys(blockList)] as (keyof typeof blockList | "air")[];
export const blockTypeCount = blockTypeList.length;

export const BlockType = Object.fromEntries(
    blockTypeList.map((name, index) => [name, index])
) as { [K in typeof blockTypeList[number]]: number };

export type BlockType = keyof typeof BlockType;

export class Block {
    private static readonly rootURI = "./assets/images/world/blocks/";
    private static atlas: DynamicTexture;

    public static size = 1;

    public static readonly faceUV = [
        // x+ y+ z+
        // x- y- z-
        new Vector4(2 / 3, 0.5, 1, 1),      // side 0 faces the positive z direction = left face
        new Vector4(2 / 3, 0, 1, 0.5),      // side 1 faces the negative z direction = right face
        new Vector4(0, 0.5, 1 / 3, 1),      // side 2 faces the positive x direction = front face
        new Vector4(0, 0, 1 / 3, 0.5),      // side 3 faces the negative x direction = back face
        new Vector4(1 / 3, 0.5, 2 / 3, 1),  // side 4 faces the positive y direction = top face
        new Vector4(1 / 3, 0, 2 / 3, 0.5),  // side 5 faces the negative y direction = bottom face
    ];

    public static generateTextureAtlas(scene: LevelScene): DynamicTexture {
        // make texture atlas
        this.atlas = new DynamicTexture("block_atlas", { width: 96, height: 16 * blockTypeCount }, scene, true, Texture.NEAREST_SAMPLINGMODE, Engine.TEXTUREFORMAT_RGBA);
        console.log("atlas size: ", this.atlas.getSize());

        for (let i = 1; i < blockTypeCount; i++) {
            const filelist = blockList[blockTypeList[i]];
            const color = this.getFaceColors(blockTypeList[i]);

            // Draw each image onto the canvas
            filelist.map(file => Block.rootURI + file).forEach((imgUrl, index) => {
                let image = new Image();
                image.src = imgUrl;
                image.onload = () => {
                    const dx = index * 16;
                    const dy = i * 16;
                    
                    this.atlas.getContext().drawImage(image, dx, dy, 16, 16); // Adjust placement on canvas

                    const imageData = this.atlas.getContext().getImageData(dx, dy, 16, 16);

                    for (let j = 0; j < imageData.data.length; j += 4) {
                        imageData.data[j] *= color[index].r;
                        imageData.data[j + 1] *= color[index].g;
                        imageData.data[j + 2] *= color[index].b;
                    }

                    this.atlas.getContext().putImageData(imageData, dx, dy);

                    this.atlas.update(undefined, undefined, true);
                };
            });
        }
        this.atlas.hasAlpha = true;

        // for (const key of notaBlockList) {
        //     const texture = new Texture(this.rootURI + blocks.notABlock[key][0], Block.scene, undefined, undefined, Texture.NEAREST_NEAREST);
        //     texture.hasAlpha = true;
        //     buffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
        // }

        return this.atlas;
    }

    public static getTextureAtlas(): DynamicTexture {
        return this.atlas;
    }

    public static getBlockTypeFromId(id: number): BlockType {
        return blockTypeList[id];
    }

    public static getFaceColors(key: BlockType): Array<Color4> {
        // add color to greyed faces
        switch (key) {
            case "oak_leaves":
                return [
                    new Color4(0, 0.48, 0, 1), // +X
                    new Color4(0, 0.48, 0, 1), // -X
                    new Color4(0, 0.48, 0, 1), // +Y
                    new Color4(0, 0.48, 0, 1), // -Y
                    new Color4(0, 0.48, 0, 1), // +Z
                    new Color4(0, 0.48, 0, 1), // -Z
                ];
            case "grass_block":
                return [
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(0.48, 0.74, 0.42, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                ];
            default:
                return [
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                    new Color4(1, 1, 1, 1),
                ];
        }
    }

    // static makeRuntimeMeshBuffer() {
    //     for (const key of notaBlockList) {
    //         const face1 = MeshBuilder.CreatePlane(key + "_1", { size: Block.size, sideOrientation: Mesh.DOUBLESIDE }, Block.scene);
    //         face1.rotation.y = 3 * Math.PI / 4;
    //         face1.material = this.runtimeMaterialBuffer[key];

    //         const face2 = MeshBuilder.CreatePlane(key + "_2", { size: Block.size, sideOrientation: Mesh.DOUBLESIDE }, Block.scene);
    //         face2.rotation.y = Math.PI / 4;
    //         face2.material = this.runtimeMaterialBuffer[key];

    //         // make a root node
    //         const root = Mesh.MergeMeshes([face1, face2])!;
    //         root.setEnabled(false);
    //         root.checkCollisions = false;
    //         buffer[key] = root;
    //     }
    //     this.runtimeMeshBuffer = buffer;
    // }
}
