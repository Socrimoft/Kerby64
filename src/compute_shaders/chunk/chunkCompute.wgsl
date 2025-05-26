struct Uniforms {
    chunkSize: vec3<u32>,
    blockTypeCount: u32,
};

struct Vertex {
    position: vec3<f32>,
    normal: vec3<f32>,
    uv: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> chunkBuffer: array<u32>;
@group(0) @binding(2) var<storage, read_write> vertexBuffer: array<Vertex>;
@group(0) @binding(3) var<storage, read_write> indexBuffer: array<u32>;
@group(0) @binding(4) var<storage, read_write> counterBuffer: atomic<u32>;

fn getBlockU32Index(x: u32, y: u32, z: u32) -> u32 {
    return x + y * uniforms.chunkSize.x + z * uniforms.chunkSize.x * uniforms.chunkSize.y;
}

fn getBlockId(x: u32, y: u32, z: u32) -> u32 {
    let u32Index = getBlockU32Index(x, y, z);
    return chunkBuffer[u32Index];
}

fn isFilledBlock(x: u32, y: u32, z: u32) -> bool {
    if (x >= uniforms.chunkSize.x || y >= uniforms.chunkSize.y || z >= uniforms.chunkSize.z) {
        return false;
    }
    return getBlockId(x, y, z) != 0u;
}

fn isPositionInChunk(pos: vec3<i32>) -> bool {
    return pos.x >= 0 && pos.y >= 0 && pos.z >= 0 && pos.x < i32(uniforms.chunkSize.x) && pos.y < i32(uniforms.chunkSize.y) && pos.z < i32(uniforms.chunkSize.z);
}

fn getAdjacentNormals(faceNormal: vec3<i32>, vertex: vec3<f32>) -> array<vec3<i32>, 2> {
    var adj_normals: array<vec3<i32>, 2>;

    if (abs(faceNormal.x) == 1) {
        adj_normals[0] = vec3<i32>(0, i32(sign(vertex.y)), 0);
        adj_normals[1] = vec3<i32>(0, 0, i32(sign(vertex.z)));
    } else if (abs(faceNormal.y) == 1) {
        adj_normals[0] = vec3<i32>(i32(sign(vertex.x)), 0, 0);
        adj_normals[1] = vec3<i32>(0, 0, i32(sign(vertex.z)));
    } else {
        adj_normals[0] = vec3<i32>(i32(sign(vertex.x)), 0, 0);
        adj_normals[1] = vec3<i32>(0, i32(sign(vertex.y)), 0);
    }

    return adj_normals;
}

const vertices = array<array<vec3<f32>, 4>, 6>(
    array<vec3<f32>, 4>(vec3<f32>(0.5, 0.5, -0.5), vec3<f32>(0.5, -0.5, -0.5), vec3<f32>(0.5, -0.5, 0.5), vec3<f32>(0.5, 0.5, 0.5)), // face +X
    array<vec3<f32>, 4>(vec3<f32>(-0.5, 0.5, 0.5), vec3<f32>(-0.5, -0.5, 0.5), vec3<f32>(-0.5, -0.5, -0.5), vec3<f32>(-0.5, 0.5, -0.5)), // face -X
    array<vec3<f32>, 4>(vec3<f32>(-0.5, 0.5, 0.5), vec3<f32>(-0.5, 0.5, -0.5), vec3<f32>(0.5, 0.5, -0.5), vec3<f32>(0.5, 0.5, 0.5)), // face +Y
    array<vec3<f32>, 4>(vec3<f32>(0.5, -0.5, 0.5), vec3<f32>(0.5, -0.5, -0.5), vec3<f32>(-0.5, -0.5, -0.5), vec3<f32>(-0.5, -0.5, 0.5)), // face -Y
    array<vec3<f32>, 4>(vec3<f32>(0.5, -0.5, 0.5), vec3<f32>(-0.5, -0.5, 0.5), vec3<f32>(-0.5, 0.5, 0.5), vec3<f32>(0.5, 0.5, 0.5)), // face +Z
    array<vec3<f32>, 4>(vec3<f32>(0.5, 0.5, -0.5), vec3<f32>(-0.5, 0.5, -0.5), vec3<f32>(-0.5, -0.5, -0.5), vec3<f32>(0.5, -0.5, -0.5)), // face -Z
);

const normals = array<vec3<i32>, 6>(
    vec3<i32>(1, 0, 0), // +X
    vec3<i32>(-1, 0, 0), // -X
    vec3<i32>(0, 1, 0), // +Y
    vec3<i32>(0, -1, 0), // -Y
    vec3<i32>(0, 0, 1), // +Z
    vec3<i32>(0, 0, -1) // -Z
);

const faceUVs = array<array<vec2<f32>, 4>, 6>(
    array<vec2<f32>, 4>(vec2<f32>(0, 0), vec2<f32>(0, 1), vec2<f32>(1, 1), vec2<f32>(1, 0)), // +X
    array<vec2<f32>, 4>(vec2<f32>(0, 0), vec2<f32>(0, 1), vec2<f32>(1, 1), vec2<f32>(1, 0)), // -X
    array<vec2<f32>, 4>(vec2<f32>(1, 1), vec2<f32>(0, 1), vec2<f32>(0, 0), vec2<f32>(1, 0)), // +Y
    array<vec2<f32>, 4>(vec2<f32>(1, 0), vec2<f32>(1, 1), vec2<f32>(0, 1), vec2<f32>(0, 0)), // -Y
    array<vec2<f32>, 4>(vec2<f32>(1, 1), vec2<f32>(0, 1), vec2<f32>(0, 0), vec2<f32>(1, 0)), // +Z TODO: fix +Z
    array<vec2<f32>, 4>(vec2<f32>(1, 0), vec2<f32>(0, 0), vec2<f32>(0, 1), vec2<f32>(1, 1)) // -Z
);

const tile_size: f32 = 32.0;

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
    if (!isFilledBlock(gid.x, gid.y, gid.z)) {
        return;
    }

