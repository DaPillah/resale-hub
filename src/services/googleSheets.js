const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

export async function testConnection(sheetId, apiKey) {
  const res = await fetch(`${BASE}/${sheetId}?key=${apiKey}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.properties.title
}

export async function pullFromSheets(sheetId, apiKey) {
  const res = await fetch(`${BASE}/${sheetId}/values/A:N?key=${apiKey}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)

  const rows = data.values || []
  if (rows.length < 2) return []

  return rows.slice(1).map((r) => ({
    id: r[0] || 'i_' + Date.now(),
    name: r[1] || '',
    cat: r[2] || '',
    cond: r[3] || '',
    price: parseFloat(r[4]) || 0,
    cost: parseFloat(r[5]) || 0,
    platforms: (r[7] || '').split(';').map((s) => s.trim()).filter(Boolean),
    delivery: r[8] || 'pickup',
    status: r[9] || 'Draft',
    soldOn: r[10] || null,
    date: r[11] || '',
    soldDate: r[12] || null,
    photoFolder: r[13] || '',
    listings: {},
    details: '',
  }))
}

export function itemsToCSV(items) {
  const header = ['ID', 'Name', 'Category', 'Condition', 'Price', 'Cost', 'Profit',
    'Platforms', 'Delivery', 'Status', 'Sold On', 'Date Added', 'Sold Date', 'Photo Folder']

  const rows = items.map((i) => [
    i.id,
    `"${(i.name || '').replace(/"/g, '""')}"`,
    i.cat,
    i.cond || '',
    i.price,
    i.cost || 0,
    (Number(i.price || 0) - Number(i.cost || 0)).toFixed(2),
    `"${(i.platforms || []).join('; ')}"`,
    i.delivery || '',
    i.status,
    i.soldOn || '',
    i.date || '',
    i.soldDate || '',
    `"${(i.photoFolder || '').replace(/"/g, '""')}"`,
  ])

  return [header, ...rows].map((r) => r.join(',')).join('\n')
}

export function downloadCSV(items) {
  const csv = itemsToCSV(items)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resale_hub_data.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function copyForSheets(items) {
  const tsv = itemsToCSV(items).replace(/,/g, '\t')
  return navigator.clipboard.writeText(tsv)
}
