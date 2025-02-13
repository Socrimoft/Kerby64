import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";

export class InputManager
{
    public inputMap: any;

    public upKey: string;
    public downKey: string;
    public leftKey: string;
    public rightKey: string;
    public jumpKey: string;
    public actionKey: string;

    constructor(scene: Scene) {
        this.upKey = "z";
        this.downKey = "s";
        this.leftKey = "q";
        this.rightKey = "d";
        this.jumpKey = " ";
        this.actionKey = "LeftAlt";
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
    }
}
