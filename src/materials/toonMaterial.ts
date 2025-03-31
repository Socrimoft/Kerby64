import { AbstractMesh, BaseTexture, Color3, DirectionalLight, DynamicTexture, MorphTarget, Scene, ShaderMaterial, Vector3, Vector4 } from "@babylonjs/core";

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
                uniforms: ["world", "viewProjection", "worldViewProjection", "morphTargetInfluences", "morphTargetTextureInfo", "morphTargets"],
                samplers: ["textureSampler"]
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

        if (mesh.morphTargetManager && mesh.morphTargetManager.numTargets > 0) {

            const targets: MorphTarget[] = [];
            for (let i = 0; i < mesh.morphTargetManager.numTargets; i++)
                targets.push(mesh.morphTargetManager.getTarget(i));

            console.log(mesh.morphTargetManager.numTargets.toString());
            this.setDefine("NUM_MORPH_INFLUENCERS", mesh.morphTargetManager.numTargets.toString());
            this.setInt("morphTargetCount", mesh.morphTargetManager.numTargets);
            this.setFloats("morphTargetInfluences", targets.map(t => t.influence));
        }

        this.setTexture("textureSampler", textureOrColor);
        this.setVector3("lightDirection", light.direction);
        this.setFloat("lightIntensity", light.intensity);
        this.setVector3("diffuseColor", new Vector3(light.diffuse.r, light.diffuse.g, light.diffuse.b));
        this.setVector4("ambiantColor", new Vector4(0.5, 0.5, 0.5, 1.0));
        this.setVector4("specularColor", new Vector4(0.9, 0.9, 0.9, 1.0));
        this.setFloat("specularPower", 1);
        this.setFloat("glossiness", 32);
        this.setVector4("rimColor", new Vector4(1, 1, 1, 1));
        this.setFloat("rimAmount", 0.716);
        this.setFloat("rimThreshold", 0.1);
    }

    public setSpecularPower(power: number): void {
        this.setFloat("specularPower", power);
    }
}
