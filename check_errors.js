import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const urls = [
    'http://localhost:3000/projects',
    'http://localhost:3000/about',
    'http://localhost:3000/contact',
    'http://localhost:3000/admin'
  ];

  for (const url of urls) {
    console.log(`\nVisiting ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle0' });
      const text = await page.evaluate(() => document.body.innerText.substring(0, 200));
      console.log('Content:', text.replace(/\n/g, ' '));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
  
  await browser.close();
})();
