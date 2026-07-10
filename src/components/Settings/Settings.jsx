import React, { useState } from 'react'
import { useStore } from '../../store'
import { downloadCSV } from '../../services/googleSheets'
import { Card, CardTitle, Button, Alert, Field } from '../shared'

export default function Settings() {
  const apiKey       = useStore((s) => s.apiKey)
  const userLocation = useStore((s) => s.userLocation)
  const setApiKey    = useStore((s) => s.setApiKey)
  const setUserLocation = useStore((s) => s.setUserLocation)
  const items        = useStore((s) => s.items)

  const [keyInput, setKeyInput]     = useState(apiKey)
  const [locInput, setLocInput]     = useState(userLocation)
  const [keyAlert, setKeyAlert]     = useState({ type: '', msg: '' })
  const [locAlert, setLocAlert]     = useState({ type: '', msg: '' })

  function saveKey() {
    if (!keyInput.trim()) { setKeyAlert({ type: 'err', msg: 'Enter a key first.' }); return }
    setApiKey(keyInput.trim())
    setKeyAlert({ type: 'ok', msg: 'API key saved!' })
    setTimeout(() => setKeyAlert({ type: '', msg: '' }), 3000)
  }
  function clearKey() {
    if (!window.confirm('Clear your API key?')) return
    setApiKey(''); setKeyInput('')
    setKeyAlert({ type: 'info', msg: 'API key cleared.' })
  }
  function saveLoc() {
    setUserLocation(locInput.trim())
    setLocAlert({ type: 'ok', msg: 'Location saved!' })
    setTimeout(() => setLocAlert({ type: '', msg: '' }), 2000)
  }
  function clearAll() {
    if (!window.confirm('Delete ALL your items, offers, and sales data? This cannot be undone.\n\nExport first?')) return
    localStorage.removeItem('resale-hub-store')
    window.location.reload()
  }

  return (
    <div>
      <h1 className="page-title">Settings</h1>

      <Card>
        <CardTitle>Anthropic API key</CardTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          Required for AI listing generation and price research. Stored locally in your browser only — never sent anywhere except directly to Anthropic.
        </p>
        <Field label="API Key">
          <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="sk-ant-…" />
        </Field>
        {keyAlert.msg && <Alert type={keyAlert.type || 'info'}>{keyAlert.msg}</Alert>}
        <div className="btn-row">
          <Button variant="primary" onClick={saveKey}>Save key</Button>
          <Button variant="danger"  onClick={clearKey}>Clear</Button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
          Get your key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info-txt)' }}>console.anthropic.com</a> → API Keys.
          Costs ~$0.01–0.02 per listing generation or price lookup.
        </p>
      </Card>

      <Card>
        <CardTitle>Your location</CardTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          Used for the "drive to buyer" delivery option and Cowork sessions. General area only — never your exact address.
        </p>
        <Field label="General area or zip code">
          <input value={locInput} onChange={(e) => setLocInput(e.target.value)} placeholder="e.g. Manvel TX  or  77578" />
        </Field>
        {locAlert.msg && <Alert type={locAlert.type || 'ok'}>{locAlert.msg}</Alert>}
        <Button onClick={saveLoc}>Save location</Button>
      </Card>

      <Card>
        <CardTitle>Data management</CardTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
          All data is stored locally in this browser. Export before clearing.
        </p>
        <div className="btn-row">
          <Button onClick={() => downloadCSV(items)}>⬇ Export all data (CSV)</Button>
          <Button variant="danger" onClick={clearAll}>🗑 Clear all data</Button>
        </div>
      </Card>

      <Card>
        <CardTitle>About</CardTitle>
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          Resale Hub v4.0 · Built with React + Vite · Hosted on GitHub Pages<br />
          Platforms: Facebook Marketplace, eBay, Poshmark, Mercari, Depop<br />
          AI powered by Anthropic Claude · Data stored locally in your browser
        </p>
      </Card>
    </div>
  )
}
