"use client";

import { PROTOCOLS } from "@/lib/config";
import WalletRow from "./WalletRow";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHead as TH,
} from "@/components/ui/table";

export default function WalletTable({
  wallets,
  data,
  visibleTokenColumns,
  explorerBase,
  removeWallet,
  copyAddress,
}: any) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow>
            <TH className="w-[180px]">Address</TH>
            <TH>MON Balance</TH>
            {/* Ecosystem Matrix Headers */}
            {PROTOCOLS.map((p) => (
              <TH key={p.name} className="text-center">{p.label}</TH>
            ))}
            <TH>Tx Count</TH>
            <TH>Last Active</TH>
            <TH>Health</TH>
            <TH className="text-right">Action</TH>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6 + visibleTokenColumns.length}
                className="text-center h-32 text-slate-500"
              >
                <div className="flex flex-col items-center gap-2">
                  No wallets added yet. Add one above to get started.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            wallets.map((wallet: string) => {
              const walletData = data[wallet];
              return (
                <WalletRow
                  key={wallet}
                  wallet={wallet}
                  walletData={walletData}
                  explorerBase={explorerBase}
                  onRemove={removeWallet}
                  onCopyAddress={copyAddress}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
