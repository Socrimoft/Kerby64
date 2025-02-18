import { BaseTexture, Color3, DynamicTexture, Scene, ShaderMaterial, Vector3, Vector4 } from "@babylonjs/core";

export class ToonMaterial extends ShaderMaterial {
    constructor(textureOrColor: BaseTexture | Color3, lightDirection: Vector3, animated: boolean, scene: Scene) {
        const defines = animated ? ["BONES"] : [];
        super(
            "toonShader",
            scene,
            {
                vertex: "toon",
                fragment: "toon"
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "viewProjection", "worldViewProjection"],
                samplers: ["textureSampler"],
                defines: defines
            }
        );

        if (textureOrColor instanceof Color3) {
            const size = 512;
            const dynamicTexture = new DynamicTexture("dynamicTexture", size, scene);
            const ctx = dynamicTexture.getContext();

            ctx.fillStyle = textureOrColor.toHexString();
            ctx.fillRect(0, 0, size, size);

            dynamicTexture.update();
            textureOrColor = dynamicTexture;
        }

        this.setTexture("textureSampler", textureOrColor);
        this.setVector3("lightDir", lightDirection);
        this.setVector4("ambiantColor", new Vector4(0.4, 0.4, 0.4, 1.0));
        this.setVector4("specularColor", new Vector4(0.9, 0.9, 0.9, 1.0));
        this.setFloat("glossiness", 32);
        this.setVector4("rimColor", new Vector4(1, 1, 1, 1));
        this.setFloat("rimAmount", 0.716);
        this.setFloat("rimThreshold", 0.1);
    }
}
