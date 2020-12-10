import { extractFrustum } from "./frustum.js";
import { generateTerrain } from "./workers/GenerateTerrain.js";
import Heightmap from "./heightmap.js";

export default class Terrain {
  constructor() {
    this.initChunks();

    if (input.fog) this.setProgram(programs.terrain);
    else this.setProgram(programs.terrainNoFog);

    gl.uniform1i(this.uTextureGrass, 0);
    gl.uniform1i(this.uTextureDirt, 1);
    gl.uniform1i(this.uTextureNormals, 2);
    gl.uniform1i(this.uTextureShadows, 3);

    // textures.loadTextureData("grassTexture", "./assets/grass.jpg");
    // textures.loadTextureData("dirtTexture", "./assets/dirt.jpg");

    textures.loadTextureData("grassTexture", "./assets/snow.jpg");
    textures.loadTextureData("dirtTexture", "./assets/rock.jpg");
  }
  setProgram(prog) {
    this.program = prog;
    gl.useProgram(prog);
    this.aVertexPosition = gl.getAttribLocation(prog, "aVertexPosition");
    this.aTextureCoordinates = gl.getAttribLocation(
      prog,
      "aTextureCoordinates"
    );

    this.uMVPMatrix = gl.getUniformLocation(prog, "uMVPMatrix");
    this.uMorph = gl.getUniformLocation(prog, "uMorph");

    this.uTextureGrass = gl.getUniformLocation(prog, "uTextureGrass");
    this.uTextureDirt = gl.getUniformLocation(prog, "uTextureDirt");
    this.uTextureNormals = gl.getUniformLocation(prog, "uTextureNormals");
    this.uTextureShadows = gl.getUniformLocation(prog, "uTextureShadows");
  }

  initChunks() {
    this.genIndices();

    this.heightmaps = new Array();
    this.sunHeight = 1;

    this.heightmaps.push(new Heightmap({ x: 0, z: 0 }));

    for (var x = -1; x <= 1; x++) {
      for (var z = -1; z <= 1; z++) {
        if (x != 0 || z != 0)
          this.heightmaps.push(
            new Heightmap({ x: x * mapSize, z: z * mapSize })
          );
      }
    }

    for (var x = -2; x <= 2; x++) {
      for (var z = -2; z <= 2; z++) {
        if (
          (x != 0 || z != 0) &&
          (x != 1 || z != 0) &&
          (x != -1 || z != 0) &&
          (x != 0 || z != 1) &&
          (x != 0 || z != -1) &&
          (x != -1 || z != -1) &&
          (x != 1 || z != 1) &&
          (x != 1 || z != -1) &&
          (x != -1 || z != 1)
        )
          this.heightmaps.push(
            new Heightmap({ x: x * mapSize, z: z * mapSize })
          );
      }
    }
  }

  updateChunks() {
    var heightmap = null;
    var size = mapSize * sizeRatio;
    for (var id = 0; id < this.heightmaps.length; id++) {
      heightmap = this.heightmaps[id];
      if (heightmap) {
        var used = false;
        for (var x = -2; x <= 2; x++) {
          for (var z = -2; z <= 2; z++) {
            if (
              -input.pos.x + x * size < heightmap.pos.x + size &&
              -input.pos.x + x * size > heightmap.pos.x &&
              -input.pos.z + z * size < heightmap.pos.z + size &&
              -input.pos.z + z * size > heightmap.pos.z
            ) {
              used = true;
            }
          }
        }

        if (!used && workerGenerateTerrain.getStatus(0) == "ready")
          terrain.heightmaps.remove(id);
      }
    }

    for (var x = -2; x <= 2; x++) {
      for (var z = -2; z <= 2; z++) {
        var genMap = true;
        for (var id = 0; id < this.heightmaps.length; id++) {
          heightmap = this.heightmaps[id];
          if (
            -input.pos.x + x * size < heightmap.pos.x + size &&
            -input.pos.x + x * size > heightmap.pos.x &&
            -input.pos.z + z * size < heightmap.pos.z + size &&
            -input.pos.z + z * size > heightmap.pos.z
          ) {
            genMap = false;
            break;
          }
        }

        if (genMap) {
          var px = Math.floor(-input.pos.x / size);
          var pz = Math.floor(-input.pos.z / size);
          this.heightmaps.push(
            new Heightmap({ x: px * size + x * size, z: pz * size + z * size })
          );
        }
      }
    }
  }

