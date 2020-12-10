import { workerGenerateTerrain } from "./GenerateTerrain.js";

const workerGenerateChunk = new Worker("./workers/workerGenerateChunk.js", {
  type: "module",
});
workerGenerateChunk.onmessage = function (e) {
  var message = e.data;
  var id = message.id;
  var heightmap = terrain.heightmaps[id];
  heightmap.dataBuffer = message.heightmapDataBuffer;
  heightmap.dataView = new Float32Array(heightmap.dataBuffer);

  var node = heightmap.treeNodeList[heightmap.currentNode];
  node.chunk = {};
  var chunk = node.chunk;
  chunk.boundingSphere = message.boundingSphere;

  chunk.interleavedArray = new Float32Array(message.interleavedArrayBuffer);
  chunk.interleavedArrayBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, chunk.interleavedArrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, chunk.interleavedArray, gl.STATIC_DRAW);

  this.setStatus(0, "ready");

  heightmap.currentNode--;

  if (!heightmap.treeLoaded) {
    var node = heightmap.treeNodeList[heightmap.currentNode];
    if (node) {
      generateChunk(id);
    }
    if (heightmap.currentNode < 0) heightmap.treeLoaded = true;
  }
};
workerGenerateChunk.onerror = function (e) {
  console.log("error");
};

function generateChunk(id) {
  var worker = workerGenerateChunk;
  if (
    worker.getStatus(0) == "ready" &&
    workerGenerateTerrain.getStatus(0) == "ready"
  ) {
    var heightmap = terrain.heightmaps[id];
    var node = heightmap.treeNodeList[heightmap.currentNode];
    if (node) {
      worker.setStatus(0, "busy");

      var xmin = node.xmin;
      var zmin = node.ymin;
      var xmax = node.xmax;
      var zmax = node.ymax;
      var step = Math.pow(2, node.d);

      var interleavedArrayBuffer = new ArrayBuffer(
        (((zmax - zmin + step) / step) * ((zmax - zmin + step) / step) * 6 +
          ((zmax - zmin + step) / step) * 4 * 6) *
          4
      );

      var message = {
        id: id,
        node: heightmap.currentNode,
        size: heightmap.size,
        heightRatio: heightmap.heightRatio,
        sizeRatio: sizeRatio,
        skirtHeight: heightmap.skirtHeight,
        offset: heightmap.pos,
        xmin: xmin,
        zmin: zmin,
        xmax: xmax,
        zmax: zmax,
        step: step,
        heightmapDataBuffer: heightmap.dataBuffer,
        interleavedArrayBuffer: interleavedArrayBuffer,
      };
      worker.postMessage(message, [
        message.heightmapDataBuffer,
        message.interleavedArrayBuffer,
      ]);
    }
  }
}

export { workerGenerateChunk, generateChunk };
