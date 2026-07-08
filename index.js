const { chromium } = require("playwright");

const sites = [
  {
    name: "Arogga",
    url: "https://www.arogga.com/account",
    steps: [
      { action: "wait", ms: 2000 },
      { action: "click", selector: 'button:has-text("Login")' },
      { action: "wait", ms: 2000 },
      { action: "fill", selector: 'input[placeholder="Enter phone number"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button:has-text("Send")' },
      { action: "wait", ms: 2000 },
    ],
  },
  {
    name: "IqraLive",
    url: "https://iqra-live.com/",
    steps: [
      { action: "fill", selector: "#mobile" },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button:has-text("Sign In")' },
      { action: "wait", ms: 2000 },
    ],
  },
  {
    name: "Apex4u",
    url: "https://apex4u.com/sign-in",
    steps: [
      { action: "wait", ms: 3000 },
      { action: "fill", selector: 'input.form-field' },
      { action: "wait", ms: 500 },
      { action: "click", selector: '[data-testid="proceed-button"]' },
      { action: "wait", ms: 2000 },
    ],
  },
];

const args = process.argv.slice(2);
const phone = args[0] || process.env.PHONE;
const count = parseInt(args[1] || process.env.COUNT || "1");
const delay = parseInt(args[2] || process.env.DELAY || "3");

if (!phone) {
  console.error("Usage: sms-web <phone> [count] [delay]");
  console.error("   or:  PHONE=xxx COUNT=2 DELAY=3 sms-web");
  process.exit(1);
}

async function runSite(browser, site, phone) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: "networkidle", timeout: 30000 });

    for (const step of site.steps) {
      if (step.action === "fill") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        await page.fill(step.selector, phone);
      } else if (step.action === "click") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        await page.click(step.selector);
      } else if (step.action === "wait") {
        await page.waitForTimeout(step.ms);
      }
    }

    return { name: site.name, status: "DONE" };
  } catch (err) {
    return { name: site.name, status: "FAILED", error: err.message.split("\n")[0] };
  } finally {
    await ctx.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false });

  for (let i = 0; i < count; i++) {
    console.log(`[${i + 1}/${count}]`);
    const results = await Promise.allSettled(
      sites.map((site) => runSite(browser, site, phone))
    );
    for (const r of results) {
      const v = r.value || {};
      console.log(`  [${v.name}] ${v.status}${v.error ? " - " + v.error : ""}`);
    }
    if (i < count - 1 && delay > 0) {
      console.log(`  Waiting ${delay}s ...`);
      await new Promise((r) => setTimeout(r, delay * 1000));
    }
  }

  await browser.close();
  console.log("Done");
})().catch(console.error);
