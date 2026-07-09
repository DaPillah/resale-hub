import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt, CAT_COLORS, PLATFORM_MAP, calcDropPrice, hoursUntilDrop } from '../../services/platforms'
import { Metric, Card, CardTitle, Badge, BarRow, Empty } from '../shared'
import './Dashboard.css'

export default function Dashboard() {
  const items = useStore((s) => s.items)
  const offers = useStore((s) => s.offers)
  const navigate = useNavigate()

  const sold = items.filter((i) => i.status === 'Sold')
  const listed = items.filter((i) => i.status === 'Listed')
  const revenue = sold.reduce((s, i) => s + Number(i.price || 0), 0)
  const profit = sold.reduce((s, i) => s + Number(i.price || 0) - Number(i.cost || 0), 0)
  const avg = sold.length ? revenue / sold.length : 0

  // Revenue by platform
  const byPlatform = {}
  sold.forEach((i) => {
    const p = i.soldOn || 'Other'
    byPlatform[p] = (byPlatform[p] || 0) + Number(i.price || 0)
  })
  const maxPf = Math.max(...Object.values(byPlatform), 1)

  // Revenue by category
  const byCat = {}
  sold.forEach((i) => { byCat[i.cat] = (byCat[i.cat] || 0) + Number(i.price || 0) })
  const maxCat = Math.max(...Object.values(byCat), 1)

  // Active offers
  const activeOffers = offers.filter((o) => !o.resolved)

  // Items needing price drop
  const dropSoon = listed
    .map((i) => ({ item: i, hrs: hoursUntilDrop(i.date) }))
    .filter(({ hrs }) => hrs <= 4)

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="metrics-grid">
        <Metric label="Total revenue"   value={fmt(revenue)} />
        <Metric label="Total profit"    value={fmt(profit)} />
        <Metric label="Items sold"      value={sold.length} sub={`${listed.length} listed`} />
        <Metric label="Avg sale price"  value={fmt(avg)} />
      </div>

      {dropSoon.length > 0 && (
        <div className="drop-alert" onClick={() => navigate('/negotiate')}>
          ⏰ <strong>{dropSoon.length} item{dropSoon.length > 1 ? 's' : ''}</strong> ready for a price drop — check Negotiations
        </div>
      )}

      <div className="g2">
        <Card>
          <CardTitle>Revenue by platform</CardTitle>
          {Object.keys(byPlatform).length ? (
            Object.entries(byPlatform)
              .sort((a, b) => b[1] - a[1])
              .map(([p, v]) => (
                <BarRow key={p} label={p} value={v} max={maxPf}
                  color={PLATFORM_MAP[p]?.color || '#888'} displayVal={fmt(v)} />
              ))
          ) : <Empty>No sales yet</Empty>}
        </Card>

        <Card>
          <CardTitle>Best-selling categories</CardTitle>
          {Object.keys(byCat).length ? (
            Object.entries(byCat)
              .sort((a, b) => b[1] - a[1])
              .map(([c, v]) => (
                <BarRow key={c} label={c} value={v} max={maxCat}
                  color={CAT_COLORS[c] || '#888'} displayVal={fmt(v)} />
              ))
          ) : <Empty>No sales yet</Empty>}
        </Card>
      </div>

      <Card>
        <div className="card-header-row">
          <CardTitle>Active offers</CardTitle>
          {activeOffers.length > 0 && (
            <span className="offer-count">{activeOffers.length} active</span>
          )}
        </div>
        {activeOffers.length ? (
          activeOffers.slice(0, 3).map((o) => {
            const item = items.find((i) => i.id === o.itemId)
            return (
              <div key={o.id} className="offer-preview" onClick={() => navigate('/negotiate')}>
                <div className="offer-preview-left">
                  <span className="offer-amount">{fmt(o.amount)}</span>
                  <span className="offer-pct">{o.pct}% of asking</span>
                  <span className="offer-item">{item?.name || '?'}</span>
                </div>
                <div>
                  <Badge label={o.platform} />
                  <p className="offer-strategy">{o.strategy}</p>
                </div>
              </div>
            )
          })
        ) : <Empty>No active offers — log one in Negotiations</Empty>}
      </Card>

      <Card>
        <CardTitle>Recent activity</CardTitle>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Item</th><th>Status</th><th>Platforms</th><th>Price</th><th>Date</th></tr>
              </thead>
              <tbody>
                {items.slice(0, 6).map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.name}</strong>
                      <br /><span style={{ fontSize: 11, color: 'var(--text2)' }}>{i.cat}{i.cond ? ` · ${i.cond}` : ''}</span>
                    </td>
                    <td><Badge label={i.status} /></td>
                    <td>{(i.platforms || []).slice(0, 2).map((p) => <Badge key={p} label={p} />)}{(i.platforms || []).length > 2 && ` +${i.platforms.length - 2}`}</td>
                    <td>{fmt(i.price)}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{i.soldDate || i.date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No items yet — go to Add &amp; post item to get started</Empty>}
      </Card>
    </div>
  )
}
