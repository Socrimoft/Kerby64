precision highp float;

uniform mat4 worldViewProjection;
uniform vec3 lightDirection;
uniform float lightIntensity;
uniform vec3 diffuseColor;
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
    float NdotL = dot(lightDirection, normalize(vNormal));
    vec4 light = vec4(diffuseColor, 1.0) * smoothstep(0.0, 0.01, NdotL) * lightIntensity;

    vec3 viewDir = normalize(vec3(worldViewProjection));
    vec3 halfVector = normalize(lightDirection + viewDir);
    float NdotH = dot(vNormal, halfVector);
    float specularIntensity = pow(NdotH * lightIntensity, glossiness * glossiness);
    float specularIntensitySmooth = smoothstep(0.005, 0.01, specularIntensity);
    vec4 specular = specularIntensitySmooth * specularColor;

    // float rimDot = 1.0 - dot(viewDir, vNormal);
    // float rimIntensity = rimDot * pow(NdotL, rimThreshold);
    // rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);
    // vec4 rim = rimIntensity * rimColor;

    vec4 texColor = texture2D(textureSampler, vUV);

    gl_FragColor = texColor * (ambiantColor + light + specular);
}
