import { defineChain } from 'viem'

export const monadMainnet = defineChain({
  id: 143,
  name: 'Monad Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc3.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'MonadExplorer', url: 'https://monadvision.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 0,
    },
    // Canonical mainnet contracts
    create2Deployer: { address: '0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2', blockCreated: 0 },
    createX: { address: '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed', blockCreated: 0 },
    singletonFactory: { address: '0xce0042b868300000d44a59004da54a005ffdcf9f', blockCreated: 0 },
    entryPointV06: { address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', blockCreated: 0 },
    entryPointV07: { address: '0x0000000071727De22E5E9d8BAf0edAc6f37da032', blockCreated: 0 },
    multiSend: { address: '0x998739BFdAAdde7C933B942a68053933098f9EDa', blockCreated: 0 },
  },
  // mainnet-only
})

export const CONTRACTS = {
  WMON: {
    address: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A' as `0x${string}`,
    abi: [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
  },
  Magma: {
    address: '0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081' as `0x${string}`, // gMON
    abi: [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
      { inputs: [{ name: '_owner', type: 'address' }], name: 'stakedOf', outputs: [{ name: 'amount', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [{ name: '_owner', type: 'address' }], name: 'principalOf', outputs: [{ name: 'amount', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [{ name: '_owner', type: 'address' }], name: 'userInfo', outputs: [{ name: 'info', type: 'bytes' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  AUSD: {
    address: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  USDC: {
    address: '0x754704Bc059F8C67012fEd69BC8A327a5aafb603' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  WBTC: {
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  WETH: {
    address: '0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  WSOL: {
    address: '0xea17E5a9efEBf1477dB45082d67010E2245217f1' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  XAUt0: {
    address: '0x01bFF41798a0BcF287b996046Ca68b395DbC1071' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  // earnAUSD (yield aggregator tokenProxy)
  earnAUSD: {
    address: '0x103222f020e98bba0ad9809a011fdf8e6f067496' as `0x${string}`,
    abi: [
      { inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
  // aPriori ValidatorsRegistry (principalOf / balanceOf)
  ValidatorsRegistry: {
    address: '0x77f6e4103e32d6146e29cf9ed1645e170f90bc2b' as `0x${string}`,
    abi: [
      { inputs: [{ name: 'account', type: 'address' }], name: 'principalOf', outputs: [{ name: 'amount', type: 'uint256' }], stateMutability: 'view', type: 'function' },
      { inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    ] as const,
  },
}

export type ProtocolName = 'Magma' | 'Kuru' | 'Uniswap' | 'Account'

export interface ProtocolConfig {
  name: ProtocolName
  label: string
  url: string
  description: string
  actions: {
    label: string
    url: string
    intentUrl?: string
  }[]
  contract?: {
    address: `0x${string}`
    abi: any
    methods: {
      balance?: string
      stake?: string
    }
  }
}

export const PROTOCOLS: ProtocolConfig[] = [
  {
    name: 'Magma',
    label: 'Magma',
    url: 'https://magma.finance',
    description: 'Liquid Staking',
    actions: [
      { label: 'Stake', url: 'https://magma.finance' }
    ],
    contract: {
      address: CONTRACTS.Magma.address,
      abi: CONTRACTS.Magma.abi,
      methods: { balance: 'balanceOf', stake: 'stakedOf' }
    }
  },
  {
    name: 'Kuru',
    label: 'Kuru',
    url: 'https://kuru.io',
    description: 'Orderbook DEX',
    actions: [
      { label: 'Trade', url: 'https://kuru.io/trade' }
    ],
    // Placeholder address - User to provide
    contract: {
      address: '0x0000000000000000000000000000000000000000',
      abi: [{ inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      methods: { balance: 'balanceOf' }
    }
  },
  {
    name: 'Uniswap',
    label: 'Uniswap',
    url: 'https://app.uniswap.org',
    description: 'AMM DEX',
    actions: [
      { label: 'Swap', url: 'https://app.uniswap.org' }
    ],
    // Placeholder address - User to provide
    contract: {
      address: '0x0000000000000000000000000000000000000000',
      abi: [{ inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      methods: { balance: 'balanceOf' }
    }
  }
]
