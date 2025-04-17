import { ActionManager, ExecuteCodeAction, PointerEventTypes, Scene } from "@babylonjs/core";
import { InputManager as MouseManager } from "@babylonjs/core/Inputs/scene.inputManager";
export class InputManager extends MouseManager {
    public MouseMovement = { x: 0, y: 0 };
    private canvas: HTMLCanvasElement;
    public upKey = "z";
    public downKey = "s";
    public leftKey = "q";
    public rightKey = "d";
    public jumpKey = " ";
    public actionKey = "LeftAlt";
    public shiftKey = "Shift";
    public cameraKey = "F5";
    public statsKey = "F3";
    public screenShotKey = "F2";
    public hudKey = "F1";
    public escapeKey = "Escape";
    public chatKey = "t";
    public inputMap = {
        [this.upKey]: false,
        [this.downKey]: false,
        [this.leftKey]: false,
        [this.rightKey]: false,
        [this.jumpKey]: false,
        [this.actionKey]: false,
        [this.chatKey]: false,
        [this.shiftKey]: false,
        [this.cameraKey]: false,
        [this.statsKey]: false,
        [this.escapeKey]: false,
        [this.screenShotKey]: false,
        [this.hudKey]: false,
    };
    public isWorldPlaying = false;
    public isPointerLocked = false;

    constructor(scene: Scene) {
        super(scene);
        const canvas = scene.getEngine().getRenderingCanvas();
        if (!canvas) throw new Error("no canvas on engine");
        this.canvas = canvas;
        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            if (event.sourceEvent.key == this.hudKey) {
                if (!this.isWorldPlaying) {
                    event.sourceEvent.preventDefault();
                    window.open("https://github.com/Socrimoft/Kerby64", "_blank");
                    return;
                }
            }
            if (this.isWorldPlaying && ["F1", "F2", "F3", "F5"].includes(event.sourceEvent.key))
                event.sourceEvent.preventDefault();
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        // Request pointer lock for the canvas
        this.canvas.addEventListener("click", () => {
            if (this.isWorldPlaying)
                (this.canvas.requestPointerLock() || Promise.resolve()).catch(() => null);
        });

        document.addEventListener("pointerlockchange", () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            //(this.isPointerLocked ? this.attachControl : this.detachControl)();
            //console.log(`input : ${this.isPointerLocked} ${this.isWorldPlaying}`);
        });
        scene.onPointerObservable.add((pointerInfo) => {
            if (!this.isPointerLocked) return;
            switch (pointerInfo.type) {
                case PointerEventTypes.POINTERMOVE:
                    // Handle pointer move event
                    this.MouseMovement.x += pointerInfo.event.movementX;
                    this.MouseMovement.y += pointerInfo.event.movementY;
                    break;
            }
        });
        /* scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPointerMoveTrigger, (event) => {
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
 */
    }
}
