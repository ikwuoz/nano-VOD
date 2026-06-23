📇 Project Overview: Arc Stream VOD

- Core Concept: A lightweight server companion that adds a decentralized pay-per-minute meter to self-hosted Jellyfin media servers using Circle Nanopayments.

- Target User: Independent filmmakers, creators, and niche communities who want to monetize their video libraries without relying on YouTube ads or expensive Vimeo OTT subscriptions.

- The Workflow: A viewer opens a video → Jellyfin requests a temporary viewing token → The user's browser agent opens a WebSocket stream → The stream pushes micro-payments ($0.002/min) to the creator's wallet via Arc → If payments stop, the video stream is instantly paused.

🗓️ Day-by-Day Dev Milestones
## Days 1–2: Infrastructure & Wallet Automation
1. Set up a clean repository and spin up a local Jellyfin test instance using Docker.
2. Integrate Circle Programmable Wallets into your Next.js application backend.
3. Implement a server-side route that spins up a "Viewer Wallet" with a pre-set spending cap (e.g., max $1.00 spending limit for the session).

## Days 3–4: The Playback Interceptor & Metering Loop
1. Create a simple video landing page that pulls media directly from your Jellyfin server.
2. Write a JavaScript interval function (setInterval every 15 seconds) attached to the video player's HTML5 play event.
3. Every 15 seconds, trigger a background request to the backend. The backend signs an off-chain Circle Nanopayment transaction representing $0.0005 ($0.002/minute).

## Day 5: Session Enforcement & Validation
1. Build the server-side validator. If the payment gateway fails to receive the batched stablecoin transfer within the 20-second lease window, return an HTTP 402 error.
2. Catch the 402 error in the frontend player and programmatically call video.pause(), blocking further content buffering until payment resumes.

## Days 6–7: UI Polish, Live Metrics, & Submission Video
1. Build a creator dashboard displaying live streaming metrics: total runtime watched, real-time USDC streaming in, and total transactions processed.
2. Record a crisp 3-minute video showing the side-by-side view: a movie playing on the left, and a live web terminal showing micro-transactions ticking up on the right.