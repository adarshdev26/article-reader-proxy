const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

// Apply stealth to bypass bot detection
puppeteer.use(StealthPlugin());

async function scrapeArticle(url) {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    try {
        const page = await browser.newPage();

        // THE BYPASS: Set identity to Googlebot
        // This is the "Identity Spoofing" we talked about.
        await page.setUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
        
        // Add extra headers to look like a legitimate crawler
        await page.setExtraHTTPHeaders({
            'Referer': 'https://www.google.com/'
        });

        console.log(`📡 Accessing: ${url}...`);
        
        // Wait until the network is idle (important for heavy sites like NYT/WSJ)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Extract the full HTML source
        const html = await page.content();
        
        // Use JSDOM to parse the HTML string
        const dom = new JSDOM(html, { url });
        
        // Use Mozilla's Readability to "Scrub" the ads and paywall overlays
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        await browser.close();

        if (!article || !article.textContent || article.textContent.length < 200) {
            throw new Error("Content extraction failed. The paywall might still be active.");
        }

        return article;
    } catch (error) {
        await browser.close();
        console.error(`❌ Scraper Error: ${error.message}`);
        return null;
    }
}

module.exports = { scrapeArticle };