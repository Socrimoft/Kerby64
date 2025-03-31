precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

#if NUM_BONE_INFLUENCERS > 0
    attribute vec4 matricesIndices;
    attribute vec4 matricesWeights;
    #if NUM_BONE_INFLUENCERS > 4
        attribute vec4 matricesIndicesExtra;
        attribute vec4 matricesWeightsExtra;
    #endif

    #ifndef BAKED_VERTEX_ANIMATION_TEXTURE
        #ifdef BONETEXTURE
            uniform highp sampler2D boneSampler;
            uniform float boneTextureWidth;
        #else
            uniform mat4 mBones[BonesPerMesh];
        #endif

        #ifdef BONES_VELOCITY_ENABLED
            uniform mat4 mPreviousBones[BonesPerMesh];
        #endif

        #ifdef BONETEXTURE
            #define inline
            mat4 readMatrixFromRawSampler(sampler2D smp, float index)
            {
                float offset = index  * 4.0;
                float dx = 1.0 / boneTextureWidth;

                vec4 m0 = texture2D(smp, vec2(dx * (offset + 0.5), 0.));
                vec4 m1 = texture2D(smp, vec2(dx * (offset + 1.5), 0.));
                vec4 m2 = texture2D(smp, vec2(dx * (offset + 2.5), 0.));
                vec4 m3 = texture2D(smp, vec2(dx * (offset + 3.5), 0.));

                return mat4(m0, m1, m2, m3);
            }
        #endif
    #endif
#endif

uniform mat4 world;
uniform mat4 viewProjection;

#ifdef MORPHTARGETS
uniform float morphTargetInfluences[5];
uniform float morphTargetTextureIndices[5];
uniform vec3 morphTargetTextureInfo;
uniform highp sampler2DArray morphTargets;
uniform int morphTargetCount;
#endif

vec3 readVector3FromRawSampler(int targetIndex, float vertexIndex)
{			
    float y = floor(vertexIndex / morphTargetTextureInfo.y);
    float x = vertexIndex - y * morphTargetTextureInfo.y;
    vec3 textureUV = vec3((x + 0.5) / morphTargetTextureInfo.y, (y + 0.5) / morphTargetTextureInfo.z, morphTargetTextureIndices[targetIndex]);
    return texture(morphTargets, textureUV).xyz;
}

vec4 readVector4FromRawSampler(int targetIndex, float vertexIndex)
{			
    float y = floor(vertexIndex / morphTargetTextureInfo.y);
    float x = vertexIndex - y * morphTargetTextureInfo.y;
    vec3 textureUV = vec3((x + 0.5) / morphTargetTextureInfo.y, (y + 0.5) / morphTargetTextureInfo.z, morphTargetTextureIndices[targetIndex]);
    return texture(morphTargets, textureUV);
}

varying vec3 vNormal;
varying vec2 vUV;

void main() {
    mat4 finalWorld = world;
    vec3 positionUpdated = position;
    vec3 normalUpdated = normal;

    vec2 uvUpdated = uv;
    vec3 tangentUpdated = vec3(0.0);
    vec2 uv2Updated = vec2(0.0);
    vec4 colorUpdated = vec4(0.0);


    #ifndef BAKED_VERTEX_ANIMATION_TEXTURE
        #if NUM_BONE_INFLUENCERS > 0
            mat4 influence;

        #ifdef BONETEXTURE
            influence = readMatrixFromRawSampler(boneSampler, matricesIndices[0]) * matricesWeights[0];

            #if NUM_BONE_INFLUENCERS > 1
                influence += readMatrixFromRawSampler(boneSampler, matricesIndices[1]) * matricesWeights[1];
            #endif
            #if NUM_BONE_INFLUENCERS > 2
                influence += readMatrixFromRawSampler(boneSampler, matricesIndices[2]) * matricesWeights[2];
            #endif
            #if NUM_BONE_INFLUENCERS > 3
                influence += readMatrixFromRawSampler(boneSampler, matricesIndices[3]) * matricesWeights[3];
            #endif

            #if NUM_BONE_INFLUENCERS > 4
                influence += readMatrixFromRawSampler(boneSampler, matricesIndicesExtra[0]) * matricesWeightsExtra[0];
            #endif
            #if NUM_BONE_INFLUENCERS > 5
                influence += readMatrixFromRawSampler(boneSampler, matricesIndicesExtra[1]) * matricesWeightsExtra[1];
            #endif
            #if NUM_BONE_INFLUENCERS > 6
                influence += readMatrixFromRawSampler(boneSampler, matricesIndicesExtra[2]) * matricesWeightsExtra[2];
            #endif
            #if NUM_BONE_INFLUENCERS > 7
                influence += readMatrixFromRawSampler(boneSampler, matricesIndicesExtra[3]) * matricesWeightsExtra[3];
            #endif
        #else
            influence = mBones[int(matricesIndices[0])] * matricesWeights[0];

            #if NUM_BONE_INFLUENCERS > 1
                influence += mBones[int(matricesIndices[1])] * matricesWeights[1];
            #endif
            #if NUM_BONE_INFLUENCERS > 2
                influence += mBones[int(matricesIndices[2])] * matricesWeights[2];
            #endif
            #if NUM_BONE_INFLUENCERS > 3
                influence += mBones[int(matricesIndices[3])] * matricesWeights[3];
            #endif

            #if NUM_BONE_INFLUENCERS > 4
                influence += mBones[int(matricesIndicesExtra[0])] * matricesWeightsExtra[0];
            #endif
            #if NUM_BONE_INFLUENCERS > 5
                influence += mBones[int(matricesIndicesExtra[1])] * matricesWeightsExtra[1];
            #endif
            #if NUM_BONE_INFLUENCERS > 6
                influence += mBones[int(matricesIndicesExtra[2])] * matricesWeightsExtra[2];
            #endif
            #if NUM_BONE_INFLUENCERS > 7
                influence += mBones[int(matricesIndicesExtra[3])] * matricesWeightsExtra[3];
            #endif
        #endif

            finalWorld = finalWorld * influence;
        #endif
    #endif

    #ifndef MORPHTARGETS
    float vertexID;

    for (int i = 0; i < NUM_MORPH_INFLUENCERS; i++) {
        if (i >= morphTargetCount)
            break;

        vertexID = float(gl_VertexID) * morphTargetTextureInfo.x;

        #ifdef MORPHTARGETTEXTURE_HASPOSITIONS
            vertexID += 1.0;
        #endif
    
        #ifdef MORPHTARGETTEXTURE_HASNORMALS
            vertexID += 1.0;
        #endif

        #ifdef MORPHTARGETTEXTURE_HASUVS
            vertexID += 1.0;
        #endif

        #ifdef MORPHTARGETTEXTURE_HASTANGENTS
            vertexID += 1.0;
        #endif

        #ifdef MORPHTARGETTEXTURE_HASUV2S
            vertexID += 1.0;
        #endif

        #ifdef MORPHTARGETS_COLOR
            colorUpdated += (readVector4FromRawSampler(i, vertexID) - color) * morphTargetInfluences[i];
        #endif
    }
    #endif

    gl_Position = viewProjection * finalWorld * vec4(positionUpdated, 1.0);

    mat3 normalMat = transpose(inverse(mat3(finalWorld)));
    vNormal = normalMat * normalUpdated;

    vUV = uv;
}
