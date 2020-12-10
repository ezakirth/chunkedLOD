/**
 * @fileoverview blurX.vert - blurX vertex shader
 * @author Xavier de Boysson
 */

attribute highp vec4 aVertexPosition;
attribute highp vec2 aTextureCoordinates;

uniform highp vec2 uPixel;
varying highp vec2 blurCoordinates[5];

void main(void)
{
    gl_Position = aVertexPosition;
    highp vec2 pixel = uPixel * (aTextureCoordinates - .5);
    blurCoordinates[0] = aTextureCoordinates;
	blurCoordinates[1] = aTextureCoordinates + pixel * 1.407333;
	blurCoordinates[2] = aTextureCoordinates - pixel * 1.407333;
	blurCoordinates[3] = aTextureCoordinates + pixel * 3.294215;
	blurCoordinates[4] = aTextureCoordinates - pixel * 3.294215;
}
