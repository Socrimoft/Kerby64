struct Uniforms {
    seed: i32,
    chunkSize: vec3<u32>,
    chunkCoord: vec2<i32>,
    worldType: u32,
};
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read_write> blockBuffer: array<u32>;
@group(0) @binding(2) var<storage, read> flatWorldInfoBuffer: array<u32>;

//
// GLSL modulo function
fn modVec4(a: vec4f, b: vec4f) -> vec4f {
    return vec4f(trueMod(a.x, b.x), trueMod(a.y, b.y), trueMod(a.z, b.z), trueMod(a.w, b.w));
}

fn modVec3(a: vec3f, b: vec3f) -> vec3f {
    return vec3f(trueMod(a.x, b.x), trueMod(a.y, b.y), trueMod(a.z, b.z));
}

fn trueMod(x: f32, y: f32) -> f32 {
    return x - y * floor(x / y);
}

// MIT License. © Stefan Gustavson, Munrocket
fn permute4(x: vec4f) -> vec4f {
    return modVec4(((x * 34. + 1.) * x + vec4f(f32(uniforms.seed))), vec4f(289.));
}

fn taylorInvSqrt4(r: vec4f) -> vec4f {
    return 1.79284291400159 - 0.85373472095314 * r;
}

fn fade3(t: vec3f) -> vec3f {
    return t * t * t * (t * (t * 6. - 15.) + 10.);
}

fn fade2(t: vec2f) -> vec2f {
    return t * t * t * (t * (t * 6. - 15.) + 10.);
}

