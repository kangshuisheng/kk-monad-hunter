# 🎯 Monad Hunter Dashboard

A sleek, modern dashboard for tracking Monad Mainnet wallet assets and health status. Monitor native MON balances, staking positions (aPriori/Magma), and identify wallets that need attention.

![Monad Hunter Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Viem](https://img.shields.io/badge/Viem-2.x-blue?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📊 Core Functionality
- **Real-time Balance Tracking**: Monitor MON, aPriori (aprMON), and Magma (gMON) balances
- **Health Indicators**: Visual status badges for wallet health
  - 🔴 **Low Gas**: MON balance < 0.1
  - ⚠️ **No Stake**: No aPriori staking
  - ✅ **Healthy**: Active staking with sufficient gas

### 🚀 Batch Operations
- **Batch Import**: Paste multiple addresses (one per line) with automatic validation
- **Export All**: Copy all tracked addresses to clipboard
- **Export Unhealthy**: Filter and export only wallets needing attention
- **Click-to-Copy**: Click any address to copy it instantly

### 💫 Modern UI/UX
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark Mode Support**: Automatic theme detection
- **Toast Notifications**: User-friendly feedback for all actions
- **Gradient Backgrounds**: Beautiful, modern aesthetic
- **Collapsible Batch Section**: Clean, uncluttered interface

### 🔐 Privacy-First
- **LocalStorage Persistence**: Wallet addresses saved locally only
- **No Backend**: All data processing happens in your browser
- **Zero Tracking**: Your wallet data stays private

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Web3**: [Viem](https://viem.sh/) - Modern Ethereum library
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/monad-hunter.git
cd monad-hunter/dashboard

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 🎮 Usage

### Adding Wallets

**Single Address:**
1. Paste wallet address in the input field
2. Click "Add" or press Enter
3. Data fetches automatically

**Batch Import:**
1. Click "Batch Import" to expand
2. Paste multiple addresses (one per line)
3. Click "Import All" - invalid addresses are automatically skipped

### Exporting Data

- **Export All**: Click to copy all wallet addresses
- **Export Unhealthy**: Filter and copy only wallets with low gas or no staking

### Managing Wallets

- **Refresh**: Update all balances via Multicall
- **Remove**: Click trash icon to remove a wallet
- **Copy Address**: Click any address to copy it

## 🌐 Monad Mainnet Configuration

- **Chain ID**: 143
- **RPC URL**: https://rpc.monad.xyz
- **Explorer**: https://monadvision.com

### Contract Addresses

| Contract | Address |
|----------|---------|
| WMON | `0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A` |
| aPriori (aprMON) | `0x0c65A0BC65a5D819235B71F554D210D3F80E0852` |
| Magma (gMON) | `0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081` |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |

## 📁 Project Structure

```
monad-hunter/
├── config.ts                 # Monad chain config & contracts
├── verify.ts                 # CLI verification script
├── dashboard/                # Next.js app
│   ├── app/
│   │   ├── page.tsx         # Main dashboard UI
│   │   ├── layout.tsx       # Root layout with Toaster
│   │   └── globals.css      # Global styles
│   ├── components/ui/       # shadcn components
│   ├── lib/
│   │   ├── config.ts        # Chain & contract config
│   │   ├── store.ts         # Zustand state management
│   │   └── utils.ts         # Utility functions
│   └── public/              # Static assets
└── package.json
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add single wallet address
- [ ] Batch import multiple addresses
- [ ] Export all addresses
- [ ] Export unhealthy wallets
- [ ] Click to copy addresses
- [ ] Remove wallet
- [ ] Refresh data
- [ ] Test with invalid addresses
- [ ] Check responsive design (mobile/tablet/desktop)
- [ ] Verify localStorage persistence (refresh page)

### CLI Verification Script

```bash
# Test multicall logic standalone
tsx verify.ts
```

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd dashboard
vercel
```

### Environment Variables

No environment variables needed! Everything uses public RPCs.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for anything!

## 🙏 Acknowledgments

- [Monad](https://monad.xyz/) - Next-gen EVM blockchain
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Viem](https://viem.sh/) - Modern Web3 library

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/monad-hunter/issues)
- Twitter: [@yourusername](https://twitter.com/yourusername)

---

**Built with ❤️ for the Monad community**
# kk-monad-hunter
