import Quadtree from "./quadtree.js";

export default class Heightmap {
  constructor(pos) {
    this.loaded = false;
    this.pos = pos;
    this.size = mapSize;
    this.treeNodeList = new Array();
    this.currentNode = 0;
    this.treeLoaded = false;
    this.tree = new Quadtree(
      this.treeNodeList,
      0,
      0,
      this.size,
      this.size,
      terrainDepth
    );
    this.skirtHeight = this.size / 128;
    this.heightRatio = 6;
    this.high = 0;
    this.low = 0;

    this.dataBuffer = new ArrayBuffer((this.size + 1) * (this.size + 1) * 4);
    this.dataView = new Float32Array(this.dataBuffer);

    this.normalsTextureDataBuffer = new ArrayBuffer(this.size * this.size * 4);
    this.normalsTextureDataView = new Uint8Array(this.normalsTextureDataBuffer);
    this.normalsTexture = gl.createTexture();
    textures.updateTexture(
      this.normalsTexture,
      this.normalsTextureDataView,
      this.size
    );

    this.shadowsTextureDataBuffer = new ArrayBuffer(this.size * this.size * 4);
    this.shadowsTextureDataView = new Uint8Array(this.shadowsTextureDataBuffer);
    this.shadowsTexture = gl.createTexture();
    textures.updateTexture(
      this.shadowsTexture,
      this.shadowsTextureDataView,
      this.size
    );
  }
  render() {
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.normalsTexture);

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this.shadowsTexture);

    this.tree.renderChunk();
  }
}

/*
I guess you're not concerned with blend maps or texture splatting (as that's independent of your UV mapping). Since you specifically asked for minimizing distortion caused by the mapping, you could consult section 1.5 of this GPU Gems article:

http://http.developer.nvidia.com/GPUGems3/gpugems3_ch01.html

This could work even on procedurally generated terrain. The concept is also known as "triplanar texturing".

LATER EDIT: I've tested the technique in my own terrain renderer using no precomputed uvs for the mapping. All you have to do is compute 3 sets of UVs for the 3 different projection planes (XY, YZ and ZX). This can be achieved using simple vertex and fragment shader snippets:

VShader:

float tileSize = 2.0;
vec4 worldPos = ( gl_Vertex);//So we obtain the world position

TexCoordX = (worldPos.zy/tileSize);//here are our texture coordinates...
TexCoordY = (worldPos.xz/tileSize);
TexCoordZ = (worldPos.xy/tileSize);
normal =  gl_Normal;
wNormal = normal;


FShader:

vec3 n = wNormal;
n*=n;
vec2 tcX = fract(TexCoordX);
vec2 tcY = fract(TexCoordY);
vec2 tcZ = fract(TexCoordZ);

vec4 grassCol = texture2D(grassTexture,tcX)*n.x+
                texture2D(grassTexture,tcY)*n.y+
                texture2D(grassTexture,tcZ)*n.z;
*/
