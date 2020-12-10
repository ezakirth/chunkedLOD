import { showInfos } from "./GUI.js";

export function renderFrame() {
  input.check();
  mat4.perspective(pMatrix, 45, width / height, 0.1, 400 * 512);
  mat4.identity(mvMatrix);
  mat4.rotate(mvMatrix, mvMatrix, (input.pitch * Math.PI) / 180, [1, 0, 0]);
  mat4.rotate(mvMatrix, mvMatrix, (input.yaw * Math.PI) / 180, [0, 1, 0]);

  if (input.depthOfField) gl.bindFramebuffer(gl.FRAMEBUFFER, xBuffer.buffer);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  skybox.render();

  terrain.render();

  if (input.depthOfField) {
    gl.bindTexture(gl.TEXTURE_2D, xBuffer.texture);

    gl.bindFramebuffer(gl.FRAMEBUFFER, yBuffer.buffer);
    xBlur.render();
    gl.bindTexture(gl.TEXTURE_2D, yBuffer.texture);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    yBlur.render();
  }

  mat4.ortho(oMatrix, 0, width, 0, height, 0.1, 400 * 512);
  mat4.identity(mvMatrix);
  //stick.render();

  var currentTime = new Date().getTime();
  if (lastUpdateTime) {
    var delta = (currentTime - lastUpdateTime) / 1000;
    if (delta != 0) totalfps += 1 / delta;
    airTime += delta;
    tick += delta;
    totalTime += delta;
    counter++;
    if (tick >= 1) {
      fps = Math.floor((10 * totalfps) / counter) / 10;
      counter = 0;
      tick = 0;
      totalfps = 0;
    }
  }

  showInfos();

  lastUpdateTime = currentTime;
  window.requestAnimationFrame(renderFrame);
}
