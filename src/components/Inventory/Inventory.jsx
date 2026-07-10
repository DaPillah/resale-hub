import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt, calcDropPrice, deliveryLabel } from '../../services/platforms'
import { Badge, Button, Empty } from '../shared'
import './Inventory.css'

export default function Inventory() {
  const items    = useStore((s) => s.items)
  const offers   = useStore((s) => s.offers)
  const markSold = useStore((s) => s.markSold)
  const deleteItem = useStore((s) => s.deleteItem)
  const navigate = useNavigate()

  const [filterStatus, setFilterStatus] = useState('')
  const [filterPf, setFilterPf]         = useState('')

  const offerCounts = {}
  offers.filter((o) => !o.resolved).forEach((o) => {
    offerCounts[o.itemId] = (offerCounts[o.itemId] || 0) + 1
  })

  const list = items
    .filter((i) => !filterStatus || i.status === filterStatus)
    .filter((i) => !filterPf || (i.platforms || []).includes(filterPf))

  function handleMarkSold(item) {
    const pfs = item.platforms || []
    const soldOn = pfs.length === 1
      ? pfs[0]
      : window.prompt(`Which platform sold it?\n\n${pfs.join('\n')}`)
    if (soldOn) markSold(item.id, soldOn)
  }

  function handleDelete(id) {
    if (window.confirm('Delete this item? This cannot be undone.')) deleteItem(id)
  }

  return (
    <div>
      <div className="inv-header">
        <h1 className="page-title" style={{ margin: 0 }}>My inventory</h1>
        <div className="btn-row">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-sel">
            <option value="">All statuses</option>
            <option>Listed</option><option>Sold</option><option>Draft</option>
          </select>
          <select value={filterPf} onChange={(e) => setFilterPf(e.target.value)} className="filter-sel">
            <option value="">All platforms</option>
            {['Facebook Marketplace','eBay','Poshmark','Mercari','Depop','OfferUp'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <Button variant="primary" size="sm" onClick={() => navigate('/add')}>+ Add item</Button>
        </div>
      </div>

      <div className="card card-nopad">
        <div className="table-wrap">
          {list.length ? (
            <table>
              <thead>
                <tr>
                  <th>Item</th><th>Status</th><th>Platforms</th>
                  <th>Delivery</th><th>Photos</th><th>Price</th>
                  <th>Offers</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((i) => {
                  const profit = Number(i.price || 0) - Number(i.cost || 0)
                  const oc = offerCounts[i.id] || 0
                  return (
                    <tr key={i.id}>
                      <td>
                        <strong>{i.name}</strong>
                        <br /><span style={{ fontSize: 11, color: 'var(--text2)' }}>{i.cat}{i.cond ? ` · ${i.cond}` : ''}</span>
                      </td>
                      <td><Badge label={i.status} /></td>
                      <td>{(i.platforms || []).map((p) => {
                        const posted = (i.postedPlatforms || []).includes(p)
                        return (
                          <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, opacity: posted ? 0.6 : 1 }}>
                            <Badge label={p} />
                            {posted && <span style={{ fontSize: 11, color: 'var(--ok-txt)' }} title="Already posted">✓</span>}
                          </span>
                        )
                      })}</td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{deliveryLabel(i.delivery)}</td>
                      <td className={i.photoFolder ? 'photo-set' : 'photo-missing'}>
                        {i.photoFolder ? '📁 Set' : '✗ Not set'}
                      </td>
                      <td>
                        {fmt(i.price)}
                        {i.cost ? <><br /><span style={{ fontSize: 11, color: 'var(--ok-txt)' }}>+{fmt(profit)}</span></> : null}
                      </td>
                      <td>
                        {oc ? <span className="offer-badge">{oc} offer{oc > 1 ? 's' : ''}</span>
                             : <span style={{ color: 'var(--text2)' }}>—</span>}
                      </td>
                      <td>
                        <div className="btn-row">
                          {i.status !== 'Sold' && (
                            <Button size="sm" variant="ok" onClick={() => handleMarkSold(i)}>Mark sold</Button>
                          )}
                          {i.status === 'Listed' && (
                            <Button size="sm" variant="info" onClick={() => navigate('/kit', { state: { itemId: i.id } })}>Kit</Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => handleDelete(i.id)}>✕</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : <Empty>No items match this filter</Empty>}
        </div>
      </div>
    </div>
  )
}
