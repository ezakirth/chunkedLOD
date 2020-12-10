/**
 * @fileoverview skybox.frag - skybox fragment shader
 * @author Xavier de Boysson
 */

uniform highp samplerCube uTexture;
varying highp vec3 sTextureCoord;

void main(void)
{
    gl_FragColor = textureCube( uTexture, sTextureCoord );
}