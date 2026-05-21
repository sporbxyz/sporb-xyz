const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const ORDERS_FILE = '/www/wwwroot/sporb.xyz/orders.json';
const PORT = 3003;

function sendConfirmationEmail(order) {
  const id = order.id;
  const data = order.data;
  const email = data.email;
  const tier = data.tier || 'N/A';
  const amount = data.amount || data.txid || 'N/A';
  const txid = data.txid;

  const subject = 'Presale Order Confirmation – ' + id;
  const body = `Thank you for your SPORB presale order!

Order ID: ${id}
Tier: ${tier}
Amount: ${amount}
Transaction ID: ${txid}

Your order has been received. Verification will be completed within 24 hours.

Best regards,
SPORB Team`;

  const tmpFile = '/tmp/email-' + id + '.txt';
  const mailContent = `From: early@sporb.xyz
To: ${email}
Subject: ${subject}
Content-Type: text/plain; charset=UTF-8

${body}`;

  fs.writeFileSync(tmpFile, mailContent, 'utf-8');
  exec(`msmtp -a default ${email} < ${tmpFile}`, (err, stdout, stderr) => {
    if (err) {
      console.error('Email send error for', id, ':', err.message);
    } else {
      console.log('Confirmation email sent to', email, 'for order', id);
    }
    // Clean up temp file
    fs.unlink(tmpFile, () => {});
  });
}

function saveOrder(data) {
  let orders = [];
  try {
    if (fs.existsSync(ORDERS_FILE)) orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  } catch(e) { console.error('Read error:', e.message); }
  orders.push(data);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  return data.id;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.txid || !data.email) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({ok:false, error:'Missing txid or email'}));
          return;
        }
        const order = {
          id: 'SPORB-' + Math.random().toString(36).substr(2,8).toUpperCase(),
          timestamp: new Date().toISOString(),
          data: data
        };
        const id = saveOrder(order);
        console.log('Order saved:', id);
        sendConfirmationEmail(order);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok:true, order_id: id}));
      } catch(e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ok:false, error: e.message}));
      }
    });
  } else {
    res.writeHead(405);
    res.end();
  }
});

server.listen(PORT, () => console.log('Order server on port ' + PORT));
