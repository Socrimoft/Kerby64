// import { Color4, DynamicTexture, InstancedMesh, Mesh, MeshBuilder, Nullable, Texture, TransformNode, Vector3, Vector4, VertexBuffer, VertexData } from "@babylonjs/core";
// import { LevelScene } from "../scenes/levelScene";
// import { Chunk } from "./chunk";
// import { ToonMaterial } from "../materials/toonMaterial";
// import * as blocks from "./blocks.json";
// import * as vertexs from "./vertexData.json";

// const blockList = { ...blocks.sediment, ...blocks.wood, ...blocks.ore, ...blocks.other } as const;
// export type BlockType = keyof (typeof blocks.notABlock & typeof blockList);
// export type BlockList = keyof typeof blockList;

// export class Block {
//     static readonly rootURI = "./assets/images/world/blocks/";
//     public fallUnderGravity = false;
//     public static size = 1;
//     static scene: LevelScene;
//     private static readonly textureSize = 16;
//     //public chunk: Chunk;
//     private mesh: TransformNode | InstancedMesh;

//     // those are the vertex data for the block
//     // they are readonly but updateable
//     static readonly vertexDataBlockposition = new VertexBuffer(Block.scene.getEngine(), vertexs.position.flat(),
//         VertexBuffer.PositionKind, true, false, undefined, undefined, undefined, 3);
//     static readonly vertexDataBlocknormal = new VertexBuffer(Block.scene.getEngine(), vertexs.normals.flat(),
//         VertexBuffer.NormalKind, true, false, undefined, undefined, undefined, 3);
//     /*static readonly vertexDataBlockuv = new VertexBuffer(Block.scene.getEngine(), vertexs.uv.flat(),
//         VertexBuffer.UVKind, true, false, undefined, undefined, undefined, 2);*/
//     static readonly vertexDataBlockcolor = new VertexBuffer(Block.scene.getEngine(), [],
//         VertexBuffer.ColorKind, true, false, undefined, undefined, undefined, 4);

//     static readonly faceUV = [ // TODO: un-mirror the faces
//         new Vector4(1, 0, 2 / 3, 1 / 2),        // Left face
//         new Vector4(1, 1 / 2, 2 / 3, 1),        // Right face
//         new Vector4(1 / 3, 0, 0, 1 / 2),        // Front face
//         new Vector4(1 / 3, 1 / 2, 0, 1),        // Back face
//         new Vector4(2 / 3, 1 / 2, 1 / 3, 1),    // Bottom face
//         new Vector4(2 / 3, 0, 1 / 3, 1 / 2),    // Top face
//     ]

//     static makeVertexBuffer(key: BlockType): VertexData {
//         if (!Block.runtimeMeshBuffer[key]) {
//             if (key in blocks.notABlock)
//                 return this.make2DVertexBuffer(key as keyof typeof blocks.notABlock);

//             let faceColors: Color4[] | undefined = undefined;
//             // add color to greyed faces
//             if (key == "oak_leaves") {
//                 faceColors = [
//                     new Color4(0, 0.48, 0, 1), // Left face
//                     new Color4(0, 0.48, 0, 1), // Right face
//                     new Color4(0, 0.48, 0, 1), // Front face
//                     new Color4(0, 0.48, 0, 1), // Back face
//                     new Color4(0, 0.48, 0, 1), // Bottom face
//                     new Color4(0, 0.48, 0, 1), // Top face
//                 ]
//             }
//             if (key == "grass_block") {
//                 faceColors = [
//                     new Color4(1, 1, 1, 1), // Left face
//                     new Color4(1, 1, 1, 1), // Right face
//                     new Color4(1, 1, 1, 1), // Front face
//                     new Color4(1, 1, 1, 1), // Back face
//                     new Color4(0.48, 0.74, 0.42, 1), // Top face
//                     new Color4(1, 1, 1, 1), // Bottom face
//                 ]
//             }
//             new VertexData()
//             /*Block.runtimeMeshBuffer[key] = MeshBuilder.CreateBox(key, {
//                 size: Block.size, faceUV: Block.faceUV, faceColors, wrap: true
//             }, Block.scene);*/

//             // apply facecolor Color4(0, 0.48, 0, 1) to the top face of "grass_block"
//             const toonMaterial = this.makeMaterial(key as keyof typeof blockList);
//             if (faceColors != undefined)
//                 toonMaterial.useVertexColors();
//             //(Block.runtimeMeshBuffer[key] as Mesh).material = toonMaterial;

