import Graphics from "./Graphics.js";
import { doAction } from "./GUI.js";
import { input } from "./input.js";
import { textures } from "./textures.js";
import { mat4 } from "./gl-matrix/index.js";
import { initWorkers } from "./workers/initWorkers.js";

let graphics = new Graphics();
let gl = graphics.getContext();

Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

window.gl = gl;

let useLocalStorage = true;
window.graphics = graphics;
window.workerGenerateTerrain = null;
window.workerUpdateShadows = null;
window.workerGenerateChunk = null;

window.doAction = doAction;
window.mat4 = mat4;
window.textures = textures;
window.input = input;

window.totalLoading = 0;
window.terrainDepth = 3;
window.mapSize = 512;
window.sizeRatio = 1;
window.frustum = null;

window.cnt = 0;

window.skybox = null;
window.terrain = null;

window.lastUpdateTime = 0;
window.fps = 0;
window.airTime = 0;
window.tick = 0;
window.totalfps = 0;
window.counter = 0;
window.totalTime = 0;

window.mvMatrix = null;
window.pMatrix = null;
window.mvpMatrix = null;
window.oMatrix = null;

window.viewPort = 0;
window.width = 0;
window.height = 0;

window.seedBuffer = new ArrayBuffer(256);

window.programs = null;

window.xBuffer = null;
window.yBuffer = null;

window.xBlur = null;
window.yBlur = null;

function init() {
  var seedView = new Uint8Array(seedBuffer);

  let jsonSeedView = JSON.parse(window.localStorage.getItem("seedView"));
  if (jsonSeedView && useLocalStorage) {
    for (var i = 0; i < 256; i++) {
      seedView[i] = jsonSeedView[i];
    }
  } else {
    for (var i = 0; i < 256; i++) {
      seedView[i] = Math.floor(Math.random() * 256);
    }
  }
  window.localStorage.setItem("seedView", JSON.stringify(seedView));

  doAction();

  graphics.init();

  initWorkers();
}

init();
