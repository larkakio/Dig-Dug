# Neon Dig Dug

Cyberpunk Dig Dug arcade for Base App (standard web app + wallet).

## Stack

- **web/** — Next.js, Tailwind, HTML5 Canvas game, wagmi + viem + ox (Builder Codes)
- **contracts/** — Foundry `CheckIn` daily on-chain sync (no ETH required)

## Setup

```bash
cd web && cp .env.example .env.local
cd ../contracts && forge test
```

### Environment (`web/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `https://dig-dug.vercel.app` |
| `NEXT_PUBLIC_BASE_APP_ID` | `6a083421bc175abcdd5651f1` |
| `NEXT_PUBLIC_BUILDER_CODE` | `bc_…` from base.dev → Settings → Builder Code |
| `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` | Deployed `CheckIn.sol` on Base mainnet (`0x145b30d487272D4595Af5bAb21389D5f306f8207`) |
| `NEXT_PUBLIC_CHAIN_ID` | `8453` |

**Live:** [https://dig-dug.vercel.app](https://dig-dug.vercel.app)

Register on [base.dev](https://base.dev), upload `web/public/app-icon.jpg` and `app-thumbnail.jpg`, set primary URL to `https://dig-dug.vercel.app`.

### Deploy contract

```bash
cd contracts
forge build
# forge script ... --rpc-url $BASE_RPC --broadcast
```

## Play

- **Swipe** on the field to dig and move
- **Pump** button or tap when aligned with enemies
- Clear all enemies → next level
- **Daily sync** in header (gas-only check-in on Base)

## Base App

No Farcaster SDK. Uses wagmi, SIWE-ready stack, ERC-8021 attribution via `dataSuffix` in wagmi config.

Docs: [Migrate to Standard Web App](https://docs.base.org/apps/guides/migrate-to-standard-web-app) · [Builder Codes](https://docs.base.org/apps/builder-codes/builder-codes)
