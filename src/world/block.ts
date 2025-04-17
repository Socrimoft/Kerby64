import { Color4, DynamicTexture, InstancedMesh, Logger, Mesh, MeshBuilder, Nullable, Texture, TransformNode, Vector3, Vector4, VertexBuffer, VertexData } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Chunk } from "./chunk";
import { ToonMaterial } from "../materials/toonMaterial";
import blocks from "./blocks.json";
import vertexs from "./vertexData.json"; // 24 * kindsize
import vertexs2 from "./vertexData2.json"; // 16 * kindsize

export { blocks };
export const notaBlockList = Object.keys(blocks.notABlock) as (keyof typeof blocks.notABlock)[];
export const blockList = { ...blocks.sediment, ...blocks.wood, ...blocks.ore, ...blocks.other } as const;
export const blockTypeList = Object.keys(blockList) as (keyof typeof blockList)[];
export type BlockType = keyof (typeof blocks.notABlock & typeof blockList);

export class Block {
    static readonly rootURI = "./assets/images/world/blocks/";
    public fallUnderGravity = false;
    public static size = 1;
    static scene: LevelScene;
    private vertexData: VertexData;
    private mesh: TransformNode | InstancedMesh;

    static runtimeMeshBuffer: { [key in BlockType]: Mesh };

    static runtimeMaterialBuffer: { [key in BlockType]: ToonMaterial };

    static readonly faceUV = [
        // x+ y+ z+
        // x- y- z-
        new Vector4(2 / 3, 0.5, 1, 1),      // side 0 faces the positive z direction = left face
        new Vector4(2 / 3, 0, 1, 0.5),      // side 1 faces the negative z direction = right face
        new Vector4(0, 0.5, 1 / 3, 1),      // side 2 faces the positive x direction = front face
        new Vector4(0, 0, 1 / 3, 0.5),      // side 3 faces the negative x direction = back face
        new Vector4(1 / 3, 0.5, 2 / 3, 1),  // side 4 faces the positive y direction = top face
        new Vector4(1 / 3, 0, 2 / 3, 0.5),  // side 5 faces the negative y direction = bottom face
    ]

    static makeRuntimeMeshBuffer() {
        const buffer: { [key in BlockType]: Mesh } = {} as any;
        for (const key of blockTypeList) {
            let faceColors: Color4[];
            // add color to greyed faces
            switch (key) {
                case "oak_leaves":
                    faceColors = [
                        new Color4(0, 0.48, 0, 1), // Left face
                        new Color4(0, 0.48, 0, 1), // Right face
                        new Color4(0, 0.48, 0, 1), // Front face
                        new Color4(0, 0.48, 0, 1), // Back face
                        new Color4(0, 0.48, 0, 1), // Bottom face
                        new Color4(0, 0.48, 0, 1), // Top face
                    ]
                    break;
                case "grass_block":
                    faceColors = [
                        new Color4(1, 1, 1, 1), // Left face
                        new Color4(1, 1, 1, 1), // Right face
                        new Color4(1, 1, 1, 1), // Front face
                        new Color4(1, 1, 1, 1), // Back face
                        new Color4(0.48, 0.74, 0.42, 1), // Top face
                        new Color4(1, 1, 1, 1), // Bottom face
                    ]
                    break;
                default:
                    faceColors = [
                        new Color4(1, 1, 1, 1), // Left face
                        new Color4(1, 1, 1, 1), // Right face
                        new Color4(1, 1, 1, 1), // Front face
                        new Color4(1, 1, 1, 1), // Back face
                        new Color4(1, 1, 1, 1), // Bottom face
                        new Color4(1, 1, 1, 1), // Top face
                    ]
                    break;
            }
            const mesh = MeshBuilder.CreateBox(key, {
                size: Block.size, faceUV: Block.faceUV, faceColors, wrap: true
            }, Block.scene);
            mesh.material = this.runtimeMaterialBuffer[key];
            mesh.setEnabled(false);
            mesh.checkCollisions = false;
            mesh.receiveShadows = false;
            buffer[key] = mesh;
        }
        for (const key of notaBlockList) {
            const face1 = MeshBuilder.CreatePlane(key + "_1", { size: Block.size, sideOrientation: Mesh.DOUBLESIDE }, Block.scene);
            face1.rotation.y = 3 * Math.PI / 4;
            face1.material = this.runtimeMaterialBuffer[key];

            const face2 = MeshBuilder.CreatePlane(key + "_2", { size: Block.size, sideOrientation: Mesh.DOUBLESIDE }, Block.scene);
            face2.rotation.y = Math.PI / 4;
            face2.material = this.runtimeMaterialBuffer[key];

            // make a root node
            const root = Mesh.MergeMeshes([face1, face2])!;
            root.setEnabled(false);
            let colors: Color4[] = [];
            for (let i = 0; i < 16; i++) {
                switch (key) {
                    case "long_grass":
                    case "short_grass":
                        colors.push(new Color4(0, 0.48, 0, 1));
                        break;
                    default:
                        colors.push(new Color4(1, 1, 1, 1));
                }
            }
            root.setVerticesData(VertexBuffer.ColorKind, colors.map((v) => v.asArray()).flat());
            root.useVertexColors = true;
            root.checkCollisions = false;
            buffer[key] = root;
        }
        this.runtimeMeshBuffer = buffer;
    }

