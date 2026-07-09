import React, { useState } from 'react'
import { useStore } from '../../store'
import { testConnection, pullFromSheets, downloadCSV, copyForSheets } from '../../services/googleSheets'
import { Card, CardTitle, Button, Alert, Field } from '../shared'

export default function Sheets() {
  const items        = useStore((s) => s.items)
  const sheetId      = useStore((s) => s.sheetId)
  const sheetApiKey  = useStore((s) => s.sheetApiKey)
  const setSheetId   = useStore((s) => s.setSheetId)
  const setSheetApiKey = useStore((s) => s.setSheetApiKey)
  const addItem      = useStore((s) => s.addItem)

  const [localId, setLocalId]   = useState(sheetId)
  const [localKey, setLocalKey] = useState(sheetApiKey)
  const [status, setStatus]     = useState({ type: '', msg: '' })
  const [connected, setConnected] = useState(!!sheetId)
  const [connectedName, setConnectedName] = useState('')

  async function handleTest() {
    if (!localId || !localKey) { setStatus({ type: 'err', msg: 'Enter both Sheet ID and API key.' }); return }
    setStatus({ type: 'info', msg: 'Testing…' })
    try {
      const name = await testConnection(localId, localKey)
      setConnected(true); setConnectedName(name)
      setSheetId(localId); setSheetApiKey(localKey)
      setStatus({ type: 'ok', msg: `Connected to "${name}"!` })
    } catch (e) { setStatus({ type: 'err', msg: e.message }) }
  }

  async function handlePull() {
    setStatus({ type: 'info', msg: 'Fetching…' })
    try {
      const pulled = await pullFromSheets(localId, localKey)
      pulled.forEach((item) => addItem(item))
      setStatus({ type: 'ok', msg: `Pulled ${pulled.length} rows from Sheets.` })
    } catch (e) { setStatus({ type: 'err', msg: e.message }) }
  }

  async function handleCopy() {
    await copyForSheets(items)
    setStatus({ type: 'ok', msg: 'Copied! Open Google Sheets, click a cell, and press Ctrl+V (Cmd+V on Mac).' })
  }

  return (
    <div>
      <h1 className="page-title">Google Sheets sync</h1>

      <Card>
        <CardTitle>Connection</CardTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderRadius: 'var(--radius)', border: '0.5px solid var(--border)', marginBottom: 14, fontSize: 13 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: connected ? '#639922' : '#888780', flexShrink: 0 }} />
          {connected ? `Connected to "${connectedName || sheetId}"` : 'Not connected — enter credentials below'}
        </div>
        <div className="g2">
          <Field label="Google Sheet ID" hint="from the URL: /spreadsheets/d/SHEET_ID/edit">
            <input value={localId} onChange={(e) => setLocalId(e.target.value)} placeholder="1BxiMVs0XRA5nFMdKvBdBZ…" />
          </Field>
          <Field label="Google API Key" hint="from console.cloud.google.com">
            <input type="password" value={localKey} onChange={(e) => setLocalKey(e.target.value)} placeholder="AIza…" />
          </Field>
        </div>
        {status.msg && <Alert type={status.type || 'info'}>{status.msg}</Alert>}
        <div className="btn-row">
          <Button variant="info" onClick={handleTest}>Test connection</Button>
          <Button variant="ok"   onClick={handlePull}>Pull from Sheets</Button>
        </div>
      </Card>

      <Card>
        <CardTitle>Setup guide (3 steps)</CardTitle>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <p><strong>1. Create your Sheet</strong> — New Google Sheet. Copy the ID from the URL bar (the long string between /d/ and /edit).</p>
          <p><strong>2. Get an API key</strong> — Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info-txt)' }}>console.cloud.google.com</a>, enable the Google Sheets API, create an API key under Credentials.</p>
          <p><strong>3. Share the sheet</strong> — Click Share → "Anyone with the link" → Viewer. This lets the API key read it.</p>
          <p style={{ color: 'var(--text2)', marginTop: 6 }}>Note: For write access, Google requires OAuth 2.0. The export/import flow below works without OAuth.</p>
        </div>
      </Card>

      <Card>
        <CardTitle>Export &amp; import</CardTitle>
        <div className="btn-row">
          <Button onClick={() => downloadCSV(items)}>⬇ Download CSV</Button>
          <Button onClick={handleCopy}>Copy for paste</Button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginTop: 10 }}>
          In Google Sheets: File → Import → Upload → select the CSV. Or use "Copy for paste" and Ctrl+V into any open Sheet.
        </p>
      </Card>
    </div>
  )
}
