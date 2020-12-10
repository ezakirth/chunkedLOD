/**
 * @fileoverview sprite.frag - sprite fragment shader
 * @author Xavier de Boysson
 */

uniform highp sampler2D uTexture;
varying highp vec2 vTextureCoord;

void main(void)
{
	gl_FragColor =  texture2D(uTexture, vTextureCoord);
}