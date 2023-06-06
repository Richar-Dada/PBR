import { updateMaterial } from './materials/sphereMat'
import { procRenderer, hdrRenderTarget, procCamera, hdrScene } from './process'
import { mainScene, mainCamera, renderer } from './base'
import { Vector3 } from 'three'
import { hdrConverterEmmisive } from './hdrConverterEmissive';

import {SphereGeometry,Mesh,BoxGeometry} from 'three';
import {sphereMat} from './materials/sphereMat'

const renderCatch = {
    blobs: [],
    names: [],
    packed: [],
    zipping: false,
    progNow: 0,
    progTotal: 0,
    canvas: document.createElement('canvas'),
}

const calcAngle = () => {
    const direction = new Vector3
    mainCamera.getWorldDirection(direction);
    const angle = direction.multiply(new Vector3(1, 0, 1)).angleTo(new Vector3(0, 0, -1));
    if (direction.x < 0) {
      return angle;
    } else {
      return -angle;
    }
}

const storeBlobsSep = (name, callback = href => { }, progress = prog => { }) => {
  return new Promise((resolve) => {
    procRenderer.domElement.toBlob(blob => {
        renderCatch.blobs.push(blob);
        renderCatch.names.push(`${name}.png`)
        renderCatch.progNow++;
        const { progNow, progTotal } = renderCatch;
        progress({ progNow, progTotal })
        resolve()
    })
  })  
  

}
export const procRenderSep = (size = 64, callback = href => { }, progress = prog => { }) => {
  return new Promise(async (resolve) => {
    
    renderCatch.blobs = [];
    renderCatch.names = [];
    renderCatch.progNow = 0;
    renderCatch.progTotal = 12;
    procRenderer.setSize(size, size);
    procCamera.rotation.set(0, 0, 0);

    const angle = calcAngle();
    procCamera.rotateY(angle);

    //+x
    updateMaterial();
    procCamera.rotateY(-Math.PI / 2);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('px', callback, progress);
    //-x
    updateMaterial();
    procCamera.rotateY(Math.PI);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('nx', callback, progress);
    //+y
    updateMaterial();
    procCamera.rotateY(-Math.PI / 2);
    procCamera.rotateX(Math.PI / 2);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('py', callback, progress);
    //-y
    updateMaterial();
    procCamera.rotateX(-Math.PI);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('ny', callback, progress);
    //+z
    updateMaterial();
    procCamera.rotateX(Math.PI / 2);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('pz', callback, progress);
    //-z
    updateMaterial();
    procCamera.rotateY(Math.PI);
    procRenderer.render(mainScene, procCamera);
    await storeBlobsSep('nz', callback, progress);

    resolve(renderCatch)
  })

}

export const preview = () => {
  const geo = new SphereGeometry(2000,100,100);
  const sphereMesh = new Mesh(geo,sphereMat);
  sphereMesh.scale.set(-1,-1,-1);
  sphereMesh.rotateZ(Math.PI);
  sphereMesh.rotateY(-Math.PI/2);
  sphereMesh.position.set(0,0,0);
  mainScene.add(sphereMesh);
}