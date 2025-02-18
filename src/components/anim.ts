import { AnimationGroup } from "@babylonjs/core";

export interface Anim {
    idleAnim?: AnimationGroup;
    walkAnim?: AnimationGroup;
    runAnim?: AnimationGroup;
}