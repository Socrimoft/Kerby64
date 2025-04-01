import { Color4, DynamicTexture, FreeCamera, MeshBuilder, Scene, SimplexPerlin3DBlock, StandardMaterial, Texture, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Button, Control, Grid, ScrollViewer, StackPanel, TextBlock, Image, InputText } from "@babylonjs/gui";
import { Game, GameEngine } from "../game";
import { Menu } from "../gui/menu";

export class MainMenuScene extends Scene {
    private indexOfClassicMode: number = 3;
    private indexOfWorldMode = 2;
    private canvas: HTMLCanvasElement;

    constructor(engine: GameEngine) {
        super(engine);
        this.canvas = engine.getRenderingCanvas() || null as any;

    }

    public async load() {
        this.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());

        this.createMainMenu();
    }

    private firstClassicCallback(menu: Menu, i: number) {
        menu.ui.dispose();
        switch (i) {
            case (this.indexOfClassicMode):
                this.createLevelSelectionMenu("Choose a level to play", ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"], this.secondClassicCallBack.bind(this));
                return;
            case (this.indexOfWorldMode):
                this.createWorldMenu();
                return;
            default:
                this.switchToCutScene(i + 1);
                return;
        }
    }

    private secondClassicCallBack(menu: Menu, i: number) {
        menu.ui.dispose();
        this.switchToCutScene(this.indexOfClassicMode + 1, i + 1);
    }

    private createMainMenu(): void {
        const guiMenu = new Menu("menu", 720);

        guiMenu.addBackground("backgroundImage", "./assets/images/background.jpg");
        this.addGameTitleToMenu(guiMenu);
        guiMenu.addSimpleButton("start", "Start", "20%", "10%", "rgb(255,20,147)", "black", "-10%", "0px", 10, 0, Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_CENTER, () => {
            guiMenu.ui.dispose();
            this.createLevelSelectionMenu("Choose a game to play", ["Kirby Rush", "Kirby Bird", "Kirby World", "Kirby Classic"], this.firstClassicCallback.bind(this));
        });
        guiMenu.addImageButton("github", "", "./assets/images/github.png", "40px", "40px", "40px", "40px", "", "black", "10px", "10px", 10, 0, Control.VERTICAL_ALIGNMENT_TOP, Control.HORIZONTAL_ALIGNMENT_LEFT, () => {
            window.open("https://github.com/Socrimoft/Kerby64");
        });
    }
    private addGameTitleToMenu(menu: Menu) {
        const verticalAlign = Control.VERTICAL_ALIGNMENT_CENTER;
        const horizontalAlign = Control.HORIZONTAL_ALIGNMENT_CENTER;
        const fontFamily = "WorldOfSpell";
        menu.addTextBlock("shadowK", "K", 60, "grey", "-30%", "-11%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadowE", "e", 60, "grey", "-30%", "-7.5%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadowR", "r", 60, "grey", "-30%", "-3.5%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadowB", "b", 60, "grey", "-30%", "0%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadowY", "y", 60, "grey", "-30%", "3.5%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadow6", "6", 60, "grey", "-30%", "7.5%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("shadow4", "4", 60, "grey", "-30%", "11%", verticalAlign, horizontalAlign, fontFamily);
        menu.addTextBlock("title", "Kerby64", 50, "white", "-30%", "0%", verticalAlign, horizontalAlign, fontFamily);

    }

    private createLevelSelectionMenu(title: string, selection: string[], buttonCallBack: (menu: Menu, i: number) => void): void {
        const levelSelectMenu = new Menu("levelSelectMenu", 720);
        levelSelectMenu.addTextBlock("title", title, 35, "white", "-45%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER)

        const levels = selection;

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

            playLevelBtn.onPointerClickObservable.add(() => { buttonCallBack(levelSelectMenu, i) });

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

    private async createWorldMenu() {
        const worldfont = "WorldOfSpell";
        const gui = new Menu("world_setting", 1920);
        let isWorldNormal = true;
        //const backgroundTexture = AdvancedDynamicTexture.CreateFullscreenUI("backgroundTexture", false, this, AdvancedDynamicTexture.TRILINEAR_SAMPLINGMODE);

        const backgroundMaterial = new StandardMaterial("backgroundMaterial", this);

        const backgroundTexture = new DynamicTexture("backgroundTexture", this.canvas, this, undefined, Texture.NEAREST_SAMPLINGMODE);
        const backgroundContext = backgroundTexture.getContext();

        // tile a texture 16 times horizontally and 9 vertically
        backgroundTexture.uScale = 16;
        backgroundTexture.vScale = 9;
        // backgroundTexture.update(true);

        backgroundMaterial.diffuseTexture = backgroundTexture;
        //backgroundMaterial.diffuseTexture.uScale = 4; // Tiling the texture 4 times horizontally
        //backgroundMaterial.diffuseTexture. = 4; // Tiling the texture 4 times vertically


        const rows = new Grid("rows");
        gui.ui.addControl(rows);
        rows.addRowDefinition(0.2);
        rows.addRowDefinition(0.2);
        rows.addRowDefinition(0.2);
        rows.addRowDefinition(0.2);
        rows.addRowDefinition(0.2);
        const title = new TextBlock("world_title", "World");
        title.fontSize = "20%";
        title.color = "white";
        title.top = "5%";
        title.fontFamily = worldfont;
        rows.addControl(title, 0);

        const modeColumn = new Grid("mode");
        modeColumn.width = "80%";
        modeColumn.background = "grey";
        modeColumn.addColumnDefinition(0.5);
        modeColumn.addColumnDefinition(0.5);

        rows.addControl(modeColumn, 1);
        const WorldNormalBtn = new Button("WorldNormal");
        modeColumn.addControl(WorldNormalBtn, 0, 0);
        WorldNormalBtn.addControl(new TextBlock("solo", "solo"));
        console.log(WorldNormalBtn.textBlock);
        WorldNormalBtn.thickness = 0;
        WorldNormalBtn.disabledColor = "white";
        WorldNormalBtn.focusedColor = "white";
        WorldNormalBtn.isEnabled = false;

        const WorldFlatBtn = new Button("WorldFlat");
        modeColumn.addControl(WorldFlatBtn, 0, 1);

        let logIsWorldNormal = () => console.log(isWorldNormal ? "normal" : "flat");
        // WorldNormalBtn.isEnabled is set to false when WorldNormal is selected
        WorldNormalBtn.pointerUpAnimation = () => { isWorldNormal = WorldFlatBtn.isEnabled = !(WorldNormalBtn.isEnabled = false); logIsWorldNormal() }
        WorldFlatBtn.pointerUpAnimation = () => { WorldNormalBtn.isEnabled = !(isWorldNormal = WorldFlatBtn.isEnabled = false); logIsWorldNormal() }
        //let advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("GUI", true, this);
        //let loadedGUI = await advancedTexture.parseFromURLAsync("./assets/gui/world_setting.json");

        const seedGrid = new Grid("randomGrid");
        seedGrid.addColumnDefinition(0.25);
        seedGrid.addColumnDefinition(0.50);
        seedGrid.addColumnDefinition(0.25);
        const seedText = new TextBlock("seedText", "Seed : ");
        seedText.color = "white";
        seedGrid.addControl(seedText, 0, 0);
        const seedInput = new InputText("seedInput");
        seedInput.width = "80%";
        seedInput.highlightedText = "white";
        seedGrid.addControl(seedInput, 0, 1);
        const seedRandomButton = new Button("seedRandomButton");
        const seedRandomImage = new Image("seedRandomImage", "");
        const seedRandomText = new TextBlock("seedRandomText", "Random");
        seedRandomButton.addControl(seedRandomImage);
        seedRandomButton.addControl(seedRandomText);
        seedRandomText.width = "100%";
        seedRandomButton.width = "80%";
        seedGrid.addControl(seedRandomButton, 0, 2);
        rows.addControl(seedGrid, 2, 0);

        const play = new Button("playbtn");
        const playText = new TextBlock("playText", "Play");
        play.addControl(playText);
        play.pointerUpAnimation = () => this.switchToCutScene("world");
        // world do not have cutscene, it skip directly to the game
        rows.addControl(play, 3, 0);
        play.paddingLeft = "60%";
    }

    private switchToCutScene(levelToLoad: number | string, classicLevel?: number): void {
        this.detachControl();
        Game.Instance.switchToCutScene(levelToLoad, classicLevel);
        this.dispose();
    }
}
