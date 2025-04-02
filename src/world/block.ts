import { Color3, Color4, DirectionalLight, DynamicTexture, InstancedMesh, Mesh, MeshBuilder, Nullable, StandardMaterial, Texture, TransformNode, Vector3, Vector4, VertexBuffer } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Chunk } from "./chunk";
import { ToonMaterial } from "../materials/toonMaterial";
//import { ToonMaterial } from "../materials/toonMaterial";

export type BlockType = keyof (typeof Block.notABlock & typeof Block.blockList);

export class Block {
    static readonly rootURI = "./assets/images/world/blocks/";
    public fallUnderGravity = false;
    public static size = 1;
    static scene: LevelScene;
    static light: DirectionalLight;
    private mesh: TransformNode | InstancedMesh;
    static readonly sediment = {
        "dirt": ["dirt.png"],
        "stone": ["stone.png"],
        "glass": ["glass.png"],
        "obsidian": ["obsidian.png"],
        "grass_block": ["grass_block_side.png", "grass_block_top.png", "grass_block_side.png", "grass_block_side.png", "dirt.png", "grass_block_side.png"],
        "sand": ["sand.png"],
        "gravel": ["gravel.png"],
        "clay": ["clay.png"],
        "snow": ["snow.png"],
        "ice": ["ice.png"],
        "cobblestone": ["cobblestone.png"],
        "stone_bricks": ["stone_bricks.png"],
        "bricks": ["bricks.png"],
        "glowstone": ["glowstone.png"],
        "furnace": ["furnace_front.png", "furnace_top.png", "furnace_side.png", "furnace_side.png", "furnace_top.png", "furnace_side.png"],
        "pumpkin": ["pumpkin_side.png", "pumpkin_top.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png"],
        "carved_pumpkin": ["carved_pumpkin.png", "pumpkin_top.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png"],
    }
    static readonly wood = {
        "oak_leaves": ["oak_leaves.png"],
        "oak_log": ["oak_log.png", "oak_log_top.png", "oak_log.png", "oak_log.png", "oak_log_top.png", "oak_log.png"],
        "oak_planks": ["oak_planks.png"],
        "tnt": ["tnt_side.png", "tnt_top.png", "tnt_side.png", "tnt_side.png", "tnt_bottom.png", "tnt_side.png"],
        "bookshelf": ["bookshelf.png", "oak_planks.png", "bookshelf.png", "bookshelf.png", "oak_planks.png", "bookshelf.png"],
        "coal_block": ["coal_block.png"],
        "hay_block": ["hay_block_side.png", "hay_block_top.png", "hay_block_side.png", "hay_block_side.png", "hay_block_top.png", "hay_block_side.png"],
        "crafting_table": ["crafting_table_front.png", "crafting_table_top.png", "crafting_table_side.png", "crafting_table_side.png", "oak_planks.png", "crafting_table_side.png"]
    }
    static readonly ore = {
        "diamond_ore": ["diamond_ore.png"],
        "gold_ore": ["gold_ore.png"],
        "redstone_ore": ["redstone_ore.png"],
        "coal_ore": ["coal_ore.png"],
        "emerald_ore": ["emerald_ore.png"],
        "lapis_ore": ["lapis_ore.png"],
        "iron_ore": ["iron_ore.png"],
    }
    static readonly notABlock = {
        "sugar_cane": ["sugar_cane.png"],
        "short_grass": ["tall_grass_top.png"],
        "long_grass": ["tall_grass_bottom.png"],
        "red_mushroom": ["red_mushroom.png"],
        "poppy": ["poppy.png"],
        "oak_sappling": ["oak_sapling.png"],
        "dandelion": ["dandelion.png"],
    }
    static readonly other = {
        "bedrock": ["bedrock.png"],
        "jukebox": ["jukebox_side.png", "jukebox_top.png", "jukebox_side.png", "jukebox_side.png", "jukebox_side.png", "jukebox_side.png"],
        "debug": ["debug.png"],
        "debug2": ["debug2.png"],
    }

    static readonly blockList = {
        ...Block.sediment,
        ...Block.wood,
        ...Block.ore,
        ...Block.other
    };

