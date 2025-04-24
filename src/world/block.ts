import { Color4, DynamicTexture, InstancedMesh, Logger, Mesh, MeshBuilder, Nullable, Texture, TransformNode, Vector3, Vector4, VertexBuffer, VertexData } from "@babylonjs/core";
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
        this.atlas = new DynamicTexture("block_atlas", { width: 96, height: 16 * Object.keys(blockList).length }, scene, true, Texture.NEAREST_SAMPLINGMODE);

        for (let i = 1; i < blockTypeList.length; i++) {
            const filelist = blockList[blockTypeList[i]];

            // Draw each image onto the canvas
            filelist.map(file => Block.rootURI + file).forEach((imgUrl, index) => {
                let image = new Image();
                image.src = imgUrl;
                image.onload = () => {
                    this.atlas.getContext().drawImage(image, index * 16, i * 16, 16, 16); // Adjust placement on canvas
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
                    new Color4(0, 0.48, 0, 1), // Left face
                    new Color4(0, 0.48, 0, 1), // Right face
                    new Color4(0, 0.48, 0, 1), // Front face
                    new Color4(0, 0.48, 0, 1), // Back face
                    new Color4(0, 0.48, 0, 1), // Bottom face
                    new Color4(0, 0.48, 0, 1), // Top face
                ];
            case "grass_block":
                return [
                    new Color4(1, 1, 1, 1), // Left face
                    new Color4(1, 1, 1, 1), // Right face
                    new Color4(1, 1, 1, 1), // Front face
                    new Color4(1, 1, 1, 1), // Back face
                    new Color4(0.48, 0.74, 0.42, 1), // Top face
                    new Color4(1, 1, 1, 1), // Bottom face
                ];
            default:
                return [
                    new Color4(1, 1, 1, 1), // Left face
                    new Color4(1, 1, 1, 1), // Right face
                    new Color4(1, 1, 1, 1), // Front face
                    new Color4(1, 1, 1, 1), // Back face
                    new Color4(1, 1, 1, 1), // Bottom face
                    new Color4(1, 1, 1, 1), // Top face
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
