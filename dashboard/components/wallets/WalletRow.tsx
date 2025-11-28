"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export default function WalletRow({
  wallet,
  walletData,
  visibleTokenColumns,
  explorerBase,
  expanded,
  onToggleExpand,
  onRemove,
  onCopyAddress,
}: any) {
  const txCount = walletData?.txCount ?? 0;
  const lastActive = walletData?.lastActive
    ? new Date(walletData.lastActive).toLocaleString()
    : null;

  return (
    <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
      <TableCell
        className="font-mono text-xs md:text-sm cursor-pointer group"
        onClick={() => onCopyAddress(wallet)}
        title="Click to copy"
      >
        <div className="flex items-center gap-2">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
          <div className="opacity-0 group-hover:opacity-50 transition-opacity flex items-center gap-2">
            <Copy className="w-3 h-3" />
            <a
              href={`${explorerBase}/address/${wallet}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs opacity-70 hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              title="Open in explorer"
            >
              🔗
            </a>
          </div>
        </div>
      </TableCell>

      <TableCell className="font-medium">
        {walletData?.nativeBalance
          ? parseFloat(walletData.nativeBalance).toFixed(4)
          : "-"}
      </TableCell>

      {visibleTokenColumns.map((col: any) => {
        const raw = (walletData as any)?.[col.key];
        const num = Number(raw);
        const display = !Number.isNaN(num) ? num.toFixed(4) : raw ?? "-";
        return (
          <TableCell key={col.key} className="font-medium">
            {display}
          </TableCell>
        );
      })}

      <TableCell className="font-medium">{txCount}</TableCell>
      <TableCell className="font-medium">{lastActive ?? "-"}</TableCell>
      <TableCell>
        <Badge
          className={`shadow-sm ${
            walletData?.healthLabel?.includes("🟢")
              ? "bg-green-600 hover:bg-green-700"
              : walletData?.healthLabel?.includes("🟡")
              ? "bg-yellow-400"
              : "bg-red-500"
          }`}
        >
          {walletData?.healthLabel ?? "Unknown"}{" "}
          {walletData?.healthScore ? `(${walletData.healthScore})` : ""}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleExpand(wallet)}
            title={expanded ? "Collapse" : "Details"}
            className="hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(wallet)}
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
