import { vec3, vec4, quat, mat4 } from "gl-matrix";

import { Utils } from "./utils/util";
import { vsCube } from "./shaders/cube/vs-cube";
import { fsCube } from "./shaders/cube/fs-cube";

export class Cube {
  gl: WebGL2RenderingContext | null = null;

  uniformMvpLocation: WebGLUniformLocation | null = null;

  vertexArray: WebGLVertexArrayObject | null = null;
  vertexBuffer: WebGLBuffer | null = null;
  indexBuffer: WebGLBuffer | null = null;
  program: WebGLProgram | null = null;

  MVP = mat4.create();

  vertexData = new Float32Array([
    1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, -1.0,
    1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, 1.0, 0.0, 1.0, -1.0, -1.0, 0.0,
    1.0, 0.0, 1.0, 1.0, -1.0, 0.0, 1.0, 1.0, -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
    -1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
  ]);

  indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 1, 1, 6, 7, 1, 7, 2, 7,
    4, 3, 7, 3, 2, 4, 7, 6, 4, 6, 5,
  ]);

  constructor() {}

  setGL(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  init = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    this.vertexArray = this.gl.createVertexArray();
    this.vertexBuffer = this.gl.createBuffer();
    this.indexBuffer = this.gl.createBuffer();

    this.program = Utils.createProgram(this.gl, vsCube, fsCube);
  };

  bind = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;

    if (!this.program) {
      throw new Error("webgl program is null");
    }

    this.uniformMvpLocation = gl.getUniformLocation(this.program, "u_MVP");

    gl.bindVertexArray(this.vertexArray);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, "position");
    gl.vertexAttribPointer(
      positionLocation,
      3,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      0
    );
    gl.enableVertexAttribArray(positionLocation);

    const colorLocation = gl.getAttribLocation(this.program, "color");
    gl.vertexAttribPointer(
      colorLocation,
      3,
      gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 6,
      Float32Array.BYTES_PER_ELEMENT * 3
    );
    gl.enableVertexAttribArray(colorLocation);

    gl.bindVertexArray(null);
  };

  draw = (V: mat4, P: mat4) => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;
    mat4.copy(this.MVP, V);
    mat4.mul(this.MVP, P, this.MVP);

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniformMvpLocation, false, this.MVP);
    gl.bindVertexArray(this.vertexArray);
    gl.drawElements(
      gl.TRIANGLES,
      this.indices.length,
      this.gl.UNSIGNED_BYTE,
      0
    );
    gl.bindVertexArray(null);
  };
}
