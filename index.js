const { scrapeArticle } = require('./src/scraper');
const fs = require('fs');
const path = require('path');

async function runTest(targetUrl, outputName) {
    console.log(`🚀 Starting PoC for: ${outputName}`);
    
    const article = await scrapeArticle(targetUrl);

    if (article) {
        // Create a basic HTML wrapper to show Jay the final "Clean" look
        const styledHtml = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${article.title}</title>
                    <style>
                        body { font-family: -apple-system, sans-serif; line-height: 1.6; max-width: 700px; margin: 50px auto; padding: 20px; color: #222; background: #f9f9f9; }
                        h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        .metadata { color: #666; font-style: italic; margin-bottom: 30px; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <h1>${article.title}</h1>
                    <div class="metadata">Source: ${targetUrl}</div>
                    ${article.content}
                </body>
            </html>
        `;

        // Ensure output directory exists
        const outputDir = path.join(__dirname, 'outputs');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        // Save the file
        const filePath = path.join(outputDir, `${outputName}.html`);
        fs.writeFileSync(filePath, styledHtml);

        console.log(`✅ Success! Proof saved to: /outputs/${outputName}.html`);
        console.log(`📝 Content Length: ${article.textContent.length} characters.`);
    } else {
        console.log(`❌ Failed to generate proof for ${outputName}`);
    }
}

// --- RUN YOUR TESTS HERE ---
// Pick a real article from WSJ, NYT, or Telegraph
runTest('https://www.nytimes.com/2026/03/26/business/inflation-prices-energy-iran-oecd.html', 'wsj-proof');
// runTest('https://www.nytimes.com/YOUR_NYT_URL_HERE', 'nyt-proof');