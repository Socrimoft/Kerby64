export interface Cell {
    type: "void" | "ground" | "enemy" | "bonus" | "trap";
    height: number;
    // neighbors: Position[];
    hasObstacle?: boolean;
}
