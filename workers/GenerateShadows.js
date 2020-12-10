const workerGenerateShadows = new Worker(
  "./workers/GenerateShadows.worker.js",
  {
    type: "module",
  }
);

workerGenerateShadows.onmessage = function (e) {
  var message = e.data;
  var id = message.id;
  var heightmap = terrain.heightmaps[id];
  heightmap.dataBuffer = message.heightmapDataBuffer;
  heightmap.dataView = new Float32Array(heightmap.dataBuffer);
  heightmap.shadowsTextureDataBuffer = message.textureDataBuffer;
  heightmap.shadowsTextureDataView = new Uint8Array(
    heightmap.shadowsTextureDataBuffer
  );

  textures.updateTexture(
    heightmap.shadowsTexture,
    heightmap.shadowsTextureDataView,
    terrain.heightmaps[id].size,
    true
  );
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, heightmap.shadowsTexture);

  this.setStatus(0, "ready");
};
workerGenerateShadows.onerror = function (e) {
  console.log("error");
};

function generateShadows(id) {
  var worker = workerGenerateShadows;
  if (
    worker.getStatus(0) == "ready" &&
    workerGenerateTerrain.getStatus(0) == "ready"
  ) {
    worker.setStatus(0, "busy");
    var message = {
      id: id,
      size: terrain.heightmaps[id].size,
      low: terrain.heightmaps[id].low,
      high: terrain.heightmaps[id].high,
      sunHeight: terrain.sunHeight,
      heightmapDataBuffer: terrain.heightmaps[id].dataBuffer,
      textureDataBuffer: terrain.heightmaps[id].shadowsTextureDataBuffer,
    };
    worker.postMessage(message, [
      message.heightmapDataBuffer,
      message.textureDataBuffer,
    ]);
  }
}

export { workerGenerateShadows, generateShadows };
