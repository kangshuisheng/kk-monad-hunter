'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Download, RefreshCw, Sun, Moon } from 'lucide-react'
import { isAddress } from 'viem'
import { toast } from 'sonner'

type Props = {
  isLoading: boolean
  addWallet: (a: string) => void
  addMultipleWallets: (a: string[]) => void
  fetchData: () => void
  getAllWallets: () => string[]
  getUnhealthyWallets: () => string[]
  isDark: boolean | null
  setIsDark: (v: boolean | null) => void
}

export default function Header({ isLoading, addWallet, addMultipleWallets, fetchData, getAllWallets, getUnhealthyWallets, isDark, setIsDark }: Props) {
  const [inputAddress, setInputAddress] = useState('')
  const [batchInput, setBatchInput] = useState('')
  const [showBatch, setShowBatch] = useState(false)

  const handleAdd = () => {
    if (!inputAddress) return toast.error('Address is empty')
    if (isAddress(inputAddress)) {
      addWallet(inputAddress)
      setInputAddress('')
      toast.success('Wallet added')
    } else {
      toast.error('Invalid wallet address')
    }
  }

  const handleBatchImport = () => {
    const lines = batchInput.split('\n').map((l) => l.trim()).filter(Boolean)
    const valids = lines.filter(l => isAddress(l))
    const invalidCount = lines.length - valids.length
    if (valids.length > 0) {
      addMultipleWallets(valids)
      setBatchInput('')
      setShowBatch(false)
      toast.success(`Added ${valids.length} wallet(s)${invalidCount ? `, skipped ${invalidCount} invalid` : ''}`)
    } else {
      toast.error('No valid addresses found')
    }
  }

  const handleExportAll = async () => {
    const list = getAllWallets()
    if (list.length === 0) return toast.error('No wallets to export')
    try { await navigator.clipboard.writeText(list.join('\n')); toast.success('Copied addresses to clipboard') } catch { toast.error('Copy failed') }
  }

  const handleExportUnhealthy = async () => {
    const list = getUnhealthyWallets()
    if (list.length === 0) return toast.info('All wallets are healthy')
    try { await navigator.clipboard.writeText(list.join('\n')); toast.success('Copied unhealthy addresses') } catch { toast.error('Copy failed') }
  }

  const toggleTheme = () => {
    if (isDark === null) return
    if (isDark) { document.documentElement.classList.remove('dark'); localStorage.setItem('theme','light'); setIsDark(false) }
    else { document.documentElement.classList.add('dark'); localStorage.setItem('theme','dark'); setIsDark(true) }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">Monad Wallet Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Track balances, staking positions and wallet health on Monad mainnet.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full md:w-auto">
        <div className="flex items-center gap-2">
          <Input
            aria-label="Address input"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="0x..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            className="w-64"
          />
          <Button onClick={handleAdd} disabled={isLoading || !isAddress(inputAddress)} title="Add wallet">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setShowBatch(s => !s)} title="Batch import">
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button variant="outline" onClick={handleExportAll} title="Export addresses">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button variant="ghost" onClick={handleExportUnhealthy} title="Export unhealthy wallets">
            Export Unhealthy
          </Button>
          <Button variant="ghost" onClick={() => fetchData()} title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {showBatch && (
          <div className="w-full md:w-96 mt-2 md:mt-0">
            <Textarea value={batchInput} onChange={(e) => setBatchInput(e.target.value)} placeholder={`One address per line`} className="w-full" />
            <div className="flex items-center gap-2 mt-2 justify-end">
              <Button onClick={handleBatchImport}>Import</Button>
              <Button variant="ghost" onClick={() => { setBatchInput(''); setShowBatch(false) }}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
