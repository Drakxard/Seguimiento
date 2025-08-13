# Create project with patch

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/bmxOwp03qUR)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch](https://vercel.com/ovh6581-4224s-projects/v0-create-project-with-patch)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/bmxOwp03qUR](https://v0.app/chat/projects/bmxOwp03qUR)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Seguimiento API

This project now exposes three **GET** endpoints to assist with study planning. All
requests require a unique `reqId` and timestamp `ts` query parameter and respond
with `Cache-Control: no-store`.

- `GET /api/next`: query params `slotMinutes`, `currentTrack?`, `forceSwitch?` and
  the required `reqId`, `ts`. It returns the next recommended track to study or
  `204` when there are no pending tracks.
- `GET /api/progress`: query params `track`, optional `minutes`, `nextIndex`, plus
  `reqId` and `ts`. It registers completed work on a track, returning the updated
  track and the next suggestion. Repeated `reqId` values are ignored.
- `GET /api/tracks`: returns a summary of all tracks including quota, deficit and
  days remaining.

Each suggestion includes the planned acts and minutes together with a reason and
diagnostic values (`Δ, D, R, cuota, score`) that follow the scheduling rules.