    static runtimeMeshBuffer: { [key in BlockType]: Nullable<Mesh> } = {
        sugar_cane: null,
        short_grass: null,
        long_grass: null,
        red_mushroom: null,
        poppy: null,
        oak_sappling: null,
        dandelion: null,
        bedrock: null,
        jukebox: null,
        debug: null,
        debug2: null,
        diamond_ore: null,
        gold_ore: null,
        redstone_ore: null,
        coal_ore: null,
        emerald_ore: null,
        lapis_ore: null,
        iron_ore: null,
        oak_leaves: null,
        oak_log: null,
        oak_planks: null,
        tnt: null,
        bookshelf: null,
        coal_block: null,
        hay_block: null,
        crafting_table: null,
        dirt: null,
        stone: null,
        glass: null,
        obsidian: null,
        grass_block: null,
        sand: null,
        gravel: null,
        clay: null,
        snow: null,
        ice: null,
        cobblestone: null,
        stone_bricks: null,
        bricks: null,
        glowstone: null,
        furnace: null,
        pumpkin: null,
        carved_pumpkin: null
    };

    static runtimeMaterialBuffer: { [key in BlockType]: Nullable<ToonMaterial> } = {
        furnace: null,
        sugar_cane: null,
        short_grass: null,
        long_grass: null,
        red_mushroom: null,
        poppy: null,
        oak_sappling: null,
        dandelion: null,
        bedrock: null,
        jukebox: null,
        debug: null,
        debug2: null,
        diamond_ore: null,
        gold_ore: null,
        redstone_ore: null,
        coal_ore: null,
        emerald_ore: null,
        lapis_ore: null,
        iron_ore: null,
        oak_leaves: null,
        oak_log: null,
        oak_planks: null,
        tnt: null,
        bookshelf: null,
        coal_block: null,
        hay_block: null,
        crafting_table: null,
        dirt: null,
        stone: null,
        glass: null,
        obsidian: null,
        grass_block: null,
        sand: null,
        gravel: null,
        clay: null,
        snow: null,
        ice: null,
        cobblestone: null,
        stone_bricks: null,
        bricks: null,
        glowstone: null,
        pumpkin: null,
        carved_pumpkin: null
    };
    static readonly faceUV = [ // TODO: un-mirror the faces
        new Vector4(1, 0, 2 / 3, 1 / 2),        // Left face
        new Vector4(1, 1 / 2, 2 / 3, 1),        // Right face
        new Vector4(1 / 3, 0, 0, 1 / 2),        // Front face
        new Vector4(1 / 3, 1 / 2, 0, 1),        // Back face
        new Vector4(2 / 3, 1 / 2, 1 / 3, 1),    // Bottom face
        new Vector4(2 / 3, 0, 1 / 3, 1 / 2),    // Top face
    ]

    static makeMesh(key: BlockType): Mesh {
        if (!Block.runtimeMeshBuffer[key]) {
            if (key in Block.notABlock)
                return this.Make2DMesh(key as keyof typeof this.notABlock);

            let faceColors: Color4[] | undefined = undefined;
            // add color to greyed faces
            if (key == "oak_leaves") {
                faceColors = [
                    new Color4(0, 0.48, 0, 1), // Left face
                    new Color4(0, 0.48, 0, 1), // Right face
                    new Color4(0, 0.48, 0, 1), // Front face
                    new Color4(0, 0.48, 0, 1), // Back face
                    new Color4(0, 0.48, 0, 1), // Bottom face
                    new Color4(0, 0.48, 0, 1), // Top face
                ]
            }
            if (key == "grass_block") {
                faceColors = [
                    new Color4(1, 1, 1, 1), // Left face
                    new Color4(1, 1, 1, 1), // Right face
                    new Color4(1, 1, 1, 1), // Front face
                    new Color4(1, 1, 1, 1), // Back face
                    new Color4(0.48, 0.74, 0.42, 1), // Top face
                    new Color4(1, 1, 1, 1), // Bottom face
                ]
            }
            Block.runtimeMeshBuffer[key] = MeshBuilder.CreateBox(key, {
                size: Block.size, faceUV: Block.faceUV, faceColors, wrap: true
            }, Block.scene);
            Block.runtimeMeshBuffer[key]!.checkCollisions = true;
            // apply facecolor Color4(0, 0.48, 0, 1) to the top face of "grass_block"
            const toonMaterial = this.makeCubeMaterial(key as keyof typeof Block.blockList);
            if (faceColors != undefined)
                toonMaterial.useVertexColors();
            (Block.runtimeMeshBuffer[key] as Mesh).material = toonMaterial;
            
        }
        Block.runtimeMeshBuffer[key]!.setEnabled(false);
        return Block.runtimeMeshBuffer[key];
    }

