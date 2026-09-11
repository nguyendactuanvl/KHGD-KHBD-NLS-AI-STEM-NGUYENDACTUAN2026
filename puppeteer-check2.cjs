const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERROR:', error.message));
  await page.goto('https://khgdkhbd2026.vercel.app/', { waitUntil: 'networkidle0' });
  const root = await page.$eval('#root', el => el.innerHTML);
  console.log('Root length:', root.length);
  await browser.close();
})();
