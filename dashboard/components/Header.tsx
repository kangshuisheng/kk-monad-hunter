'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Plus, Upload, Download, RefreshCw, Sun, Moon, MoreVertical, Trash2 } from 'lucide-react'
import { isAddress } from 'viem'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    if (isDark) { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); setIsDark(false) }
    else { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); setIsDark(true) }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Monad Hunter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Ecosystem Matrix & Airdrop Tracker
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchData()}
            disabled={isLoading}
            className={`transition-all ${isLoading ? 'animate-spin' : ''}`}
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowBatch(true)}>
                <Upload className="w-4 h-4 mr-2" /> Batch Import
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportAll}>
                <Download className="w-4 h-4 mr-2" /> Export All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportUnhealthy}>
                <Download className="w-4 h-4 mr-2" /> Export Unhealthy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Wallet Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex-1 w-full md:w-auto flex items-center gap-2">
          <Input
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="Paste wallet address (0x...)"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            className="flex-1 font-mono text-sm"
          />
          <Button onClick={handleAdd} disabled={isLoading || !isAddress(inputAddress)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {showBatch && (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Batch Import</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowBatch(false)}><Trash2 className="w-4 h-4" /></Button>
          </div>
          <Textarea
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            placeholder="Paste multiple addresses, one per line"
            className="font-mono text-xs min-h-[100px]"
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleBatchImport} size="sm">Import Addresses</Button>
          </div>
        </div>
      )}
    </div>
  )
}
