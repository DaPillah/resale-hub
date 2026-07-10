import React from 'react'
import clsx from 'clsx'
import './shared.css'

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_CLASS = {
  'Facebook Marketplace': 'b-fb', eBay: 'b-eb', Poshmark: 'b-pm',
  Mercari: 'b-mc', Depop: 'b-dp',
  Sold: 'b-sold', Listed: 'b-listed', Draft: 'b-draft',
}

export function Badge({ label, variant }) {
  const cls = variant ? `b-${variant}` : (BADGE_CLASS[label] || 'b-ot')
  const short = label === 'Facebook Marketplace' ? 'FB Marketplace' : label
  return <span className={clsx('badge', cls)}>{short}</span>
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'default', size = 'md', className, ...props }) {
  return (
    <button className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)} {...props}>
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, noPad, ...props }) {
  return (
    <div className={clsx('card', noPad && 'card-nopad', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children }) {
  return <p className="card-title">{children}</p>
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ children, type = 'info' }) {
  if (!children) return null
  return <div className={clsx('alert', `alert-${type}`)}>{children}</div>
}

// ── Metric ────────────────────────────────────────────────────────────────────
export function Metric({ label, value, sub }) {
  return (
    <div className="metric">
      <p className="metric-l">{label}</p>
      <p className="metric-v">{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  )
}

// ── Bar chart row ─────────────────────────────────────────────────────────────
export function BarRow({ label, value, max, color, displayVal }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="bar-row">
      <span className="bar-label">{label.replace(' Marketplace', '')}</span>
      <div className="bar-bg">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="bar-val">{displayVal}</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ children }) {
  return <div className="empty">{children}</div>
}

// ── Form fields ───────────────────────────────────────────────────────────────
export function Field({ label, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {hint && <span className="field-hint">{hint}</span>}
      </label>
      {children}
    </div>
  )
}
