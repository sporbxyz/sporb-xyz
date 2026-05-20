const http = require('http');
const fs = require('fs');
const PRICE_FILE = '/www/wwwroot/sporb.xyz/price.json';
const PORT = 3004;

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const SPORB_MINT = 'FMRdhytRT49jyfrJSWsdEcvLHJQm61BKwAVrTxCFKfLU';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function fetchPrice() {
  try {
    // Get SPORB price in SOL
    const sporbResp = await fetch('https://api.jup.ag/swap/v1/quote?inputMint='+SOL_MINT+'&outputMint='+SPORB_MINT+'&amount=10000000&slippageBps=100');
    const sporbData = await sporbResp.json();
    const sporbOut = parseInt(sporbData.outAmount) / 1_000_000;
    const priceInSol = 0.01 / sporbOut;

    // Get SOL price in USDC
    const solResp = await fetch('https://api.jup.ag/swap/v1/quote?inputMint='+SOL_MINT+'&outputMint='+USDC_MINT+'&amount=1000000000&slippageBps=50');
    const solData = await solResp.json();
    const usdOut = parseInt(solData.outAmount) / 1_000_000;

    const priceInUsd = priceInSol * usdOut;
    const priceChange = 19.0; // placeholder - can calc from history later

    const result = {
      spor_usd: priceInUsd,
      sol_usd: usdOut,
      price_in_sol: priceInSol,
      timestamp: new Date().toISOString(),
      pool_sol: 0.1,  // pool composition
      pool_sporb: 4.3,
      price_change_pct: priceChange
    };

    fs.writeFileSync(PRICE_FILE, JSON.stringify(result, null, 2));
    console.log('Price updated: $' + priceInUsd.toFixed(4) + ' at ' + result.timestamp);
  } catch(e) {
    console.error('Price fetch error:', e.message);
  }
}

// Initial fetch
fetchPrice();

// Refresh every 60 seconds
setInterval(fetchPrice, 60000);

// HTTP server to serve price.json
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(PRICE_FILE, 'utf-8');
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    } catch(e) {
      res.writeHead(500);
      res.end(JSON.stringify({error: 'Price not available'}));
    }
  }
});

server.listen(PORT, () => {
  console.log('Price server on port ' + PORT);
  // Also fetch immediately
  setTimeout(fetchPrice, 1000);
});