    static Make2DMesh(key: keyof typeof this.notABlock): Mesh {
        if (!this.runtimeMaterialBuffer[key]) {
            const texture = new Texture(this.rootURI + this.notABlock[key][0], Block.scene, undefined, undefined, Texture.NEAREST_NEAREST);
            //this.runtimeMaterialBuffer[key] = new ToonMaterial(texture, this.light, false, Block.scene);
            this.runtimeMaterialBuffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
        }

        // make 2 planes
        const face1 = MeshBuilder.CreatePlane(key + "_1", { size: 1 }, Block.scene);
        face1.position.y = 0.5;
        face1.rotation.x = Math.PI / 2;
        face1.material = this.runtimeMaterialBuffer[key];

        const face2 = MeshBuilder.CreatePlane(key + "_2", { size: 1 }, Block.scene);
        face2.position.z = 0.5;
        face2.rotation.y = Math.PI / 2;
        face2.material = this.runtimeMaterialBuffer[key];

        // make a root node
        const root = new Mesh(key, Block.scene);
        face2.parent = root;
        face1.parent = root;
        root.setEnabled(false);
        root.checkCollisions = false;
        return root;
    }

    /**
    * Make a cube texture from the block list
    * @param key - the key of the block in the block list
    * @throws Error if the block is not found
    */
    static makeCubeMaterial(key: keyof typeof this.blockList) {
        if (!this.runtimeMaterialBuffer[key]) {
            // the texture is not in the buffer, so we need to create it
            const faces = this.blockList[key];
            let filelist: string[];


            switch (key) {
                case ("dirt"):
                case ("stone"):
                case ("sand"):
                case ("bedrock"):
                case ("bricks"):
                case ("clay"):
                case ("coal_block"):
                case ("coal_ore"):
                case ("cobblestone"):
                case ("debug"):
                case ("debug2"):
                case ("diamond_ore"):
                case ("emerald_ore"):
                case ("glass"):
                case ("glowstone"):
                case ("gold_ore"):
                case ("gravel"):
                case ("ice"):
                case ("iron_ore"):
                case ("lapis_ore"):
                case ("oak_planks"):
                case ("obsidian"):
                case ("redstone_ore"):
                case ("stone_bricks"):
                case ("oak_leaves"):
                case ("snow"):
                    // blocks with 6 identical faces
                    filelist = [faces[0], faces[0], faces[0], faces[0], faces[0], faces[0]]
                    break;
                case ("grass_block"):
                case ("hay_block"):
                case ("jukebox"):
                case ("oak_log"):
                case ("pumpkin"):
                case ("bookshelf"):
                case ("crafting_table"):
                case ("tnt"):
                case ("carved_pumpkin"):
                case ("furnace"):
                    // blocks with 6 different faces (DynamicTexture)
                    filelist = faces;
                    break;
                default:
                    throw new Error(`Block ${key} not found`);
            };
            const texture = new DynamicTexture(key + "Texture", { width: 48, height: 32 }, Block.scene, true, Texture.NEAREST_SAMPLINGMODE);
            const context = (texture as DynamicTexture).getContext();

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
            texture.hasAlpha = true;
            this.runtimeMaterialBuffer[key] = new ToonMaterial(key + "Material", texture, Block.scene);
            //this.runtimeMaterialBuffer[key].specularColor = new Color3(0, 0, 0);
            this.runtimeMaterialBuffer[key].needDepthPrePass = true;
        }
        return this.runtimeMaterialBuffer[key];
    }
    constructor(position: Vector3, protected chunk: Chunk, public type?: BlockType) {
        this.mesh = new TransformNode(`block_${position.x},${position.y},${position.z}`, Block.scene);
        this.mesh.position = position.scale(Block.size);
    }

    public async populateMesh(meshTemplate?: Mesh): Promise<Block> {
        if (this.type) {
            const incomingMesh = (meshTemplate ? meshTemplate : Block.makeMesh(this.type)).createInstance(this.mesh.name);
            incomingMesh.position = this.mesh.position;
            this.mesh.dispose();
            this.mesh = incomingMesh;
            this.mesh.setEnabled(true);
            this.mesh.parent = this.chunk;
        }
        else {
            this.mesh.dispose();
        }
        (this.mesh as InstancedMesh).checkCollisions = true;
        return this;
    }
}