import SimplexNoise from "./noise.js";

onmessage = function (event) {
  //  importScripts("noise.js");
  var message = event.data;

  var shadowsTextureView = new Uint8Array(message.shadowsTextureDataBuffer);
  var normalsTextureView = new Uint8Array(message.normalsTextureDataBuffer);

  var dataViewHM = new Float32Array(message.heightmapDataBuffer);
  var size = message.size;
  var sunHeight = message.sunHeight;
  var offset = message.offset;
  var sizeRatio = message.sizeRatio;
  offset.x /= sizeRatio;
  offset.z /= sizeRatio;

  var overlap = 64;
  var dataBuffer = new ArrayBuffer(
    (size + overlap + 1) * (size + overlap + 1) * 4
  );
  var dataView = new Float32Array(dataBuffer);

  var seed = new Uint8Array(message.seedBuffer);
  var noise = new SimplexNoise(seed);

  for (var i = 0; i < dataView.length; i++) {
    dataView[i] = 0;
  }

  addPerlinNoise(
    3,
    (size + overlap) / 2,
    dataView,
    size + overlap,
    noise,
    offset
  );

  addPerlinNoise(
    6,
    (size + overlap) / 8,
    dataView,
    size + overlap,
    noise,
    offset
  );

  perturb(16, 16, dataView, size + overlap, noise, offset);

  erode(10, 16 * (size + overlap), dataView, size + overlap);

  addPerlinNoise(
    0.4,
    (size + overlap) * 3,
    dataView,
    size + overlap,
    noise,
    offset
  );

  smoothen(dataView, size + overlap);

  for (var z = 0; z < size + overlap + 1; z++) {
    for (var x = 0; x < size + overlap + 1; x++) {
      if (
        x >= overlap / 2 &&
        x < size + overlap / 2 + 1 &&
        z >= overlap / 2 &&
        z < size + overlap / 2 + 1
      )
        dataViewHM[x - overlap / 2 + (z - overlap / 2) * (size + 1)] =
          dataView[x + z * (size + overlap + 1)] * sizeRatio;
    }
  }

  var high = 0;
  var low = 999999;
  for (var i = 0; i < dataViewHM.length; i++) {
    if (dataViewHM[i] > high) high = dataViewHM[i];
    if (dataViewHM[i] < low) low = dataViewHM[i];
  }

  low = Math.abs(low);
  high = low + high;

  generateNormals(normalsTextureView, dataViewHM, size);
  generateShadows(shadowsTextureView, dataViewHM, size, sunHeight, low, high);

  var dataBuffer = null;
  var dataView = null;

  var returnMessage = {
    id: message.id,
    low: low,
    high: high,
    heightmapDataBuffer: message.heightmapDataBuffer,
    shadowsTextureDataBuffer: message.shadowsTextureDataBuffer,
    normalsTextureDataBuffer: message.normalsTextureDataBuffer,
    //       seedBuffer: message.seedBuffer
  };

  postMessage(returnMessage, [
    returnMessage.heightmapDataBuffer,
    returnMessage.shadowsTextureDataBuffer,
    returnMessage.normalsTextureDataBuffer,
  ]);
};

var generateNormals = function (normalsTextureView, dataView, size) {
  for (var z = 0; z < size; z++) {
    for (var x = 0; x < size; x++) {
      var a = dataView[x + 1 + z * (size + 1)];
      var b = dataView[x - 1 + z * (size + 1)];
      var c = dataView[x + (z + 1) * (size + 1)];
      var d = dataView[x + (z - 1) * (size + 1)];

      var sx = a - b;
      var sz = c - d;

      var yScale = 1;
      var xzScale = 2;

      var nx = -sx * yScale;
      var ny = 2 * xzScale;
      var nz = sz * yScale;

      var L = 1 / Math.hypot(nx, ny, nz);
      nx *= L;
      ny *= L;
      nz *= L;

      if (nz < 0) nz = 0;
      if (nx < 0) nx = 0;

      normalsTextureView[(x + z * size) * 4] = nx * 255;
      normalsTextureView[(x + z * size) * 4 + 1] = ny * 255;
      normalsTextureView[(x + z * size) * 4 + 2] = nz * 255;
      normalsTextureView[(x + z * size) * 4 + 3] = 255;
    }
  }

  for (var z = 0; z < size; z++) {
    normalsTextureView[(0 + z * size) * 4 + 0] =
      normalsTextureView[(1 + z * size) * 4 + 0];
    normalsTextureView[(0 + z * size) * 4 + 1] =
      normalsTextureView[(1 + z * size) * 4 + 1];
    normalsTextureView[(0 + z * size) * 4 + 2] =
      normalsTextureView[(1 + z * size) * 4 + 2];
    normalsTextureView[(0 + z * size) * 4 + 3] =
      normalsTextureView[(1 + z * size) * 4 + 3];
  }

  for (var x = 0; x < size; x++) {
    normalsTextureView[(x + 0 * size) * 4 + 0] =
      normalsTextureView[(x + 1 * size) * 4 + 0];
    normalsTextureView[(x + 0 * size) * 4 + 1] =
      normalsTextureView[(x + 1 * size) * 4 + 1];
    normalsTextureView[(x + 0 * size) * 4 + 2] =
      normalsTextureView[(x + 1 * size) * 4 + 2];
    normalsTextureView[(x + 0 * size) * 4 + 3] =
      normalsTextureView[(x + 1 * size) * 4 + 3];
  }

  /*
    for (var z = 1; z < size - 1; ++z)
    {
        for (var x = 1; x < size - 1; ++x)
        {
            var totalR = 0.0;
            var totalG = 0.0;
            var totalB = 0.0;
            for (var v = -1; v <= 1; v++)
            {
                for (var u = -1; u <= 1; u++)
                {
                    totalR += normalsTextureView[(x + u + (z + v) * size)*4];
                    totalG += normalsTextureView[(x + u + (z + v) * size)*4+1];
                    totalB += normalsTextureView[(x + u + (z + v) * size)*4+2];
                }
            }

            normalsTextureView[(x + z * size)*4] = totalR / 9.0;
            normalsTextureView[(x + z * size)*4+1] = totalG / 9.0;
            normalsTextureView[(x + z * size)*4+2] = totalB / 9.0;
        }
    }

*/
};

