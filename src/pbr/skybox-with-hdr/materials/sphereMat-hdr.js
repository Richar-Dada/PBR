import { ShaderMaterial, DoubleSide } from 'three';
import { HdrTexture } from '../textures/iniHdrTexture';
import { vertexShader } from '../../shaders/skybox-hdr/vertex';
import { fragmentShader } from '../../shaders/skybox-hdr/fragment';

export const sphereMatHdr = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    tDiffuse: { value: HdrTexture }
  },
  transparent: true,
  side: DoubleSide
});

