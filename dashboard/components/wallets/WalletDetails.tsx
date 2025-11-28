"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WalletDetails({
  wallet,
  walletData,
  visibleTokenColumns,
  explorerBase,
}: any) {
  return (
    <TableRow className="bg-slate-50 dark:bg-slate-900 transition-colors">
      <TableCell colSpan={6 + visibleTokenColumns.length}>
        <div className="p-4 rounded border border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <strong>Details</strong>
              <span className="font-mono">{wallet}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs opacity-70">
                Explorer:{" "}
                <a
                  href={`${explorerBase}/address/${wallet}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  🔗
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        JSON.stringify(walletData, null, 2)
                      );
                      toast.success("JSON copied");
                    } catch (e) {
                      toast.error("Copy failed");
                    }
                  }}
                >
                  Copy JSON
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify(walletData, null, 2)],
                      { type: "application/json" }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${wallet}_details.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500">aPriori Balance</div>
              <div className="font-medium">
                {walletData?.aPrioriBalance ?? "-"}
              </div>
              <div className="text-xs text-slate-400">
                aPriori Stake: {walletData?.aPrioriStake ?? "0"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Magma Balance</div>
              <div className="font-medium">
                {walletData?.magmaBalance ?? "-"}
              </div>
              <div className="text-xs text-slate-400">
                Magma Stake: {walletData?.magmaStake ?? "0"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">earnAUSD</div>
              <div className="font-medium">{walletData?.earnAUSD ?? "-"}</div>
              <div className="text-xs text-slate-400">
                User Info:{" "}
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {walletData?.magmaInfo ?? "-"}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
            Raw data:{" "}
            <pre className="max-h-40 overflow-auto text-xs">
              {JSON.stringify(walletData, null, 2)}
            </pre>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}
