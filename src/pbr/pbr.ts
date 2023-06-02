import { vec3, vec4, quat, mat4 } from "gl-matrix";

import { CubeMap } from "./cubeMap";
import { Cube } from "./cube";
import { Skybox } from "./skybox";

export class PBR {
  cubeMap = new CubeMap();

  cube = new Cube();

  skybox = new Skybox();

  modelView = mat4.create();
  cameraMatrix = mat4.create();
  perspective = mat4.create();

  gl: WebGL2RenderingContext | null = null;
  canvas: HTMLCanvasElement | null = null;

  async init(domId: string) {
    const canvas = document.getElementById(domId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error("fail to get canvas");
    }

    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2");
    if (!this.gl) {
      throw new Error("fail to get webgl");
    }

    mat4.perspective(
      this.perspective,
      0.6,
      canvas.width / canvas.height,
      0.01,
      100
    );

    var cameraPosition = vec3.fromValues(3, 3, 7);
    var up = vec3.fromValues(0, 1, 0);
    var target = vec3.fromValues(0, 0, 0);

    mat4.lookAt(this.cameraMatrix, cameraPosition, target, up);

    mat4.mul(this.modelView, this.cameraMatrix, this.modelView);

    this.cube.setGL(this.gl);
    this.cube.init();
    this.cube.bind();

    this.skybox.setGL(this.gl);
    await this.skybox.loadAll();
    this.skybox.init();
    this.skybox.bind();

    // this.cubeMap.setGL(this.gl);
    // await this.cubeMap.loadAll();
    // this.cubeMap.init();
    // this.cubeMap.bind();
  }

  render = () => {
    if (!this.gl) {
      throw new Error("webgl is null");
    }

    if (!this.canvas) {
      throw new Error("canvas is null");
    }

    const gl = this.gl;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    console.log("width", this.canvas.width);
    this.gl.scissor(0, 0, this.canvas.width, this.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);

    // mat4.identity(this.modelView)

    // this.cubeMap.draw(this.modelView, this.perspective);

    // this.cube.draw(this.modelView, this.perspective);
    this.skybox.draw(this.modelView, this.perspective);

    requestAnimationFrame(this.render);
  };
}
