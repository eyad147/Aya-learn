const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  // -- LOGIN TEST --
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  if (errors.length) {
    console.log('ERRORS on login page load:', JSON.stringify(errors));
  } else {
    console.log('No console errors on login page load');
  }

  const loginEmail = await page.$('#loginEmail');
  const loginPass = await page.$('#loginPassword');
  const loginBtn = await page.$('#loginForm button[type=submit]');
  console.log('loginEmail:', loginEmail ? 'OK' : 'MISSING');
  console.log('loginPass:', loginPass ? 'OK' : 'MISSING');
  console.log('loginBtn:', loginBtn ? 'OK' : 'MISSING');

  if (loginEmail && loginPass && loginBtn) {
    await loginEmail.fill('admin@ayalearn.com');
    await loginPass.fill('password123');
    await loginBtn.click();
    await page.waitForTimeout(3000);
    console.log('After login click URL:', page.url());
    if (page.url().includes('dashboard')) {
      console.log('LOGIN: PASSED');
    } else {
      console.log('LOGIN: FAILED (redirected to ' + page.url() + ')');
      let body = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('Body:', body);
    }
  }

  // -- REPORT ERRORS --
  if (errors.length) {
    console.log('\nAll errors captured:');
    errors.forEach(e => console.log('  -', e));
  }

  await browser.close();
})();
