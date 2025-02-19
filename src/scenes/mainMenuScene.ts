import { Color4, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Button, Control, Grid, ScrollViewer, StackPanel, TextBlock } from "@babylonjs/gui";
import { Game, GameEngine } from "../game";
import { Menu } from "../gui/menu";

export class MainMenuScene extends Scene {
    constructor(engine: GameEngine) {
        super(engine);
    }

    public async load() {
        this.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());

        this.createMainMenu();
    }

    private createMainMenu(): void {
        const guiMenu = new Menu("menu", 720);

        guiMenu.addBackground("backgroundImage", "./assets/images/background.jpg");
        guiMenu.addTextBlock("title", "Kerby54", 40, "white", "-30%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER, "WorldOfSpell");

        guiMenu.addSimpleButton("start", "Start", "20%", "10%", "rgb(255,20,147)", "black", "0px", "0px", 10, 0, Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_CENTER, () => {
            guiMenu.ui.dispose();
            this.createLevelSelectionMenu();
        });
        guiMenu.addImageButton("github", "", "./assets/images/github.png", "40px", "40px", "40px", "40px", "black", "black", "10px", "10px", 10, 0, Control.VERTICAL_ALIGNMENT_TOP, Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
            window.open("https://github.com/Socrimoft");
        });
    }

    private createLevelSelectionMenu(): void {
        const levelSelectMenu = new Menu("levelSelectMenu", 720);
        levelSelectMenu.addTextBlock("title", "Choose a level to play", 35, "white", "-45%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER)

        const levels = ["Kirby Rush", "Kirby Bird", "Kirby World", "Kirby Classic"];

        const levelsScrollViewer = new ScrollViewer();
        levelsScrollViewer.width = "500px";
        levelsScrollViewer.height = "250px";
        levelsScrollViewer.top = "0%";

        const panel = new StackPanel();
        panel.isVertical = true;
        levelsScrollViewer.addControl(panel);

        for (let i = 0; i < levels.length; i++) {
            const row = new Grid();
            row.height = "35px";
            row.width = "500px";
            row.addColumnDefinition(0.33);
            row.addColumnDefinition(0.33);
            row.addColumnDefinition(0.33);

            const name = new TextBlock();
            name.text = levels[i];
            name.color = "white";
            name.fontSize = 14;
            name.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            name.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

            const starsCount = new TextBlock();
            starsCount.text = `${0} stars`;
            starsCount.color = "white";
            starsCount.fontSize = 14;

            const playLevelBtn = Button.CreateSimpleButton(i.toString(), "Play");
            playLevelBtn.width = "50px";
            playLevelBtn.height = "30px";
            playLevelBtn.cornerRadius = 10;
            playLevelBtn.color = "black";
            playLevelBtn.background = "rgb(50, 205, 50)";

            playLevelBtn.onPointerClickObservable.add(() => {
                levelSelectMenu.ui.dispose();
                console.log(i + 1);
                this.switchToCutScene(i + 1);
            });

            row.addControl(name, i);
            row.addControl(starsCount, i, 1);
            row.addControl(playLevelBtn, i, 2);
            panel.addControl(row);
        }
        levelSelectMenu.ui.addControl(levelsScrollViewer);

        levelSelectMenu.addSimpleButton("mainmenu", "Return To Main Menu", "150px", "40px", "rgb(170, 74, 68)", "black", "-30px", 0, 10, 0, Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_CENTER, () => {
            levelSelectMenu.ui.dispose();
            this.createMainMenu();
        });
    }

    private switchToCutScene(levelToLoad: number): void {
        this.detachControl();
        Game.Instance.switchToCutScene(levelToLoad);
        this.dispose();
    }
}
