import { AbstractMesh, BaseTexture, Color3, DirectionalLight, DynamicTexture, MorphTarget, Scene, ShaderLanguage, ShaderMaterial, Vector3, Vector4 } from "@babylonjs/core";

export class ToonMaterial extends ShaderMaterial {
    constructor(textureOrColor: BaseTexture | Color3, light: DirectionalLight, mesh: AbstractMesh, scene: Scene) {
        super(
            "toonShader",
            scene,
            {
                vertex: "toon",
                fragment: "toon"
            },
            {
                attributes: ["position", "normal", "uv"],
                uniformBuffers: ["Scene", "Mesh"],
                shaderLanguage: ShaderLanguage.WGSL
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

        this.setTexture("texture", textureOrColor);
        this.setVector3("lightDirection", light.direction);
        this.setFloat("lightIntensity", light.intensity);
        this.setVector3("diffuseColor", new Vector3(light.diffuse.r, light.diffuse.g, light.diffuse.b));
        this.setVector4("ambiantColor", new Vector4(0.5, 0.5, 0.5, 1.0));
        this.setVector4("specularColor", new Vector4(0.9, 0.9, 0.9, 1.0));
        this.setFloat("glossiness", 32);
        this.setVector4("rimColor", new Vector4(1, 1, 1, 1));
        this.setFloat("rimAmount", 0.716);
        this.setFloat("rimThreshold", 0.1);
    }
}
