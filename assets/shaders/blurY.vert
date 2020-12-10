/**
 * @fileoverview blurY.vert - blurY vertex shader
 * @author Xavier de Boysson
 */

attribute highp vec4 aVertexPosition;
attribute highp vec2 aTextureCoordinates;

uniform highp vec2 uPixel;
varying highp vec2 blurCoordinates[6];

void main(void)
{
    gl_Position = aVertexPosition;
    blurCoordinates[5] = aTextureCoordinates - .5;
    highp vec2 pixel = (uPixel * blurCoordinates[5]);
    blurCoordinates[0] = aTextureCoordinates;
	blurCoordinates[1] = aTextureCoordinates + pixel * 1.407333;
	blurCoordinates[2] = aTextureCoordinates - pixel * 1.407333;
	blurCoordinates[3] = aTextureCoordinates + pixel * 3.294215;
	blurCoordinates[4] = aTextureCoordinates - pixel * 3.294215;

}
