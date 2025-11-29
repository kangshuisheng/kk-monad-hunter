import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPublicClient, http, formatEther } from "viem";
import { monadMainnet, PROTOCOLS } from "./config";

interface WalletData {
  nativeBalance: string;
  protocols: Record<string, {
    name: string
    active: boolean
    balance: string
    lastInteraction?: number
  }>
  txCount: number // transaction count (nonce)
  lastActive: number | null // unix ms of last transaction (if available)
  healthScore: number
  healthLabel: string
  lastUpdated: number;
}

interface AppState {
  wallets: string[];
  data: Record<string, WalletData>;
  isLoading: boolean;
  addWallet: (address: string) => void;
  addMultipleWallets: (addresses: string[]) => void;
  removeWallet: (address: string) => void;
  fetchData: () => Promise<void>;
  getAllWallets: () => string[];
  getUnhealthyWallets: () => string[];
}

const client = createPublicClient({
  chain: monadMainnet,
  transport: http(),
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      wallets: [],
      data: {},
      isLoading: false,

      addWallet: (address) => {
        const { wallets } = get();
        if (!wallets.includes(address)) {
          set({ wallets: [...wallets, address] });
          get().fetchData();
        }
      },

      addMultipleWallets: (addresses) => {
        const { wallets } = get();
        const uniqueAddresses = [...new Set(addresses)];
        const newWallets = uniqueAddresses.filter(
          (addr) => !wallets.includes(addr)
        );
        if (newWallets.length > 0) {
          set({ wallets: [...wallets, ...newWallets] });
          get().fetchData();
        }
      },

      removeWallet: (address) => {
        const { wallets, data } = get();
        const newData = { ...data };
        delete newData[address];
        set({ wallets: wallets.filter((w) => w !== address), data: newData });
      },

      getAllWallets: () => {
        return get().wallets;
      },

      getUnhealthyWallets: () => {
        const { wallets, data } = get()
        return wallets.filter(wallet => {
          const walletData = data[wallet]
          if (!walletData) return false
          const monBal = parseFloat(walletData.nativeBalance || "0")
          // Use healthScore if available: score < 50 considered unhealthy
          if (typeof walletData.healthScore === 'number') return walletData.healthScore < 50

          // Fallback logic if healthScore not ready (though it should be)
          const hasProtocols = Object.values(walletData.protocols || {}).some(p => p.active)
          return monBal < 0.1 || !hasProtocols
        })
      },

      fetchData: async () => {
        const { wallets } = get();
        if (wallets.length === 0) return;

        set({ isLoading: true });

        try {
          // Prepare Multicall
          const contracts: any[] = [];

          for (const wallet of wallets) {
            // 1. Native Balance
            contracts.push({
              address: "0xcA11bde05977b3631167028862bE2a173976CA11",
              abi: [{
                inputs: [{ name: "addr", type: "address" }],
                name: "getEthBalance",
                outputs: [{ name: "balance", type: "uint256" }],
                stateMutability: "view",
                type: "function",
              }],
              functionName: "getEthBalance",
              args: [wallet],
            });

            // 2. Protocol Balances
            for (const protocol of PROTOCOLS) {
              if (protocol.contract) {
                // Balance
                contracts.push({
                  address: protocol.contract.address,
                  abi: protocol.contract.abi,
                  functionName: protocol.contract.methods.balance || 'balanceOf',
                  args: [wallet],
                })
                // Stake (if applicable)
                if (protocol.contract.methods.stake) {
                  contracts.push({
                    address: protocol.contract.address,
                    abi: protocol.contract.abi,
                    functionName: protocol.contract.methods.stake,
                    args: [wallet],
                  })
                }
              }
            }
          }

          const results = await client.multicall({
            contracts,
            allowFailure: true,
          });

          const newData: Record<string, WalletData> = {};

          // Calculate calls per wallet: 1 (native) + PROTOCOLS * (1 or 2 depending on stake)
          // To be safe, we iterate carefully.
          let resultIndex = 0;

          for (const wallet of wallets) {
            // 1. Native
            const nativeRes = results[resultIndex++];
            const nativeBalance = nativeRes.status === "success"
              ? formatEther(nativeRes.result as bigint)
              : "0";

            // 2. Protocols
            const protocolData: Record<string, any> = {};

            for (const protocol of PROTOCOLS) {
              let balance = "0";
              let active = false;

              if (protocol.contract) {
                // Balance
                const balRes = results[resultIndex++];
                if (balRes.status === 'success') {
                  const val = balRes.result as bigint;
                  if (val > BigInt(0)) {
                    balance = formatEther(val); // Assuming 18 decimals for simplicity for now, or use token decimals if available
                    active = true;
                  }
                }

                // Stake
                if (protocol.contract.methods.stake) {
                  const stakeRes = results[resultIndex++];
                  if (stakeRes.status === 'success') {
                    const val = stakeRes.result as bigint;
                    if (val > BigInt(0)) {
                      // Add stake to balance or track separately? 
                      // For matrix, just need to know if active.
                      active = true;
                      // Update balance to show total (stake + balance)? 
                      // For now let's just keep balance as liquid and ensure active is true.
                    }
                  }
                }
              }

              protocolData[protocol.name] = {
                name: protocol.name,
                active,
                balance
              }
            }

            newData[wallet] = {
              nativeBalance,
              protocols: protocolData,
              txCount: 0,
              lastActive: null,
              healthScore: 0,
              healthLabel: 'Unknown',
              lastUpdated: Date.now()
            }
          }

          // fetch txCount for each wallet via RPC (parallel)
          const txCountPromises = wallets.map((w) => client.getTransactionCount({ address: w as `0x${string}` }))
          const txCountSettled = await Promise.allSettled(txCountPromises)

          // optional: query explorer API for last tx timestamp if NEXT_PUBLIC_EXPLORER_API_URL provided
          const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_API_URL as string | undefined
          const explorerKey = process.env.NEXT_PUBLIC_EXPLORER_API_KEY as string | undefined

          const fetchLastActive = async (address: string) => {
            if (!explorerUrl) return null
            try {
              const url = `${explorerUrl}?module=account&action=txlist&address=${address}&page=1&offset=1&sort=desc${explorerKey ? `&apikey=${explorerKey}` : ''}`
              const r = await fetch(url)
              if (!r.ok) return null
              const json = await r.json()
              if (json && Array.isArray(json.result) && json.result.length > 0) {
                const tx = json.result[0];
                let ts = Number(tx.timeStamp || tx.timestamp)

                // Fallback: if timestamp is missing but we have blockNumber, try to fetch block
                if (Number.isNaN(ts) && tx.blockNumber) {
                  try {
                    const block = await client.getBlock({ blockNumber: BigInt(tx.blockNumber) })
                    ts = Number(block.timestamp)
                  } catch (e) {
                    console.error('Failed to fetch block time', e)
                  }
                }

                if (!Number.isNaN(ts)) return Number(ts) * 1000
              }
            } catch (e) {
              // ignore
            }
            return null
          }

          const lastActivePromises = wallets.map((w) => fetchLastActive(w))
          const lastActiveSettled = await Promise.allSettled(lastActivePromises)

          // compute health
          const calculateHealth = (
            native: string,
            txCountNum: number,
            protocols: Record<string, any>
          ) => {
            let score = 0
            const nativeNum = parseFloat(native || '0')
            if (nativeNum > 10) score += 20
            if (nativeNum > 50) score += 10

            if (txCountNum > 5) score += 30
            if (txCountNum > 20) score += 20

            const activeProtocols = Object.values(protocols).filter(p => p.active).length
            if (activeProtocols > 0) score += Math.min(30, activeProtocols * 10)

            if (score >= 80) return { score, label: '🟢 Elite' }
            if (score >= 50) return { score, label: '🟡 Good' }
            return { score, label: '🔴 Weak' }
          }

          for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i]
            const txSettled = txCountSettled[i]
            const txNum = txSettled && txSettled.status === 'fulfilled' ? Number(txSettled.value) : 0
            const lastSettled = lastActiveSettled[i]
            const lastTs = lastSettled && lastSettled.status === 'fulfilled' ? lastSettled.value : null

            const health = calculateHealth(newData[wallet].nativeBalance, txNum, newData[wallet].protocols)

            // merge into newData
            newData[wallet] = {
              ...newData[wallet],
              txCount: txNum,
              lastActive: lastTs,
              healthScore: health.score,
              healthLabel: health.label,
            }
          }

          set({ data: newData, isLoading: false });
        } catch (error) {
          console.error("Fetch error:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "monad-hunter-storage",
      partialize: (state) => ({ wallets: state.wallets }), // Only persist wallets
    }
  )
);
