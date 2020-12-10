import { createProgramsFromURIs } from "./shaderUtils.js";
import { renderFrame } from "./render.js";
import Terrain from "./terrain.js";
import Skybox from "./skybox.js";
import Pass from "./pass.js";

export default class Graphics {
  constructor() {
    let body = document.querySelector("body");
    this.canvas = document.createElement("canvas");
    body.append(this.canvas);

    this.ctx = this.canvas.getContext("webgl");
  }
  getContext() {
    return this.ctx;
  }

  setup(scale) {
    width = window.innerWidth / scale;
    height = window.innerHeight / scale;
    viewPort = width / (2 * Math.tan((45 * Math.PI) / 180 / 2));

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width * scale + "px";
    this.canvas.style.height = height * scale + "px";
    gl.viewport(0, 0, width, height);
    xBuffer = textures.createFramebuffer();
    yBuffer = textures.createFramebuffer();
    if (xBlur) {
      xBlur = new Pass(programs.blurX, xBuffer, 1);
      yBlur = new Pass(programs.blurY, yBuffer, 2);
    }
  }

  init() {
    window.onresize = () => {
      this.setup(input.scale);
    };

    this.setup(input.scale);

    //    gl.clearColor(246./255., 233./255., 180./255., 1.);
    gl.clearColor(0, 0, 0, 1);

    gl.clearDepth(1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    createProgramsFromURIs(gl, {
      programs: [
        {
          name: "terrain",
          vsURI: "./assets/shaders/terrain.vert",
          fsURI: "./assets/shaders/terrain.frag",
        },
        {
          name: "terrainNoFog",
          vsURI: "./assets/shaders/terrain.vert",
          fsURI: "./assets/shaders/terrainNoFog.frag",
        },
        {
          name: "skybox",
          vsURI: "./assets/shaders/skybox.vert",
          fsURI: "./assets/shaders/skybox.frag",
        },
        {
          name: "blurX",
          vsURI: "./assets/shaders/blurX.vert",
          fsURI: "./assets/shaders/blurX.frag",
        },
        {
          name: "blurY",
          vsURI: "./assets/shaders/blurY.vert",
          fsURI: "./assets/shaders/blurY.frag",
        },
      ],
      onComplete: function (progs) {
        programs = progs;

        terrain = new Terrain();
        skybox = new Skybox();

        xBlur = new Pass(programs.blurX, xBuffer, 1);
        yBlur = new Pass(programs.blurY, yBuffer, 2);

        pMatrix = mat4.create();
        oMatrix = mat4.create();
        mvMatrix = mat4.create();
        mvpMatrix = mat4.create();

        input.init();

        renderFrame();
      },
    });
  }
}
