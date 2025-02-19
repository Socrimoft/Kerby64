import { CreateBox, DirectionalLight, Mesh, Vector3 } from "@babylonjs/core";
import { Player } from "../actors/player";
import { GameEntity } from "../actors/gameEntity";
import { LevelScene } from "../scenes/levelScene";

export abstract class Environment {
    protected scene: LevelScene;
    protected player: Player;

    protected light?: DirectionalLight;

    protected skybox: Mesh;
    protected skyboxSize = 10000;

    private groundSegments: Array<Mesh> = [];
    private staticObjects: Array<Mesh> = [];
    private entitiesObjects: Array<GameEntity> = [];

    constructor(scene: LevelScene, player: Player) {
        this.scene = scene;
        this.player = player
        this.skybox = CreateBox("skybox", { size: this.skyboxSize }, this.scene);
    }

    public getLight(): DirectionalLight {
        if (!this.light)
            throw new Error("Cannot return non-instanciated light");
        return this.light;
    }

    protected getGroundSegments(): Array<Mesh> {
        return this.groundSegments;
    }

    protected setGroundSegments(segments: Array<Mesh>): void {
        this.groundSegments = segments;
    }

    protected pushGroundSegment(mesh: Mesh, position?: Vector3) {
        if (position) mesh.position = position;
        this.groundSegments.push(mesh);
    }

    protected pushStaticObject(mesh: Mesh, position: Vector3) {
        mesh.position = position;
        this.staticObjects.push(mesh);
    }

    protected pushEntityObject(entity: GameEntity, position: Vector3) {
        entity.setPosition(position);
        entity.activateEntityComponents();
        this.entitiesObjects.push(entity);

    }

    public async load(): Promise<void> {
        this.setupSkybox();
        this.setupLight();
        await this.loadEnvironment();
    }

    abstract setupSkybox(): void;
    abstract loadEnvironment(): Promise<void>;
    abstract setupLight(): void;
    abstract getLightDirection(): Vector3;
    abstract setLightDirection(direction: Vector3): void;
    abstract beforeRenderUpdate(): void;
}
