precision highp float;

uniform mat4 worldViewProjection;
uniform vec3 lightDir;
uniform vec4 ambiantColor;
uniform vec4 specularColor;
uniform float glossiness;
uniform vec4 rimColor;
uniform float rimAmount;
uniform float rimThreshold;
uniform sampler2D textureSampler;

varying vec3 vNormal;
varying vec2 vUV;

void main(void) {
    float NdotL = dot(lightDir, normalize(vNormal));
    float lightIntensity = smoothstep(0.0, 0.01, NdotL);

    vec3 viewDir = normalize(vec3(worldViewProjection));
    vec3 halfVector = normalize(lightDir + viewDir);
    float NdotH = dot(vNormal, halfVector);
    float specularIntensity = pow(NdotH * lightIntensity, glossiness * glossiness);
    float specularIntensitySmooth = smoothstep(0.005, 0.01, specularIntensity);
    vec4 specular = specularIntensitySmooth * specularColor;

    // float rimDot = 1.0 - dot(viewDir, vNormal);
    // float rimIntensity = rimDot * pow(NdotL, rimThreshold);
    // rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);
    // vec4 rim = rimIntensity * rimColor;

    vec4 texColor = texture2D(textureSampler, vUV);

    gl_FragColor = texColor * (ambiantColor + lightIntensity + specular);
}
