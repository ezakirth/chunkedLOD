/**
 * @fileoverview frustum.js - frustum functions
 * @author Xavier de Boysson
 */

"use strict";
class Plane {
  constructor(a, b, c, d) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }
  normalize() {
    var d = 1 / Math.sqrt(this.a * this.a + this.b * this.b + this.c * this.c);
    this.a = this.a * d;
    this.b = this.b * d;
    this.c = this.c * d;
    this.d = this.d * d;
  }
}

class Sphere {
  constructor(x, y, z, r) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.r = r;
  }
}

class Vertex {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// point distance from plane: distance = a*x + b*y + c*z + d
export function sphereInFrustum(f, s) {
  for (var p = 0; p < 6; p++) {
    if (f[p].a * s.x + f[p].b * s.y + f[p].c * s.z + f[p].d <= -s.r)
      return false;
  }
  return true;
}

// Extract view frustum planes
export function extractFrustum() {
  var mat = mvpMatrix;
  var a = 0,
    b = 0,
    c = 0,
    d = 0;
  var frustum = [null, null, null, null, null, null];
  var mat1 = mat[0];
  var mat2 = mat[1];
  var mat3 = mat[2];
  var mat4 = mat[3];
  var mat5 = mat[4];
  var mat6 = mat[5];
  var mat7 = mat[6];
  var mat8 = mat[7];
  var mat9 = mat[8];
  var mat10 = mat[9];
  var mat11 = mat[10];
  var mat12 = mat[11];
  var mat13 = mat[12];
  var mat14 = mat[13];
  var mat15 = mat[14];
  var mat16 = mat[15];

  // Right plane
  a = mat4 - mat1;
  b = mat8 - mat5;
  c = mat12 - mat9;
  d = mat16 - mat13;
  frustum[0] = new Plane(a, b, c, d);
  frustum[0].normalize();

  // Left plane
  a = mat4 + mat1;
  b = mat8 + mat5;
  c = mat12 + mat9;
  d = mat16 + mat13;
  frustum[1] = new Plane(a, b, c, d);
  frustum[1].normalize();

  // Bottom plane
  a = mat4 + mat2;
  b = mat8 + mat6;
  c = mat12 + mat10;
  d = mat16 + mat14;
  frustum[2] = new Plane(a, b, c, d);
  frustum[2].normalize();

  // Top plane
  a = mat4 - mat2;
  b = mat8 - mat6;
  c = mat12 - mat10;
  d = mat16 - mat14;
  frustum[3] = new Plane(a, b, c, d);
  frustum[3].normalize();

  // Far plane
  a = mat4 - mat3;
  b = mat8 - mat7;
  c = mat12 - mat11;
  d = mat16 - mat15;
  frustum[4] = new Plane(a, b, c, d);
  frustum[4].normalize();

  // Near plane
  a = mat4 + mat3;
  b = mat8 + mat7;
  c = mat12 + mat11;
  d = mat16 + mat15;
  frustum[5] = new Plane(a, b, c, d);
  frustum[5].normalize();

  return frustum;
}
