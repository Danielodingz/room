# Enterprise Feature Gap Analysis

Based on a review of the current implementation of "Room" (using Next.js and LiveKit), here are the key architectural and product features missing to reach parity with enterprise platforms like Zoom or Google Meet:

## 1. Advanced Host Credentials & Waiting Rooms
- **Current State**: The `roomId` is a random UUID generated via `/api/room/create`. Any user with the `roomId` can join and automatically publish video/audio.
- **What's Missing**: 
  - **Roles**: LiveKit supports Host vs. Participant credentials in its `AccessToken`. The `roomJoin` grant should specify `canPublish: false` for participants entering a waiting room.
  - **Waiting Room UI**: The frontend needs a state to handle users who are connected but not yet "admitted" by a host.
  - **Host Controls**: The UI needs a participant management panel allowing the host to "Admit All", "Mute All", or kick disruptive participants.

## 2. Dynamic Presenter Layouts for Screen Sharing
- **Current State**: Screen shares are added to the general `GridLayout` alongside regular webcams.
- **What's Missing**:
  - The UI (in `src/app/app/room/[id]/page.tsx`) needs to distinguish between a `Track.Source.ScreenShare` and `Track.Source.Camera`. 
  - When a screen share track becomes active, it should be rendered in a prominent `FocusLayout` component (taking up ~80% of the screen), while participant thumbnails are moved to a `CarouselLayout` or floating sidebar.

## 3. Persistent User Profiles & Authentication
- **Current State**: Users authenticate solely via a Starknet wallet connection (displaying a shortened address like `0x1234...5678`).
- **What's Missing**:
  - A persistent database (e.g., PostgreSQL or Supabase) to map Starknet addresses to user profiles (Names, Avatars/ENS mapping).
  - An onboarding or "Waiting Area" setup screen where a user can configure their Display Name and check their mic/camera feed *before* entering the room.

## 4. In-Meeting Virtual Backgrounds & Blur
- **Current State**: Local participants simply publish their raw camera feed to the network.
- **What's Missing**:
  - Integration with `@livekit/components-react` background processors. This requires adding a UI selector in the video settings to toggle background blur or custom virtual image backgrounds (using WebAssembly/WebGL processing local to the browser).

## 5. Meeting Transcriptions & Recording
- **Current State**: No recording or transcription logic exists.
- **What's Missing**:
  - **Recording**: Requires spinning up a LiveKit Egress service (often strictly server-side) to composite the room's output into a single MP4 and uploading it to an S3 bucket.
  - **Transcription**: Requires routing the audio streams through a service like Deepgram or OpenAI Whisper and sending the generated closed captions back to the frontend via Data Channels.

## 6. End-to-End Encryption (E2EE)
- **Current State**: WebRTC provides standard transport encryption, but the backend server still theoretically has access to the raw streams.
- **What's Missing**:
  - Implementing LiveKit's E2EE features which require users to exchange a shared key or passphrase to decrypt media streams entirely client-side.
