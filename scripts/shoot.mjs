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
    "--window-size=1440,900",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE: " + m.text());
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000)); // let GLBs + draco load

const shots = [
  [0.02, "01-intro"],
  [0.14, "02-walk"],
  [0.30, "03-seated-drive"],
  [0.46, "04-crash"],
  [0.51, "05-fly"],
  [0.60, "06-services"],
  [0.72, "07-fix"],
  [0.88, "08-driveaway"],
  [0.96, "09-projects"],
];

for (const [frac, name] of shots) {
  await page.evaluate((f) => {
    const h = document.body.scrollHeight - window.innerHeight;
    window.scrollTo(0, h * f);
  }, frac);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `/tmp/n-${name}.png` });
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
