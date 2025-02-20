import { ActionManager, ExecuteCodeAction, Scene } from "@babylonjs/core";

export class InputManager {
    public inputMap: { [key: string]: boolean } = {};
    public upKey = "z";
    public downKey = "s";
    public leftKey = "q";
    public rightKey = "d";
    public jumpKey = " ";
    public actionKey = "LeftAlt";
    public shilftKey = "Shift";
    public cameraKey = "F5";
    public statsKey = "F3";
    public isWorldPlaying = false

    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
            if (this.isWorldPlaying && ["F3", "F5"].includes(event.sourceEvent.key))
                event.sourceEvent.preventDefault();
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
            this.inputMap[event.sourceEvent.key] = event.sourceEvent.type == "keydown";
        }));
    }
}
