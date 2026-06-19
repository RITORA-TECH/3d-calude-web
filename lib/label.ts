import * as THREE from "three";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws a service "chip" to a canvas and returns it as a texture. */
export function makeLabelTexture(title: string, sub: string, accent: string) {
  const w = 640;
  const h = 240;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;

  // panel
  ctx.fillStyle = "rgba(10,15,30,0.94)";
  roundRect(ctx, 6, 6, w - 12, h - 12, 34);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = accent;
  ctx.stroke();

  // accent bar
  ctx.fillStyle = accent;
  roundRect(ctx, 40, 52, 10, h - 104, 6);
  ctx.fill();

  // title
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 56px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(title, 76, 60);

  // subtitle / stack
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "400 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(sub, 78, 138);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
