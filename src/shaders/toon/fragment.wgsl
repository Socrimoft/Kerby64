#include<sceneUboDeclaration>

struct Light {
    diffuse: vec3<f32>,
    intensity: f32,
    direction: vec3<f32>,
};

var<storage, read> lights: array<Light>;

uniform ambiantColor: vec4<f32>;
uniform specularColor: vec4<f32>;
uniform glossiness: f32;
uniform rimColor: vec4<f32>;
uniform rimAmount: f32;
uniform rimThreshold: f32;

var texture: texture_2d<f32>;
var textureSampler: sampler;

varying vPositionW: vec3<f32>;
varying vNormalW: vec3<f32>;
varying vUV: vec2<f32>;
varying vColor: vec<f32>;

@fragment
fn main(input: FragmentInputs) -> FragmentOutputs {
    var finalColor = textureSample(texture, textureSampler, fragmentInputs.vUV) * fragmentInputs.vColor;

    for (var i: u32 = 0; i < arrayLength(&lights); i++) {
        let lightDir = -lights[i].direction;
        let NdotL = dot(lightDir, normalize(fragmentInputs.vNormalW));
        let light = vec4<f32>(lights[i].diffuse, 1.0) * smoothstep(0.0, 0.01, NdotL) * lights[i].intensity;

        let viewDir = normalize((vec4<f32>(fragmentInputs.vPositionW, 1.0) * scene.viewProjection).xyz);
        let halfVector = normalize(lightDir + viewDir);
        let NdotH = dot(fragmentInputs.vNormalW, halfVector);
        let specularIntensity = pow(NdotH * lights[i].intensity, uniforms.glossiness * uniforms.glossiness);
        let specularIntensitySmooth = smoothstep(0.005, 0.01, specularIntensity);
        let specular = specularIntensitySmooth * uniforms.specularColor;

        // let rimDot = 1.0 - dot(viewDir, fragmentInputs.vNormalW);
        // var rimIntensity = rimDot * pow(NdotL, uniforms.rimThreshold);
        // rimIntensity = smoothstep(uniforms.rimAmount - 0.01, uniforms.rimAmount + 0.01, rimIntensity);
        // let rim = uniforms.rimColor * rimIntensity;

        finalColor *= (uniforms.ambiantColor + light + specular);
    }

    fragmentOutputs.color = finalColor;
}
