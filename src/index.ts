import "./index.css";
import { PBR } from "./pbr/pbr";

const pbr = new PBR();
pbr.init("canvas-dom").then(() => {
  pbr.render();
});
