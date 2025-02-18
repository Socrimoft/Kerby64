precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

#ifdef BONES
#include <bonesDeclaration>
#endif

uniform mat4 world;
uniform mat4 viewProjection;

varying vec3 vNormal;
varying vec2 vUV;

void main() {
    mat4 finalWorld = world;

    #ifdef BONES
    #include <bonesVertex>
    #endif

    gl_Position = viewProjection * finalWorld * vec4(position, 1.0);

    mat3 normalMat = transpose(inverse(mat3(finalWorld)));
    vNormal = normalMat * normal;

    vUV = uv;
}