var generateShadows = function (
  shadowsTextureView,
  dataView,
  size,
  sunHeight,
  low,
  high
) {
  var currHeight, shadow;

  for (var z = 0; z < size + 1; z++) {
    var maxHeight = 0;
    for (var x = size; x >= 0; x--) {
      currHeight = ((low + dataView[x + z * (size + 1)]) / high) * 255;

      if (currHeight > maxHeight) {
        shadow = 0;
        maxHeight = currHeight;
      } else {
        shadow = (255 - currHeight) * 0.8;
      }
      shadowsTextureView[
        ((x < size ? x : x - 1) + (z < size ? z : z - 1) * size) * 4
      ] = 255 - shadow;

      maxHeight -= sunHeight;
    }
  }

  for (var z = 2; z < size - 2; ++z) {
    for (var x = 2; x < size - 2; ++x) {
      var total = 0.0;
      for (var v = -2; v <= 2; v++) {
        for (var u = -2; u <= 2; u++) {
          total += shadowsTextureView[(x + u + (z + v) * size) * 4];
        }
      }

      shadowsTextureView[(x + z * size) * 4] = total / 25.0;
    }
  }
};

var addPerlinNoise = function (f, d, dataView, size, noise, offset) {
  for (var z = 0; z < size + 1; z++) {
    for (var x = 0; x < size + 1; x++) {
      dataView[x + z * (size + 1)] +=
        noise.noise(
          (f * (x + offset.x)) / size,
          (f * (z + offset.z)) / size,
          0
        ) * d;
    }
  }
};

var perturb = function (f, d, dataView, size, noise, offset) {
  var u, v;
  var tempBuffer = new ArrayBuffer((size + 1) * (size + 1) * 4);
  var tempView = new Float32Array(tempBuffer);

  for (var z = 0; z < size + 1; z++) {
    for (var x = 0; x < size + 1; x++) {
      u =
        (x +
          noise.noise(
            (f * (x + offset.x)) / size,
            (f * (z + offset.z)) / size,
            0
          ) *
            d) |
        0;
      v =
        (z +
          noise.noise(
            (f * (x + offset.x)) / size,
            (f * (z + offset.z)) / size,
            1
          ) *
            d) |
        0;
      if (u < 0) u = 0;
      if (u > size + 1) u = size;
      if (v < 0) v = 0;
      if (v > size + 1) v = size;

      tempView[x + z * (size + 1)] = dataView[u + v * (size + 1)];
    }
  }

  for (var z = 0; z < size + 1; z++) {
    for (var x = 0; x < size + 1; x++) {
      dataView[x + z * (size + 1)] = tempView[x + z * (size + 1)];
    }
  }
};

var erode = function (iterations, smoothness, dataView, size) {
  var abs = Math.abs,
    dMax = 0,
    dI = 0,
    dH = 0,
    dataViewXZ = 0;
  for (var i = 0; i < iterations; i++) {
    var mu = 0;
    var mv = 0;

    for (var z = 1; z < size; z++) {
      for (var x = 1; x < size; x++) {
        dMax = 0;
        mu = 0;
        mv = 0;
        dataViewXZ = dataView[x + z * (size + 1)];
        for (var v = -1; v <= 1; v++) {
          for (var u = -1; u <= 1; u++) {
            if (abs(u) + abs(v) > 0) {
              dI = dataViewXZ - dataView[x + u + (z + v) * (size + 1)];
              if (dI > dMax) {
                dMax = dI;
                mu = u;
                mv = v;
              }
            }
          }
        }

        if (0 < dMax && dMax <= smoothness / size) {
          dH = dMax / 2;
          dataView[x + z * (size + 1)] -= dH;
          dataView[x + mu + (z + mv) * (size + 1)] += dH;
        }
      }
    }
  }
};

var smoothen = function (dataView, size) {
  for (var z = 1; z < size; ++z) {
    for (var x = 1; x < size; ++x) {
      var total = 0.0;
      for (var v = -1; v <= 1; v++) {
        for (var u = -1; u <= 1; u++) {
          total += dataView[x + u + (z + v) * (size + 1)];
        }
      }

      dataView[x + z * (size + 1)] = total / 9.0;
    }
  }
};
