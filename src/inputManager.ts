import { ActionManager, ExecuteCodeAction, PointerEventTypes, Scene } from "@babylonjs/core";
import { InputManager as MouseManager } from "@babylonjs/core/Inputs/scene.inputManager";

export enum Key {
    Up = "z",
    Down = "s",
    Left = "q",
    Right = "d",
    Jump = " ",
    LeftClick = "lClick",
    RightClick = "rClick",
    Action = "LeftAlt",
    Shift = "Shift",
    Camera = "F5",
    Stats = "F3",
    ScreenShot = "F2",
    Hud = "F1",
    Escape = "Escape",
    Chat = "t"
}

enum Games {
    none = 0,
    rush = 1,
    bird = 2,
    world = 3,
    classic = 4
}

export class InputManager extends MouseManager {
    public MouseMovement = { x: 0, y: 0 };
    private canvas: HTMLCanvasElement;
    public inputMap: { [key in Key]: boolean } = Object.fromEntries(
        Object.values(Key).map((key) => [key, false])
    ) as any;

    public isWorldPlaying: boolean = false;
    public actualGame: Games = Games.none;
    public isClassicPlaying: boolean = false;
    public isRushPlaying: boolean = false;
    public isPointerLocked: boolean = false;

    constructor(scene: Scene) {
        super(scene);
        const canvas = scene.getEngine().getRenderingCanvas();
        if (!canvas) throw new Error("no canvas on engine");
        this.canvas = canvas;
        scene.actionManager = new ActionManager(scene);
        this.inputMap[Key.Escape] = true; // simulate keydown to bring the pause menu in the event of pointer not being locked
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            switch (event.sourceEvent.key as Key) {
                case (Key.Escape):
                    if (this.isWorldPlaying && !this.isPointerLocked) {
                        //event.sourceEvent.preventDefault();
                        this.isWorldPlaying = false;
                    };
                    break;
                case (Key.Hud):         //F1
                    if (!this.isWorldPlaying)
                        window.open("https://github.com/Socrimoft/Kerby64", "_blank");
                case (Key.ScreenShot):  //F2
                case (Key.Stats):       //F3
                case (Key.Camera):      //F5
                    if (this.isWorldPlaying)
                        event.sourceEvent.preventDefault();
                default:
                    this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
                    break;
            }
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        document.addEventListener("pointerlockchange", () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas
            if (!this.isPointerLocked) {
                this.inputMap[Key.Escape] = true;
            }
            //(this.isPointerLocked ? this.attachControl : this.detachControl)();
            //console.log(`input : ${this.isPointerLocked} ${this.isWorldPlaying}`);
        });
        scene.onPointerObservable.add((pointerInfo) => {
            if (!this.isPointerLocked) return;
            if (pointerInfo.type == 4) { // PointerMove
                this.MouseMovement.x += pointerInfo.event.movementX;
                this.MouseMovement.y += pointerInfo.event.movementY;
            }
        });

        // Request pointer lock for the canvas + handle clicks
        this.canvas.addEventListener("pointerdown", (event) => {

            switch (this.actualGame) {
                case Games.classic:
                case Games.rush:
                    if (event.button === 0)
                        this.inputMap[Key.LeftClick] = true;
                    else if (event.button === 2)
                        this.inputMap[Key.RightClick] = true;

                case Games.world:
                    if (this.isWorldPlaying && !this.isPointerLocked)
                        (this.canvas.requestPointerLock() || Promise.resolve()).catch(() => null);
            };
        });

        this.canvas.addEventListener("pointerup", (event) => {
            switch (this.actualGame) {
                case Games.classic:
                case Games.rush:
                    if (event.button === 0)
                        this.inputMap[Key.LeftClick] = false;
                    else if (event.button === 2)
                        this.inputMap[Key.RightClick] = false;
                    break;
            }
        });

    }
}