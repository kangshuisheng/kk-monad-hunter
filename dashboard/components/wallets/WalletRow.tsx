"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, Check, X, AlertTriangle, Clock } from "lucide-react";
import { PROTOCOLS } from "@/lib/config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WalletRow({
  wallet,
  walletData,
  explorerBase,
  onRemove,
  onCopyAddress,
}: any) {
  const txCount = walletData?.txCount ?? 0;

  // Cooldown Timer Logic
  const lastActiveMs = walletData?.lastActive;
  let activeStatus = { label: "Unknown", color: "bg-slate-100 text-slate-500", icon: <Clock className="w-3 h-3" /> };

  if (lastActiveMs) {
    const diff = Date.now() - lastActiveMs;
    const hours = diff / (1000 * 60 * 60);
    const days = hours / 24;

    if (hours < 24) {
      activeStatus = { label: "Done", color: "bg-green-100 text-green-700 border-green-200", icon: <Check className="w-3 h-3" /> };
    } else if (days < 3) {
      activeStatus = { label: "Cooling", color: "bg-blue-50 text-blue-600 border-blue-100", icon: <Clock className="w-3 h-3" /> };
    } else if (days > 7) {
      activeStatus = { label: "Wake Up", color: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="w-3 h-3" /> };
    } else {
      activeStatus = { label: "Ready", color: "bg-yellow-50 text-yellow-600 border-yellow-100", icon: <Clock className="w-3 h-3" /> };
    }
  }

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
      <TableCell className="font-mono text-xs">
        <div className="flex items-center gap-2">
          <span
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => onCopyAddress(wallet)}
          >
            {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => onCopyAddress(wallet)}>
              <Copy className="w-3 h-3" />
            </Button>
            <a href={`${explorerBase}/address/${wallet}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500">
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </TableCell>

      <TableCell className="font-medium">
        {walletData?.nativeBalance
          ? parseFloat(walletData.nativeBalance).toFixed(3)
          : "-"}
      </TableCell>

      {/* Ecosystem Matrix Cells */}
      {PROTOCOLS.map((p) => {
        const pData = walletData?.protocols?.[p.name];
        const isActive = pData?.active;
        const balance = pData?.balance && pData.balance !== "0" ? parseFloat(pData.balance).toFixed(2) : null;

        return (
          <TableCell key={p.name} className="text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              {isActive ? (
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
                  <Check className="w-3 h-3" />
                  {balance && <span>{balance}</span>}
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => window.open(p.actions[0].url, '_blank')}
                      >
                        Go
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Interact with {p.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </TableCell>
        );
      })}

      <TableCell className="font-medium text-center">{txCount}</TableCell>

      <TableCell>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${activeStatus.color}`}>
          {activeStatus.icon}
          {activeStatus.label}
        </div>
      </TableCell>

      <TableCell>
        <Badge
          variant="outline"
          className={`${walletData?.healthLabel?.includes("🟢")
            ? "bg-green-50 text-green-700 border-green-200"
            : walletData?.healthLabel?.includes("🟡")
              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
              : "bg-red-50 text-red-700 border-red-200"
            }`}
        >
          {walletData?.healthScore ?? 0}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(wallet)}
          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