//         }
//         //Block.runtimeMeshBuffer[key]!.setEnabled(false);
//         return Block.runtimeMeshBuffer[key]!;
//     }

//     static make2DVertexBuffer(key: keyof typeof blocks.notABlock): VertexData {
//         if (!this.runtimeMaterialBuffer[key]) {
//             const texture = new Texture(this.rootURI + blocks.notABlock[key][0], Block.scene, undefined, undefined, Texture.NEAREST_NEAREST);
//             //this.runtimeMaterialBuffer[key] = new ToonMaterial(texture, this.light, false, Block.scene);
//             this.runtimeMaterialBuffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
//         }

//         // make 2 planes
//         const face1 = MeshBuilder.CreatePlane(key + "_1", { size: Block.size }, Block.scene);
//         face1.position.y = 0.5;
//         face1.rotation.x = Math.PI / 2;
//         face1.material = this.runtimeMaterialBuffer[key];

//         const face2 = MeshBuilder.CreatePlane(key + "_2", { size: Block.size }, Block.scene);
//         face2.position.z = 0.5;
//         face2.rotation.y = Math.PI / 2;
//         face2.material = this.runtimeMaterialBuffer[key];

//         // make a root node
//         const root = new Mesh(key, Block.scene);
//         face2.parent = root;
//         face1.parent = root;
//         root.setEnabled(false);
//         root.checkCollisions = false;
//         return new VertexData();
//     }

//     /**
//     * Make a cube texture from the block list
//     * @param key - the key of the block in the block list
//     * @throws Error if the block is not found
//     */
//     private static makeMaterial(key: keyof typeof blockList) {
//         if (!this.runtimeMaterialBuffer[key]) {
//             // the texture is not in the buffer, so we need to create it
//             if (!(key in blockList)) {
//                 throw new Error(`Block ${key} not found in block database.`);
//             }
//             const filelist = blockList[key];
//             const texture = new DynamicTexture(key + "Texture", { width: this.textureSize * 3, height: this.textureSize * 2 }, Block.scene, true, Texture.NEAREST_SAMPLINGMODE);
//             const context = texture.getContext();

//             // Draw each image onto the canvas
//             let imagesLoaded = 0;
//             filelist.map((file: string) => Block.rootURI + file).forEach((imgUrl, index) => {
//                 let image = new Image();
//                 image.src = imgUrl;
//                 image.onload = () => {
//                     context.drawImage(image, (index % 3) * this.textureSize, index < 3 ? 0 : this.textureSize, this.textureSize, this.textureSize);
//                     imagesLoaded++;
//                     // Update the texture only after all images are loaded and drawn
//                     if (imagesLoaded === filelist.length)
//                         (texture as DynamicTexture).update(undefined, undefined, true);
//                 };
//             });
//             //texture.displayName = key + "Texture";
//             texture.hasAlpha = key === "oak_leaves" || key == "glass" || key == "ice";
//             this.runtimeMaterialBuffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
//         }
//         return this.runtimeMaterialBuffer[key];
//     }
//     constructor(position: Vector3, protected chunk: Chunk, public type: BlockType) {
//         this.mesh = new TransformNode(`block_${position.x},${position.y},${position.z}`, Block.scene);
//         this.mesh.position = position.scale(Block.size);
//     }

//     public async populateMesh(): Promise<Block> {
//         if (this.type) {
//             const incomingMesh = Block.makeVertexBuffer(this.type).clone();
//             //incomingMesh.position = this.mesh.position.scale(Block.size);
//             this.mesh.dispose();
//             //this.mesh = incomingMesh;
//             this.mesh.setEnabled(true);
//             //(this.mesh as InstancedMesh).renderingGroupId = this.mesh.position.y % 4;
//             //(this.mesh as InstancedMesh).occlusionQueryAlgorithmType = Mesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
//             //(this.mesh as InstancedMesh).occlusionType = Mesh.OCCLUSION_TYPE_STRICT;
//             this.mesh.parent = this.chunk;
//         }
//         else {
//             this.mesh.dispose();
//         }
//         (this.mesh as Mesh).receiveShadows = true;
//         (this.mesh as InstancedMesh).checkCollisions = true;
//         return this;
//     }
// }