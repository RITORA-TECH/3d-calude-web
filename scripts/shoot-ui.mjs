import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
});
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push("CONSOLE: " + m.text()); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6000));

async function scrollTo(f) {
  await page.evaluate((f) => {
    const h = document.body.scrollHeight - window.innerHeight;
    window.scrollTo(0, h * f);
  }, f);
  await new Promise((r) => setTimeout(r, 1400));
}

// services + tech badges section
await scrollTo(0.62);
await page.screenshot({ path: "/tmp/ui-services.png" });
// contact
await scrollTo(0.99);
await page.screenshot({ path: "/tmp/ui-contact.png" });

// open the AI agent and walk the flow
await page.evaluate(() => window.dispatchEvent(new CustomEvent("ritora:chat")));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: "/tmp/ui-chat-1.png" });

async function type(text) {
  await page.type("#agent-input", text);
  await page.keyboard.press("Enter");
  await new Promise((r) => setTimeout(r, 800));
}
await type("A telemedicine app");
await page.screenshot({ path: "/tmp/ui-chat-2.png" });
// timeline quick reply
const chip = await page.$$("button");
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("1–3 months"));
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 900));
await type("test@ritora.com");
await page.screenshot({ path: "/tmp/ui-chat-3.png" });

// mobile chat
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => window.dispatchEvent(new CustomEvent("ritora:chat")));
await new Promise((r) => setTimeout(r, 600));
await page.screenshot({ path: "/tmp/ui-chat-mobile.png" });

console.log("ERROR_COUNT:" + errors.length);
[...new Set(errors)].slice(0, 25).forEach((e) => console.log(e));
await browser.close();
