export class Random {
    public seed: number;
    rand: () => number;
    random: () => number;
    constructor(seed: number) {
        this.seed = seed ^ 0xDEADBEEF;
        this.rand = Random.sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, this.seed);
        this.random = () => this.rand() / 4294967296;
        for (var i = 0; i < 15; i++) this.rand();
    }
    private static sfc32(a: number, b: number, c: number, d: number) {
        return function () {
            a |= 0; b |= 0; c |= 0; d |= 0;
            let t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0);
        }
    }
}