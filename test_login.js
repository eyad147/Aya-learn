const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle' });
  console.log('Page title:', await page.title());
  
  const form = await page.$('form[id="loginForm"]');
  console.log('Login form found:', !!form);
  
  await page.fill('input[id="loginEmail"]', 'omar@student.com');
  await page.fill('input[id="loginPassword"]', 'password123');
  
  const [response] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/auth/login'), { timeout: 5000 }).catch(() => null),
    page.click('button[type="submit"]')
  ]);
  
  if (response) {
    console.log('Response status:', response.status());
    try { const body = await response.json(); console.log('Response body:', JSON.stringify(body)); } catch(e) { console.log('Response text:', await response.text()); }
  } else {
    console.log('No API response received');
    console.log('Current URL:', page.url());
  }
  
  const token = await page.evaluate(() => localStorage.getItem('aya_token'));
  console.log('Token in localStorage:', token ? token.substring(0, 20) + '...' : 'null');
  
  await browser.close();
})().catch(e => { console.error('SCRIPT ERROR:', e.message); process.exit(1); });
