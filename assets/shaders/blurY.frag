/**
 * @fileoverview blurY.frag - blurY fragment shader
 * @author Xavier de Boysson
 */

uniform highp sampler2D uTexture;

varying highp vec2 blurCoordinates[6];

void main(void)
{
	highp vec3 sum = texture2D(uTexture, blurCoordinates[0]).rbg * 0.204164;
	sum += texture2D(uTexture, blurCoordinates[1]).rbg * 0.304005;
	sum += texture2D(uTexture, blurCoordinates[2]).rbg * 0.304005;
	sum += texture2D(uTexture, blurCoordinates[3]).rbg * 0.093913;
	sum += texture2D(uTexture, blurCoordinates[4]).rbg * 0.093913;
	highp float vignette = 1. - dot(blurCoordinates[5], blurCoordinates[5]);
	gl_FragColor =  vec4(sum*vignette*vignette, 1.);
}