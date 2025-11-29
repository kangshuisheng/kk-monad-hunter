"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import Header from "@/components/Header";
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

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Wallet Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitor your ecosystem interactions and health score.
            </p>
          </div>
          <div className="p-0">
            <WalletTable
              wallets={wallets}
              data={data}
              explorerBase={explorerBase}
              removeWallet={removeWallet}
              copyAddress={copyAddress}
            />
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 pb-4">
          <p>Monad Mainnet • Chain ID: 143</p>
        </div>
      </div>
    </div>
  );
}
