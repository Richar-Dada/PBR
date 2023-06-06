import { DataTexture } from 'three';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { updateSphereMap } from '../materials/sphereMat'

export const HdrTexture = new DataTexture();

export const loadHdr = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new RGBELoader()

    loader.load(
      url,
      tex => {
        tex.encoding = THREE.RGBEEncoding;
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.flipY = true;
    
        HdrTexture.copy(tex);
        HdrTexture.needsUpdate = true;
    
        updateSphereMap(tex);

        resolve()
      }
    )
  })
}

