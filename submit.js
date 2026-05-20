// Early Access form submission handler — stores to JSON file + email notify
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const DATA_FILE = '/www/wwwroot/sporb.xyz/submissions.json';
const NOTIFY_EMAIL = 'early@sporb.xyz';
const PORT = 3002; // Internal, reverse-proxied by Nginx

function saveSubmission(data) {
  let submissions = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      submissions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading submissions file:', e.message);
  }
  submissions.push(data);
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');
  return submissions.length;
}

function sendEmail(data) {
  const subject = `🔭 New SPORB Early Supporter: ${data.contact || 'unknown'}`;
  const body = [
    `New Early Access Submission`,
    `------------------------`,
    `Contact: ${data.contact || 'N/A'}`,
    `Wallet:  ${data.wallet || 'N/A'}`,
    `Plan:    ${data.plan || 'N/A'}`,
    `Time:    ${data.submitted_at || 'N/A'}`,
    `IP:      ${data.ip || 'N/A'}`,
    `------------------------`,
  ].join('\n');

  const proc = spawn('/usr/sbin/sendmail', ['-t']);
  proc.stdin.write(`To: ${NOTIFY_EMAIL}\n`);
  proc.stdin.write(`Subject: ${subject}\n`);
  proc.stdin.write(`MIME-Version: 1.0\n`);
  proc.stdin.write(`Content-Type: text/plain; charset="UTF-8"\n`);
  proc.stdin.write(`Content-Transfer-Encoding: 8bit\n\n`);
  proc.stdin.write(body);
  proc.stdin.end();
  proc.on('close', (code) => {
    console.log(`Email notification sent (exit: ${code})`);
  });
  proc.on('error', (err) => {
    console.error('Email send failed:', err.message);
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/submit') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      data.submitted_at = new Date().toISOString();
      data.ip = req.socket.remoteAddress;

      const count = saveSubmission(data);
      console.log(`✅ Submission #${count}: ${data.contact || 'unknown'}`);

      // Send email notification (best-effort)
      sendEmail(data);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: "Received. We'll be in touch." }));
    } catch (e) {
      console.error('Invalid submission:', e.message);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`SPORB submission API running on http://127.0.0.1:${PORT}`);
});
