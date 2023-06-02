import { vec3, vec4, quat, mat4 } from "gl-matrix";

import { Utils } from "./util";
import { vsCubeMap } from "./shaders/vs-cube-map";
import { fsCubeMap } from "./shaders/fs-cube-map";

export class CubeMap {
  gl: WebGL2RenderingContext | null = null;
  textureIndex = 31;

  textureIBLDiffuseIndex = 30;

  images = null;

  vertexArray: WebGLVertexArrayObject | null = null;
  vertexBuffer: WebGLBuffer | null = null;
  program: WebGLProgram | null = null;
  uniformMvpLocation: WebGLUniformLocation | null = null;
  uniformEnvironmentLocation: WebGLUniformLocation | null = null;
  texture: WebGLTexture | null = null;
  textureIBLDiffuse: WebGLTexture | null = null;

  MVP = mat4.create();

  uris = [
    "/textures/environment/px.jpg",
    "/textures/environment/nx.jpg",
    "../textures/environment/py.jpg",
    "../textures/environment/ny.jpg",
    "../textures/environment/pz.jpg",
    "../textures/environment/nz.jpg",

    // ibl diffuse
    "../textures/environment/diffuse/bakedDiffuse_01.jpg",
    "../textures/environment/diffuse/bakedDiffuse_02.jpg",
    "../textures/environment/diffuse/bakedDiffuse_03.jpg",
    "../textures/environment/diffuse/bakedDiffuse_04.jpg",
    "../textures/environment/diffuse/bakedDiffuse_05.jpg",
    "../textures/environment/diffuse/bakedDiffuse_06.jpg",
  ];

  vertexData = new Float32Array([
    0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,

    0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0,

    1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0,
    1.0, 0.0, 0.0,

    1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
  ]);

  constructor() {}

  setGL(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

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

    this.textureIBLDiffuse = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureIBLDiffuse);
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
        images[i + 6]
      );
    }

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  };

  init = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    this.vertexArray = this.gl.createVertexArray();
    this.vertexBuffer = this.gl.createBuffer();

    this.program = Utils.createProgram(this.gl, vsCubeMap, fsCubeMap);
  };

  bind = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;
    // const defaultSampler = gl.createSampler() as WebGLSampler

    // gl.samplerParameteri(defaultSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    // gl.samplerParameteri(defaultSampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.samplerParameteri(defaultSampler, gl.TEXTURE_WRAP_S, gl.REPEAT);
    // gl.samplerParameteri(defaultSampler, gl.TEXTURE_WRAP_T, gl.REPEAT);

    if (!this.program) {
      throw new Error("webgl program is null");
    }

    this.uniformMvpLocation = gl.getUniformLocation(this.program, "u_MVP");
    this.uniformEnvironmentLocation = gl.getUniformLocation(
      this.program,
      "u_environment"
    );

    gl.bindVertexArray(this.vertexArray);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.bindVertexArray(null);
  };

  draw = (V: mat4, P: mat4) => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    const gl = this.gl;
    mat4.copy(this.MVP, V);
    this.MVP[12] = 0.0;
    this.MVP[13] = 0.0;
    this.MVP[14] = 0.0;
    this.MVP[15] = 1.0;
    mat4.mul(this.MVP, P, this.MVP);

    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0 + this.textureIndex);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    gl.uniformMatrix4fv(this.uniformMvpLocation, false, this.MVP);
    gl.uniform1i(this.uniformEnvironmentLocation, this.textureIndex);
    gl.bindVertexArray(this.vertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    gl.bindVertexArray(null);
  };
}
