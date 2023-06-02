import { vec3, vec4, quat, mat4 } from "gl-matrix";

import { Utils } from "./util";
import { vsSkybox } from "./shaders/skybox/vs-skybox";
import { fsSkybox } from "./shaders/skybox/fs-skybox";

export class Skybox {
  gl: WebGL2RenderingContext | null = null;

  uniformMvpLocation: WebGLUniformLocation | null = null;

  vertexArray: WebGLVertexArrayObject | null = null;
  vertexBuffer: WebGLBuffer | null = null;
  indexBuffer: WebGLBuffer | null = null;
  program: WebGLProgram | null = null;

  texture: WebGLTexture | null = null;

  MVP = mat4.create();

  uris = [
    "/textures/environment/px.jpg",
    "/textures/environment/nx.jpg",
    "../textures/environment/py.jpg",
    "../textures/environment/ny.jpg",
    "../textures/environment/pz.jpg",
    "../textures/environment/nz.jpg",
  ];

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

  createMesh(gl, name, width, height, depth, x, y, z) {
    let w = width * 0.5,
      h = height * 0.5,
      d = depth * 0.5;
    let x0 = x - w,
      x1 = x + w,
      y0 = y - h,
      y1 = y + h,
      z0 = z - d,
      z1 = z + d;
    var aVert = [
      x0,
      y1,
      z1,
      0, //0 Front
      x0,
      y0,
      z1,
      0, //1
      x1,
      y0,
      z1,
      0, //2
      x1,
      y1,
      z1,
      1, //3

      x1,
      y1,
      z0,
      1, //4 Back
      x1,
      y0,
      z0,
      1, //5
      x0,
      y0,
      z0,
      1, //6
      x0,
      y1,
      z0,
      0, //7

      x0,
      y1,
      z0,
      2, //7 Left
      x0,
      y0,
      z0,
      2, //6
      x0,
      y0,
      z1,
      2, //1
      x0,
      y1,
      z1,
      1, //0

      x0,
      y0,
      z1,
      3, //1 Bottom
      x0,
      y0,
      z0,
      3, //6
      x1,
      y0,
      z0,
      3, //5
      x1,
      y0,
      z1,
      2, //2

      x1,
      y1,
      z1,
      4, //3 Right
      x1,
      y0,
      z1,
      4, //2
      x1,
      y0,
      z0,
      4, //5
      x1,
      y1,
      z0,
      3, //4

      x0,
      y1,
      z0,
      5, //7 Top
      x0,
      y1,
      z1,
      5, //0
      x1,
      y1,
      z1,
      5, //3
      x1,
      y1,
      z0,
      1, //4
    ];
    //Build the index of each quad [0,1,2, 2,3,0]
    var aIndex = [];
    for (var i = 0; i < aVert.length / 4; i += 2)
      aIndex.push(i, i + 1, Math.floor(i / 4) * 4 + ((i + 2) % 4));

    //Build UV data for each vertex
    var aUV = [];
    for (var i = 0; i < 6; i++) aUV.push(0, 0, 0, 1, 1, 1, 1, 0);

    //Build Normal data for each vertex
    var aNorm = [
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1, //Front
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1, //Back
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0, //Left
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0,
      0,
      -1,
      0, //Bottom
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0, //Right
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      1,
      0, //Top
    ];

    var mesh = gl.fCreateMeshVAO(name, aIndex, aVert, aNorm, aUV, 4);
    mesh.noCulling = true;
    return mesh;
  }

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

    const images = imgs;
    const gl = this.gl;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_MODE, gl.NONE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);

    for (var i = 0; i < 6; i++) {
      gl.texImage2D(
        gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        images[i]
      );
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
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
