"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import WalletTable from "@/components/wallets/WalletTable";
import { toast } from "sonner";

export default function Home() {
  const {
    wallets,
    data,
    isLoading,
    addWallet,
    addMultipleWallets,
    removeWallet,
    fetchData,
    getAllWallets,
    getUnhealthyWallets,
  } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState<boolean | null>(null);

  // Hydration fix + initial fetch
  useEffect(() => {
    setIsMounted(true);
    fetchData();

    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          setIsDark(true);
        } else {
          document.documentElement.classList.remove("dark");
          setIsDark(false);
        }
      }
    } catch (e) {
      setIsDark(null);
    }
  }, [fetchData]);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (!isMounted) return null;

  // columns selection logic - show token only if ANY wallet has non-zero
  const tokenColumnKeys = [
    { key: "aPrioriBalance", label: "aPriori (aprMON)" },
    { key: "aPrioriStake", label: "aPriori Stake" },
    { key: "magmaBalance", label: "Magma (gMON)" },
    { key: "AUSD", label: "AUSD" },
    { key: "earnAUSD", label: "earnAUSD" },
    { key: "USDC", label: "USDC" },
    { key: "WBTC", label: "WBTC" },
    { key: "WETH", label: "WETH" },
    { key: "WSOL", label: "WSOL" },
    { key: "XAUt0", label: "XAUt0" },
  ];

  const visibleTokenColumns = tokenColumnKeys.filter(({ key }) => {
    return wallets.some((w) => {
      const v = (data[w] as any)?.[key];
      if (!v) return false;
      const n = Number(v);
      return !Number.isNaN(n) && n > 0;
    });
  });

  const explorerBase = "https://monadvision.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          isLoading={isLoading}
          addWallet={addWallet}
          addMultipleWallets={addMultipleWallets}
          fetchData={fetchData}
          getAllWallets={getAllWallets}
          getUnhealthyWallets={getUnhealthyWallets}
          isDark={isDark}
          setIsDark={setIsDark}
        />

        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
            <CardDescription>
              Overview of added wallets, balances and staking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <WalletTable
                wallets={wallets}
                data={data}
                visibleTokenColumns={visibleTokenColumns}
                explorerBase={explorerBase}
                removeWallet={removeWallet}
                copyAddress={copyAddress}
              />
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pb-4">
          <p>Monad Mainnet • Chain ID: 143</p>
        </div>
      </div>
    </div>
  );
}
