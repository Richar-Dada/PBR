export class Utils {
  static createShader(
    gl: WebGL2RenderingContext,
    source: string,
    type: number
  ) {
    const shader = gl.createShader(type);

    if (!shader) {
      throw new Error("webgl createShader error");
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  static createProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    var program = gl.createProgram();

    if (!program) {
      throw new Error("webgl createProgram error");
    }

    var vshader = this.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fshader = this.createShader(
      gl,
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    gl.attachShader(program, vshader);
    gl.deleteShader(vshader);
    gl.attachShader(program, fshader);
    gl.deleteShader(fshader);
    gl.linkProgram(program);

    var log = gl.getProgramInfoLog(program);
    if (log) {
      console.log(log);
    }

    log = gl.getShaderInfoLog(vshader);
    if (log) {
      console.log(log);
    }

    log = gl.getShaderInfoLog(fshader);
    if (log) {
      console.log(log);
    }

    return program;
  }

  static loadImage(
    url: string,
    onload: (this: GlobalEventHandlers, ev: Event) => void
  ) {
    var img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    // img.onload = function() {
    //     onload(img);
    // };
    img.onload = onload;
    return img;
  }

  static loadImages(urls: string[]): Promise<HTMLImageElement[]> {
    return new Promise((resolve, reject) => {
      var imgs: HTMLImageElement[] = [];
      var imgsToLoad = urls.length;

      function onImgLoad() {
        if (--imgsToLoad <= 0) {
          resolve(imgs);
        }
      }

      for (var i = 0; i < imgsToLoad; ++i) {
        imgs.push(this.loadImage(urls[i], onImgLoad));
      }
    });
  }
}
