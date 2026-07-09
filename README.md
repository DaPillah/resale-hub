# 🛍️ Resale Hub

Your personal resale selling command center. List items across Facebook Marketplace, eBay, Poshmark, Mercari, Depop, and OfferUp — with AI-generated listings, price research, negotiation tracking, and a Cowork integration for semi-automated posting.

## Features

- **AI listing generation** — writes optimized copy for every platform at once
- **Price research** — searches real sold listings and recommends list/drop/floor prices
- **Negotiation tracker** — logs offers, suggests counters, tracks 2-day price drop timers
- **Posting kits** — all listing copy + photo folder path + Cowork brief in one view
- **Platform intel** — tracks which platforms your items actually sell on
- **Google Sheets sync** — export/import your inventory data
- **Cowork integration** — copy a brief and hand off posting to Claude Desktop

---

## Quick start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/resale-hub.git
cd resale-hub
npm install
```

### 2. Add your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your key at [console.anthropic.com](https://console.anthropic.com) → API Keys.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173/resale-hub/](http://localhost:5173/resale-hub/)

---

## Deploy to GitHub Pages

### 1. Update `vite.config.js`

Make sure the `base` matches your repo name:

```js
base: '/resale-hub/',  // change if your repo is named differently
```

### 2. Enable GitHub Pages

In your GitHub repo: **Settings → Pages → Source → GitHub Actions**

### 3. Push to main

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically builds and deploys on every push to `main`. Your site will be live at:

```
https://YOUR_USERNAME.github.io/resale-hub/
```

---

## Photo folder setup

Organize your item photos like this on your computer:

```
Desktop/
  Resale/
    Nike Air Force 1 Size 10/
      photo1.jpg   ← best shot (becomes thumbnail)
      photo2.jpg
      photo3.jpg
    Kindle Paperwhite/
      photo1.jpg
      ...
```

When adding an item in the app, paste the folder path (e.g. `~/Resale/Nike Air Force 1 Size 10`). The Posting Kit will include this path in the Cowork brief so Claude Desktop can find and upload your photos automatically.

---

## Using with Cowork (Claude Desktop)

1. Open a Posting Kit for any listed item
2. Click **"Copy Cowork brief"**
3. Open Cowork (Claude Desktop) and paste the brief
4. Say: *"Post this item to eBay"* (or whichever platform)
5. Cowork + Claude in Chrome will fill in the listing form, upload your photos, and stop for your review before publishing

See `cowork/cowork_prompt.md` for the full session prompt to paste at the start of each Cowork session.

---

## Project structure

```
resale-hub/
├── src/
│   ├── components/          # One folder per page/feature
│   │   ├── Dashboard/
│   │   ├── Inventory/
│   │   ├── AddItem/
│   │   ├── PostingKit/
│   │   ├── Negotiations/
│   │   ├── PriceResearch/
│   │   ├── PlatformIntel/
│   │   ├── Sheets/
│   │   ├── Settings/
│   │   └── shared/          # Reusable UI components
│   ├── hooks/               # Custom React hooks (future)
│   ├── services/            # API calls + business logic
│   │   ├── anthropic.js     # AI listing generation + price research
│   │   ├── googleSheets.js  # Sheets sync + CSV export
│   │   └── platforms.js     # Platform metadata + pricing helpers
│   ├── store/
│   │   └── index.js         # Zustand global state + localStorage persistence
│   ├── App.jsx              # Routing + layout
│   └── main.jsx
├── cowork/
│   └── cowork_prompt.md     # Paste this into Cowork each session
├── .github/workflows/
│   └── deploy.yml           # Auto-deploy to GitHub Pages on push to main
├── .env.example             # Copy to .env.local and add your keys
└── vite.config.js
```

---

## Tech stack

- **React 18** + **React Router 6** — UI and routing
- **Zustand** — global state with localStorage persistence
- **Vite** — fast build tool
- **Lucide React** — icons
- **Anthropic Claude API** — AI listing generation and price research
- **Google Sheets API** — inventory sync
- **GitHub Pages** — free static hosting
- **GitHub Actions** — CI/CD pipeline

---

## Cost

API costs are minimal for personal use:
- Listing generation: ~$0.01–0.02 per item
- Price research: ~$0.01–0.02 per lookup
- 20 items/week ≈ under $1/month
