# Room

**Build. Learn. and Collaborate in One Room**

<p align="center">
  <img src="https://img.shields.io/badge/Starknet-Native-blue?style=for-the-badge" alt="Starknet Native" />
  <img src="https://img.shields.io/badge/LiveKit-WebRTC-purple?style=for-the-badge" alt="LiveKit Powered" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

---

## The Problem

Builders, learners, and communities lack a unified space that seamlessly integrates high-quality video collaboration with native Web3 token incentives. Currently, hosts face:

1. **Fragmented Workflows** — Switching between Web2 video conferencing apps and Web3 wallets to send rewards.
2. **Friction in Onboarding** — Relying on disjointed tools for hackathons, classes, and live collaboration.
3. **Complicated Token Mechanics** — Difficulty in rewarding participants instantly without manual, time-consuming token transfers.

---

## The Solution

**Collaborate Live. Reward Instantly.**

Room is a decentralized meeting platform built natively on **Starknet** that allows users to host hackathons, run classes, collaborate live, and reward participants instantly with STRK. By bringing seamless wallet connections and high-quality video into a single interface, Room makes Web3 communities truly interactive.

### How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   User Wallet   │────▶│   Next.js    │────▶│  RoomVault Contract │
│(Argent/Braavos) │     │  Frontend    │     │  (Starknet Sepolia) │
└─────────────────┘     └──────────────┘     └─────────────────────┘
                               │                       │
                               ▼                       ▼
                        ┌──────────────┐     ┌─────────────────────┐
                        │   LiveKit    │     │      STRK Token     │
                        │   Server     │     │      Transfers      │
                        │  (WebRTC)    │     │                     │
                        └──────────────┘     └─────────────────────┘
```

1. **Authentication** — Users connect their Starknet wallets to authenticate and manage their identities
2. **Collaboration** — Participants join LiveKit-powered video and audio meeting rooms
3. **Incentivization** — Hosts and users manage their balances and facilitate seamless STRK token transfers directly via the Starknet RoomVault contract

---

## Repository Structure

This repository contains both the frontend application and the on-chain smart contracts.

| Directory | Description |
|-----------|-------------|
| [`/src`](./src) | Next.js Frontend — Landing page, dashboard, meeting rooms |
| [`/contracts`](./contracts) | Cairo Smart Contracts — RoomVault vault and token logic |

---

### 1. Web Application (`/src`)

> The main web frontend — user interface and meeting UI

**Tech Stack:**
- **Frontend:** Next.js 14, React 18, Tailwind CSS, Lucide React
- **Video/Audio:** LiveKit (`@livekit/components-react`, `livekit-server-sdk`)
- **Blockchain:** Starknet React (`@starknet-react/core`), Starknet.js, Starknetkit

**Features:**
- Native Starknet wallet support (Argent X, Braavos)
- Live video meetings with custom avatar overlays
- Personalized profiles (Display Name, Avatar, Email)
- Actionable dashboard with STRK wallet balance and transaction history
- Smooth, modern, UI for Web3 collaboration

**Quick Start:**
```bash
npm install
npm run dev
# App runs on http://localhost:3000
```

---

### 2. Smart Contracts (`/contracts/room_vault`)

> On-Chain Vault System — Built with Cairo and deployed on Starknet

**Tech Stack:**
- **Language:** Cairo
- **Toolchain:** Scarb
- **Network:** Starknet (Sepolia Testnet)

**What It Does:**
Implements a **RoomVault** smart contract that allows platform users to deposit, withdraw, and send STRK tokens natively to other participants of the platform.

| Component | Status |
|-----------|--------|
| Vault Contract (room_vault) | ✅ Working — Compiles successfully |
| Deployment Script | ✅ Available (`deploy_room_vault.sh`) |
| Contract Deployment | ✅ Deployed — Starknet Sepolia |

**Installation:**
```bash
# Prerequisites
# - Scarb
# - Starkli

# Build contracts
cd contracts/room_vault
scarb build
```

---

## Use Cases

### 1. Web3 Hackathons & Bounties

A protocol wants to host a virtual hackathon. They use Room to conduct live workshops and instantly distribute STRK bounties to top participants directly within the meeting interface.

### 2. Paid Educational Classes

An educator teaches Cairo development courses online. Students can connect their wallets, pay for entry using Starknet's low fees, and join high-quality video classrooms.

### 3. DAO Governance Calls

A DAO wants to verify token holdings or identity before allowing members to speak or vote during a community call. They use Room's Starknet integration to ensure only relevant community members can participate fully.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Starknet Native** | Built with Cairo, interacting seamlessly with Starknet networks |
| **Integrated Video** | Low-latency WebRTC streams powered by LiveKit |
| **Seamless Wallet UX** | Deep integration with Argent X and Braavos via Starknetkit |
| **Instant Rewards** | On-chain STRK token management to immediately reward participants |

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

For smart contract contributions, check the `/contracts` directory.

---

## License

MIT License.

---

<p align="center">
  <strong>Build. Learn. and Collaborate in One Room.</strong>
</p>
