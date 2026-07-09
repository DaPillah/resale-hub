import React, { useState } from 'react'
import { useStore } from '../../store'
import { fmt, getOfferStrategy, hoursUntilDrop, calcDropPrice } from '../../services/platforms'
import { Card, CardTitle, Button, Alert, Badge, Empty, Field } from '../shared'

export default function Negotiations() {
  const items       = useStore((s) => s.items)
  const offers      = useStore((s) => s.offers)
  const addOffer    = useStore((s) => s.addOffer)
  const resolveOffer= useStore((s) => s.resolveOffer)

  const [form, setForm] = useState({ itemId: '', platform: '', amount: '', notes: '' })
  const [alert, setAlert] = useState({ type: '', msg: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const listed = items.filter((i) => i.status === 'Listed')

  function logOffer() {
    const item = items.find((i) => i.id === form.itemId)
    if (!form.itemId || !form.platform || !form.amount || !item) {
      setAlert({ type: 'err', msg: 'Fill in item, platform, and offer amount.' })
      return
    }
    const { pct, advice, counter } = getOfferStrategy(parseFloat(form.amount), item.price)
    addOffer({
      id: 'o_' + Date.now(),
      itemId: form.itemId, platform: form.platform,
      amount: parseFloat(form.amount), notes: form.notes,
      date: new Date().toISOString().slice(0, 10),
      resolved: false, strategy: advice, pct,
      counter,
    })
    setAlert({ type: 'ok', msg: `Offer logged! ${advice}` })
    setForm((f) => ({ ...f, amount: '', notes: '' }))
    setTimeout(() => setAlert({ type: '', msg: '' }), 5000)
  }

  const active   = offers.filter((o) => !o.resolved)
  const resolved = offers.filter((o) =>  o.resolved).slice(0, 5)

  const timers = listed
    .map((i) => ({ item: i, hrs: hoursUntilDrop(i.date), dropPrice: calcDropPrice(i.price) }))
    .sort((a, b) => a.hrs - b.hrs)

  return (
    <div>
      <h1 className="page-title">Negotiations</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Log offers you receive from any platform. The app calculates the ideal counter and tracks your 2-day price drop timers.
      </p>

      <div className="g2">
        <div>
          <Card>
            <CardTitle>Log a new offer</CardTitle>
            <Field label="Item">
              <select value={form.itemId} onChange={set('itemId')}>
                <option value="">Select item…</option>
                {listed.map((i) => <option key={i.id} value={i.id}>{i.name} ({fmt(i.price)})</option>)}
              </select>
            </Field>
            <Field label="Platform offer came from">
              <select value={form.platform} onChange={set('platform')}>
                <option value="">Select…</option>
                {['Facebook Marketplace','eBay','Poshmark','Mercari','Depop','OfferUp','Text/Other'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Offer amount ($)">
              <input type="number" value={form.amount} onChange={set('amount')} placeholder="0.00" min="0" step="0.01" />
            </Field>
            <Field label="Notes" hint="optional">
              <input value={form.notes} onChange={set('notes')} placeholder='e.g. "will you take $30?"' />
            </Field>
            {alert.msg && <Alert type={alert.type === 'ok' ? 'ok' : 'err'}>{alert.msg}</Alert>}
            <Button variant="primary" onClick={logOffer}>+ Log offer</Button>
          </Card>

          <Card>
            <CardTitle>Price drop timers</CardTitle>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
              Drop price ~12% after 2 days with no offers to refresh your listing in platform algorithms.
            </p>
            {timers.length ? timers.slice(0, 6).map(({ item, hrs, dropPrice }) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text2)' }}>{fmt(item.price)} → drop to {fmt(dropPrice)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: hrs <= 0 ? 'var(--err-txt)' : '#BA7517' }}>
                    {hrs <= 0 ? 'Now!' : `${hrs}h`}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text2)' }}>{hrs <= 0 ? 'Drop price now' : 'until drop'}</p>
                </div>
              </div>
            )) : <Empty>No listed items</Empty>}
          </Card>
        </div>

        <div>
          <Card>
            <CardTitle>Active offers</CardTitle>
            {active.length ? active.map((o) => {
              const item = items.find((i) => i.id === o.itemId)
              return (
                <div key={o.id} style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 600 }}>{fmt(o.amount)}</span>
                      <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 8 }}>{o.pct}% of asking</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Badge label={o.platform} />
                      <Button size="sm" onClick={() => resolveOffer(o.id)}>Resolve</Button>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>{item?.name || '?'} · {o.date}{o.notes ? ` · "${o.notes}"` : ''}</p>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--info-txt)', background: 'var(--info-bg)', borderRadius: 'var(--radius)', padding: '7px 10px' }}>
                    {o.strategy}
                    {o.counter && <strong> Counter: {fmt(o.counter)}</strong>}
                  </div>
                </div>
              )
            }) : <Empty>No active offers yet</Empty>}

            {resolved.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: 'var(--text2)', margin: '12px 0 6px' }}>Resolved</p>
                {resolved.map((o) => {
                  const item = items.find((i) => i.id === o.itemId)
                  return <div key={o.id} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
                    {item?.name || '?'} — {fmt(o.amount)} on {o.platform} <span style={{ color: 'var(--ok-txt)' }}>✓ resolved</span>
                  </div>
                })}
              </>
            )}
          </Card>

          <Card>
            <CardTitle>Negotiation playbook</CardTitle>
            {[
              ['90%+ of asking', 'Strong offer — accept or counter at 95%.'],
              ['80–90% of asking', 'Reasonable — counter at 92%.'],
              ['70–80% of asking', 'Low — counter at 88% and hold firm.'],
              ['Below 70%', 'Too low — decline politely. They rarely come back serious.'],
              ['After 2 days, no offers', 'Drop price ~12%. This also refreshes your listing in platform algorithms.'],
              ['Safety tip', 'For local meetups: public place only. Many police stations have safe exchange zones.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '0.5px solid var(--border)' }}>
                <p style={{ fontSize: 12, fontWeight: 600 }}>{title}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{desc}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
