const express = require('express');
const { scrapeArticle } = require('./src/scraper');
const app = express();
const port = 3000;

app.use(express.json());

// 1. This serves the UI (The Input Field)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Article Cleaner PoC</title>
            <style>
                body { font-family: -apple-system, sans-serif; background: #f0f2f5; display: flex; flex-direction: column; align-items: center; padding: 50px; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 100%; max-width: 600px; text-align: center; }
                input { width: 80%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 20px; outline: none; }
                input:focus { border-color: #007bff; }
                button { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; }
                button:disabled { background: #ccc; }
                #status { margin-top: 20px; color: #666; font-style: italic; }
                #article-view { margin-top: 40px; background: white; padding: 40px; border-radius: 12px; width: 100%; max-width: 800px; display: none; line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>🗞️ Article Cleaner Showcase</h2>
                <p>Paste a locked NYT, WSJ, or Telegraph link below:</p>
                <input type="text" id="urlInput" placeholder="https://www.nytimes.com/...">
                <br>
                <button id="btn" onclick="processArticle()">Clean & Bypass</button>
                <div id="status"></div>
            </div>

            <div id="article-view"></div>

            <script>
                async function processArticle() {
                    const url = document.getElementById('urlInput').value;
                    const status = document.getElementById('status');
                    const btn = document.getElementById('btn');
                    const view = document.getElementById('article-view');

                    if (!url) return alert('Please paste a URL first!');

                    // UI Updates
                    status.innerText = '📡 Initializing Stealth Browser... (ETA 5-10s)';
                    btn.disabled = true;
                    view.style.display = 'none';

                    try {
                        const response = await fetch('/api/clean', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url })
                        });
                        
                        const data = await response.json();

                        if (data.content) {
                            view.style.display = 'block';
                            view.innerHTML = '<h1>' + data.title + '</h1><hr>' + data.content;
                            status.innerText = '✅ Success! Paywall Bypassed.';
                        } else {
                            status.innerText = '❌ Failed to extract content.';
                        }
                    } catch (err) {
                        status.innerText = '❌ Error connecting to server.';
                    } finally {
                        btn.disabled = false;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// 2. This is the API route that talks to your scraper
app.post('/api/clean', async (req, res) => {
    const { url } = req.body;
    console.log(`🚀 Showcase Request for: ${url}`);
    
    const article = await scrapeArticle(url);
    
    if (article) {
        res.json(article);
    } else {
        res.status(500).json({ error: 'Bypass failed' });
    }
});

app.listen(port, () => {
    console.log(`
    ✅ Showcase Server Ready!
    🔗 URL: http://localhost:${port}
    ---------------------------------
    `);
});