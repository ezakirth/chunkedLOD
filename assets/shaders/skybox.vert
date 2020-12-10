/**
 * @fileoverview skybox.vert - skybox vertex shader
 * @author Xavier de Boysson
 */

attribute highp vec4 aVertexPosition;
attribute highp vec3 aTextureCoordinates;

uniform highp mat4 uMVPMatrix;

varying highp vec3 sTextureCoord;

void main(void)
{
    gl_Position = uMVPMatrix * aVertexPosition;

    sTextureCoord = aTextureCoordinates;
}