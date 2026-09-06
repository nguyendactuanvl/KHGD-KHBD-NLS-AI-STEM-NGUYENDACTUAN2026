import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE_ERROR:', error.message);
    console.log(error.stack);
  });
  
  await page.goto('http://localhost:3000');
  
  // wait a bit
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
