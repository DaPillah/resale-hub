import React from 'react'
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { ShoppingBag, LayoutDashboard, Plus, Package, MessageSquare, CheckSquare, Search, BarChart2, Table, Settings } from 'lucide-react'
import { useStore } from './store'
import { fmt } from './services/platforms'

import Dashboard from './components/Dashboard/Dashboard'
import AddItem from './components/AddItem/AddItem'
import Inventory from './components/Inventory/Inventory'
import Negotiations from './components/Negotiations/Negotiations'
import PostingKit from './components/PostingKit/PostingKit'
import PriceResearch from './components/PriceResearch/PriceResearch'
import PlatformIntel from './components/PlatformIntel/PlatformIntel'
import Sheets from './components/Sheets/Sheets'
import SettingsPage from './components/Settings/Settings'

import './App.css'

const NAV = [
  { section: 'Overview' },
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { section: 'Selling' },
  { to: '/add',       icon: Plus,            label: 'Add & post item' },
  { to: '/inventory', icon: Package,         label: 'My inventory' },
  { to: '/negotiate', icon: MessageSquare,   label: 'Negotiations' },
  { to: '/kit',       icon: CheckSquare,     label: 'Posting kits' },
  { section: 'Research' },
  { to: '/price',     icon: Search,          label: 'Price research' },
  { section: 'Analytics' },
  { to: '/intel',     icon: BarChart2,       label: 'Platform intel' },
  { section: 'Data' },
  { to: '/sheets',    icon: Table,           label: 'Google Sheets' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
]

function Header() {
  const items = useStore((s) => s.items)
  const sold = items.filter((i) => i.status === 'Sold')
  const listed = items.filter((i) => i.status === 'Listed')
  const revenue = sold.reduce((s, i) => s + Number(i.price || 0), 0)
  return (
    <header className="app-header">
      <div className="logo">
        <ShoppingBag size={20} color="#639922" />
        Resale Hub
      </div>
      <span className="header-sub">
        {sold.length} sold · {listed.length} listed · {fmt(revenue)} revenue
      </span>
    </header>
  )
}

function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      {NAV.map((item, i) =>
        item.section ? (
          <div key={i} className="nav-section">{item.section}</div>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        )
      )}
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter basename="/resale-hub">
      <Header />
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/add"       element={<AddItem />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/negotiate" element={<Negotiations />} />
            <Route path="/kit"       element={<PostingKit />} />
            <Route path="/price"     element={<PriceResearch />} />
            <Route path="/intel"     element={<PlatformIntel />} />
            <Route path="/sheets"    element={<Sheets />} />
            <Route path="/settings"  element={<SettingsPage />} />
            <Route path="*"          element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
