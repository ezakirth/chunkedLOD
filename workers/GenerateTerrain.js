import { generateChunk } from "./GenerateChunk.js";

const workerGenerateTerrain = new Worker(
  "./workers/GenerateTerrain.worker.js",
  {
    type: "module",
  }
);

workerGenerateTerrain.onmessage = function (e) {
  var message = e.data;
  var id = message.id;
  var heightmap = terrain.heightmaps[id];
  heightmap.dataBuffer = message.heightmapDataBuffer;
  heightmap.dataView = new Float32Array(heightmap.dataBuffer);
  heightmap.normalsTextureDataBuffer = message.normalsTextureDataBuffer;
  heightmap.normalsTextureDataView = new Uint8Array(
    heightmap.normalsTextureDataBuffer
  );
  heightmap.shadowsTextureDataBuffer = message.shadowsTextureDataBuffer;
  heightmap.shadowsTextureDataView = new Uint8Array(
    heightmap.shadowsTextureDataBuffer
  );
  heightmap.low = message.low;
  heightmap.high = message.high;

  textures.updateTexture(
    heightmap.normalsTexture,
    heightmap.normalsTextureDataView,
    heightmap.size,
    true
  );
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, heightmap.normalsTexture);

  textures.updateTexture(
    heightmap.shadowsTexture,
    heightmap.shadowsTextureDataView,
    heightmap.size,
    true
  );
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, heightmap.shadowsTexture);

  heightmap.currentNode = heightmap.treeNodeList.length - 1;
  heightmap.treeLoaded = false;
  heightmap.loaded = true;

  this.setStatus(id, "ready");
  generateChunk(id);
};
workerGenerateTerrain.onerror = function (e) {
  console.log("error");
};

function generateTerrain(id) {
  var worker = workerGenerateTerrain;
  if (worker.getStatus(id) == "ready") {
    worker.setStatus(id, "busy");
    var message = {
      id: id,
      offset: terrain.heightmaps[id].pos,
      size: terrain.heightmaps[id].size,
      sunHeight: terrain.sunHeight,
      sizeRatio: sizeRatio,
      heightmapDataBuffer: terrain.heightmaps[id].dataBuffer,
      normalsTextureDataBuffer: terrain.heightmaps[id].normalsTextureDataBuffer,
      shadowsTextureDataBuffer: terrain.heightmaps[id].shadowsTextureDataBuffer,
      seedBuffer: seedBuffer,
    };

    worker.postMessage(message, [
      message.heightmapDataBuffer,
      message.normalsTextureDataBuffer,
      message.shadowsTextureDataBuffer,
    ]);
  }
}

export { workerGenerateTerrain, generateTerrain };
