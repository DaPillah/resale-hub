// ── Platform metadata ─────────────────────────────────────────────────────────

export const PLATFORMS = [
  { id: 'fb',  name: 'Facebook Marketplace', badge: 'b-fb', color: '#1877F2', sellUrl: 'https://www.facebook.com/marketplace/create/item' },
  { id: 'eb',  name: 'eBay',                 badge: 'b-eb', color: '#BA7517', sellUrl: 'https://www.ebay.com/sell/list' },
  { id: 'pm',  name: 'Poshmark',             badge: 'b-pm', color: '#D4537E', sellUrl: 'https://poshmark.com/create-listing' },
  { id: 'mc',  name: 'Mercari',              badge: 'b-mc', color: '#639922', sellUrl: 'https://www.mercari.com/sell/' },
  { id: 'dp',  name: 'Depop',               badge: 'b-dp', color: '#7F77DD', sellUrl: 'https://www.depop.com/sell/' },
  { id: 'ou',  name: 'OfferUp',             badge: 'b-ou', color: '#D85A30', sellUrl: 'https://offerup.com/sell/' },
]

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.name, p]))

export const CATEGORIES = ['Clothing', 'Shoes', 'Electronics', 'Furniture', 'Books', 'Accessories', 'Other']

export const CONDITIONS = ['New with tags', 'Like new', 'Good', 'Fair', 'Poor / For parts']

export const DELIVERY_OPTIONS = [
  {
    id: 'pickup',
    label: 'Local pickup only',
    tag: 'Recommended',
    tagColor: 'ok',
    desc: 'Buyer comes to you. Zero effort, zero cost, zero shipping disputes. Best for furniture, large items, and anything local.',
    listingText: 'Local pickup only',
  },
  {
    id: 'both',
    label: 'Pickup or shipping',
    tag: 'Best for eBay/Poshmark',
    tagColor: 'ok',
    desc: 'Pickup for local buyers + shipping for everyone else. eBay and Poshmark handle labels automatically — just pack and drop at USPS/UPS.',
    listingText: 'Available for local pickup or shipping',
  },
  {
    id: 'drive',
    label: "I'll drive to buyer",
    tag: 'High value items only',
    tagColor: 'warn',
    desc: 'You drop off within 15 minutes. Only worth it for items $40+. Always meet in a public place.',
    listingText: 'I can drive to you (within 15 min)',
  },
  {
    id: 'ship',
    label: 'Shipping only',
    tag: null,
    tagColor: null,
    desc: 'Ship to buyer anywhere. Best for small, easy-to-pack items on eBay or Poshmark.',
    listingText: 'Ships only',
  },
]

export const CAT_COLORS = {
  Clothing: '#7F77DD', Shoes: '#378ADD', Electronics: '#639922',
  Furniture: '#BA7517', Books: '#D4537E', Accessories: '#1D9E75', Other: '#888780',
}

// ── Pricing helpers ───────────────────────────────────────────────────────────

export function calcDropPrice(price) {
  return Math.round(Number(price) * 0.875)
}

export function hoursUntilDrop(dateStr) {
  const ms = new Date(dateStr).getTime() + 2 * 24 * 60 * 60 * 1000 - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60)))
}

export function fmt(n) {
  return '$' + Number(n || 0).toFixed(2)
}

// ── Offer strategy ────────────────────────────────────────────────────────────

export function getOfferStrategy(offerAmount, askingPrice) {
  const pct = Math.round((offerAmount / askingPrice) * 100)
  if (pct >= 90) return { pct, advice: 'Strong offer — accept or counter at 95%.', counter: Math.round(askingPrice * 0.95) }
  if (pct >= 80) return { pct, advice: `Reasonable — counter at ${fmt(Math.round(askingPrice * 0.92))}.`, counter: Math.round(askingPrice * 0.92) }
  if (pct >= 70) return { pct, advice: `Low — counter at ${fmt(Math.round(askingPrice * 0.88))} and hold.`, counter: Math.round(askingPrice * 0.88) }
  return { pct, advice: 'Too low — politely decline. These buyers rarely get serious.', counter: null }
}