fn perlinNoise2(P: vec2f) -> f32 {
    var Pi: vec4f = floor(P.xyxy) + vec4f(0., 0., 1., 1.);
    let Pf = fract(P.xyxy) - vec4f(0., 0., 1., 1.);
    Pi = modVec4(Pi, vec4f(289.));
    // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;
    let i = permute4(permute4(ix) + iy);
    var gx: vec4f = 2. * fract(i * 0.0243902439) - 1.;
    // 1/41 = 0.024...
    let gy = abs(gx) - 0.5;
    let tx = floor(gx + 0.5);
    gx = gx - tx;
    var g00: vec2f = vec2f(gx.x, gy.x);
    var g10: vec2f = vec2f(gx.y, gy.y);
    var g01: vec2f = vec2f(gx.z, gy.z);
    var g11: vec2f = vec2f(gx.w, gy.w);
    let norm = 1.79284291400159 - 0.85373472095314 * vec4f(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 = g00 * norm.x;
    g01 = g01 * norm.y;
    g10 = g10 * norm.z;
    g11 = g11 * norm.w;
    let n00 = dot(g00, vec2f(fx.x, fy.x));
    let n10 = dot(g10, vec2f(fx.y, fy.y));
    let n01 = dot(g01, vec2f(fx.z, fy.z));
    let n11 = dot(g11, vec2f(fx.w, fy.w));
    let fade_xy = fade2(Pf.xy);
    let n_x = mix(vec2f(n00, n01), vec2f(n10, n11), vec2f(fade_xy.x));
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

fn perlinNoise3(P: vec3f) -> f32 {
    var Pi0: vec3f = floor(P);
    // Integer part for indexing

    var Pi1: vec3f = Pi0 + vec3f(1.);
    // Integer part + 1

    Pi0 = modVec3(Pi0, vec3f(289.));

    Pi1 = modVec3(Pi1, vec3f(289.));

    let Pf0 = fract(P);
    // Fractional part for interpolation

    let Pf1 = Pf0 - vec3f(1.);
    // Fractional part - 1.
    let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    let iy = vec4f(Pi0.yy, Pi1.yy);

    let iz0 = Pi0.zzzz;

    let iz1 = Pi1.zzzz;

    let ixy = permute4(permute4(ix) + iy);
    let ixy0 = permute4(ixy + iz0);
    let ixy1 = permute4(ixy + iz1);

    var gx0: vec4f = ixy0 / 7.;
    var gy0: vec4f = fract(floor(gx0) / 7.) - 0.5;
    gx0 = fract(gx0);
    var gz0: vec4f = vec4f(0.5) - abs(gx0) - abs(gy0);
    var sz0: vec4f = step(gz0, vec4f(0.));
    gx0 = gx0 + sz0 * (step(vec4f(0.), gx0) - 0.5);
    gy0 = gy0 + sz0 * (step(vec4f(0.), gy0) - 0.5);

    var gx1: vec4f = ixy1 / 7.;
    var gy1: vec4f = fract(floor(gx1) / 7.) - 0.5;
    gx1 = fract(gx1);
    var gz1: vec4f = vec4f(0.5) - abs(gx1) - abs(gy1);
    var sz1: vec4f = step(gz1, vec4f(0.));
    gx1 = gx1 - sz1 * (step(vec4f(0.), gx1) - 0.5);
    gy1 = gy1 - sz1 * (step(vec4f(0.), gy1) - 0.5);

    var g000: vec3f = vec3f(gx0.x, gy0.x, gz0.x);
    var g100: vec3f = vec3f(gx0.y, gy0.y, gz0.y);
    var g010: vec3f = vec3f(gx0.z, gy0.z, gz0.z);
    var g110: vec3f = vec3f(gx0.w, gy0.w, gz0.w);
    var g001: vec3f = vec3f(gx1.x, gy1.x, gz1.x);
    var g101: vec3f = vec3f(gx1.y, gy1.y, gz1.y);
    var g011: vec3f = vec3f(gx1.z, gy1.z, gz1.z);
    var g111: vec3f = vec3f(gx1.w, gy1.w, gz1.w);

    let norm0 = taylorInvSqrt4(vec4f(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 = g000 * norm0.x;
    g010 = g010 * norm0.y;
    g100 = g100 * norm0.z;
    g110 = g110 * norm0.w;
    let norm1 = taylorInvSqrt4(vec4f(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 = g001 * norm1.x;
    g011 = g011 * norm1.y;
    g101 = g101 * norm1.z;
    g111 = g111 * norm1.w;

    let n000 = dot(g000, Pf0);
    let n100 = dot(g100, vec3f(Pf1.x, Pf0.yz));
    let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
    let n110 = dot(g110, vec3f(Pf1.xy, Pf0.z));
    let n001 = dot(g001, vec3f(Pf0.xy, Pf1.z));
    let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
    let n011 = dot(g011, vec3f(Pf0.x, Pf1.yz));
    let n111 = dot(g111, Pf1);

    var fade_xyz: vec3f = fade3(Pf0);
    let temp = vec4f(f32(fade_xyz.z));
    // simplify after chrome bug fix
    let n_z = mix(vec4f(n000, n100, n010, n110), vec4f(n001, n101, n011, n111), temp);
    let n_yz = mix(n_z.xy, n_z.zw, vec2f(f32(fade_xyz.y)));
    // simplify after chrome bug fix
    let n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

fn getBlockU32Index(gid: vec3<u32>) -> u32 {
    return gid.x + gid.y * uniforms.chunkSize.x + gid.z * uniforms.chunkSize.x * uniforms.chunkSize.y;
}

fn setBlockId(gid: vec3<u32>, id: u32) {
    let u32Index = getBlockU32Index(gid);
    blockBuffer[u32Index] = id;
}

@compute @workgroup_size(8, 1, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (uniforms.worldType==0u) {
        if (uniforms.seed==0) {
            debug(gid);
            return;
        }
        flat(gid);
        return;
    }
    normal(gid);
    return;
}

fn debug(gid: vec3<u32>) {
    if (gid.y == 0u) {
        setBlockId(gid, 2u);
        return;
    }
    if (uniforms.chunkCoord.x==0 && uniforms.chunkCoord.y==0) {
        setBlockId(gid, 1u);
        return;
    }
    setBlockId(gid, 37u);
    //blockBuffer[u32Index] = 0xFFFFFFFFu;
}

fn flat(gid: vec3<u32>) {
    let u32Index = getBlockU32Index(gid);
    blockBuffer[u32Index] = (flatWorldInfoBuffer[gid.y >> 1] >> ((gid.y & 1) * 16u))& 0xFFFFu;
}

fn normal(gid: vec3<u32>) {
    if (gid.y > 64u) {
        return;
    }
    let x = f32(i32(gid.x * uniforms.chunkSize.x) * uniforms.chunkCoord.x);
    let y = f32(gid.y);
    let z = f32(i32(gid.z * uniforms.chunkSize.z) * uniforms.chunkCoord.y);
    let p = vec3f(x, y*256.0, z)/4096.0;
    let n = perlinNoise3(p);
    
    let u32Index = getBlockU32Index(gid);
    if (n > 0.0) {
        blockBuffer[u32Index] = 2u;
    }
}