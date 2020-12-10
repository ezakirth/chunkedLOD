/**
 * @fileoverview sprite.vert - sprite vertex shader
 * @author Xavier de Boysson
 */

attribute highp vec4 aVertexPosition;
attribute highp vec2 aTextureCoordinates;

uniform highp mat4 uMVPMatrix;
varying highp vec2 vTextureCoord;

void main(void)
{
    gl_Position = uMVPMatrix * aVertexPosition;
    vTextureCoord = aTextureCoordinates;
}
