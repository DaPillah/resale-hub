import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'
import { researchPrice } from '../../services/anthropic'
import { fmt, CONDITIONS } from '../../services/platforms'
import { Card, CardTitle, Button, Alert, Empty, Field } from '../shared'

export default function PriceResearch() {
  const apiKey         = useStore((s) => s.apiKey)
  const priceHistory   = useStore((s) => s.priceHistory)
  const addPriceHistory= useStore((s) => s.addPriceHistory)
  const navigate       = useNavigate()

  const [form, setForm] = useState({ desc: '', cond: '', platform: '' })
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function doResearch() {
    if (!form.desc) { setStatus({ type: 'err', msg: 'Describe the item first.' }); return }
    if (!apiKey)    { setStatus({ type: 'err', msg: 'Add your Anthropic API key in Settings first.' }); return }
    setLoading(true); setStatus({ type: 'info', msg: 'Searching current market prices…' }); setResult(null)
    try {
      const r = await researchPrice(apiKey, form)
      setResult(r)
      addPriceHistory({ id: 'p_' + Date.now(), ...form, result: r, date: new Date().toISOString().slice(0, 10) })
      setStatus({ type: '', msg: '' })
    } catch (e) {
      setStatus({ type: 'err', msg: `Error: ${e.message}` })
    } finally { setLoading(false) }
  }

  function useThisPrice(r) {
    navigate('/add', { state: { prefill: { name: r.itemName, price: r.listPrice, details: `Suggested drop price after 2 days: ${fmt(r.dropPrice)}` } } })
  }

  const DEMAND_COLOR = { high: 'var(--ok-txt)', medium: '#BA7517', low: 'var(--err-txt)' }

  return (
    <div>
      <h1 className="page-title">Price research</h1>

      <Card>
        <CardTitle>Research market price for an item</CardTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 13 }}>
          Describe your item and Claude will look up real sold listings to recommend a smart pricing strategy.
        </p>
        <Field label="Item description">
          <textarea value={form.desc} onChange={set('desc')} style={{ minHeight: 80 }}
            placeholder="Be specific: brand, model, size, condition, year. e.g. 'Levi's 501 jeans 32x30 dark wash, good condition, some fading'" />
        </Field>
        <div className="g2">
          <Field label="Your condition">
            <select value={form.cond} onChange={set('cond')}>
              <option value="">Select…</option>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Primary platform">
            <select value={form.platform} onChange={set('platform')}>
              <option value="">Any platform</option>
              {['Facebook Marketplace','eBay','Poshmark','Mercari','Depop','OfferUp'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        {status.msg && <Alert type={status.type || 'info'}>{status.msg}</Alert>}
        <Button variant="primary" onClick={doResearch} disabled={loading}>
          {loading ? 'Researching…' : '🔍 Research prices'}
        </Button>
      </Card>

      {result && (
        <Card style={{ border: '2px solid var(--green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3 }}>Market research for</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>{result.itemName}</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12 }}>
              <p style={{ color: 'var(--text2)' }}>{result.confidence} confidence</p>
              <p style={{ color: DEMAND_COLOR[result.demand], fontWeight: 500 }}>{result.demand} demand</p>
            </div>
          </div>

          <div className="g3" style={{ marginBottom: 14 }}>
            {[
              { label: 'List at (start here)', val: result.listPrice, color: 'var(--green)', highlight: true },
              { label: 'Drop to after 2 days', val: result.dropPrice, color: '#BA7517' },
              { label: 'Quick sale floor',      val: result.quickSalePrice, color: 'var(--text2)' },
            ].map(({ label, val, color, highlight }) => (
              <div key={label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '11px 13px', textAlign: 'center', border: highlight ? '2px solid var(--green)' : undefined }}>
                <p style={{ fontSize: 19, fontWeight: 600, color }}>{fmt(val)}</p>
                <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '11px 13px', marginBottom: 13 }}>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 12 }}>
              Market range: {fmt(result.marketLow)} – {fmt(result.marketHigh)} · Avg: {fmt(result.marketAvg)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text2)' }}>{result.reasoning}</p>
          </div>

          {result.tips?.length > 0 && (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Selling tips</p>
              <ul style={{ fontSize: 12, color: 'var(--text2)', paddingLeft: 18, lineHeight: 2 }}>
                {result.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </>
          )}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href={result.searchLinks?.ebay} target="_blank" rel="noopener noreferrer">
              <Button size="sm">eBay sold listings ↗</Button>
            </a>
            <a href={result.searchLinks?.poshmark} target="_blank" rel="noopener noreferrer">
              <Button size="sm">Poshmark sold ↗</Button>
            </a>
            <Button size="sm" variant="ok" onClick={() => useThisPrice(result)}>Use these prices →</Button>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle>Recent lookups</CardTitle>
        {priceHistory.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>List price</th><th>Drop price</th><th>Avg market</th><th>Date</th></tr></thead>
              <tbody>
                {priceHistory.map((p) => (
                  <tr key={p.id}>
                    <td>{p.desc.slice(0, 45)}{p.desc.length > 45 ? '…' : ''}</td>
                    <td style={{ fontWeight: 500, color: 'var(--green)' }}>{fmt(p.result.listPrice)}</td>
                    <td style={{ color: '#BA7517' }}>{fmt(p.result.dropPrice)}</td>
                    <td style={{ color: 'var(--text2)' }}>{fmt(p.result.marketAvg)}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No lookups yet</Empty>}
      </Card>
    </div>
  )
}
