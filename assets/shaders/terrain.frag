/**
 * @fileoverview terrain.frag - terrain fragment shader
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
    highp vec3 lightdir = vec3(-1.0,1.0,0.0);
    highp float light = dot(lightdir, norm) * .5 + .5;


    highp vec3 FragColor =  (color + cliffCol)/2. * light;

    highp vec3 fog_color = vec3(246./255., 233./255., 180./255.);
    highp float fog_density = 1.;
    highp float perspective_far = 768.;//325.;
    highp float fog = fog_density * (gl_FragCoord.z / gl_FragCoord.w) / perspective_far;
    fog -= .2;

    highp vec3 col = mix( fog_color, FragColor , clamp(1. - fog, 0., 1.));


    gl_FragColor = vec4(col, 1.);
}