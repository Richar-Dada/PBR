import { vec3, vec4, quat, mat4 } from "gl-matrix";

import { Utils } from "./utils/util";
import { vsSkybox } from "./shaders/skybox/vs-skybox";
import { fsSkybox } from "./shaders/skybox/fs-skybox";

export class Skybox {
  gl: WebGL2RenderingContext | null = null;

  viewDirectionProjectionInverseLocation: WebGLUniformLocation | null = null;

  vertexArray: WebGLVertexArrayObject | null = null;
  vertexBuffer: WebGLBuffer | null = null;
  indexBuffer: WebGLBuffer | null = null;
  program: WebGLProgram | null = null;

  skyboxLocation: WebGLUniformLocation | null = null;
  positionLocation: number = 0;

  MVP = mat4.create();

  uris = [
    "/textures/environment/cao/px.png",
    "/textures/environment/cao/nx.png",
    "../textures/environment/cao/py.png",
    "../textures/environment/cao/ny.png",
    "../textures/environment/cao/pz.png",
    "../textures/environment/cao/nz.png",
  ];

  positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

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

    this.program = Utils.createProgram(this.gl, vsSkybox, fsSkybox);
  };

  loadAll = async () => {
    const images = await Utils.loadImages(this.uris);
    this.onLoadAll(images);
  };

  onLoadAll = (imgs: HTMLImageElement[]) => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    console.log("onLoadAll");

    const images = imgs;
    const gl = this.gl;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );

    const targetArr = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    for (var i = 0; i < 6; i++) {
      gl.texImage2D(
        targetArr[i],
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        images[i]
      );
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  };

  bind = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;

    if (!this.program) {
      throw new Error("webgl program is null");
    }

    this.viewDirectionProjectionInverseLocation = gl.getUniformLocation(
      this.program,
      "u_viewDirectionProjectionInverse"
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    this.positionLocation = gl.getAttribLocation(this.program, "a_position");

    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.positionLocation);

    this.skyboxLocation = gl.getUniformLocation(this.program, "u_skybox");
  };

  draw = (C: mat4, P: mat4) => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;
    const viewMatrix = mat4.create();
    // know 逆矩阵
    mat4.invert(viewMatrix, C);
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    const viewDirectionProjectionMatrix = mat4.create();
    mat4.mul(viewDirectionProjectionMatrix, P, viewMatrix);
    const viewDirectionProjectionInverseMatrix = mat4.create();
    mat4.invert(
      viewDirectionProjectionInverseMatrix,
      viewDirectionProjectionMatrix
    );

    gl.useProgram(this.program);

    gl.uniformMatrix4fv(
      this.viewDirectionProjectionInverseLocation,
      false,
      viewDirectionProjectionInverseMatrix
    );

    gl.uniform1i(this.skyboxLocation, 0);

    gl.depthFunc(gl.EQUAL);

    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
  };
}
