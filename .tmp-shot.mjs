import { chromium } from 'playwright';

const browser = await chromium.launch();
const errors = [];
const outDir =
	'C:/Users/hjjou/AppData/Local/Temp/claude/c--Users-hjjou-Desktop-Dev-matr-coming-soon/596289f4-2ef4-48c6-97c2-def4ddc47c12/scratchpad';

async function shoot(viewport, name, actions) {
	const page = await browser.newPage({ viewport });
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(`[${name}] ${msg.text()}`);
	});
	page.on('pageerror', (err) => errors.push(`[${name}] pageerror: ${err.message}`));
	await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
	if (actions) await actions(page);
	await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
	await page.close();
}

await shoot({ width: 1440, height: 900 }, 'v2-desktop-full');
await shoot({ width: 375, height: 812 }, 'v2-mobile-full');

const page2 = await browser.newPage({ viewport: { width: 375, height: 812 } });
await page2.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page2.click('button[aria-label="Open menu"]');
await page2.waitForTimeout(250);
await page2.screenshot({ path: `${outDir}/v2-mobile-menu.png` });
await page2.close();

const page3 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page3.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page3.screenshot({ path: `${outDir}/v2-header-on-hero.png` });
await page3.hover('h1');
await page3.mouse.move(760, 800);
await page3.mouse.wheel(0, 900);
await page3.waitForTimeout(400);
await page3.screenshot({ path: `${outDir}/v2-header-on-light.png` });
await page3.close();

await browser.close();

if (errors.length) {
	console.log('CONSOLE ERRORS:');
	console.log(errors.join('\n'));
} else {
	console.log('No console errors.');
}
