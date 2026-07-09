import React, { useState } from 'react'
import { useStore } from '../../store'
import { PLATFORMS, CATEGORIES, CONDITIONS, DELIVERY_OPTIONS, fmt, buildDeliveryText } from '../../services/platforms'
import { generateListings, generateFBListing } from '../../services/anthropic'
import { Card, CardTitle, Button, Alert, Badge, Field } from '../shared'
import './AddItem.css'

const DEEP_LINKS = Object.fromEntries(PLATFORMS.map((p) => [p.name, p.sellUrl]))

function CopyBox({ id, text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="copy-row">
      <pre className="listing-box" id={id}>{text}</pre>
      <Button size="sm" onClick={copy} className="copy-btn">{copied ? 'Copied!' : 'Copy'}</Button>
    </div>
  )
}

export default function AddItem() {
  const addItem = useStore((s) => s.addItem)
  const apiKey = useStore((s) => s.apiKey)

  const [form, setForm] = useState({
    name: '', cat: '', cond: '', price: '', cost: '',
    date: new Date().toISOString().slice(0, 10),
    details: '', photoFolder: '',
  })
  const [selectedPlatforms, setSelectedPlatforms] = useState(['eBay'])
  const [selectedDelivery, setSelectedDelivery] = useState(['pickup'])
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [listings, setListings] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const togglePf = (name) => setSelectedPlatforms((prev) =>
    prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
  )
  const toggleDelivery = (id) =>
    setSelectedDelivery((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )

  async function handleSubmit() {
    if (!form.name || !form.cat || !form.cond || !form.price || selectedPlatforms.length === 0) {
      setStatus({ type: 'err', msg: 'Fill in all required fields and select at least one platform.' })
      return
    }
    if (selectedDelivery.length === 0) {
      setStatus({ type: 'err', msg: 'Select at least one delivery option.' })
      return
    }
    if (!apiKey) {
      setStatus({ type: 'err', msg: 'Add your Anthropic API key in Settings first.' })
      return
    }

    setLoading(true)
    setStatus({ type: 'info', msg: 'Generating AI listings…' })
    setListings(null)

    const deliveryText = buildDeliveryText(selectedDelivery)

    const newItem = {
      id: 'i_' + Date.now(),
      ...form,
      price: parseFloat(form.price),
      cost: parseFloat(form.cost) || 0,
      platforms: selectedPlatforms,
      delivery: selectedDelivery,
      status: 'Listed',
      soldOn: null,
      soldDate: null,
      listings: {},
    }

    try {
      const hasFB = selectedPlatforms.includes('Facebook Marketplace')
      const aiPlatforms = selectedPlatforms.filter((p) => p !== 'Facebook Marketplace')
      const generatedListings = {}

      if (hasFB) {
        const fb = generateFBListing({ ...form, deliveryText })
        generatedListings['Facebook Marketplace'] = fb
      }
      if (aiPlatforms.length > 0) {
        const ai = await generateListings(apiKey, {
          name: form.name, cat: form.cat, cond: form.cond,
          price: form.price, details: form.details,
          deliveryText, platforms: aiPlatforms,
        })
        Object.assign(generatedListings, ai)
      }

      newItem.listings = generatedListings
      addItem(newItem)
      setListings(generatedListings)
      setStatus({ type: 'ok', msg: 'Item saved! Listings generated below.' })
    } catch (e) {
      setStatus({ type: 'err', msg: `Error: ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Add &amp; post item</h1>

      <Card>
        <CardTitle>Item details</CardTitle>
        <div className="g2">
          <Field label="Item name *"><input value={form.name} onChange={set('name')} placeholder="e.g. Levi's 501 Jeans 32x30 Dark Wash" /></Field>
          <Field label="Category *">
            <select value={form.cat} onChange={set('cat')}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="g2">
          <Field label="Condition *">
            <select value={form.cond} onChange={set('cond')}>
              <option value="">Select…</option>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Asking price ($) *"><input type="number" value={form.price} onChange={set('price')} placeholder="0.00" min="0" step="0.01" /></Field>
        </div>
        <div className="g2">
          <Field label="What you paid ($)" hint="optional"><input type="number" value={form.cost} onChange={set('cost')} placeholder="0.00" min="0" step="0.01" /></Field>
          <Field label="Date added"><input type="date" value={form.date} onChange={set('date')} /></Field>
        </div>
        <Field label="Key details to highlight">
          <textarea value={form.details} onChange={set('details')} placeholder="Brand, size, color, features, flaws, reason for selling…" />
        </Field>
        <div className="photo-folder-box">
          <p className="photo-folder-title">📁 Photo folder path</p>
          <p className="photo-folder-hint">Save photos to a folder, paste the path here. Cowork uses this to find and upload photos automatically.</p>
          <input
            type="text" value={form.photoFolder} onChange={set('photoFolder')}
            placeholder="e.g. ~/Resale/Nike Air Force 1  or  C:\Resale\Nike Air Force 1"
            style={{ fontFamily: 'monospace', fontSize: 12 }}
          />
          <p className="photo-folder-tip">Tip: Keep a <code>Resale/</code> folder on your Desktop with a subfolder per item.</p>
        </div>
      </Card>

      <Card>
        <CardTitle>Delivery options</CardTitle>
        {DELIVERY_OPTIONS.map((opt) => (
          <label key={opt.id} className={`delivery-opt${selectedDelivery.includes(opt.id) ? ' selected' : ''}`}
            onClick={() => toggleDelivery(opt.id)}>
            <div className="delivery-top">
              <input type="checkbox" value={opt.id} checked={selectedDelivery.includes(opt.id)} onChange={() => {}} />
              <span className="delivery-label">{opt.label}</span>
              {opt.tag && <span className={`delivery-tag tag-${opt.tagColor}`}>{opt.tag}</span>}
            </div>
            <p className="delivery-desc">{opt.desc}</p>
          </label>
        ))}
        {selectedDelivery.length > 0 && (
          <div className="delivery-summary">
            <span className="delivery-summary-label">Your listing will say: </span>
            <span className="delivery-summary-text">"{buildDeliveryText(selectedDelivery)}"</span>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>Choose platforms</CardTitle>
        <div className="platform-grid">
          {PLATFORMS.map((pf) => (
            <label key={pf.id} className={`pf-check${selectedPlatforms.includes(pf.name) ? ' selected' : ''}`}>
              <input type="checkbox" checked={selectedPlatforms.includes(pf.name)}
                onChange={() => togglePf(pf.name)} />
              <Badge label={pf.name} />
              {pf.name === 'Facebook Marketplace' && <span className="pf-note">Manual</span>}
            </label>
          ))}
        </div>
        {status.msg && <Alert type={status.type === 'ok' ? 'ok' : status.type === 'err' ? 'err' : 'info'}>{status.msg}</Alert>}
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Generating…' : '✦ Generate AI listings & save item'}
        </Button>
      </Card>

      {listings && (
        <div>
          {Object.entries(listings).map(([platform, { title, desc }]) => (
            <Card key={platform}>
              <div className="listing-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge label={platform} />
                  {platform === 'Facebook Marketplace' && <span style={{ fontSize: 11, color: 'var(--text2)' }}>Guided posting</span>}
                </div>
                <a href={DEEP_LINKS[platform] || '#'} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant={platform === 'Facebook Marketplace' ? 'fb' : 'default'}>
                    Open {platform.replace(' Marketplace', '')} ↗
                  </Button>
                </a>
              </div>

              {platform === 'Facebook Marketplace' && (
                <div className="fb-guide">
                  <p className="fb-guide-title">How to post on Facebook Marketplace</p>
                  <ol className="fb-steps">
                    <li>Copy description → click "Open FB Marketplace" above</li>
                    <li>Click "Create new listing" → "Item for sale"</li>
                    <li>Add your photos first</li>
                    <li>Paste the title and description</li>
                    <li>Set price: ${form.price} · Category: {form.cat}</li>
                    <li>Set location → Publish</li>
                  </ol>
                </div>
              )}

              {title && <><p className="listing-field-label">Title</p><CopyBox text={title} /></>}
              <p className="listing-field-label">Description</p>
              <CopyBox text={desc} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
