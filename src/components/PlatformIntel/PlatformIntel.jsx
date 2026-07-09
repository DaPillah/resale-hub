import React from 'react'
import { useStore } from '../../store'
import { fmt, CAT_COLORS, PLATFORM_MAP } from '../../services/platforms'
import { Card, CardTitle, Badge, Empty, BarRow } from '../shared'

const ALL_PF = ['Facebook Marketplace','eBay','Poshmark','Mercari','Depop','OfferUp']

export default function PlatformIntel() {
  const items = useStore((s) => s.items)
  const sold  = items.filter((i) => i.status === 'Sold' && i.soldOn)

  const pfStats = ALL_PF.map((p) => {
    const listed = items.filter((i) => (i.platforms || []).includes(p)).length
    const soldOn = sold.filter((i) => i.soldOn === p).length
    const rev    = sold.filter((i) => i.soldOn === p).reduce((s, i) => s + Number(i.price || 0), 0)
    const rate   = listed ? Math.round((soldOn / listed) * 100) : 0
    return { p, listed, soldOn, rev, rate }
  }).filter((s) => s.listed > 0).sort((a, b) => b.rev - a.rev)

  const maxRev  = Math.max(...pfStats.map((s) => s.rev), 1)
  const maxRate = Math.max(...pfStats.map((s) => s.rate), 1)
  const cats    = [...new Set(items.map((i) => i.cat).filter(Boolean))]
  const pfUsed  = ALL_PF.filter((p) => items.some((i) => (i.platforms || []).includes(p)))
  const multi   = items.filter((i) => (i.platforms || []).length > 1 && i.status === 'Listed')

  return (
    <div>
      <h1 className="page-title">Platform intel</h1>

      <Card>
        <CardTitle>Platform performance — where items actually sell</CardTitle>
        {pfStats.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Platform</th><th>Listed</th><th>Sold</th><th>Revenue</th><th>Sell rate</th></tr></thead>
              <tbody>
                {pfStats.map(({ p, listed, soldOn, rev, rate }) => (
                  <tr key={p}>
                    <td><Badge label={p} /></td>
                    <td>{listed}</td>
                    <td>{soldOn}</td>
                    <td style={rev === Math.max(...pfStats.map((s) => s.rev)) ? { fontWeight: 600, color: 'var(--ok-txt)' } : {}}>{fmt(rev)}</td>
                    <td style={rate === maxRate ? { fontWeight: 600, color: 'var(--ok-txt)' } : {}}>{rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>Mark items as sold to see platform performance</Empty>}
      </Card>

      <Card>
        <CardTitle>Category × platform sell rate matrix</CardTitle>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 11 }}>Green = best sell rate for that category</p>
        {cats.length && pfUsed.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  {pfUsed.map((p) => <th key={p} style={{ textAlign: 'center' }}>{p.replace(' Marketplace', '')}</th>)}
                </tr>
              </thead>
              <tbody>
                {cats.map((cat) => {
                  const rates = pfUsed.map((p) => {
                    const l = items.filter((i) => i.cat === cat && (i.platforms || []).includes(p)).length
                    const s = sold.filter((i) => i.cat === cat && i.soldOn === p).length
                    return l ? Math.round((s / l) * 100) : null
                  })
                  const maxR = Math.max(...rates.filter((r) => r !== null), 0)
                  return (
                    <tr key={cat}>
                      <td><strong>{cat}</strong></td>
                      {rates.map((r, i) => (
                        <td key={i} style={{ textAlign: 'center', fontWeight: r === maxR && r > 0 ? 600 : undefined, color: r === null ? 'var(--text2)' : r === maxR && r > 0 ? 'var(--ok-txt)' : undefined }}>
                          {r === null ? '—' : `${r}%`}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <Empty>List and sell items on multiple platforms to see this matrix</Empty>}
      </Card>

      <Card>
        <CardTitle>Items listed on multiple platforms</CardTitle>
        {multi.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Listed on</th><th>Price</th></tr></thead>
              <tbody>
                {multi.map((i) => (
                  <tr key={i.id}>
                    <td><strong>{i.name}</strong></td>
                    <td>{(i.platforms || []).map((p) => <Badge key={p} label={p} />)}</td>
                    <td>{fmt(i.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>No items currently listed on multiple platforms</Empty>}
      </Card>
    </div>
  )
}
