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

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Draws a sleek service "card" to a canvas and returns it as a texture. */
export function makeLabelTexture(
  title: string,
  sub: string,
  accent: string,
  icon: string
) {
  const w = 760;
  const h = 400;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const pad = 16;

  // ---- glass panel with a soft vertical gradient ----
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(20,26,44,0.96)");
  grad.addColorStop(1, "rgba(8,11,22,0.96)");
  ctx.fillStyle = grad;
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 44);
  ctx.fill();

  // accent glow wash in the top-left corner
  const glow = ctx.createRadialGradient(150, 120, 10, 150, 120, 360);
  glow.addColorStop(0, hexToRgba(accent, 0.32));
  glow.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = glow;
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 44);
  ctx.fill();

  // hairline accent border
  ctx.lineWidth = 2;
  ctx.strokeStyle = hexToRgba(accent, 0.55);
  roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 44);
  ctx.stroke();

  // ---- icon badge ----
  const bx = 56;
  const by = 60;
  const bs = 120;
  const bg = ctx.createLinearGradient(bx, by, bx + bs, by + bs);
  bg.addColorStop(0, accent);
  bg.addColorStop(1, hexToRgba(accent, 0.65));
  ctx.fillStyle = bg;
  roundRect(ctx, bx, by, bs, bs, 30);
  ctx.fill();
  ctx.font = "72px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, bx + bs / 2, by + bs / 2 + 4);

  // ---- title ----
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 60px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(title, bx + bs + 34, by + 56);

  // subtitle / car-part metaphor
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = "400 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText(sub, bx + bs + 34, by + 104);

  // ---- divider + footer tag ----
  const dy = 250;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, dy);
  ctx.lineTo(w - 56, dy);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(66, dy + 44, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 26px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("RITORA TECHNOLOGIES", 88, dy + 53);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
