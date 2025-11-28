import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createPublicClient, http, formatEther } from "viem";
import { monadMainnet, CONTRACTS } from "./config";

interface WalletData {
  nativeBalance: string;
  aPrioriBalance: string;
  magmaBalance: string;
  aPrioriStake?: string; // principal on ValidatorsRegistry (if available)
  magmaStake?: string; // any reported stake on Magma (if available)
  magmaInfo?: string | null; // raw userInfo (if present)
  AUSD?: string;
  earnAUSD?: string;
  USDC?: string;
  WBTC?: string;
  WETH?: string;
  WSOL?: string;
  XAUt0?: string;
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
          const apBal = parseFloat(walletData.aPrioriBalance || "0")
          // Fallback: Consider unhealthy if: low gas (< 0.1 MON) OR no staking
          return monBal < 0.1 || apBal === 0
        })
      },

      fetchData: async () => {
        const { wallets } = get();
        if (wallets.length === 0) return;

        set({ isLoading: true });

        try {
          const contracts: any[] = [];

          // Prepare Multicall
          // tokens we will query per wallet (order matters)
          const tokenKeys: (keyof typeof CONTRACTS)[] = [
            "aPriori",
            "Magma",
            "AUSD",
            "earnAUSD",
            "USDC",
            "WBTC",
            "WETH",
            "WSOL",
            "XAUt0",
          ];

          for (const wallet of wallets) {
            // Native Balance (via Multicall3)
            contracts.push({
              address: "0xcA11bde05977b3631167028862bE2a173976CA11",
              abi: [
                {
                  inputs: [{ name: "addr", type: "address" }],
                  name: "getEthBalance",
                  outputs: [{ name: "balance", type: "uint256" }],
                  stateMutability: "view",
                  type: "function",
                },
              ],
              functionName: "getEthBalance",
              args: [wallet],
            });

            // token balances and decimals (balanceOf + decimals per token)
            for (const key of tokenKeys) {
              const token = (CONTRACTS as any)[key];
              if (!token) continue;
              // balance
              contracts.push({
                address: token.address,
                abi: token.abi,
                functionName: "balanceOf",
                args: [wallet],
              });
              // decimals
              contracts.push({
                address: token.address,
                abi: token.abi,
                functionName: "decimals",
              });
            }
            // validators registry checks (optional)
            const validators = (CONTRACTS as any)["ValidatorsRegistry"];
            if (validators) {
              contracts.push({
                address: validators.address,
                abi: validators.abi,
                functionName: "principalOf",
                args: [wallet],
              });
              contracts.push({
                address: validators.address,
                abi: validators.abi,
                functionName: "balanceOf",
                args: [wallet],
              });
            }
            // Magma optional getters (stakedOf, principalOf, userInfo) — allowFailure will handle missing methods
            const magma = (CONTRACTS as any)["Magma"];
            if (magma) {
              contracts.push({
                address: magma.address,
                abi: magma.abi,
                functionName: "stakedOf",
                args: [wallet],
              });
              contracts.push({
                address: magma.address,
                abi: magma.abi,
                functionName: "principalOf",
                args: [wallet],
              });
              contracts.push({
                address: magma.address,
                abi: magma.abi,
                functionName: "userInfo",
                args: [wallet],
              });
            }
          }

          const results = await client.multicall({
            contracts,
            allowFailure: true,
          });

            const newData: Record<string, WalletData> = {};

          // account for extra calls: ValidatorsRegistry (2) + Magma optional getters (3)
          const callsPerWallet = 1 + tokenKeys.length * 2 + 2 + 3;

          const formatToken = (value: bigint, decimals: number) => {
            const divisor = BigInt(10) ** BigInt(decimals);
            const whole = value / divisor;
            const rem = value % divisor;
            const frac = rem
              .toString()
              .padStart(decimals, "0")
              .slice(0, Math.min(decimals, 6));
            return frac ? `${whole.toString()}.${frac}` : whole.toString();
          };

            for (let i = 0; i < wallets.length; i++) {
            const wallet = wallets[i];
            const baseIndex = i * callsPerWallet;

            const nativeRes = results[baseIndex];
            const nativeBalance =
              nativeRes.status === "success"
                ? formatEther(nativeRes.result as bigint)
                : "0";

            const tokenValues: Record<string, string> = {};
            for (let t = 0; t < tokenKeys.length; t++) {
              const balRes = results[baseIndex + 1 + t * 2];
              const decRes = results[baseIndex + 1 + t * 2 + 1];

              if (balRes.status === "success" && decRes.status === "success") {
                const bal = balRes.result as bigint;
                const dec = Number(decRes.result as bigint);
                tokenValues[tokenKeys[t]] = formatToken(bal, dec);
              } else {
                tokenValues[tokenKeys[t]] = "0";
              }
            }

            // After standard tokens, attempt to read aPriori staking principal (ValidatorsRegistry)
            const registryPrincipalRes = results[baseIndex + 1 + tokenKeys.length * 2];
            const registryBalanceRes = results[baseIndex + 1 + tokenKeys.length * 2 + 1];

            let aPrioriStakeStr = "0";
            if (registryPrincipalRes && registryPrincipalRes.status === 'success') {
              // principalOf likely returns raw MON with 18 decimals
              const v = registryPrincipalRes.result as bigint;
              aPrioriStakeStr = formatToken(v, 18);
            } else if (registryBalanceRes && registryBalanceRes.status === 'success') {
              const v = registryBalanceRes.result as bigint;
              aPrioriStakeStr = formatToken(v, 18);
            }

            // After registry, attempt Magma-specific getters (stakedOf, principalOf, userInfo)
            const magmaStakedRes = results[baseIndex + 1 + tokenKeys.length * 2 + 2];
            const magmaPrincipalRes = results[baseIndex + 1 + tokenKeys.length * 2 + 3];
            const magmaUserInfoRes = results[baseIndex + 1 + tokenKeys.length * 2 + 4];

            let magmaStakeStr = '0'
            let magmaInfoStr: string | null = null
            if (magmaStakedRes && magmaStakedRes.status === 'success') {
              magmaStakeStr = formatToken(magmaStakedRes.result as bigint, 18)
            } else if (magmaPrincipalRes && magmaPrincipalRes.status === 'success') {
              magmaStakeStr = formatToken(magmaPrincipalRes.result as bigint, 18)
            }

            if (magmaUserInfoRes && magmaUserInfoRes.status === 'success') {
              try {
                // userInfo may return a tuple — convert to JSON string for UI
                const r = magmaUserInfoRes.result as unknown
                magmaInfoStr = JSON.stringify(r)
              } catch (e) {
                magmaInfoStr = String(magmaUserInfoRes.result)
              }
            }

              newData[wallet] = {
              nativeBalance,
              aPrioriBalance: tokenValues["aPriori"] ?? "0",
              aPrioriStake: aPrioriStakeStr,
              magmaStake: magmaStakeStr,
              magmaInfo: magmaInfoStr,
              magmaBalance: tokenValues["Magma"] ?? "0",
              AUSD: tokenValues["AUSD"] ?? "0",
              earnAUSD: tokenValues["earnAUSD"] ?? "0",
              USDC: tokenValues["USDC"] ?? "0",
              WBTC: tokenValues["WBTC"] ?? "0",
              WETH: tokenValues["WETH"] ?? "0",
              WSOL: tokenValues["WSOL"] ?? "0",
              XAUt0: tokenValues["XAUt0"] ?? "0",
              txCount: 0,
              lastActive: null,
              healthScore: 0,
              healthLabel: 'Unknown',
              lastUpdated: Date.now(),
            };
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
                  const ts = Number(json.result[0].timeStamp || json.result[0].timestamp)
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
              tokenValues: Record<string, string>,
              hasAPrioriStake: boolean,
              hasMagmaStake: boolean
            ) => {
              let score = 0
              const nativeNum = parseFloat(native || '0')
              if (nativeNum > 10) score += 20
              if (nativeNum > 50) score += 10

              if (txCountNum > 5) score += 30
              if (txCountNum > 20) score += 20

              const protocolInteractions = Object.values(tokenValues).filter((v) => v && v !== '0').length
                + (hasAPrioriStake ? 1 : 0)
                + (hasMagmaStake ? 1 : 0)
              if (protocolInteractions > 0) score += Math.min(30, protocolInteractions * 10)

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

              // reconstruct tokenValues we stored earlier
              const tokenValues: Record<string, string> = {}
              for (let t = 0; t < tokenKeys.length; t++) {
                tokenValues[tokenKeys[t]] = (newData[wallet] as any)[tokenKeys[t]] ?? '0'
              }

              // include aPriori stake as an indicator (if present)
              const hasAPrioriStake = (newData[wallet].aPrioriStake && newData[wallet].aPrioriStake !== '0')
              const hasMagmaStake = (newData[wallet].magmaStake && newData[wallet].magmaStake !== '0')
              const health = calculateHealth(newData[wallet].nativeBalance, txNum, tokenValues, !!hasAPrioriStake, !!hasMagmaStake)

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
