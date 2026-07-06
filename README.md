# 🎥 Nano VOD Protocol

An open-source, decentralized pay-per-minute Video-on-Demand (VOD) streaming infrastructure powered by the **Circle Agent Stack** and **Arc Blockchain L1**. 

Built for the **Lepton Agents Hackathon**, this project solves **RFB 06: Creator & Publisher Monetization and Distribution** by introducing programmatic, zero-gas nanopayments into native video distribution networks.

---

## 🌐 Live Demo

**[https://nano-vod.vercel.app/](https://nano-vod.vercel.app/)**

---

## 🚀 The Core Thesis: "Payment is the Authentication"

Traditional paywalls require heavy login flows, credit card processing, and fixed monthly commitments. **Arc Stream VOD** implements the HTTP `402 Payment Required` standard via an autonomous agent wrapper. 

- **Autonomous Metering**: The client browser initializes an automated Viewer Agent Wallet.
- **Micro-Slicing**: As the video plays, the client issues an off-chain batched cryptographic signature every 15 seconds.
- **Sub-Cent Split Fees**: The backend routes micro-payments ($0.002 every 15 seconds) directly on the Arc Network—splitting 98% to the Independent Creator and a 2% platform protocol take-rate.
- **HTTP 402 Blockade**: If the payment stream is interrupted or the agent's balance drops to zero, the media stream is instantly terminated at the API proxy layer.

---

## 🛠️ Technical Architecture

### Key Technical Implementations
1. **Circle Developer-Controlled Wallets**: Handles background spending policies safely without exposing user keys.
2. **Circle Nanopayments Client Engine**: Batches transactions off-chain, bringing transaction gas friction to zero.
3. **Arc High-Speed L1 Layer**: Finalizes sub-cent stablecoin settlements instantly (~350ms).
4. **Jellyfin Streaming Proxy Handler**: A secure Node/Next API proxy layer that reads byte ranges from a standard self-hosted Jellyfin instances and injects the HTTP 402 conditional gate.


## ⚙️ Local Development & Quickstart

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/ikwuoz/nano-VOD.git
cd nano-VOD
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root directory:
```bash
# Circle Developer Configurations
CIRCLE_DEVELOPER_KEY="your_circle_developer_api_key"
CIRCLE_WALLET_SET_ID="your_agent_wallet_set_id"
PLATFORM_FEE_WALLET="0x_your_arc_platform_wallet_address"

# Jellyfin Instance Configs
JELLYFIN_SERVER_URL="http://localhost:8096"
JELLYFIN_API_KEY="your_jellyfin_admin_api_token"
```

### 3. Start the Next.js Engine
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to interact with the project interface.
