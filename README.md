# Project Iris 🚀 — 神秘 Landing Page

## 目前狀態
- 一個完整、神秘、有動態星星背景嘅 landing page
- 太空 x AI x Web3 主題，但唔講具體做咩
- 有早期 supporters 登記表格
- Vercel / Netlify 一鍵 deploy

## 神秘策略

### Stealth Mode 描述
```
Something beyond is being built.
We're building the infrastructure for the next leap — 
where space, artificial intelligence, and decentralized networks converge.
```

### 三大 Pillar（公開可見）
1. 🚀 Space Infrastructure
2. 🧠 Artificial Intelligence
3. ⛓️ Decentralized Network

### 唔公開嘅（白名單先睇到）
- Token details
- Whitepaper
- Team info
- Specific tech stack
- Roadmap

## Deploy 方法

### 方法 1: Vercel（推薦）
```bash
# 安裝 Vercel CLI
npm install -g vercel

# Deploy
cd /root/orbitalai/website
vercel --prod
```

### 方法 2: Netlify
```bash
# 用 Netlify Drop
# 直接上傳 /root/orbitalai/website/ 呢個 folder
```

### 方法 3: 自己 server（E3）
```bash
# Nginx static serve
cp -r /root/orbitalai/website/* /var/www/html/
```

## Domain 建議
- orbridge.xyz ✅（推薦，short + .xyz crypto friendly）
- project-iris.io
- orbitalai.io
- iris-bridge.xyz

## 下一步
1. Register domain
2. Deploy to Vercel/Netlify
3. Set up API endpoint for form submissions
4. 開始推廣俾 early supporters
