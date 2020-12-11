/**
 * @fileoverview terrainNoFog.frag - terrainNoFog fragment shader
 * @author Xavier de Boysson
 */

uniform highp sampler2D uTextureGrass;
uniform highp sampler2D uTextureDirt;
uniform highp sampler2D uTextureShadows;
uniform highp sampler2D uTextureNormals;

varying highp vec2 vTextureCoord;
varying highp vec2 TexCoordX;
varying highp vec2 TexCoordY;
varying highp vec2 TexCoordZ;

void main(void)
{
    highp vec3 n = texture2D(uTextureNormals, vTextureCoord).rgb;
    //n*=n;

    highp vec2 tcX = fract(TexCoordX);
    highp vec2 tcY = fract(TexCoordY);
    highp vec2 tcZ = fract(TexCoordZ);

    highp vec3 dirtTX = texture2D(uTextureDirt,tcX).rgb * n.x;
    highp vec3 grassTY = texture2D(uTextureGrass,tcY).rgb * n.y;
    highp vec3 grassTZ = texture2D(uTextureGrass,tcZ).rgb * n.z;

    highp vec3 grassCol = texture2D(uTextureGrass,tcX).rgb * n.x + grassTY + grassTZ;
    highp vec3 dirtCol = dirtTX + texture2D(uTextureDirt,tcY).rgb * n.y + texture2D(uTextureDirt,tcZ).rgb * n.z;
    highp vec3 color = dirtTX + grassTY + grassTZ;

    highp float slope = 1.0 - n.y;
    highp vec3 cliffCol;

    if (slope < .6)
        cliffCol = grassCol;

    if ((slope<.8) && (slope >= .6))
        cliffCol = mix( grassCol , dirtCol, (slope - .6) * (1. / (.8 - .6)));

    if (slope >= .8)
        cliffCol = dirtCol;

    highp vec3 norm = normalize(n);
    highp vec3 lightdir = normalize(vec3(100.0, 0.0,-100.0));
    highp float light = dot(lightdir, norm) * .5 + .5;

    highp float contrast = 100.; //input range [-100..100]
    contrast = contrast / 100.0 + 1.; //convert to decimal & shift range: [0..2]
    highp float intercept = .5 * (1. - contrast);
    light *= contrast + intercept;

    highp vec3 FragColor =  (color + cliffCol)/2. * light;//z * texture2D(uTextureShadows, vTextureCoord).r;

    gl_FragColor = vec4(FragColor, 1.);
}