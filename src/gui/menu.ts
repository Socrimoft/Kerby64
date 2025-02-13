import { AdvancedDynamicTexture, Button, Control, Image, TextBlock } from "@babylonjs/gui";

export class Menu
{
    public ui: AdvancedDynamicTexture;

    constructor(name: string, idealWidth: number) {
        this.ui = AdvancedDynamicTexture.CreateFullscreenUI(name);
        this.ui.idealWidth = idealWidth;
    }

    public addBackground(name: string, url: string): void {
        const backgroundImage = new Image(name, url);
        backgroundImage.stretch = Image.STRETCH_FILL;
        this.ui.addControl(backgroundImage);
    }

    public addTextBlock(name: string, text: string, fontSize: number, color: string = "white", top: string | number = 0, verticalAlignment: number = Control.VERTICAL_ALIGNMENT_TOP, horizontalAlignment: number = Control.HORIZONTAL_ALIGNMENT_LEFT, fontFamily?: string): void {
        const textBlock = new TextBlock(name, text);
        textBlock.fontSize = fontSize;
        textBlock.color = color;
        textBlock.top = top;
        textBlock.verticalAlignment = verticalAlignment;
        textBlock.horizontalAlignment = horizontalAlignment;
        if (fontFamily) textBlock.fontFamily = fontFamily;
        this.ui.addControl(textBlock);
    }

    private addButton(button: Button, width: string | number, height: string | number, background: string = "black", color: string = "white", top: string | number = 0, left: string | number = 0, cornerRadius: number = 0, thickness: number = 0, verticalAlignment: number = Control.VERTICAL_ALIGNMENT_BOTTOM, horizontalAlignment: number = Control.HORIZONTAL_ALIGNMENT_CENTER, clickCallback?: () => void): void {
        button.width = width;
        button.height = height;
        button.background = background;
        button.color = color;
        button.top = top;
        button.left = left;
        button.cornerRadius = cornerRadius;
        button.thickness = thickness;
        button.verticalAlignment = verticalAlignment;
        button.horizontalAlignment = horizontalAlignment;
        this.ui.addControl(button);
        button.onPointerClickObservable.add(clickCallback);
    }

    public addSimpleButton(name: string, text: string, width: string | number, height: string | number, background: string = "black", color: string = "white", top: string | number = 0, left: string | number = 0, cornerRadius: number = 0, thickness: number = 0, verticalAlignment: number = Control.VERTICAL_ALIGNMENT_BOTTOM, horizontalAlignment: number = Control.HORIZONTAL_ALIGNMENT_CENTER, clickCallback?: () => void): void {
        const button = Button.CreateSimpleButton(name, text);
        this.addButton(button, width, height, background, color, top, left, cornerRadius, thickness, verticalAlignment, horizontalAlignment, clickCallback);
    }

    public addImageButton(name: string, text: string, imageUrl: string, imageWidth: string, imageHeight: string, width: string | number, height: string | number, background: string = "black", color: string = "white", top: string | number = 0, left: string | number = 0, cornerRadius: number = 0, thickness: number = 0, verticalAlignment: number = Control.VERTICAL_ALIGNMENT_BOTTOM, horizontalAlignment: number = Control.HORIZONTAL_ALIGNMENT_CENTER, clickCallback?: () => void): void {
        const button = Button.CreateImageButton(name, text, imageUrl);
        if (button.image) {
            button.image.width = imageWidth;
            button.image.height = imageHeight;
        }
        this.addButton(button, width, height, background, color, top, left, cornerRadius, thickness, verticalAlignment, horizontalAlignment, clickCallback);
    }
}
