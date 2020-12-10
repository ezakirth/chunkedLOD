/**
 * @fileoverview terrain.vert - terrain vertex shader
 * @author Xavier de Boysson
 */

attribute highp vec4 aVertexPosition;
attribute highp vec2 aTextureCoordinates;

uniform highp mat4 uMVPMatrix;
uniform highp float uMorph;

varying highp vec2 vTextureCoord;
varying highp vec2 TexCoordX;
varying highp vec2 TexCoordY;
varying highp vec2 TexCoordZ;

void main(void)
{
    highp float morphedVertex = aVertexPosition.w + uMorph * (aVertexPosition.y - aVertexPosition.w);

    TexCoordX = (aVertexPosition.zy)*.25;
    TexCoordY = (aVertexPosition.xz)*.25;
    TexCoordZ = (aVertexPosition.xy)*.25;

    gl_Position = uMVPMatrix * vec4(aVertexPosition.x, morphedVertex, aVertexPosition.z, 1.0);
    vTextureCoord = aTextureCoordinates;
}