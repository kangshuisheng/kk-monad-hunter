import { createPublicClient, http, formatEther, parseEther } from "viem";
import type { Abi } from "viem";
import { monadMainnet, CONTRACTS } from "./config";

// 1. Initialize Client
const client = createPublicClient({
  chain: monadMainnet,
  transport: http(),
});

// 2. Define Test Addresses (You can add more)
const TEST_WALLETS = [
  // user-provided addresses for debugging
  '0x9f3070183a44F5872D7B1A88844C8d35E9399B72',
  '0x94434829a1A3723F25437754699d2857DcDEe287',
  '0xb845fD366Ddab4C9da3f2F21273582E30d5D10E7',
  '0x1100a763d9f28203EC7440eF889Fdbf67361a665',
]

async function main() {
  console.log("🔍 Starting Monad Hunter Verification...");
  console.log(`📡 Connected to: ${monadMainnet.name}`);
  console.log(`🔗 RPC: ${monadMainnet.rpcUrls.default.http[0]}`);

  const results = [];

  // 3. Multicall Logic
  // We want to fetch: Native Balance, Nonce, aPriori Balance, Magma Balance
  // For 3 wallets, that's 3 * 4 = 12 calls in one batch.

  // typed array for viem's multicall helper
  const contracts: {
    address: `0x${string}`;
    abi: Abi;
    functionName: string;
    args?: readonly unknown[];
  }[] = [];

  // prepare a correctly-typed ABI for Multicall3.getEthBalance
  const multicall3GetEthBalanceAbi = [
    {
      inputs: [{ name: "addr", type: "address" }],
      name: "getEthBalance",
      outputs: [{ name: "balance", type: "uint256" }],
      stateMutability: "view" as const,
      type: "function" as const,
    },
  ] as const as unknown as Abi;

  // token keys we want to check per wallet (order matters for parsing results)
  const tokenKeys: (keyof typeof CONTRACTS)[] = [
    'Magma',
    'AUSD',
    'USDC',
    'WBTC',
    'WETH',
    'WSOL',
    'earnAUSD',
    'XAUt0',
  ]

  for (const wallet of TEST_WALLETS) {
    // Native Balance
    contracts.push({
      address: "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`,
      abi: multicall3GetEthBalanceAbi,
      functionName: "getEthBalance",
      args: [wallet] as const,
    });

    // Nonce (Transaction Count)
    // Note: Multicall3 doesn't have getTransactionCount directly for other addresses usually,
    // but we can use the aggregate3 method if we were calling state changing,
    // but for view, we usually use the multicall3's helper or just separate calls if needed.
    // However, Multicall3 has `getEthBalance`. It does NOT have `getTransactionCount`.
    // We might need to use `client.multicall` with `allowFailure: true` which wraps it.
    // Viem's `multicall` can handle standard contract calls.
    // For `getBalance` and `getTransactionCount` (native), Viem's multicall might not support them directly in the `contracts` array unless they are wrapped in a contract call.
    // Multicall3 has `getEthBalance`. It does NOT have `getTransactionCount`.
    // So for Nonce, we might have to skip it in the multicall OR use a specific helper contract if available.
    // Let's stick to `getEthBalance` (via Multicall3) and Token Balances.
    // We will skip Nonce in the Multicall for now to keep it simple, or do it separately.
    // Actually, let's just do Token Balances and Native Balance via Multicall3.

    // token balances to fetch (local list drives both call creation and result parsing)
    for (const key of tokenKeys) {
      const token = CONTRACTS[key]
      if (!token) continue
      // balanceOf
      contracts.push({
        address: token.address as `0x${string}`,
        abi: token.abi as unknown as Abi,
        functionName: 'balanceOf',
        args: [wallet] as const,
      })
      // decimals
      contracts.push({
        address: token.address as `0x${string}`,
        abi: token.abi as unknown as Abi,
        functionName: 'decimals',
      })
    }
    // validators registry: attempt principalOf + balanceOf (if present)
    const validators = (CONTRACTS as any)["ValidatorsRegistry"]
    if (validators) {
      contracts.push({
        address: validators.address as `0x${string}`,
        abi: validators.abi as unknown as Abi,
        functionName: 'principalOf',
        args: [wallet] as const,
      })
      contracts.push({
        address: validators.address as `0x${string}`,
        abi: validators.abi as unknown as Abi,
        functionName: 'balanceOf',
        args: [wallet] as const,
      })
    }
    // magma optional getters
    const magma = (CONTRACTS as any)["Magma"]
    if (magma) {
      contracts.push({ address: magma.address as `0x${string}`, abi: magma.abi as unknown as Abi, functionName: 'stakedOf', args: [wallet] as const })
      contracts.push({ address: magma.address as `0x${string}`, abi: magma.abi as unknown as Abi, functionName: 'principalOf', args: [wallet] as const })
      contracts.push({ address: magma.address as `0x${string}`, abi: magma.abi as unknown as Abi, functionName: 'userInfo', args: [wallet] as const })
    }
  }

  console.log(`📦 Batching ${contracts.length} calls...`);

  try {
    const multicallResults = await client.multicall({
      contracts: contracts,
      allowFailure: true,
    });

    // 4. Data Cleaning
    // Compute number of calls per wallet: 1 native + 2 per token (balance + decimals)
    const callsPerWallet = 1 + tokenKeys.length * 2 + 2 + 3

    // helper to format token amounts for arbitrary decimals
    const formatToken = (value: bigint, decimals: number) => {
      const divisor = BigInt(10) ** BigInt(decimals)
      const whole = value / divisor
      const rem = value % divisor
      // show up to 6 fractional digits
      const frac = rem.toString().padStart(decimals, '0').slice(0, Math.min(decimals, 6))
      return frac ? `${whole.toString()}.${frac}` : whole.toString()
    }

    for (let i = 0; i < TEST_WALLETS.length; i++) {
      const wallet = TEST_WALLETS[i]
      const baseIndex = i * callsPerWallet // base for this wallet's results

      const nativeBalResult = multicallResults[baseIndex]
      const nativeBal =
        nativeBalResult.status === 'success'
          ? formatEther(nativeBalResult.result as bigint)
          : 'Error'

      // parse token balances (each token has balance + decimals pair)
      const tokenData: Record<string, string> = {}
      for (let t = 0; t < tokenKeys.length; t++) {
        const balanceRes = multicallResults[baseIndex + 1 + t * 2]
        const decRes = multicallResults[baseIndex + 1 + t * 2 + 1]

        let formatted = 'Error'
        if (balanceRes.status === 'success' && decRes.status === 'success') {
          const bal = balanceRes.result as bigint
          const dec = Number(decRes.result as bigint)
          formatted = formatToken(bal, dec)
        }

        tokenData[tokenKeys[t]] = formatted
      }

      // read registry values (principalOf then balanceOf)
      const registryPrincipalRes = multicallResults[baseIndex + 1 + tokenKeys.length * 2]
      const registryBalanceRes = multicallResults[baseIndex + 1 + tokenKeys.length * 2 + 1]

      let aprStake = '0'
      if (registryPrincipalRes && registryPrincipalRes.status === 'success') {
        aprStake = formatToken(registryPrincipalRes.result as bigint, 18)
      } else if (registryBalanceRes && registryBalanceRes.status === 'success') {
        aprStake = formatToken(registryBalanceRes.result as bigint, 18)
      }

      // magma results (stakedOf, principalOf, userInfo)
      const magmaStakedRes = multicallResults[baseIndex + 1 + tokenKeys.length * 2 + 2]
      const magmaPrincipalRes = multicallResults[baseIndex + 1 + tokenKeys.length * 2 + 3]
      const magmaUserInfoRes = multicallResults[baseIndex + 1 + tokenKeys.length * 2 + 4]

      let magmaStake = '0'
      let magmaInfo = null
      if (magmaStakedRes && magmaStakedRes.status === 'success') magmaStake = formatToken(magmaStakedRes.result as bigint, 18)
      else if (magmaPrincipalRes && magmaPrincipalRes.status === 'success') magmaStake = formatToken(magmaPrincipalRes.result as bigint, 18)
      if (magmaUserInfoRes && magmaUserInfoRes.status === 'success') magmaInfo = String(magmaUserInfoRes.result)

      results.push({
        Address: `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        'MON (Native)': nativeBal,
        'Magma Stake': magmaStake,
        'Magma Info': magmaInfo,
        'Magma (gMON)': tokenData['Magma'] ?? '-',
        'AUSD': tokenData['AUSD'] ?? '-',
        'USDC': tokenData['USDC'] ?? '-',
        'WBTC': tokenData['WBTC'] ?? '-',
        'WETH': tokenData['WETH'] ?? '-',
        'WSOL': tokenData['WSOL'] ?? '-',
        'XAUt0': tokenData['XAUt0'] ?? '-',
      })
    }

    console.table(results);
  } catch (error) {
    console.error("❌ Multicall Failed:", error);
  }
}

main();