    let blockId = getBlockId(gid.x, gid.y, gid.z);
    let atlasSize = vec2<f32>(tile_size * 6, tile_size * f32(uniforms.blockTypeCount));

    let i32_pos = vec3<i32>(i32(gid.x), i32(gid.y), i32(gid.z));
    let position = vec3<f32>(f32(gid.x), f32(gid.y), f32(gid.z));

    for (var face: u32 = 0u; face < 6u; face++)
    {
        let normal = normals[face];
        let neighbor = i32_pos + normal;

        if (!isPositionInChunk(neighbor) || !isFilledBlock(u32(neighbor.x), u32(neighbor.y), u32(neighbor.z))) {

            let baseIndex = atomicAdd(&counterBuffer, 1u);
            var vertexIndex = baseIndex * 4u;
            var indexIndex = baseIndex * 6u;

            let tileOffset = vec2<f32>(f32(face) * tile_size, f32(blockId) * tile_size);

            for (var v: u32 = 0u; v < 4u; v++) {
                let vertex = vertices[face][v];
                let adj_normals = getAdjacentNormals(normal, vertex);
                let adj_blocks = array<vec3<i32>, 2>(i32_pos + adj_normals[0], i32_pos + adj_normals[1]);

                if ((isPositionInChunk(adj_blocks[0]) && getBlockId(u32(adj_blocks[0].x), u32(adj_blocks[0].y), u32(adj_blocks[0].z))==blockId) ||
                    (isPositionInChunk(adj_blocks[1]) && getBlockId(u32(adj_blocks[1].x), u32(adj_blocks[1].y), u32(adj_blocks[1].z))==blockId)) {
                    let vertexIndex = atomicAdd(&counterBuffer, 1u);
                    vertexBuffer[vertexIndex].position = position + vertices[face][v];
                    vertexBuffer[vertexIndex].normal = vec3<f32>(normal);

                    // ancien UV mapping
                    let uv = tileOffset + faceUVs[face][v] * tile_size;
                    vertexBuffer[vertexIndex].uv = vec2<f32>(uv.x / atlasSize.x, 1 - uv.y / atlasSize.y);
                }
            }

            indexBuffer[indexIndex] = vertexIndex + 0u;
            indexBuffer[indexIndex + 1] = vertexIndex + 1u;
            indexBuffer[indexIndex + 2] = vertexIndex + 2u;

            indexBuffer[indexIndex + 3] = vertexIndex + 0u;
            indexBuffer[indexIndex + 4] = vertexIndex + 2u;
            indexBuffer[indexIndex + 5] = vertexIndex + 3u;
        }
    }
}
