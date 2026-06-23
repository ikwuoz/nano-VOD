# 🤖 Coding Agent System Instructions: Arc Stream VOD

This file defines the strict architectural rules, invariants, and implementation protocols for managing the Arc Stream VOD codebase. Read this file before creating or modifying endpoints, video player mechanics, or wallet automation scripts.

---

## 🎯 System Objectives & Guardrails

1. **The Invariant Rule**: Content streaming must ALWAYS be bound to an active payment lease window. Never optimize the streaming code by bypassing or caching the session authorization logic.
2. **Standard Protocol**: Enforce the HTTP `402 Payment Required` standard. If payment verification fails, stop data processing immediately and return a `402` status with the header `'X-X402-Required': 'true'`.
3. **No-Gas Execution**: All blockchain logic must route through Circle's off-chain gasless batch engine using the Arc L1 network configurations.

---

## 🏗️ Technical Domain Specifications

### 1. Payment Lifecycle Invariants (`src/app/api/pay/route.ts`)
- **Frictionless Conversions**: All micro-payment processing amounts must be passed and parsed strictly as string representations (e.g., `'0.002000'`) to prevent floating-point inaccuracy during splitting operations.
- **The Split Ratio**: Hardcode a rigid division of funds: 98% to the content provider (`creatorWalletAddress`) and 2% to the protocol repository account (`PLATFORM_FEE_WALLET`).
- **Lease Expiry Windows**: When a transaction returns a `SUCCESS` status, the validity lease window must be extended by exactly 20 seconds (`Date.now() + 20000`).

### 2. Media Proxy Guardrails (`src/app/api/stream/route.ts`)
- **Verification Priority**: Validate the timestamp check against the session ledger *before* establishing connection contexts or fetching media buffers from the Jellyfin node.
- **Grace Windows**: Enforce a grace period of exactly 20 seconds. If `Date.now() - lastPaidTimestamp > 20000`, block the request immediately with an HTTP 402 error code.
- **Chunk Integrity**: Ensure full propagation of standard HTTP multimedia data headers (`Range`, `Content-Range`, `Accept-Ranges: bytes`) to allow smooth seeking within the video element player frame.

### 3. Frontend Automation Loops (`src/app/watch/[id]/page.tsx`)
- **Heartbeat Rhythm**: Run the continuous trigger pulse exactly every 15 seconds while playback is ongoing. This ensures the wallet completes transactions 5 seconds before the backend's 20-second lease window expires.
- **Immediate Pause Execution**: On catching an HTTP 402 response, programmatically invoke `.pause()` directly on the `HTMLVideoElement` ref and flag the application's warning interface state. Do not attempt automated multi-retry connections when a 402 code is received.

---

## 🛠️ Implementation & Modification Protocols

When tasked with expanding features or optimizing routes, strictly follow these implementation steps:

1. **Verify Sandbox Compatibility**: Ensure any modifications to onboarding or wallet setup processes preserve the mock data paths for the **One-Click Sandbox Account** block inside `src/app/page.tsx`. This is critical for judges' evaluations.
2. **Validate State Dependencies**: When changing components inside the `/watch` directory, ensure that changes to the `isPlaying` or `paymentError` states instantly alter the active looping interval timers.
3. **Keep Code Clean**: Avoid adding external orchestration engines or unverified third-party libraries for payment routing. Depend strictly on `@circle-fin/developer-controlled-wallets` and direct, standard Web APIs (`fetch`).


<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
