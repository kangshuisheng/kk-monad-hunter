"use client";

import React, { useState } from "react";
import WalletRow from "./WalletRow";
import WalletDetails from "./WalletDetails";
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (w: string) => setExpanded((s) => ({ ...s, [w]: !s[w] }));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TH>Address</TH>
            <TH>MON Balance</TH>
            {visibleTokenColumns.map((c: any) => (
              <TH key={c.key}>{c.label}</TH>
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
                <React.Fragment key={wallet}>
                  <WalletRow
                    wallet={wallet}
                    walletData={walletData}
                    visibleTokenColumns={visibleTokenColumns}
                    explorerBase={explorerBase}
                    expanded={!!expanded[wallet]}
                    onToggleExpand={toggle}
                    onRemove={removeWallet}
                    onCopyAddress={copyAddress}
                  />

                  {expanded[wallet] && (
                    <WalletDetails
                      wallet={wallet}
                      walletData={walletData}
                      visibleTokenColumns={visibleTokenColumns}
                      explorerBase={explorerBase}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
