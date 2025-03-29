import { CubeTexture, DirectionalLight, InstancedMesh, Mesh, MeshBuilder, Nullable, Texture, TransformNode, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Chunk } from "./chunk";
import { ToonMaterial } from "../materials/toonMaterial";

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
        "grass_block": ["grass_block_top.png", "dirt.png", "grass_block_side.png", "grass_block_side.png", "grass_block_side.png", "grass_block_side.png"],
        "sand": ["sand.png"],
        "gravel": ["gravel.png"],
        "clay": ["clay.png"],
        "snow": ["snow.png"],
        "ice": ["ice.png"],
        "cobblestone": ["cobblestone.png"],
        "stone_bricks": ["stone_bricks.png"],
        "bricks": ["bricks.png"],
        "glowstone": ["glowstone.png"],
        "furnace": ["furnace_front.png", "furnace_side.png", "furnace_top.png", "furnace_side.png", "furnace_side.png", "furnace_side.png"],
        "pumpkin": ["pumpkin_side.png", "pumpkin_side.png", "pumpkin_top.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png"],
        "carved_pumpkin": ["carved_pumpkin.png", "pumpkin_side.png", "pumpkin_top.png", "pumpkin_side.png", "pumpkin_side.png", "pumpkin_side.png"],
    }
    static readonly wood = {
        "oak_leaves": ["oak_leaves.png"],
        "oak_log": ["oak_log.png", "oak_log.png", "oak_log_top.png", "oak_log.png", "oak_log.png", "oak_log_top.png"],
        "oak_planks": ["oak_planks.png"],
        "tnt": ["tnt_side.png", "tnt_side.png", "tnt_top.png", "tnt_side.png", "tnt_side.png", "tnt_bottom.png"],
        "bookshelf": ["bookshelf.png", "bookshelf.png", "oak_planks.png", "bookshelf.png", "bookshelf.png", "oak_planks.png"],
        "coal_block": ["coal_block.png"],
        "hay_block": ["hay_block_side.png", "hay_block_side.png", "hay_block_top.png", "hay_block_side.png", "hay_block_side.png", "hay_block_side.png"],
        "crafting_table": ["crafting_table_front.png", "crafting_table_side.png", "crafting_table_top.png", "crafting_table_side.png", "crafting_table_side.png"]
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
        "oak_sappling": ["oak_sappling.png"],
        "dandelion": ["dandelion.png"],
    }
    static readonly other = {
        "bedrock": ["bedrock.png"],
        "jukebox": ["jukebox_side.png", "jukebox_side.png", "jukebox_top.png", "jukebox_side.png", "jukebox_side.png", "jukebox_side.png"],
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

    static makeMesh(key: BlockType): Mesh {
        if (!Block.runtimeMeshBuffer[key]) {
            if (key in Block.notABlock)
                return this.Make2DMesh(key as keyof typeof this.notABlock);

            Block.runtimeMeshBuffer[key] = MeshBuilder.CreateBox(key, { size: Block.size }, Block.scene);
            (Block.runtimeMeshBuffer[key] as Mesh).material = this.makeCubeMaterial(key as keyof typeof Block.blockList);
        }
        return Block.runtimeMeshBuffer[key];
    }

    static Make2DMesh(key: keyof typeof this.notABlock): Mesh {
        if (!this.runtimeMaterialBuffer[key]) {
            const texture = new Texture(this.rootURI + this.notABlock[key][0], Block.scene);
            this.runtimeMaterialBuffer[key] = new ToonMaterial(texture, this.light, false, Block.scene);
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
                    // blocks with 6 different faces
                    filelist = faces;
                    break;
                default:
                    throw new Error(`Block ${key} not found`);
            };
            const texture = new CubeTexture(key + "Texture", Block.scene, undefined, undefined, filelist.map(file => Block.rootURI + file));
            texture.name = key + "Texture";
            //console.log(texture, texture.name, texture.url);
            this.runtimeMaterialBuffer[key] = new ToonMaterial(texture, this.light, false, Block.scene);
            this.runtimeMaterialBuffer[key].name = key + "Material";
        }
        //console.log(this.runtimeMaterialBuffer[key]);
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
            this.mesh.parent = this.chunk;
        }
        else {
            this.mesh.dispose();
        }
        (this.mesh as InstancedMesh).checkCollisions = true;
        return this;
    }
}