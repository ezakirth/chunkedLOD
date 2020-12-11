const input = {
  active: false,
  current: { x: 0, y: 0 },
  previous: { x: 0, y: 0 },
  pos: { x: -512 / 2, y: 0, z: -512 / 2 },
  yaw: 0,
  pitch: 20,
  gravity: 9.8,
  keyPressed: [],
  strafing: false,
  flying: true,
  speed: 0,
  jump: 0,
  jumping: false,
  wireframe: false,
  vertexMorphing: true,
  depthOfField: false,
  fog: true,
  autoRun: false,
  scale: 1,

  init: function () {
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("touchmove", input.update, true);
    window.addEventListener(
      "touchend",
      function (e) {
        input.active = false;
        input.previous.x = e.targetTouches[0].clientX;
        input.previous.y = e.targetTouches[0].clientY;
      },
      false
    );
    window.addEventListener(
      "touchstart",
      function (e) {
        input.active = true;
        input.previous.x = e.targetTouches[0].clientX;
        input.previous.y = e.targetTouches[0].clientY;
      },
      false
    );

    window.addEventListener("mousemove", input.update, false);
    window.addEventListener(
      "mouseup",
      function (e) {
        input.active = false;
      },
      false
    );
    window.addEventListener(
      "mousedown",
      function (e) {
        input.active = true;
      },
      false
    );

    window.addEventListener(
      "mousewheel",
      function (e) {
        var prev = input.scale;
        if (e.wheelDelta > 0) input.scale += 0.25;
        else input.scale -= 0.25;

        if (input.scale > 4) input.scale = 4;
        if (input.scale < 1) input.scale = 1;

        if (prev != input.scale) graphics.setup(input.scale);
      },
      false
    );

    window.addEventListener(
      "keydown",
      function (e) {
        input.keyPressed[e.code] = true;
        if (input.keyPressed.Space && !input.flying && !input.jumping) {
          input.jump = 2;
          input.jumping = true;
        }
      },
      false
    );

    window.addEventListener(
      "keyup",
      function (e) {
        input.keyPressed[e.code] = false;
        if (input.keyPressed.Space == false) {
          input.jump /= 3;
        }
      },
      false
    );
  },

  update: function (e) {
    e.preventDefault();

    if (e.type == "mousemove") {
      input.current.x = e.clientX;
      input.current.y = e.clientY;
    } else {
      input.current.x = e.targetTouches[0].clientX;
      input.current.y = e.targetTouches[0].clientY;
    }

    if (input.active) {
      input.yaw += (input.current.x - input.previous.x) / 3;
      input.pitch -= (input.current.y - input.previous.y) / 3;

      if (input.pitch > 90) input.pitch = 90;
      if (input.pitch < -90) input.pitch = -90;
    }

    input.previous.x = input.current.x;
    input.previous.y = input.current.y;
  },

  check: function () {
    var speed = 0.5;
    if (input.jumping) speed *= 2;

    if (input.autoRun) speed = 0.1;
    if (input.flying) speed = 3;

    var key = input.keyPressed;
    //    key[38] = true;
    // left right
    if (key.ArrowLeft || key.ArrowRight || key.KeyA || key.KeyD) {
      if (key.ArrowLeft || key.KeyA) input.speed = -speed;
      if (key.ArrowRight || key.KeyD) input.speed = speed;
      input.pos.x -= Math.cos((input.yaw * Math.PI) / 180) * input.speed;
      input.pos.z -= Math.sin((input.yaw * Math.PI) / 180) * input.speed;
    }

    if (key.Space && input.flying) {
      input.pos.y -= 1;
    }

    // up down
    if (key.ArrowUp || key.ArrowDown || key.KeyW || key.KeyS || input.autoRun) {
      if (key.ArrowUp || key.KeyW || input.autoRun) input.speed = speed;
      if (key.ArrowDown || key.KeyS) input.speed = -speed;
      if (input.flying) {
        input.pos.x -= input.speed * Math.sin((input.yaw * Math.PI) / 180) * Math.cos((input.pitch * Math.PI) / 180);
        input.pos.y += input.speed * Math.sin((input.pitch * Math.PI) / 180);
        input.pos.z += input.speed * Math.cos((input.yaw * Math.PI) / 180) * Math.cos((input.pitch * Math.PI) / 180);
      } else {
        input.pos.x -= input.speed * Math.sin((input.yaw * Math.PI) / 180);
        input.pos.z += input.speed * Math.cos((input.yaw * Math.PI) / 180);

        //            input.pos.x -= Math.cos((input.yaw)*Math.PI/180) * Math.cos(totalTime*10)/30;
        //            input.pos.z -= Math.sin((input.yaw)*Math.PI/180) * Math.cos(totalTime*10)/30;
      }
    }

    var id = -1;
    for (var i = 0; i < terrain.heightmaps.length; i++) {
      if (
        -input.pos.x < terrain.heightmaps[i].pos.x + terrain.heightmaps[0].size &&
        -input.pos.x > terrain.heightmaps[i].pos.x &&
        -input.pos.z < terrain.heightmaps[i].pos.z + terrain.heightmaps[0].size &&
        -input.pos.z > terrain.heightmaps[i].pos.z
      ) {
        id = i;
        break;
      }
    }

    if (id != -1) {
      var dataView = terrain.heightmaps[id].dataView;
      if (dataView.length > 0) {
        if (!input.flying) input.pos.y += -input.jump + (input.jump * airTime) / 10 + (input.gravity * airTime) / 10;
        var size = terrain.heightmaps[id].size;

        var px = -input.pos.x - terrain.heightmaps[id].pos.x;
        var pz = -input.pos.z - terrain.heightmaps[id].pos.z;
        var x = Math.floor(px);
        var z = Math.floor(pz);
        var modX = px - x;
        var modY = pz - z;

        var a = dataView[x + z * (size + 1)];
        var b = dataView[x + (z + 1) * (size + 1)];
        a = a + modX * (dataView[x + 1 + z * (size + 1)] - a);
        b = b + modX * (dataView[x + 1 + (z + 1) * (size + 1)] - b);
        var currHeight = -(a + modY * (b - a)) / terrain.heightmaps[id].heightRatio;

        if (input.pos.y > currHeight - 5 + Math.cos(totalTime * 5) / 15) {
          input.pos.y = currHeight - 5 + Math.cos(totalTime * 5) / 15;
          airTime = 0;
          input.jump = 0;
          input.jumping = false;
        } else input.pos.y += Math.cos(totalTime * 5) / 15;
      }
    }
  },
};

export { input };