  render() {
    gl.useProgram(this.program);
    mat4.translate(mvMatrix, mvMatrix, [input.pos.x, input.pos.y, input.pos.z]);
    mat4.multiply(mvpMatrix, pMatrix, mvMatrix);
    gl.uniformMatrix4fv(this.uMVPMatrix, false, mvpMatrix);

    frustum = extractFrustum();

    var onMap = false;
    var heightmap = null;

    this.updateChunks();

    cnt = 0;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.grassTexture);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures.dirtTexture);
    gl.uniform1i(this.uTextureGrass, 0);
    gl.uniform1i(this.uTextureDirt, 1);
    gl.uniform1i(this.uTextureNormals, 2);
    gl.uniform1i(this.uTextureShadows, 3);

    gl.enableVertexAttribArray(this.aVertexPosition);
    gl.enableVertexAttribArray(this.aTextureCoordinates);

    // same indices for all chunks
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);

    totalLoading = 0;
    for (var id = 0; id < this.heightmaps.length; id++) {
      heightmap = this.heightmaps[id];
      if (heightmap) {
        if (heightmap.loaded) {
          totalLoading++;
          heightmap.render();
        } else {
          generateTerrain(id);
        }
      }
    }
    totalLoading = Math.floor((totalLoading / this.heightmaps.length) * 100);

    gl.disableVertexAttribArray(this.aVertexPosition);
    gl.disableVertexAttribArray(this.aTextureCoordinates);
  }

  genIndices() {
    var size = mapSize / Math.pow(2, terrainDepth);
    var indicesBuffer = new ArrayBuffer((size * size + size * 4) * 6 * 2);
    var indices = new Uint16Array(indicesBuffer);

    var a, b, c, d;
    var i = 0;
    var j = 0;
    for (var z = 0; z < size + 1; z++) {
      for (var x = 0; x < size + 1; x++) {
        if (x < size && z < size) {
          a = i / 3;
          b = (i + 3 * (size + 1)) / 3;
          c = (i + 3 + 3 * (size + 1)) / 3;
          d = (i + 3) / 3;

          indices[j] = a;
          indices[j + 1] = b;
          indices[j + 2] = c;
          indices[j + 3] = c;
          indices[j + 4] = d;
          indices[j + 5] = a;
          j += 6;
        }
        i += 3;
      }
    }

    // left skirt
    for (var z = 0; z < size + 1; z++) {
      if (z < size) {
        a = i / 3;
        b = (i + 3) / 3;
        c = (z + 1) * (size + 1);
        d = z * (size + 1);

        indices[j] = a;
        indices[j + 1] = b;
        indices[j + 2] = c;
        indices[j + 3] = c;
        indices[j + 4] = d;
        indices[j + 5] = a;
        j += 6;
      }
      i += 3;
    }

    // bottom skirt
    for (var x = 0; x < size + 1; x++) {
      if (x < size) {
        b = i / 3;
        c = (i + 3) / 3;
        a = x + size * (size + 1);
        d = x + 1 + size * (size + 1);
        indices[j] = a;
        indices[j + 1] = b;
        indices[j + 2] = c;
        indices[j + 3] = c;
        indices[j + 4] = d;
        indices[j + 5] = a;
        j += 6;
      }
      i += 3;
    }

    // top skirt
    for (var x = 0; x < size + 1; x++) {
      if (x < size) {
        a = i / 3;
        d = (i + 3) / 3;
        b = x;
        c = x + 1;
        indices[j] = a;
        indices[j + 1] = b;
        indices[j + 2] = c;
        indices[j + 3] = c;
        indices[j + 4] = d;
        indices[j + 5] = a;
        j += 6;
      }
      i += 3;
    }

    // right skirt
    for (var z = 0; z < size + 1; z++) {
      if (z < size) {
        c = (i + 3) / 3;
        d = i / 3;
        a = size + z * (size + 1);
        b = size + (z + 1) * (size + 1);

        indices[j] = a;
        indices[j + 1] = b;
        indices[j + 2] = c;
        indices[j + 3] = c;
        indices[j + 4] = d;
        indices[j + 5] = a;
        j += 6;
      }
      i += 3;
    }

    this.indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.indicesLength = indices.length;
  }
}
