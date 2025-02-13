import { AnimationGroup, Scene, SceneLoader, TransformNode } from "@babylonjs/core";

export class AssetsLoader
{
    public static async loadCharacterAssets(name: string, filename: string, animations: Array<AnimationGroup>, scene: Scene): Promise<TransformNode> {
        let root = new TransformNode(name, scene);
        const models = await SceneLoader.ImportMeshAsync("", "./assets/models/", filename, scene);
        models.meshes.forEach(mesh => {
            mesh.parent = root;
        });
        models.animationGroups.forEach((ag) => {
            animations.push(ag);
        });

        return root;
    }
}
