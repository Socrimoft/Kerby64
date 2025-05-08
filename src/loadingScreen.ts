import { ILoadingScreen } from "@babylonjs/core";

export class KerbyLoadingScreen implements ILoadingScreen {
    public loadingUIBackgroundColor: string;
    private div: HTMLDivElement;
    constructor(public loadingUIText: string) {
        this.loadingUIBackgroundColor = "black";
        const div = document.getElementById("LoadingScreen");
        if (!(div instanceof HTMLDivElement)) throw new Error("LoadingScreen not found");
        this.div = div;
        window.addEventListener("resize", this.resizeLoadingUI.bind(this));
        document.body.appendChild(this.div);
    }
    private get isVisible(): boolean {
        return this.div.checkVisibility() || false;
    }
    private resizeLoadingUI(event: UIEvent) {
        //
    }
    public displayLoadingUI() {
        if (!this.isVisible) {
            // Do not add a loading screen if there is already one
            this.div.style.display = "initial";
            return;
        }
    }

    public hideLoadingUI() {
        this.div.style.display = "none";
    }
}