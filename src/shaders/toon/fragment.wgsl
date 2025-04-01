#include<sceneUboDeclaration>

uniform lightDirection : vec3<f32>;
uniform lightIntensity : f32;
uniform diffuseColor : vec3<f32>;
uniform ambiantColor : vec4<f32>;
uniform specularColor : vec4<f32>;
uniform glossiness : f32;
uniform rimColor : vec4<f32>;
uniform rimAmount : f32;
uniform rimThreshold : f32;

var texture : texture_2d<f32>;
var textureSampler : sampler;

varying vPositionW : vec3<f32>;
varying vNormalW: vec3<f32>;
varying vUV : vec2<f32>;

@fragment
fn main(input : FragmentInputs) -> FragmentOutputs {
    let NdotL = dot(uniforms.lightDirection, normalize(fragmentInputs.vNormalW));
    let light = vec4<f32>(uniforms.diffuseColor, 1.0) * smoothstep(0.0, 0.01, NdotL) * uniforms.lightIntensity;
    let viewDir = normalize((vec4<f32>(fragmentInputs.vPositionW, 1.0) * scene.viewProjection).xyz);
    let halfVector = normalize(uniforms.lightDirection + viewDir);
    let NdotH = dot(fragmentInputs.vNormalW, halfVector);
    let specularIntensity = pow(NdotH * uniforms.lightIntensity, uniforms.glossiness * uniforms.glossiness);
    let specularIntensitySmooth = smoothstep(0.005, 0.01, specularIntensity);
    let specular = specularIntensitySmooth * uniforms.specularColor;

    // float rimDot = 1.0 - dot(viewDir, vNormalW);
    // float rimIntensity = rimDot * pow(NdotL, rimThreshold);
    // rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);
    // vec4 rim = rimIntensity * rimColor;

    let texColor = textureSample(texture, textureSampler, fragmentInputs.vUV);

    fragmentOutputs.color = texColor * (uniforms.ambiantColor + light + specular);
}
