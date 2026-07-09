import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── helpers ──────────────────────────────────────────────────────────────────
const SEED_ITEMS = [
  {
    id: 'i1', name: "Levi's 501 Jeans 32x30", cat: 'Clothing', cond: 'Good',
    price: 45, cost: 8, date: '2026-06-10', platforms: ['Poshmark', 'Depop'],
    delivery: ['pickup', 'ship'], status: 'Sold', soldOn: 'Poshmark', soldDate: '2026-06-18',
    listings: {}, details: '', photoFolder: '~/Resale/Levis 501 Jeans',
  },
  {
    id: 'i2', name: 'Nike Air Force 1 Size 10', cat: 'Shoes', cond: 'Like new',
    price: 75, cost: 22, date: '2026-06-12', platforms: ['eBay', 'Facebook Marketplace'],
    delivery: ['pickup', 'ship'], status: 'Sold', soldOn: 'eBay', soldDate: '2026-06-20',
    listings: {}, details: '', photoFolder: '~/Resale/Nike Air Force 1',
  },
  {
    id: 'i3', name: 'Kindle Paperwhite 2022', cat: 'Electronics', cond: 'Like new',
    price: 95, cost: 40, date: '2026-06-18', platforms: ['eBay', 'Mercari'],
    delivery: ['pickup', 'ship'], status: 'Listed', soldOn: null, soldDate: null,
    listings: {
      eBay: { title: 'Kindle Paperwhite 2022 11th Gen 8GB Like New', desc: 'Like new Kindle Paperwhite 2022. Includes charging cable. Ships fast.' },
      Mercari: { title: 'Kindle Paperwhite 2022 Like New', desc: '• Like new condition\n• Includes cable\n• Ships within 1 day' },
    },
    details: 'Includes original charging cable', photoFolder: '~/Resale/Kindle Paperwhite',
  },
  {
    id: 'i4', name: 'H&M Floral Midi Dress S', cat: 'Clothing', cond: 'Good',
    price: 18, cost: 0, date: '2026-06-20', platforms: ['Poshmark', 'Depop', 'Mercari'],
    delivery: ['pickup', 'ship'], status: 'Listed', soldOn: null, soldDate: null,
    listings: {}, details: 'Floral print, midi length, no flaws', photoFolder: '~/Resale/HM Floral Dress',
  },
]

const SEED_OFFERS = [
  {
    id: 'o1', itemId: 'i3', platform: 'Mercari', amount: 70,
    notes: 'will you take 70?', date: '2026-06-25', resolved: false,
    strategy: 'Counter at $84 — that\'s 10% under your ask.', pct: 74,
  },
]

// ── store ─────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // ── state ──
      items: SEED_ITEMS,
      offers: SEED_OFFERS,
      priceHistory: [],
      apiKey: '',
      sheetId: '',
      sheetApiKey: '',
      userLocation: '',

      // ── item actions ──
      addItem: (item) => set((s) => ({ items: [item, ...s.items] })),

      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),

      deleteItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          offers: s.offers.filter((o) => o.itemId !== id),
        })),

      markSold: (id, soldOn) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, status: 'Sold', soldOn, soldDate: new Date().toISOString().slice(0, 10) }
              : i
          ),
          offers: s.offers.map((o) => (o.itemId === id ? { ...o, resolved: true } : o)),
        })),

      // ── offer actions ──
      addOffer: (offer) => set((s) => ({ offers: [offer, ...s.offers] })),

      resolveOffer: (id) =>
        set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, resolved: true } : o)) })),

      // ── price history ──
      addPriceHistory: (entry) =>
        set((s) => ({ priceHistory: [entry, ...s.priceHistory].slice(0, 20) })),

      // ── settings ──
      setApiKey: (key) => set({ apiKey: key }),
      setSheetId: (id) => set({ sheetId: id }),
      setSheetApiKey: (key) => set({ sheetApiKey: key }),
      setUserLocation: (loc) => set({ userLocation: loc }),
    }),
    {
      name: 'resale-hub-store',
      // Only persist these keys to localStorage
      partialize: (s) => ({
        items: s.items,
        offers: s.offers,
        priceHistory: s.priceHistory,
        apiKey: s.apiKey,
        sheetId: s.sheetId,
        sheetApiKey: s.sheetApiKey,
        userLocation: s.userLocation,
      }),
    }
  )
)
