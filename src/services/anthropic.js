const BASE_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-6'

async function callClaude(apiKey, prompt, maxTokens = 1400) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.content.map((b) => b.text || '').join('')
}

// ── Generate listings ─────────────────────────────────────────────────────────

export async function generateListings(apiKey, { name, cat, cond, price, details, brand, size, color, deliveryText, platforms }) {
  const prompt = `Generate optimized resale listing copy. Output ONLY in this format with --- between platforms, no preamble:
PLATFORM: [name]
TITLE: [title]
DESCRIPTION: [description]
---

Item: ${name} | Category: ${cat} | Condition: ${cond} | Price: $${price}
Brand: ${brand || 'Not specified'} | Size: ${size || 'Not specified'} | Color: ${color || 'Not specified'}
Delivery: ${deliveryText}
Details: ${details || 'None'}
Platforms: ${platforms.join(', ')}

State the brand and size explicitly and near the start of each description — platforms surface these as searchable fields, not just prose.

Style guide:
- eBay: keyword-rich title (80 chars), detailed description with specs and condition notes, mention shipping
- Poshmark: fashion-forward, brand prominent, size visible, end with 3-5 hashtags
- Mercari: concise, bullet-point condition notes, friendly tone, call out any flaws
- Depop: casual Gen Z tone, lowercase title okay, style-focused hashtags
- OfferUp: local community feel, short paragraphs, mention pickup/meetup

Always include delivery info naturally in the description.`

  const text = await callClaude(apiKey, prompt)
  const listings = {}

  text.split('---').map((s) => s.trim()).filter(Boolean).forEach((sec) => {
    const pMatch = sec.match(/PLATFORM:\s*(.+)/)
    const tMatch = sec.match(/TITLE:\s*(.+)/)
    const dMatch = sec.match(/DESCRIPTION:\s*([\s\S]+)/)
    if (!pMatch) return
    const p = pMatch[1].trim()
    listings[p] = {
      title: tMatch ? tMatch[1].trim() : '',
      desc: dMatch ? dMatch[1].trim() : '',
    }
  })

  return listings
}

// ── Price research ────────────────────────────────────────────────────────────

export async function researchPrice(apiKey, { desc, cond, platform }) {
  const prompt = `You are a resale pricing expert. Research current market prices for the item below using your knowledge of recent eBay sold listings, Poshmark, Mercari, and other resale platforms.

Item: ${desc}
Condition: ${cond || 'not specified'}
Primary platform: ${platform || 'any'}

Respond with ONLY valid JSON, no other text:
{
  "itemName": "clean item name",
  "marketAvg": 45.00,
  "marketLow": 30.00,
  "marketHigh": 65.00,
  "listPrice": 58.00,
  "dropPrice": 48.00,
  "quickSalePrice": 38.00,
  "confidence": "high|medium|low",
  "demand": "high|medium|low",
  "bestPlatform": "platform name",
  "reasoning": "2-3 sentences explaining pricing logic and market context",
  "tips": ["tip 1", "tip 2", "tip 3"],
  "searchLinks": {
    "ebay": "https://www.ebay.com/sch/i.html?_nkw=KEYWORDS&LH_Sold=1&LH_Complete=1",
    "poshmark": "https://poshmark.com/search?query=KEYWORDS&availability=sold_out"
  }
}

listPrice = 10-20% above market avg (negotiation room)
dropPrice = ~12% below listPrice (drop after 2 days)
quickSalePrice = floor price if need it gone fast
Base numbers on actual SOLD prices, not asking prices.`

  const text = await callClaude(apiKey, prompt, 800)
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

// ── FB Marketplace listing (no AI needed — template) ─────────────────────────

export function generateFBListing({ name, cond, price, details, deliveryText, cat, brand, size, color }) {
  const title = `${cond} ${name} — $${price}`
  const specs = [brand && `Brand: ${brand}`, size && `Size: ${size}`, color && `Color: ${color}`].filter(Boolean).join(' | ')
  const desc = [
    name,
    `Condition: ${cond}`,
    specs || null,
    `Price: $${price}`,
    deliveryText,
    '',
    details || 'Great item, well maintained.',
    '',
    'Message with any questions!',
  ].filter((line) => line !== null).join('\n')
  return { title, desc }
}
