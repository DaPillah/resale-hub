import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../../store'
import { fmt, calcDropPrice, hoursUntilDrop, PLATFORMS, deliveryLabel } from '../../services/platforms'
import { Card, CardTitle, Badge, Button, Alert, Empty } from '../shared'
import './PostingKit.css'

const DEEP_LINKS = Object.fromEntries(PLATFORMS.map((p) => [p.name, p.sellUrl]))

function CopyBox({ text, multiline }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="kit-copy-row">
      {multiline ? <pre className="kit-copy-box">{text}</pre> : <div className="kit-copy-box">{text}</div>}
      <Button size="sm" onClick={copy} className="kit-copy-btn">{copied ? '✓' : 'Copy'}</Button>
    </div>
  )
}

export default function PostingKit() {
  const items  = useStore((s) => s.items)
  const userLocation = useStore((s) => s.userLocation)
  const togglePosted = useStore((s) => s.togglePosted)
  const location = useLocation()
  const [selectedId, setSelectedId] = useState(location.state?.itemId || '')
  const [openPlatforms, setOpenPlatforms] = useState({})

  useEffect(() => {
    if (location.state?.itemId) setSelectedId(location.state.itemId)
  }, [location.state])

  const listed = items.filter((i) => i.status === 'Listed')
  const item = items.find((i) => i.id === selectedId)

  const togglePlatform = (p) => setOpenPlatforms((prev) => ({ ...prev, [p]: !prev[p] }))

  const FB_NAME = 'Facebook Marketplace'
  const postedPlatforms = item ? (item.postedPlatforms || []) : []
  const automatedPlatforms = item ? (item.platforms || []).filter((p) => p !== FB_NAME && !postedPlatforms.includes(p)) : []
  const hasFB = item ? (item.platforms || []).includes(FB_NAME) && !postedPlatforms.includes(FB_NAME) : false
  const missingListings = item ? (item.platforms || []).filter((p) => !item.listings?.[p]?.desc) : []

  const coworkBrief = item ? `=== RESALE HUB — POSTING KIT ===
Item: ${item.name}
Category: ${item.cat} | Condition: ${item.cond}
Brand: ${item.brand || 'Not specified'} | Size: ${item.size || 'Not specified'} | Color: ${item.color || 'Not specified'}
Price: ${fmt(item.price)} | Drop to: ${fmt(calcDropPrice(item.price))} after 2 days
Delivery: ${deliveryLabel(item.delivery)}
Location: ${userLocation || 'Not set — ask the user for their general area/zip before submitting any form that requires one'}
Photo folder: ${item.photoFolder || 'NOT SET — add in inventory'}

PLATFORMS TO POST ON: ${(item.platforms || []).join(', ')}
${postedPlatforms.length > 0 ? `ALREADY POSTED (skip — do not repost): ${postedPlatforms.join(', ')}\n` : ''}${missingListings.length > 0 ? `\nNO LISTING COPY GENERATED YET FOR: ${missingListings.join(', ')} — do not invent a title/description for these, go back to Add & Post Item and generate copy first\n` : ''}
${Object.entries(item.listings || {}).map(([p, l]) =>
`--- ${p.toUpperCase()}${postedPlatforms.includes(p) ? ' (ALREADY POSTED — SKIP)' : ''} ---
URL: ${DEEP_LINKS[p] || 'no direct link on file — search for their sell/create listing page'}
Title: ${l.title || ''}
Description:
${l.desc || ''}`).join('\n\n')}

=== INSTRUCTIONS FOR COWORK ===
${automatedPlatforms.length > 0 ? `Automate these platforms one at a time, finishing all steps for one before starting the next: ${automatedPlatforms.join(', ')}
1. Open the URL listed above for that platform
2. Fill in the title and description exactly as written above
3. Set price to ${fmt(item.price)}
4. If the platform has separate Brand / Size / Color fields, fill them in directly using the values above (skip any marked "Not specified") rather than parsing them out of the title or description
5. Set condition to the closest equivalent to "${item.cond}" — platforms use their own condition wording, so pick the nearest match rather than requiring an exact string
6. Set category to the closest equivalent to "${item.cat}" — this app's categories are broad, so pick whatever specific category the platform offers that best fits, rather than expecting an exact match
7. Delivery: ${deliveryLabel(item.delivery)}. Only "local pickup" and "shipping" are usually real form toggles — "drive to buyer" is informational only (it's already worked into the description) and won't have its own field
8. If the platform asks for your location/zip, use: ${userLocation || '[not set — ask the user]'}
9. ${item.photoFolder ? `Upload ALL photos from ${item.photoFolder} (best shot first)` : 'No photo folder is set — pause and ask the user for photos directly rather than searching for a folder'}
10. If a required field isn't covered by anything above, stop and ask the user rather than guessing
11. DO NOT publish — stop and show the user the preview for review
12. Once the user confirms it's live, check that platform's "Posted" box on this Posting Kit page before moving to the next platform or item
` : ''}${hasFB ? `
--- FACEBOOK MARKETPLACE: MANUAL ONLY, DO NOT AUTOMATE ---
Facebook aggressively flags automated browsing and can lock accounts over it. Do not control the browser on Facebook Marketplace. Instead, walk the user through posting it themselves:
- Give them the title and description above to paste in
- Tell them the price, condition, and delivery to set
- Remind them to upload photos from ${item.photoFolder || '[photo folder not set — ask them for photos]'}, best shot first
- Once they confirm it's live, check Facebook Marketplace's "Posted" box on this Posting Kit page
` : ''}${automatedPlatforms.length === 0 && !hasFB ? 'Every selected platform is already marked posted — nothing to do for this item.\n' : ''}` : ''

  return (
    <div>
      <h1 className="page-title">Posting kits</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
        Everything needed to post an item — copy, photos path, platform links. Copy the Cowork brief to hand off posting to Claude automatically.
      </p>

      <Card>
        <CardTitle>Select item</CardTitle>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ maxWidth: 400 }}>
          <option value="">Choose a listed item…</option>
          {listed.map((i) => <option key={i.id} value={i.id}>{i.name} ({fmt(i.price)})</option>)}
        </select>
      </Card>

      {item ? (
        <>
          <Card>
            <div className="kit-item-header">
              <div>
                <p style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {[item.cat, item.cond, fmt(item.price), item.brand, item.size, item.color].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--text2)' }}>Price drop in</p>
                <p className={`kit-hrs ${hoursUntilDrop(item.date) <= 0 ? 'urgent' : ''}`}>
                  {hoursUntilDrop(item.date) <= 0 ? 'Now!' : `${hoursUntilDrop(item.date)}h`}
                </p>
              </div>
            </div>

            <div className="kit-stats">
              <div className="kit-stat"><p className="kit-stat-l">Asking price</p><p className="kit-stat-v" style={{ color: 'var(--green)' }}>{fmt(item.price)}</p></div>
              <div className="kit-stat"><p className="kit-stat-l">Drop to (2 days)</p><p className="kit-stat-v" style={{ color: '#BA7517' }}>{fmt(calcDropPrice(item.price))}</p></div>
              <div className="kit-stat"><p className="kit-stat-l">Delivery</p><p style={{ fontSize: 12, fontWeight: 500 }}>{deliveryLabel(item.delivery)}</p></div>
              <div className="kit-stat"><p className="kit-stat-l">Platforms</p><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>{(item.platforms || []).map((p) => (
                <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 2, opacity: postedPlatforms.includes(p) ? 0.6 : 1 }}>
                  <Badge label={p} />
                  {postedPlatforms.includes(p) && <span style={{ fontSize: 11, color: 'var(--ok-txt)' }} title="Already posted">✓</span>}
                </span>
              ))}</div></div>
            </div>

            <div className="kit-section">
              <p className="kit-section-label">📁 Photo folder</p>
              {item.photoFolder
                ? <div className="folder-path">{item.photoFolder}</div>
                : <Alert type="warn">No photo folder set. Edit the item in inventory to add one.</Alert>
              }
            </div>

            {missingListings.length > 0 && (
              <Alert type="warn">No listing copy generated yet for {missingListings.join(', ')} — go to Add &amp; post item to generate it before using this kit, otherwise Cowork has no title/description to work from for {missingListings.length > 1 ? 'those platforms' : 'that platform'}.</Alert>
            )}
          </Card>

          <Card>
            <CardTitle>Platform listings</CardTitle>
            {Object.keys(item.listings || {}).length === 0
              ? <Alert type="warn">No listings generated yet. Go to Add &amp; post item to generate them.</Alert>
              : Object.entries(item.listings).map(([platform, { title, desc }]) => (
                <div key={platform} className="platform-accordion">
                  <div className="platform-accordion-header" onClick={() => togglePlatform(platform)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge label={platform} /></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text2)' }}
                        onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={postedPlatforms.includes(platform)}
                          onChange={() => togglePosted(item.id, platform)} />
                        Posted
                      </label>
                      <a href={DEEP_LINKS[platform] || '#'} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}>
                        <Button size="sm">Open {platform.replace(' Marketplace', '')} ↗</Button>
                      </a>
                      <span style={{ fontSize: 14, color: 'var(--text2)' }}>{openPlatforms[platform] ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {openPlatforms[platform] && (
                    <div className="platform-accordion-body">
                      {title && <><p className="kit-field-label">Title</p><CopyBox text={title} /></>}
                      <p className="kit-field-label">Description</p>
                      <CopyBox text={desc} multiline />
                    </div>
                  )}
                </div>
              ))
            }
          </Card>

          <Card>
            <CardTitle>🤖 Cowork brief — copy &amp; paste into Cowork</CardTitle>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              Paste this into Cowork (Claude Desktop) and say "post this item to [platform]." Cowork will handle the form, find your photos, and wait for your review before publishing.
            </p>
            <CopyBox text={coworkBrief} multiline />
          </Card>

          <Card>
            <CardTitle>How to use with Cowork</CardTitle>
            <div className="cowork-guide">
              {[
                ['1. Copy the brief above', 'Click the Copy button on the Cowork brief.'],
                ['2. Open Cowork (Claude Desktop)', 'Starting a new session? Paste cowork/cowork_prompt.md first — it gives Cowork your platforms, delivery options, pricing strategy, and safety rules, and only needs to be pasted once. Continuing an existing session that already has it loaded? Skip straight to step 3.'],
                ['3. Paste and give the instruction', 'Paste the brief, then say: "Post this item to eBay" (or whichever platform).'],
                ['4. Watch Cowork work', 'It will open each platform, fill in the form fields, navigate to your photo folder, and upload photos. Facebook Marketplace is handled manually — Cowork will walk you through posting it yourself instead of automating the browser.'],
                ['5. Review and publish', 'Cowork will stop and show you the listing preview. You click Publish when it looks good.'],
                ['6. Check it off', 'Once it\'s live, check that platform\'s "Posted" box below (or ask Cowork to) so it\'s skipped next time — this matters if you ever ask Cowork to go through several items in one sweep.'],
              ].map(([title, desc]) => (
                <div key={title} className="cowork-step">
                  <p className="cowork-step-title">{title}</p>
                  <p className="cowork-step-desc">{desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card><Empty>Select a listed item above to view its posting kit</Empty></Card>
      )}
    </div>
  )
}
