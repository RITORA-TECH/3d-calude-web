import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--no-sandbox",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
    "--use-gl=angle",
    "--use-angle=swiftshader",
  ],
});

const page = await browser.newPage();

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE: " + m.text());
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

// timeline frames
const shots = [
  [0.02, "01-intro"],
  [0.12, "02-walk"],
  [0.19, "03-climb-in"],
  [0.28, "04-drive"],
  [0.355, "05-crash"],
  [0.43, "06-parts"],
  [0.5, "07-devs"],
  [0.6, "08-reassemble"],
  [0.7, "09-repaired"],
  [0.92, "10-host"],
  [0.97, "11-connect"],
];

// viewports to verify responsiveness
const viewports = [
  { name: "desktop", width: 1680, height: 1050 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
];

for (const vp of viewports) {
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000)); // let GLBs + draco load

  // desktop gets the full timeline; others just a few key frames
  const frames = vp.name === "desktop" ? shots : [shots[0], shots[2], shots[5], shots[9]];

  for (const [frac, name] of frames) {
    await page.evaluate((f) => {
      const h = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, h * f);
    }, frac);
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: `/tmp/n-${vp.name}-${name}.png` });
  }
}

const info = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const gl = c && (c.getContext("webgl2") || c.getContext("webgl"));
  return { canvas: !!c, gl: !!gl };
});

console.log("CANVAS_INFO:" + JSON.stringify(info));
console.log("ERROR_COUNT:" + errors.length);
[...new Set(errors)].slice(0, 25).forEach((e) => console.log(e));

await browser.close();