    static makeRuntimeMaterialBuffer() {
        const buffer: { [key in BlockType]: ToonMaterial } = {} as any;
        for (const key of blockTypeList) {
            const filelist = blockList[key];
            const texture = new DynamicTexture(key + "Texture", { width: 48, height: 32 }, Block.scene, true, Texture.NEAREST_SAMPLINGMODE);
            const context = texture.getContext();

            // Draw each image onto the canvas
            let imagesLoaded = 0;
            filelist.map(file => Block.rootURI + file).forEach((imgUrl, index) => {
                let image = new Image();
                image.src = imgUrl;
                image.onload = () => {
                    context.drawImage(image, (index % 3) * 16, index < 3 ? 0 : 16, 16, 16); // Adjust placement on canvas
                    imagesLoaded++;
                    // Update the texture only after all images are loaded and drawn
                    if (imagesLoaded === filelist.length)
                        (texture as DynamicTexture).update(undefined, undefined, true);
                };
            });
            //texture.displayName = key + "Texture";
            texture.hasAlpha = key === "oak_leaves" || key == "glass" || key == "ice";
            buffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
        }
        for (const key of notaBlockList) {
            const texture = new Texture(this.rootURI + blocks.notABlock[key][0], Block.scene, undefined, undefined, Texture.NEAREST_NEAREST);
            texture.hasAlpha = true;
            buffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
        }
        this.runtimeMaterialBuffer = buffer;

    }

    constructor(public position: Vector3, protected chunk: Chunk, public type: BlockType) {
        this.mesh = new TransformNode(`block_${position.x},${position.y},${position.z}`, Block.scene);
        this.mesh.position = position.scale(Block.size);
        this.vertexData = new VertexData();
        this.vertexData.positions = vertexs.positions.map(
            (v) => [
                (v[0] + position.x) * Block.size,
                (v[1] + position.y) * Block.size,
                (v[2] + position.z) * Block.size
            ]).flat();
        this.vertexData.normals = vertexs.normals.flat();
        this.vertexData.uvs = vertexs.uvs.flat();
        let colors: Color4[] = [];
        for (let i = 0; i < 24 * 4; i++) {
            colors.push(new Color4(1, 1, 1, 1));
        }
        this.vertexData.colors = colors.map((v) => v.asArray()).flat();
    }

    public async populateMesh(): Promise<Block> {
        const incomingMesh = Block.runtimeMeshBuffer[this.type].clone(this.mesh.name);
        incomingMesh.position = this.mesh.position.scale(Block.size);
        this.mesh.dispose();
        this.mesh = incomingMesh;
        this.mesh.setEnabled(true);
        (this.mesh as InstancedMesh).checkCollisions = !((notaBlockList as string[]).includes(this.type));
        (this.mesh as InstancedMesh).receiveShadows = true;
        //(this.mesh as InstancedMesh).alwaysSelectAsActiveMesh = true;
        //(this.mesh as InstancedMesh).occlusionQueryAlgorithmType = Mesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
        //(this.mesh as InstancedMesh).occlusionType = Mesh.OCCLUSION_TYPE_STRICT;
        this.mesh.parent = this.chunk;
        return this;
    }
}